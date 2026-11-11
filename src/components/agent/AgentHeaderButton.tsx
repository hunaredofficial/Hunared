"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

/**
 * Header control for Hunared Agent — matches Messages / theme icon sizing (h-8 w-8).
 * Dispatches `hunared-agent-toggle` so a single mounted HunaredAgent opens the drawer.
 * Hidden when AI is OFF (local + account preference).
 */
export function AgentHeaderButton({ className }: { className?: string }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [aiEnabled, setAiEnabled] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        setAiEnabled(localStorage.getItem("hunared_ai_enabled") !== "0");
      } catch {
        /* ignore */
      }
    };
    read();
    const onCustom = () => read();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "hunared_ai_enabled") read();
    };
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ open?: boolean }>).detail;
      if (typeof detail?.open === "boolean") setOpen(detail.open);
    };
    window.addEventListener("hunared-ai-settings-changed", onCustom);
    window.addEventListener("storage", onStorage);
    window.addEventListener("hunared-agent-open-state", onOpen);
    return () => {
      window.removeEventListener("hunared-ai-settings-changed", onCustom);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("hunared-agent-open-state", onOpen);
    };
  }, []);

  // Soft-check account preference when signed in
  useEffect(() => {
    if (!isSignedIn) return;
    void fetch("/api/profile/ai-settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && typeof j.ai_enabled === "boolean") {
          setAiEnabled(j.ai_enabled);
          try {
            localStorage.setItem("hunared_ai_enabled", j.ai_enabled ? "1" : "0");
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {});
  }, [isSignedIn]);

  if (!isLoaded || !aiEnabled) return null;

  function toggle() {
    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(
        typeof window !== "undefined" ? window.location.pathname : "/"
      )}`;
      return;
    }
    window.dispatchEvent(new CustomEvent("hunared-agent-toggle"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={open ? "Close Hunared Agent" : "Open Hunared Agent"}
      aria-label={open ? "Close Hunared Agent" : "Open Hunared Agent"}
      aria-pressed={open}
      className={cn(
        "relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        "text-muted-foreground hover:text-foreground hover:bg-muted/80",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        open && "bg-primary/15 text-primary",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-1 rounded-md opacity-0 transition-opacity",
          open && "opacity-100 bg-primary/10"
        )}
      />
      <Sparkles
        className={cn("h-4 w-4 relative z-[1]", open && "text-primary")}
        strokeWidth={2}
      />
      {/* subtle online dot when signed in */}
      {isSignedIn && (
        <span
          aria-hidden
          className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-background"
        />
      )}
    </button>
  );
}
