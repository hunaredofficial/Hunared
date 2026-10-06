"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getCitiesForCountry } from "@/lib/cities";
import { cn } from "@/lib/utils";
import { ChevronDown, MapPin, X } from "lucide-react";

/**
 * City field: type any city name + full scrollable suggestions from country list.
 * Empty value = All Cities.
 * Dropdown uses a fixed portal so it is not clipped by parent overflow-hidden (hero).
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
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
    maxH: number;
    openUp: boolean;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current && rootRef.current.contains(target)) return;
      const portal = document.getElementById(`${id}-city-portal`);
      if (portal && portal.contains(target)) return;
      setOpen(false);
      setQuery(value || "");
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [value, id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => c.toLowerCase().includes(q));
  }, [cities, query]);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setPos(null);
      return;
    }
    function measure() {
      if (!rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
      const maxH = Math.min(320, Math.max(200, openUp ? spaceAbove : spaceBelow));
      setPos({
        top: openUp ? rect.top : rect.bottom,
        left: rect.left,
        width: Math.max(rect.width, 200),
        maxH,
        openUp,
      });
    }
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open, cities.length, query]);

  const height =
    size === "lg" ? "h-11 sm:h-12" : size === "sm" ? "h-9" : "h-10";

  const baseStyle =
    variant === "hero"
      ? "rounded-lg border border-border bg-background text-sm text-foreground focus:ring-primary/30 [color-scheme:dark]"
      : "rounded-md border border-input bg-background text-sm text-foreground focus:ring-ring [color-scheme:dark]";

  function commit(city: string) {
    onChange(city);
    setQuery(city);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const q = query.trim();
      if (!q) {
        commit("");
        return;
      }
      const match = filtered.find((c) => c.toLowerCase() === q.toLowerCase());
      commit(match || q);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery(value || "");
    } else if (e.key === "ArrowDown") {
      setOpen(true);
    }
  }

  const dropdown =
    open && pos && mounted
      ? createPortal(
          <div
            id={`${id}-city-portal`}
            className="fixed z-[300] rounded-lg border border-border bg-popover text-popover-foreground shadow-xl overflow-hidden"
            style={{
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxH,
              ...(pos.openUp
                ? { bottom: window.innerHeight - pos.top + 4 }
                : { top: pos.top + 4 }),
            }}
            role="listbox"
          >
            <ul
              className="overflow-y-auto overscroll-contain py-1"
              style={{ maxHeight: pos.maxH }}
            >
              <li>
                <button
                  type="button"
                  role="option"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commit("")}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
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
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => commit(c)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground",
                        value === c && "bg-accent/50 font-medium text-foreground"
                      )}
                    >
                      {c}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          placeholder="All Cities"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            "w-full pl-3.5 pr-16 focus:outline-none focus:ring-2",
            height,
            baseStyle,
            inputClassName
          )}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {(value || query) && (
            <button
              type="button"
              aria-label="Clear city"
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => {
                commit("");
                inputRef.current?.focus();
              }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground pointer-events-none opacity-50 transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </div>
      {dropdown}
    </div>
  );
}
