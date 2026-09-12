"use client";

import { Circle, Moon, Sun } from "lucide-react";
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

/** 4 theme options: 2 standard + 2 high-contrast */
const THEME_OPTIONS = [
  {
    value: "light",
    label: "Light",
    description: "Standard light theme",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Standard dark theme",
    icon: Moon,
  },
  {
    value: "contrast-white",
    label: "Contrast White",
    description: "High contrast — outdoor / sun",
    icon: Circle,
  },
  {
    value: "contrast-black",
    label: "Contrast Black",
    description: "High contrast — pure black",
    icon: Circle,
  },
] as const;

function TriggerIcon({
  theme,
  resolvedTheme,
}: {
  theme?: string;
  resolvedTheme?: string;
}) {
  if (theme === "contrast-white") {
    return <Circle className="h-4 w-4 fill-none stroke-[2.5]" />;
  }
  if (theme === "contrast-black") {
    return <Circle className="h-4 w-4 fill-current" />;
  }
  if (theme === "dark" || (theme === "system" && resolvedTheme === "dark")) {
    return <Moon className="h-4 w-4" />;
  }
  return <Sun className="h-4 w-4" />;
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Highlight: system resolves to light/dark for display, but no forced selection
  const active = theme ?? "system";

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
          <TriggerIcon theme={active} resolvedTheme={resolvedTheme} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-[11px] text-muted-foreground">
          {active === "system"
            ? "Using device theme — pick one to lock"
            : "Theme preference"}
        </div>
        {THEME_OPTIONS.map(({ value, label, description, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-start gap-2.5 cursor-pointer py-2",
              active === value && "bg-primary/10 text-primary"
            )}
          >
            {value === "contrast-black" ? (
              <Circle className="h-4 w-4 mt-0.5 shrink-0 fill-current" />
            ) : value === "contrast-white" ? (
              <Circle className="h-4 w-4 mt-0.5 shrink-0 stroke-[2.5]" />
            ) : (
              <Icon className="h-4 w-4 mt-0.5 shrink-0" />
            )}
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
