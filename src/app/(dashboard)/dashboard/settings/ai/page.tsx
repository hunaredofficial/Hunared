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

const DEFAULTS: AiSettings = {
  ai_enabled: true,
  ai_personalization: true,
  ai_cv_analysis: true,
  ai_notifications: false,
};

export default function PublicAiSettingsPage() {
  const [s, setS] = useState<AiSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/profile/ai-settings");
        if (res.status === 401) {
          setSignedIn(false);
          try {
            const raw = localStorage.getItem("hunared_ai_prefs");
            if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw) });
            else if (localStorage.getItem("hunared_ai_enabled") === "0") {
              setS((x) => ({ ...x, ai_enabled: false }));
            }
          } catch {
            /* ignore */
          }
        } else if (res.ok) {
          setSignedIn(true);
          const j = await res.json();
          setS({
            ai_enabled: j.ai_enabled ?? true,
            ai_personalization: j.ai_personalization ?? true,
            ai_cv_analysis: j.ai_cv_analysis ?? true,
            ai_notifications: j.ai_notifications ?? false,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(next: AiSettings) {
    setS(next);
    try {
      localStorage.setItem("hunared_ai_enabled", next.ai_enabled ? "1" : "0");
      localStorage.setItem("hunared_ai_prefs", JSON.stringify(next));
    } catch {
      /* ignore */
    }
    if (!signedIn) {
      toast.success(next.ai_enabled ? "Hunared AI is ON (this device)" : "Hunared AI is OFF (this device)");
      return;
    }
    try {
      const res = await fetch("/api/profile/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error || "Could not save to account — saved on this device");
        return;
      }
      toast.success(next.ai_enabled ? "Hunared AI is ON" : "Hunared AI is OFF");
    } catch {
      toast.message("Saved on this device");
    }
  }

  return (
    <div className="container max-w-xl mx-auto px-4 py-10 space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 mb-2" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Privacy & AI</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Control Hunared AI. Turning AI off does not disable Jobs, Marketplace, Learning, or your
          account.
          {!signedIn && (
            <span className="block mt-1 text-xs">
              You are browsing as a guest — preference is stored on this device.{" "}
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>{" "}
              to sync across devices.
            </span>
          )}
        </p>
      </div>

      <div
        className={cn(
          "rounded-xl border p-4",
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
              AI assistant for search guidance, platform help, CV tips, and recommendations. When
              off, the assistant stays inactive.
            </p>
          </div>
          <Switch
            checked={s.ai_enabled}
            disabled={loading}
            onCheckedChange={() => void save({ ...s, ai_enabled: !s.ai_enabled })}
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
              desc: "Use profile and activity signals when signed in and AI is on.",
            },
            {
              key: "ai_cv_analysis" as const,
              title: "AI-assisted CV analysis",
              desc: "Allow CV Builder AI tools when you use them.",
            },
            {
              key: "ai_notifications" as const,
              title: "AI notifications",
              desc: "Optional tips about matches or CV improvements.",
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
              disabled={loading || !s.ai_enabled}
              onCheckedChange={() => void save({ ...s, [row.key]: !s[row.key] })}
              aria-label={row.title}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" asChild>
          <Link href="/agent">Open Hunared AI</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
