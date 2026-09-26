"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AiStatusWidget({ className }: { className?: string }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("hunared_ai_widget_dismissed") === "1") {
        setDismissed(true);
      }
    } catch {
      /* ignore */
    }
    void fetch("/api/profile/ai-settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && typeof j.ai_enabled === "boolean") setEnabled(j.ai_enabled);
        else setEnabled(true);
      })
      .catch(() => setEnabled(true));
  }, []);

  if (dismissed || enabled === null) return null;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between",
        enabled ? "border-primary/25 bg-primary/5" : "border-border bg-card",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">
            Hunared AI{" "}
            <span className="text-xs font-normal text-muted-foreground">
              {enabled ? "is ON" : "is OFF"}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {enabled
              ? "Ask for jobs, CV help, marketplace search, and career guidance."
              : "AI assistance is disabled. Jobs, Marketplace, and other features still work."}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" variant="outline" asChild>
          <Link href="/dashboard/settings/ai">Settings</Link>
        </Button>
        {enabled ? (
          <Button size="sm" asChild>
            <Link href="/agent">Open AI</Link>
          </Button>
        ) : (
          <Button size="sm" asChild>
            <Link href="/dashboard/settings/ai">Turn On</Link>
          </Button>
        )}
        <button
          type="button"
          className="text-[11px] text-muted-foreground hover:text-foreground px-1"
          onClick={() => {
            setDismissed(true);
            try {
              sessionStorage.setItem("hunared_ai_widget_dismissed", "1");
            } catch {
              /* ignore */
            }
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
