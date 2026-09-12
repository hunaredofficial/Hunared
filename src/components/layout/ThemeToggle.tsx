"use client";

import { Circle, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

/** Cycle order on each click */
const THEME_CYCLE = ["light", "dark", "contrast-white", "contrast-black"] as const;
type ThemeValue = (typeof THEME_CYCLE)[number];

function nextTheme(current: string | undefined): ThemeValue {
  const idx = THEME_CYCLE.indexOf(current as ThemeValue);
  if (idx === -1) {
    // system / unknown → start at light
    return "light";
  }
  return THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
}

function ThemeIcon({ theme }: { theme?: string }) {
  if (theme === "contrast-white") {
    return <Circle className="h-4 w-4 stroke-[2.5]" />;
  }
  if (theme === "contrast-black") {
    return <Circle className="h-4 w-4 fill-current" />;
  }
  if (theme === "dark") {
    return <Moon className="h-4 w-4" />;
  }
  return <Sun className="h-4 w-4" />;
}

const LABELS: Record<string, string> = {
  light: "Light",
  dark: "Dark",
  "contrast-white": "Contrast White",
  "contrast-black": "Contrast Black",
  system: "Auto",
};

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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

  // If still on system, show icon for resolved theme; click locks to next in cycle
  const displayTheme =
    theme === "system" || !theme ? resolvedTheme ?? "light" : theme;

  const handleClick = () => {
    const from =
      theme === "system" || !theme
        ? (resolvedTheme as string) || "light"
        : theme;
    setTheme(nextTheme(from));
  };

  const nextLabel = LABELS[nextTheme(
    theme === "system" || !theme ? (resolvedTheme as string) || "light" : theme
  )];

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-9 h-9 transition-all duration-300 hover:bg-primary/10 cursor-pointer"
      onClick={handleClick}
      aria-label={`Theme: ${LABELS[displayTheme] ?? displayTheme}. Click for ${nextLabel}`}
      title={`Theme: ${LABELS[displayTheme] ?? displayTheme} → ${nextLabel}`}
    >
      <ThemeIcon theme={displayTheme} />
    </Button>
  );
}
