"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getCitiesForCountry } from "@/lib/cities";
import { cn } from "@/lib/utils";
import { ChevronDown, MapPin, Search, X } from "lucide-react";

/**
 * City field: type any city name + full scrollable suggestions from country list.
 * Empty value = All Cities.
 * Dropdown opens upward when there is not enough space below (e.g. hero form).
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
  variant?: "select" | "hero";
}) {
  const cities = getCitiesForCountry(
    !country || country === "all" ? "" : country
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const [openUp, setOpenUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value || "");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [value]);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    // Prefer up when less than ~300px below or more space above
    setOpenUp(spaceBelow < 300 && spaceAbove > spaceBelow);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => c.toLowerCase().includes(q));
  }, [cities, query]);

  const height =
    size === "lg" ? "h-12 sm:h-13" : size === "sm" ? "h-9" : "h-10";

  const baseStyle =
    variant === "hero"
      ? "rounded-xl border border-primary/15 bg-background/70 text-sm sm:text-base text-foreground focus:ring-primary/30 [color-scheme:dark]"
      : "rounded-md border border-input bg-background text-sm text-foreground focus:ring-ring [color-scheme:dark]";

  function commit(city: string) {
    onChange(city);
    setQuery(city);
    setOpen(false);
  }

  function clear() {
    onChange("");
    setQuery("");
    setOpen(true);
  }

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <div className="relative">
        <input
          id={id}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (filtered.length === 1) {
                commit(filtered[0]);
              } else if (query.trim()) {
                commit(query.trim());
              } else {
                commit("");
              }
            }
            if (e.key === "Escape") {
              setOpen(false);
              setQuery(value || "");
            }
          }}
          placeholder="All Cities"
          autoComplete="off"
          data-color-scheme="dark"
          className={cn(
            "w-full pl-3 pr-14 appearance-none focus:outline-none focus:ring-2 cursor-text",
            height,
            baseStyle,
            inputClassName
          )}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {query ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
              className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              aria-label="Clear city"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground pointer-events-none opacity-50 transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </div>

      {open && (
        <div
          className={cn(
            "absolute z-[100] w-full min-w-[200px] max-h-[280px] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl",
            openUp ? "bottom-full mb-1" : "top-full mt-1"
          )}
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60 text-xs text-muted-foreground">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {country && country !== "all"
                ? `${filtered.length} of ${cities.length} cities`
                : cities.length
                  ? `${filtered.length} cities`
                  : "Type any city name"}
            </span>
          </div>
          <ul
            ref={listRef}
            className="max-h-[230px] overflow-y-auto overscroll-contain py-1"
            role="listbox"
          >
            <li>
              <button
                type="button"
                role="option"
                onClick={() => commit("")}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                  !value && "bg-accent/50 text-foreground font-medium"
                )}
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                All Cities
              </button>
            </li>
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-muted-foreground">
                No match — press Enter to use “{query.trim()}”
              </li>
            ) : (
              filtered.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    role="option"
                    onClick={() => commit(c)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                      value === c && "bg-accent/50 font-medium text-foreground"
                    )}
                  >
                    {c}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
