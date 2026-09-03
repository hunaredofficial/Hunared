import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createAdminClient } from "@/lib/supabase";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { fullName, email, message, phone, reason } = body as Record<
    string,
    string | undefined
  >;

  if (
    typeof fullName !== "string" ||
    !fullName.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof message !== "string" ||
    !message.trim()
  ) {
    return NextResponse.json(
      { error: "Name, email, and message are required" },
      { status: 400 }
    );
  }

  if (typeof reason !== "string" || !reason.trim()) {
    return NextResponse.json(
      { error: "Contact reason is required" },
      { status: 400 }
    );
  }

  if (typeof phone !== "string" || !phone.trim() || phone.replace(/\D/g, "").length < 8) {
    return NextResponse.json(
      { error: "A valid phone number is required" },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const name = fullName.trim();
  const mail = email.trim();
  const msg = message.trim();
  const reasonDisplay = reason.trim();
  const phoneDisplay =
    typeof phone === "string" && phone.trim() ? phone.trim() : null;

  // 1) Always try to store in database first (works without SMTP)
  let savedToDb = false;
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("contact_messages").insert({
      full_name: name,
      email: mail,
      phone: phoneDisplay,
      reason: reasonDisplay,
      message: msg,
    });
    if (error) {
      console.error("[contact] DB insert failed:", error.message);
    } else {
      savedToDb = true;
    }
  } catch (e) {
    console.error("[contact] DB unavailable:", e);
  }

  // 2) Optional email via SMTP (if configured)
  const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
  const SMTP_PASS =
    process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.SMTP_PASSWORD;
  const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
  const CONTACT_TO =
    process.env.CONTACT_TO || process.env.SMTP_TO || "hunaredofficial@gmail.com";

  let emailed = false;
  if (SMTP_USER && SMTP_PASS) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
      <h2 style="background: #0f172a; color: #fff; padding: 16px 24px; border-radius: 8px 8px 0 0; margin: 0;">
        New Contact Form Submission
      </h2>
      <div style="border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #475569; width: 120px; vertical-align: top;">Name</td>
            <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #475569; vertical-align: top;">Email</td>
            <td style="padding: 8px 0;">
              <a href="mailto:${escapeHtml(mail)}" style="color: #2563eb;">${escapeHtml(mail)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #475569; vertical-align: top;">Phone</td>
            <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(phoneDisplay || "—")}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #475569; vertical-align: top;">Reason</td>
            <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(reasonDisplay)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #475569; vertical-align: top;">Message</td>
            <td style="padding: 8px 0; color: #0f172a; white-space: pre-wrap;">${escapeHtml(msg)}</td>
          </tr>
        </table>
      </div>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 16px; text-align: center;">
        Sent from the Hunared contact form · Reply directly to reach the sender.
      </p>
    </div>
  `;

    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"Hunared Contact" <${SMTP_USER}>`,
        to: CONTACT_TO,
        replyTo: `"${name.replace(/"/g, "")}" <${mail}>`,
        subject: `[${reasonDisplay}] Message from ${name}`,
        html,
      });
      emailed = true;
    } catch (err) {
      console.error("[contact] Failed to send email:", err);
    }
  } else {
    console.warn(
      "[contact] SMTP not configured (set SMTP_USER + SMTP_PASS). Message stored in DB only."
    );
  }

  // Success if either path worked
  if (savedToDb || emailed) {
    return NextResponse.json({
      ok: true,
      emailed,
      saved: savedToDb,
    });
  }

  // Both failed
  return NextResponse.json(
    {
      error:
        "Could not send your message. Please email hunaredofficial@gmail.com directly, or try again later.",
    },
    { status: 500 }
  );
}
