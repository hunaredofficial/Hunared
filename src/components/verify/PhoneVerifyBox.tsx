"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Phone } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  /** Controlled phone value */
  phone: string;
  onPhoneChange?: (v: string) => void;
  /** Called when phone OTP succeeds */
  onVerified?: (phone: string) => void;
  purpose?: string;
  className?: string;
  /** If already verified on server */
  alreadyVerified?: boolean;
  label?: string;
};

export function PhoneVerifyBox({
  phone,
  onPhoneChange,
  onVerified,
  purpose = "listing",
  className,
  alreadyVerified = false,
  label = "Phone number",
}: Props) {
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(alreadyVerified);

  async function sendCode() {
    if (!phone.trim() || phone.replace(/\D/g, "").length < 8) {
      toast.error("Enter a valid phone number with country code");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "phone",
          destination: phone.trim(),
          purpose,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setSent(true);
      toast.success("SMS code sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send SMS");
    } finally {
      setSending(false);
    }
  }

  async function checkCode() {
    setChecking(true);
    try {
      const res = await fetch("/api/verify/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "phone",
          destination: phone.trim(),
          code: code.trim(),
          purpose,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      setVerified(true);
      toast.success("Phone verified");
      onVerified?.(phone.trim());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setChecking(false);
    }
  }

  if (verified) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400",
          className
        )}
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>Phone verified{phone ? `: ${phone}` : ""}</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2 rounded-lg border border-border p-3", className)}>
      <label className="text-sm font-medium flex items-center gap-1.5">
        <Phone className="h-3.5 w-3.5" />
        {label} <span className="text-destructive">*</span>
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange?.(e.target.value)}
          placeholder="+966 5x xxx xxxx"
          className="flex-1 h-10 px-3 rounded-lg border border-input bg-background text-sm"
        />
        <button
          type="button"
          onClick={sendCode}
          disabled={sending}
          className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          ) : sent ? (
            "Resend code"
          ) : (
            "Send SMS code"
          )}
        </button>
      </div>
      {sent && (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit code"
            className="flex-1 h-10 px-3 rounded-lg border border-input bg-background text-sm tracking-widest"
          />
          <button
            type="button"
            onClick={checkCode}
            disabled={checking || code.length !== 6}
            className="h-10 px-4 rounded-lg border border-border text-sm font-medium disabled:opacity-50"
          >
            {checking ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              "Verify"
            )}
          </button>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        One-time phone verification is required to post jobs and listings (anti-spam).
      </p>
    </div>
  );
}
