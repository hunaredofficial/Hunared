"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
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

export default function DashboardAiSettingsPage() {
  const [s, setS] = useState<AiSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/profile/settings");
        if (res.ok) {
          const j = await res.json();
          if (!cancelled) {
            setS({
              ai_enabled: j.ai_enabled !== false,
              ai_personalization: j.ai_personalization !== false,
              ai_cv_analysis: j.ai_cv_analysis !== false,
              ai_notifications: j.ai_notifications === true,
            });
          }
        } else {
          const res2 = await fetch("/api/profile/ai-settings");
          if (res2.ok) {
            const j = await res2.json();
            if (!cancelled) {
              setS({
                ai_enabled: j.ai_enabled !== false,
                ai_personalization: j.ai_personalization !== false,
                ai_cv_analysis: j.ai_cv_analysis !== false,
                ai_notifications: j.ai_notifications === true,
              });
            }
          }
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(patch: Partial<AiSettings>) {
    const next = { ...s, ...patch };
    setS(next);
    try {
      localStorage.setItem("hunared_ai_enabled", next.ai_enabled ? "1" : "0");
      window.dispatchEvent(new Event("hunared-ai-settings-changed"));
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch("/api/profile/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const res2 = await fetch("/api/profile/ai-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
        if (!res2.ok) {
          toast.error("Could not save AI settings");
          return;
        }
      }
      toast.success("Saved");
    } catch {
      toast.error("Could not save AI settings");
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
    <div className="max-w-lg mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/settings">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Settings
          </Link>
        </Button>
      </div>
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI & agent
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Control Hunared AI on your account. You can also manage this under Dashboard → Settings.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-2">
          <Toggle
            label="Hunared AI agent"
            desc="Show the floating assistant on the site"
            checked={s.ai_enabled}
            onChange={(v) => void save({ ai_enabled: v })}
          />
          <Toggle
            label="Personalization"
            desc="Use your profile to rank jobs and listings"
            checked={s.ai_personalization}
            onChange={(v) => void save({ ai_personalization: v })}
          />
          <Toggle
            label="CV analysis"
            desc="Allow AI helpers inside CV Builder"
            checked={s.ai_cv_analysis}
            onChange={(v) => void save({ ai_cv_analysis: v })}
          />
          <Toggle
            label="AI notifications"
            desc="Optional AI-related alerts (when available)"
            checked={s.ai_notifications}
            onChange={(v) => void save({ ai_notifications: v })}
          />
        </div>
      )}
    </div>
  );
}
