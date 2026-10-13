"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function AiSettingsClient() {
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
      window.dispatchEvent(new Event("hunared-ai-settings-changed"));
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
        toast.error("Could not save");
        return;
      }
      toast.success("Saved");
    } catch {
      toast.error("Could not save");
    }
  }

  function Toggle({
    label,
    desc,
    checked,
    onChange,
  }: {
    label: string;
    desc: string;
    checked: boolean;
    onChange: (v: boolean) => void;
  }) {
    return (
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "w-full flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-colors",
          checked ? "border-primary/40 bg-primary/5" : "border-border bg-card/40 hover:bg-muted/40"
        )}
      >
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
        <span
          className={cn(
            "mt-0.5 h-5 w-9 shrink-0 rounded-full relative transition-colors",
            checked ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
              checked ? "left-4" : "left-0.5"
            )}
          />
        </span>
      </button>
    );
  }

  return (
    <div className="container max-w-lg mx-auto px-4 py-10 space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Home
        </Link>
      </Button>
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Privacy & AI
        </h1>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
          <Shield className="h-3.5 w-3.5" />
          Control Hunared AI on this device{signedIn ? " and your account" : ""}.
        </p>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-2">
          <Toggle
            label="Hunared AI agent"
            desc="Show the floating assistant"
            checked={s.ai_enabled}
            onChange={(v) => void save({ ...s, ai_enabled: v })}
          />
          <Toggle
            label="Personalization"
            desc="Rank jobs and listings using your profile"
            checked={s.ai_personalization}
            onChange={(v) => void save({ ...s, ai_personalization: v })}
          />
          <Toggle
            label="CV analysis"
            desc="Allow AI helpers in CV Builder"
            checked={s.ai_cv_analysis}
            onChange={(v) => void save({ ...s, ai_cv_analysis: v })}
          />
          <Toggle
            label="AI notifications"
            desc="Optional AI-related alerts"
            checked={s.ai_notifications}
            onChange={(v) => void save({ ...s, ai_notifications: v })}
          />
        </div>
      )}
    </div>
  );
}
