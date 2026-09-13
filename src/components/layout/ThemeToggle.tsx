"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

/** Only two themes: Light ↔ Dark */
const THEME_CYCLE = ["light", "dark"] as const;
type ThemeValue = (typeof THEME_CYCLE)[number];

function nextTheme(current: string | undefined): ThemeValue {
  // Map any high-contrast / system residual to the opposite of resolved feel
  if (current === "dark" || current === "contrast-black") return "light";
  return "dark";
}

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
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
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
