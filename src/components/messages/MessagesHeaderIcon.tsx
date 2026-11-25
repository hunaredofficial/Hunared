"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

/**
 * Header Messages — opens same-screen resizable panel (not full page navigation).
 * Signed-in only.
 */
export function MessagesHeaderIcon({ className }: { className?: string }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  const load = useCallback(() => {
    if (!isSignedIn) return;
    void fetch("/api/messages/unread")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && typeof j.count === "number") setCount(j.count);
      })
      .catch(() => {});
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) {
      setCount(0);
      return;
    }
    load();
    const t = window.setInterval(load, 30000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);
    const onOpenState = (e: Event) => {
      const d = (e as CustomEvent<{ open?: boolean }>).detail;
      if (typeof d?.open === "boolean") setOpen(d.open);
    };
    window.addEventListener("hunared-messages-open-state", onOpenState as EventListener);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("hunared-messages-open-state", onOpenState as EventListener);
    };
  }, [isSignedIn, load]);

  if (!isLoaded || !isSignedIn) return null;

  const aria = count > 0 ? `Messages, ${count} unread` : "Messages";

  return (
    <button
      type="button"
      title={aria}
      aria-label={aria}
      aria-pressed={open}
      onClick={() => {
        window.dispatchEvent(new CustomEvent("hunared-messages-toggle"));
      }}
      className={cn(
        "relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        "text-muted-foreground hover:text-foreground hover:bg-muted/80",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        open && "bg-primary/15 text-primary",
        className
      )}
    >
      <MessageSquare className="h-4 w-4" strokeWidth={2} />
      {count > 0 && (
        <span
          className={cn(
            "absolute top-0.5 right-0.5 min-w-[0.95rem] h-[0.95rem] px-0.5",
            "rounded-full bg-primary text-primary-foreground",
            "text-[9px] font-bold leading-none flex items-center justify-center",
            "ring-2 ring-background pointer-events-none"
          )}
        >
          {count > 99 ? "99+" : count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
