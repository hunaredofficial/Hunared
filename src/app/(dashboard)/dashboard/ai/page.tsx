"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AiSettings = {
  ai_enabled: boolean;
  ai_personalization: boolean;
  ai_cv_analysis: boolean;
  ai_notifications: boolean;
};

export default function PrivacyAiSettingsPage() {
  const [s, setS] = useState<AiSettings>({
    ai_enabled: true,
    ai_personalization: true,
    ai_cv_analysis: true,
    ai_notifications: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/profile/ai-settings");
        if (res.ok) {
          const j = await res.json();
          setS({
            ai_enabled: j.ai_enabled ?? true,
            ai_personalization: j.ai_personalization ?? true,
            ai_cv_analysis: j.ai_cv_analysis ?? true,
            ai_notifications: j.ai_notifications ?? false,
          });
          if (j.migrationRequired) {
            toast.message("Run database migration 009_ai_preferences.sql to persist AI settings.");
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(next: AiSettings) {
    setSaving(true);
    setS(next);
    try {
      const res = await fetch("/api/profile/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error || "Could not save settings");
        return;
      }
      toast.success(next.ai_enabled ? "Hunared AI is ON" : "Hunared AI is OFF");
      try {
        localStorage.setItem("hunared_ai_enabled", next.ai_enabled ? "1" : "0");
      } catch {
        /* ignore */
      }
    } finally {
      setSaving(false);
    }
  }

  function toggle(key: keyof AiSettings) {
    const next = { ...s, [key]: !s[key] };
    // Master off disables children for clarity but keeps their values
    void save(next);
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 mb-2" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Privacy & AI</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          You control whether Hunared AI can assist you. Turning AI off does not disable
          Jobs, Marketplace, Learning, or your account.
        </p>
      </div>

      <div
        className={cn(
          "rounded-xl border p-4 space-y-4",
          s.ai_enabled ? "border-primary/30 bg-primary/5" : "border-border bg-card"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="font-semibold">Hunared AI</p>
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full",
                  s.ai_enabled
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {s.ai_enabled ? "On" : "Off"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use Hunared&apos;s AI assistant and AI-powered help across the platform
              (search guidance, CV assist, career tips). When off, the assistant stays
              inactive and AI recommendations stop.
            </p>
          </div>
          <Switch
            checked={s.ai_enabled}
            disabled={loading || saving}
            onCheckedChange={() => toggle("ai_enabled")}
            aria-label="Hunared AI on or off"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {(
          [
            {
              key: "ai_personalization" as const,
              title: "Personalized recommendations",
              desc: "Use your profile, skills, and saved activity to rank relevant jobs and listings when AI is on.",
            },
            {
              key: "ai_cv_analysis" as const,
              title: "AI-assisted CV analysis",
              desc: "Allow CV Builder AI tools to analyze and suggest improvements to your CV content.",
            },
            {
              key: "ai_notifications" as const,
              title: "AI notifications",
              desc: "Occasional tips about matches or CV improvements. Off by default.",
            },
          ] as const
        ).map((row) => (
          <div key={row.key} className="flex items-start justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium">{row.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{row.desc}</p>
            </div>
            <Switch
              checked={s[row.key]}
              disabled={loading || saving || !s.ai_enabled}
              onCheckedChange={() => toggle(row.key)}
              aria-label={row.title}
            />
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        AI-generated assistance is guidance only — verify important information before
        applying, publishing, or paying. Hunared AI cannot access other users&apos; private
        data. Destructive or irreversible actions always require your confirmation.
      </p>

      <Button variant="outline" size="sm" asChild>
        <Link href="/agent">Open Hunared AI</Link>
      </Button>
    </div>
  );
}
