"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@clerk/nextjs";

/**
 * Applies saved account preferences (theme, compact mode, AI flag) after login.
 */
export function PreferencesApplier() {
  const { isSignedIn } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/profile/settings");
        if (!res.ok || cancelled) return;
        const j = await res.json();
        if (cancelled) return;
        if (j.preferred_theme) setTheme(j.preferred_theme);
        if (typeof j.ai_enabled === "boolean") {
          localStorage.setItem(
            "hunared_ai_enabled",
            j.ai_enabled ? "1" : "0"
          );
        }
        if (j.preferred_country) {
          localStorage.setItem(
            "hunared_preferred_country",
            j.preferred_country
          );
        }
        if (j.preferred_timezone) {
          localStorage.setItem(
            "hunared_preferred_timezone",
            j.preferred_timezone
          );
        }
        if (typeof j.compact_mode === "boolean") {
          localStorage.setItem(
            "hunared_compact_mode",
            j.compact_mode ? "1" : "0"
          );
          document.documentElement.classList.toggle(
            "compact-ui",
            j.compact_mode
          );
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, setTheme]);

  return null;
}
