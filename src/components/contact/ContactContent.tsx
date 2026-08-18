"use client";

import { useState } from "react";
import { MapPin, Send, Loader2, ChevronDown } from "lucide-react";
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

export function ContactContent() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Name, email, and message are required");
      return;
    }
    if (!form.reason) {
      toast.error("Please select a contact reason");
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
          phone: form.phone.trim() || undefined,
          reason: form.reason,
          message: form.message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send message");
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", reason: "", message: "" });
      toast.success("Message sent! We'll get back to you shortly.");
    } catch (err) {
      setStatus("error");
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
      {/* Left — contact info */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Contact information</h2>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Reach us through any of the channels below. We typically respond within one business day.
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
                  <a href={href} className="text-sm font-medium text-foreground hover:text-primary">
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

      {/* Right — form */}
      <div className="lg:col-span-3">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-1">Send us a message</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Fill in the form and we&apos;ll be in touch.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
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
                className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Email address <span className="text-destructive">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="abdullah@example.com"
                className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Phone optional */}
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Contact number{" "}
                <span className="text-muted-foreground text-xs font-normal">(optional)</span>
              </label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+966 5x xxx xxxx"
                className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Contact reason <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <select
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  required
                  className="w-full h-11 pl-3 pr-9 rounded-lg border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  {CONTACT_REASONS.map((r) => (
                    <option key={r.value || "empty"} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Message */}
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
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full h-11 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {status === "sending" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}