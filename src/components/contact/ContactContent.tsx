"use client";

import { useState } from "react";
import { MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const CONTACT_REASONS = [
  { value: "", label: "Select a reason..." },
  { value: "general", label: "General inquiry" },
  { value: "account_issue", label: "Account / login issue" },
  { value: "website_issue", label: "Website or technical issue" },
  { value: "job_listing", label: "Job listing problem" },
  { value: "marketplace", label: "Marketplace listing problem" },
  { value: "suggestion", label: "Suggestion / feedback" },
  { value: "premium_ads", label: "Premium advertising" },
  { value: "partnership", label: "Partnership / business inquiry" },
  { value: "report_fraud", label: "Report fraud or abuse" },
  { value: "payment", label: "Payment / billing" },
  { value: "other", label: "Other" },
];

const contactInfo = [
  {
    icon: MapPin,
    label: "Location",
    value: "Serving expats worldwide",
    href: null as string | null,
  },
];

type VerifyState = {
  sent: boolean;
  verified: boolean;
  code: string;
  sending: boolean;
  checking: boolean;
};

export function ContactContent() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [emailV, setEmailV] = useState<VerifyState>({
    sent: false,
    verified: false,
    code: "",
    sending: false,
    checking: false,
  });
  const [phoneV, setPhoneV] = useState<VerifyState>({
    sent: false,
    verified: false,
    code: "",
    sending: false,
    checking: false,
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "email") {
      setEmailV({
        sent: false,
        verified: false,
        code: "",
        sending: false,
        checking: false,
      });
    }
    if (name === "phone") {
      setPhoneV({
        sent: false,
        verified: false,
        code: "",
        sending: false,
        checking: false,
      });
    }
  }

  async function sendOtp(channel: "email" | "phone") {
    const destination =
      channel === "email" ? form.email.trim() : form.phone.trim();
    if (channel === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destination)) {
      toast.error("Enter a valid email first");
      return;
    }
    if (channel === "phone" && destination.replace(/\D/g, "").length < 8) {
      toast.error("Enter a valid phone with country code first");
      return;
    }
    const setV = channel === "email" ? setEmailV : setPhoneV;
    setV((s) => ({ ...s, sending: true }));
    try {
      const res = await fetch("/api/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          destination,
          purpose: "contact",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setV((s) => ({ ...s, sent: true, sending: false }));
      toast.success(
        channel === "email" ? "Code sent to your email" : "SMS code sent"
      );
    } catch (e) {
      setV((s) => ({ ...s, sending: false }));
      toast.error(e instanceof Error ? e.message : "Failed to send code");
    }
  }

  async function checkOtp(channel: "email" | "phone") {
    const destination =
      channel === "email" ? form.email.trim() : form.phone.trim();
    const v = channel === "email" ? emailV : phoneV;
    const setV = channel === "email" ? setEmailV : setPhoneV;
    setV((s) => ({ ...s, checking: true }));
    try {
      const res = await fetch("/api/verify/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          destination,
          code: v.code.trim(),
          purpose: "contact",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      setV((s) => ({ ...s, verified: true, checking: false }));
      toast.success(channel === "email" ? "Email verified" : "Phone verified");
    } catch (e) {
      setV((s) => ({ ...s, checking: false }));
      toast.error(e instanceof Error ? e.message : "Verification failed");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Name, email, and message are required");
      return;
    }
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 8) {
      toast.error("Phone number is required");
      return;
    }
    if (!form.reason) {
      toast.error("Please select a contact reason");
      return;
    }
    if (!emailV.verified) {
      toast.error("Please verify your email with the code we send");
      return;
    }
    if (!phoneV.verified) {
      toast.error("Please verify your phone with the SMS code");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          reason: form.reason,
          message: form.message.trim(),
          emailVerified: true,
          phoneVerified: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send message");
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", reason: "", message: "" });
      setEmailV({
        sent: false,
        verified: false,
        code: "",
        sending: false,
        checking: false,
      });
      setPhoneV({
        sent: false,
        verified: false,
        code: "",
        sending: false,
        checking: false,
      });
      toast.success("Message sent! We'll get back to you shortly.");
    } catch (err) {
      setStatus("error");
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  }

  const fieldClass =
    "w-full h-11 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Contact information
        </h2>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Reach us through any of the channels below. We typically respond
          within one business day.
        </p>
        <ul className="space-y-8">
          {contactInfo.map(({ icon: Icon, label, value, href }) => (
            <li key={label} className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                {href ? (
                  <a
                    href={href}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-foreground">{value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-3">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-1">Send us a message</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Email and phone must both be verified before sending (anti-spam).
          </p>

          {status === "sent" ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="font-medium">Message sent successfully</p>
              <button
                type="button"
                className="text-sm text-primary underline"
                onClick={() => setStatus("idle")}
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Full name <span className="text-destructive">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Abdullah"
                  className={fieldClass}
                />
              </div>

              {/* Email + verify */}
              <div className="space-y-2">
                <label className="text-sm font-medium block">
                  Email address <span className="text-destructive">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={emailV.verified}
                    placeholder="abdullah@example.com"
                    className={fieldClass}
                  />
                  {!emailV.verified && (
                    <button
                      type="button"
                      onClick={() => sendOtp("email")}
                      disabled={emailV.sending}
                      className="h-11 px-4 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium whitespace-nowrap disabled:opacity-50"
                    >
                      {emailV.sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : emailV.sent ? (
                        "Resend email code"
                      ) : (
                        "Send email code"
                      )}
                    </button>
                  )}
                  {emailV.verified && (
                    <span className="flex items-center gap-1 text-sm text-emerald-500 px-2">
                      <CheckCircle2 className="h-4 w-4" /> Verified
                    </span>
                  )}
                </div>
                {emailV.sent && !emailV.verified && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={emailV.code}
                      onChange={(e) =>
                        setEmailV((s) => ({
                          ...s,
                          code: e.target.value.replace(/\D/g, "").slice(0, 6),
                        }))
                      }
                      placeholder="6-digit email code"
                      maxLength={6}
                      className={fieldClass}
                    />
                    <button
                      type="button"
                      onClick={() => checkOtp("email")}
                      disabled={emailV.checking || emailV.code.length !== 6}
                      className="h-11 px-4 rounded-lg border border-border text-sm font-medium disabled:opacity-50"
                    >
                      {emailV.checking ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Verify email"
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Phone + verify */}
              <div className="space-y-2">
                <label className="text-sm font-medium block">
                  Contact number <span className="text-destructive">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    disabled={phoneV.verified}
                    placeholder="+966 5x xxx xxxx"
                    className={fieldClass}
                  />
                  {!phoneV.verified && (
                    <button
                      type="button"
                      onClick={() => sendOtp("phone")}
                      disabled={phoneV.sending}
                      className="h-11 px-4 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium whitespace-nowrap disabled:opacity-50"
                    >
                      {phoneV.sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : phoneV.sent ? (
                        "Resend SMS"
                      ) : (
                        "Send SMS code"
                      )}
                    </button>
                  )}
                  {phoneV.verified && (
                    <span className="flex items-center gap-1 text-sm text-emerald-500 px-2">
                      <CheckCircle2 className="h-4 w-4" /> Verified
                    </span>
                  )}
                </div>
                {phoneV.sent && !phoneV.verified && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={phoneV.code}
                      onChange={(e) =>
                        setPhoneV((s) => ({
                          ...s,
                          code: e.target.value.replace(/\D/g, "").slice(0, 6),
                        }))
                      }
                      placeholder="6-digit SMS code"
                      maxLength={6}
                      className={fieldClass}
                    />
                    <button
                      type="button"
                      onClick={() => checkOtp("phone")}
                      disabled={phoneV.checking || phoneV.code.length !== 6}
                      className="h-11 px-4 rounded-lg border border-border text-sm font-medium disabled:opacity-50"
                    >
                      {phoneV.checking ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Verify phone"
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Contact reason <span className="text-destructive">*</span>
                </label>
                <select
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                >
                  {CONTACT_REASONS.map((r) => (
                    <option key={r.value || "empty"} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Message <span className="text-destructive">*</span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="How can we help you?"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y min-h-[120px]"
                />
              </div>

              <button
                type="submit"
                disabled={
                  status === "sending" || !emailV.verified || !phoneV.verified
                }
                className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === "sending" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
