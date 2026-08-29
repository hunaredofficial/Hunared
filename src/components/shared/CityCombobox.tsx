"use client";

import { getCitiesForCountry } from "@/lib/cities";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

/**
 * City field: type any city name + suggestions from country list.
 * Empty value = All Cities.
 * `variant="select"` matches country Select / native select styling.
 */
export function CityCombobox({
  country,
  value,
  onChange,
  className,
  inputClassName,
  id = "city-combobox",
  size = "md",
  variant = "select",
}: {
  country: string;
  value: string;
  onChange: (city: string) => void;
  className?: string;
  inputClassName?: string;
  id?: string;
  size?: "sm" | "md" | "lg";
  /** select = match country dropdown colors; hero = primary-tinted hero style */
  variant?: "select" | "hero";
}) {
  const cities = getCitiesForCountry(
    !country || country === "all" ? "" : country
  );
  const listId = `${id}-list`;

  const height =
    size === "lg" ? "h-12 sm:h-13" : size === "sm" ? "h-9" : "h-10";

  const baseStyle =
    variant === "hero"
      ? "rounded-xl border border-primary/15 bg-background/70 text-sm sm:text-base text-foreground focus:ring-primary/30 [color-scheme:dark]"
      : "rounded-md border border-input bg-background text-sm text-foreground focus:ring-ring [color-scheme:dark]";

  return (
    <div className={cn("relative", className)}>
      <input
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="All Cities"
        autoComplete="off"
        data-color-scheme="dark"
        className={cn(
          "w-full pl-3 pr-8 appearance-none focus:outline-none focus:ring-2 cursor-text",
          height,
          baseStyle,
          inputClassName
        )}
      />
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none opacity-50" />
      <datalist id={listId}>
        {cities.map((c) => (
          <option key={c} value={c} className="bg-background text-foreground" />
        ))}
      </datalist>
    </div>
  );
}
