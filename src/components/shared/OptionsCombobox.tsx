"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export type OptionItem = { value: string; label: string };

/**
 * Dropdown matching CityCombobox look: portal list, same padding/hover/panel.
 * Used for Country / Category in hero and anywhere a fixed option list is needed.
 */
export function OptionsCombobox({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
  id = "options-combobox",
  size = "md",
  variant = "select",
  searchable = true,
  leadingIcon,
}: {
  value: string;
  onChange: (value: string) => void;
  options: OptionItem[];
  placeholder?: string;
  className?: string;
  id?: string;
  size?: "sm" | "md" | "lg";
  variant?: "select" | "hero";
  searchable?: boolean;
  leadingIcon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
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

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? (value ? value : "");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open, value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current && rootRef.current.contains(target)) return;
      const portal = document.getElementById(`${id}-options-portal`);
      if (portal && portal.contains(target)) return;
      setOpen(false);
      setQuery("");
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q)
    );
  }, [options, query]);

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
  }, [open, filtered.length, query]);

  const height =
    size === "lg" ? "h-11 sm:h-12" : size === "sm" ? "h-9" : "h-10";

  const baseStyle =
    variant === "hero"
      ? "rounded-lg border border-border bg-background text-sm text-foreground focus:ring-primary/30 [color-scheme:dark]"
      : "rounded-md border border-input bg-input/30 text-sm text-foreground shadow-none focus:ring-ring dark:bg-input/30 dark:hover:bg-input/40 [color-scheme:dark]";

  function commit(v: string) {
    onChange(v);
    setQuery("");
    setOpen(false);
  }

  const display = open && searchable ? query : selectedLabel;

  const dropdown =
    open && pos && mounted
      ? createPortal(
          <div
            id={`${id}-options-portal`}
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
              {filtered.length === 0 ? (
                <li className="px-3 py-3 text-sm text-muted-foreground">
                  No match
                </li>
              ) : (
                filtered.map((o) => (
                  <li key={o.value || o.label}>
                    <button
                      type="button"
                      role="option"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => commit(o.value)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground",
                        value === o.value &&
                          "bg-accent/50 font-medium text-foreground"
                      )}
                    >
                      {o.label}
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
        {leadingIcon}
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          autoComplete="off"
          readOnly={!searchable}
          value={display}
          placeholder={placeholder}
          onChange={(e) => {
            if (!searchable) return;
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          className={cn(
            "w-full pr-9 focus:outline-none focus:ring-2 cursor-pointer",
            leadingIcon ? "pl-9" : "pl-3.5",
            height,
            baseStyle
          )}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          
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
