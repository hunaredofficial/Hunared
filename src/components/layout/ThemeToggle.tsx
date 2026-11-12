"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

/** Light ↔ Dark only. Persists to next-themes storage and account settings when signed in. */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Migrate away from removed high-contrast themes once
  useEffect(() => {
    if (!mounted) return;
    if (theme === "contrast-white") setTheme("light");
    if (theme === "contrast-black") setTheme("dark");
  }, [mounted, theme, setTheme]);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9"
        aria-label="Theme"
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark =
    theme === "dark" ||
    theme === "contrast-black" ||
    ((theme === "system" || !theme) && resolvedTheme === "dark");

  const handleClick = () => {
    const next = isDark ? "light" : "dark";
    // Mark so PreferencesApplier does not overwrite this choice mid-session
    try {
      sessionStorage.setItem("hunared_theme_user_set", next);
    } catch {
      /* ignore */
    }
    setTheme(next);
    // Persist to account when possible (avoids revert after refresh / applier)
    void fetch("/api/profile/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferred_theme: next }),
    }).catch(() => {
      /* guest or offline — local theme still applies via next-themes */
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="w-9 h-9 transition-all duration-300 hover:bg-primary/10 cursor-pointer"
      onClick={handleClick}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
