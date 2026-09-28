"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export function MessagesHeaderIcon({ className }: { className?: string }) {
  const { isSignedIn } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isSignedIn) return;
    let alive = true;
    const load = () => {
      void fetch("/api/messages/unread")
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (alive && j && typeof j.count === "number") setCount(j.count);
        })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 45000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [isSignedIn]);

  if (!isSignedIn) return null;

  return (
    <Link
      href="/dashboard/messages"
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors",
        className
      )}
      aria-label={count ? `Messages, ${count} unread` : "Messages"}
    >
      <MessageSquare className="h-4.5 w-4.5 h-4 w-4" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
