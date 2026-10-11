"use client";

/**
 * Keeps Clerk session / JWT fresh while the user is active on Hunared.
 * Combined with Clerk Dashboard session settings (30-day lifetime + inactivity),
 * users stay signed in for about a month of normal use.
 */
import { useEffect, useRef } from "react";
import { useAuth, useSession } from "@clerk/nextjs";

/** Refresh token about every 12 minutes while the tab is open */
const REFRESH_MS = 12 * 60 * 1000;
/** Minimum gap between refreshes (avoid spam on rapid visibility changes) */
const MIN_GAP_MS = 60 * 1000;

export function SessionKeepAlive() {
  const { isSignedIn, getToken } = useAuth();
  const { session } = useSession();
  const lastRef = useRef(0);

  useEffect(() => {
    if (!isSignedIn) return;

    const touch = async () => {
      const now = Date.now();
      if (now - lastRef.current < MIN_GAP_MS) return;
      lastRef.current = now;
      try {
        // Refresh JWT (short-lived); session cookie stays managed by Clerk
        await getToken({ skipCache: true });
        // Touch session activity when Clerk SDK supports it
        const s = session as { touch?: () => Promise<unknown> } | null | undefined;
        if (s && typeof s.touch === "function") {
          await s.touch();
        }
      } catch {
        /* offline or transient — ignore */
      }
    };

    void touch();

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void touch();
    }, REFRESH_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void touch();
    };
    const onFocus = () => void touch();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [isSignedIn, getToken, session]);

  return null;
}
