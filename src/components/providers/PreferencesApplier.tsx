"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@clerk/nextjs";

/**
 * Applies saved account preferences after login.
 * Does not overwrite a theme the user just chose in this session (header toggle).
 */
export function PreferencesApplier() {
  const { isSignedIn } = useAuth();
  const { setTheme } = useTheme();
  const appliedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn) {
      appliedRef.current = false;
      return;
    }
    if (appliedRef.current) return;
    appliedRef.current = true;

    let cancelled = false;
    void (async () => {
      try {
        // If user already toggled theme this session, keep their choice
        let userSet: string | null = null;
        try {
          userSet = sessionStorage.getItem("hunared_theme_user_set");
        } catch {
          /* ignore */
        }

        const res = await fetch("/api/profile/settings");
        if (!res.ok || cancelled) return;
        const j = await res.json();
        if (cancelled) return;

        if (!userSet && j.preferred_theme) {
          const t = String(j.preferred_theme);
          if (t === "light" || t === "dark" || t === "system") {
            setTheme(t);
          }
        }

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
