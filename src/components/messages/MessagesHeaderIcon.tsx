"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

/**
 * Header Messages — icon only + unread badge (no text label).
 * Signed-in only.
 */
export function MessagesHeaderIcon({ className }: { className?: string }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [count, setCount] = useState(0);

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
    return () => {
      window.clearInterval(t);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [isSignedIn, load]);

  if (!isLoaded || !isSignedIn) return null;

  const aria = count > 0 ? `Messages, ${count} unread` : "Messages";

  return (
    <Link
      href="/dashboard/messages"
      title={aria}
      aria-label={aria}
      className={cn(
        "relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        "text-muted-foreground hover:text-foreground hover:bg-muted/80",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
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
    </Link>
  );
}
