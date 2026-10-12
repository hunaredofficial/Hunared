"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

/**
 * Header Messages control — icon + unread badge.
 * Visible only when signed in.
 */
export function MessagesHeaderIcon({
  className,
  showLabel = false,
}: {
  className?: string;
  /** Show "Messages" text next to icon (desktop) */
  showLabel?: boolean;
}) {
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
    // Refresh when returning from messages page / other tabs
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

  const label = count > 0 ? `Messages, ${count} unread` : "Messages";

  return (
    <Link
      href="/dashboard/messages"
      title={label}
      aria-label={label}
      className={cn(
        "relative inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-muted-foreground transition-colors",
        "hover:text-foreground hover:bg-muted/80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        className
      )}
    >
      <span className="relative inline-flex">
        <MessageSquare className="h-4 w-4" strokeWidth={2} />
        {count > 0 && (
          <span
            className={cn(
              "absolute -top-1.5 -right-1.5 min-w-[1.05rem] h-[1.05rem] px-0.5",
              "rounded-full bg-primary text-primary-foreground",
              "text-[10px] font-bold leading-none flex items-center justify-center",
              "ring-2 ring-background"
            )}
          >
            {count > 99 ? "99+" : count > 9 ? "9+" : count}
          </span>
        )}
      </span>
      {showLabel && (
        <span className="hidden xl:inline text-[13px] font-medium">Messages</span>
      )}
    </Link>
  );
}
