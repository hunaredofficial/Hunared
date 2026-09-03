import crypto from "crypto";
import nodemailer from "nodemailer";
import { createAdminClient } from "@/lib/supabase";

export type VerifyChannel = "email" | "phone";

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  // default: keep digits only with +
  return digits.startsWith("00") ? `+${digits.slice(2)}` : `+${digits}`;
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createAndSendOtp(opts: {
  channel: VerifyChannel;
  destination: string;
  purpose: string;
  userId?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const dest =
    opts.channel === "email"
      ? normalizeEmail(opts.destination)
      : normalizePhone(opts.destination);

  if (opts.channel === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dest)) {
    return { ok: false, error: "Invalid email address" };
  }
  if (opts.channel === "phone" && dest.replace(/\D/g, "").length < 8) {
    return { ok: false, error: "Invalid phone number" };
  }

  const code = generateCode();
  const code_hash = hashCode(code);
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const supabase = createAdminClient();

  // invalidate previous unused codes for same dest+purpose
  await supabase
    .from("verification_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("channel", opts.channel)
    .eq("destination", dest)
    .eq("purpose", opts.purpose)
    .is("consumed_at", null);

  const { error } = await supabase.from("verification_otps").insert({
    channel: opts.channel,
    destination: dest,
    code_hash,
    purpose: opts.purpose,
    user_id: opts.userId ?? null,
    expires_at,
  });

  if (error) {
    console.error("[verify] insert otp failed", error);
    return { ok: false, error: "Could not create verification code" };
  }

  if (opts.channel === "email") {
    const sent = await sendEmailOtp(dest, code);
    if (!sent.ok) return sent;
  } else {
    const sent = await sendSmsOtp(dest, code);
    if (!sent.ok) return sent;
  }

  return { ok: true };
}

export async function verifyOtp(opts: {
  channel: VerifyChannel;
  destination: string;
  code: string;
  purpose: string;
  userId?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const dest =
    opts.channel === "email"
      ? normalizeEmail(opts.destination)
      : normalizePhone(opts.destination);
  const code = opts.code.trim();
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: "Enter the 6-digit code" };
  }

  const supabase = createAdminClient();
  const { data: rows } = await supabase
    .from("verification_otps")
    .select("id, code_hash, expires_at, attempts")
    .eq("channel", opts.channel)
    .eq("destination", dest)
    .eq("purpose", opts.purpose)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  const row = rows?.[0];
  if (!row) return { ok: false, error: "No code found. Please send a new code." };
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "Code expired. Please send a new code." };
  }
  if ((row.attempts ?? 0) >= 5) {
    return { ok: false, error: "Too many attempts. Please send a new code." };
  }

  await supabase
    .from("verification_otps")
    .update({ attempts: (row.attempts ?? 0) + 1 })
    .eq("id", row.id);

  if (row.code_hash !== hashCode(code)) {
    return { ok: false, error: "Incorrect code" };
  }

  await supabase
    .from("verification_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", row.id);

  // If phone + logged-in user: mark profile verified (one-time for listings)
  if (opts.channel === "phone" && opts.userId) {
    await supabase
      .from("profiles")
      .update({
        phone: dest,
        phone_verified_at: new Date().toISOString(),
      })
      .eq("id", opts.userId);
  }

  return { ok: true };
}

async function sendEmailOtp(
  email: string,
  code: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
  const SMTP_PASS =
    process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.SMTP_PASSWORD;
  const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);

  if (!SMTP_USER || !SMTP_PASS) {
    return {
      ok: false,
      error: "Email verification is not configured (SMTP).",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"Hunared" <${SMTP_USER}>`,
      to: email,
      subject: `${code} is your Hunared verification code`,
      text: `Your verification code is ${code}. It expires in 10 minutes.\n\nIf you did not request this, ignore this email.`,
      html: `<p>Your Hunared verification code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:4px">${code}</p><p>Expires in 10 minutes.</p>`,
    });
    return { ok: true };
  } catch (e) {
    console.error("[verify] email send failed", e);
    return { ok: false, error: "Failed to send email code" };
  }
}

async function sendSmsOtp(
  phone: string,
  code: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    // Dev fallback: log code so testing works without Twilio
    if (process.env.VERIFY_DEV_MODE === "true") {
      console.warn(`[verify] DEV MODE SMS to ${phone}: code ${code}`);
      return { ok: true };
    }
    return {
      ok: false,
      error:
        "Phone SMS is not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER on Vercel.",
    };
  }

  try {
    const body = new URLSearchParams({
      To: phone,
      From: from,
      Body: `Hunared code: ${code}. Valid 10 minutes.`,
    });
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );
    if (!res.ok) {
      const t = await res.text();
      console.error("[verify] twilio error", t);
      return { ok: false, error: "Failed to send SMS code" };
    }
    return { ok: true };
  } catch (e) {
    console.error("[verify] sms failed", e);
    return { ok: false, error: "Failed to send SMS code" };
  }
}

export async function isPhoneVerified(
  userId: string
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("phone_verified_at")
    .eq("id", userId)
    .maybeSingle();
  return Boolean(data?.phone_verified_at);
}
