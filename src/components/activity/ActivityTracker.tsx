"use client";

/**
 * Quietly records signed-in browsing history when history_enabled is on.
 * Privacy: user can disable under Dashboard → Settings → Privacy.
 */
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const SKIP = ["/sign-in", "/register", "/api"];

export function ActivityTracker() {
  const { isSignedIn, isLoaded } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastKey = useRef("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !pathname) return;

    if (SKIP.some((s) => pathname === s || pathname.startsWith(s + "/"))) return;

    try {
      if (localStorage.getItem("hunared_history_enabled") === "0") return;
    } catch {
      /* ignore */
    }

    const qs = searchParams?.toString();
    const path = qs ? `${pathname}?${qs}` : pathname;
    const key = path;

    if (key === lastKey.current) return;
    lastKey.current = key;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const title =
        typeof document !== "undefined" ? document.title.replace(/\s*[—|–|-]\s*Hunared.*$/i, "").trim() : "";
      void fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          title: title || undefined,
          event_type: "page_view",
        }),
      }).catch(() => {});
    }, 900);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [isLoaded, isSignedIn, pathname, searchParams]);

  return null;
}
