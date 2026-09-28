"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export function MessagesHeaderIcon({ className }: { className?: string }) {
  const { isSignedIn } = useAuth();
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
    if (!isSignedIn) return;
    load();
    const t = setInterval(load, 45000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [isSignedIn, load]);

  if (!isSignedIn) return null;

  return (
    <Link
      href="/dashboard/messages"
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors",
        className
      )}
      aria-label={count ? `Messages, ${count} unread` : "Messages"}
      title="Messages"
    >
      <MessageSquare className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[1.15rem] h-[1.15rem] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
