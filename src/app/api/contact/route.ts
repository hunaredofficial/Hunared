import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

  // Basic email format guard
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
  const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.SMTP_PASSWORD;
  const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
  if (!SMTP_USER || !SMTP_PASS) {
    console.error("[contact] SMTP_USER/SMTP_PASS (or EMAIL_USER/EMAIL_PASS) env vars are not set");
    return NextResponse.json(
      { error: "Mail server is not configured. Please email hunaredofficial@gmail.com directly." },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const phoneDisplay =
    typeof phone === "string" && phone.trim() ? phone.trim() : "—";
  const reasonDisplay = reason.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
      <h2 style="background: #0f172a; color: #fff; padding: 16px 24px; border-radius: 8px 8px 0 0; margin: 0;">
        New Contact Form Submission
      </h2>
      <div style="border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #475569; width: 120px; vertical-align: top;">Name</td>
            <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(fullName.trim())}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #475569; vertical-align: top;">Email</td>
            <td style="padding: 8px 0;">
              <a href="mailto:${escapeHtml(email.trim())}" style="color: #2563eb;">${escapeHtml(email.trim())}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #475569; vertical-align: top;">Phone</td>
            <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(phoneDisplay)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #475569; vertical-align: top;">Reason</td>
            <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(reasonDisplay)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #475569; vertical-align: top;">Message</td>
            <td style="padding: 8px 0; color: #0f172a; white-space: pre-wrap;">${escapeHtml(message.trim())}</td>
          </tr>
        </table>
      </div>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 16px; text-align: center;">
        Sent from the Hunared contact form &bull; Reply directly to reach the sender.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Hunared Contact" <${SMTP_USER}>`,
      to: "hunaredofficial@gmail.com",
      replyTo: `"${escapeHtml(fullName.trim())}" <${escapeHtml(email.trim())}>`,
      subject: `[${escapeHtml(reasonDisplay)}] Message from ${escapeHtml(fullName.trim())}`,
      html,
    });
  } catch (err) {
    console.error("[contact] Failed to send email:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}