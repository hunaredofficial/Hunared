"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  {
    value: "system",
    label: "Auto",
    description: "Match device theme",
    icon: Monitor,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Dim for low light",
    icon: Moon,
  },
  {
    value: "high-contrast",
    label: "Daylight",
    description: "High contrast for sun",
    icon: Sun,
  },
] as const;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const active = theme ?? "system";
  const TriggerIcon =
    !mounted
      ? Sun
      : active === "system"
        ? Monitor
        : active === "high-contrast"
          ? Sun
          : active === "dark" || resolvedTheme === "dark"
            ? Moon
            : Sun;

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 transition-all duration-300 hover:bg-primary/10 cursor-pointer"
          aria-label="Theme settings"
          title="Theme"
        >
          <TriggerIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {THEME_OPTIONS.map(({ value, label, description, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-start gap-2.5 cursor-pointer py-2",
              active === value && "bg-primary/10 text-primary"
            )}
          >
            <Icon className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium leading-none">{label}</span>
              <span className="text-[11px] text-muted-foreground font-normal">
                {description}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
