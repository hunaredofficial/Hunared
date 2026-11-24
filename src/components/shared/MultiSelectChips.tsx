"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

type MultiSelectChipsProps = {
  options: readonly string[] | string[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  max?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
};

/**
 * Inline-search multi-select matching form control height (h-10).
 * Search types in the same row; dropdown lists matches below.
 */
export function MultiSelectChips({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No matches",
  max,
  disabled,
  className,
  label,
}: MultiSelectChipsProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options as string[];
    return (options as string[]).filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function toggle(opt: string) {
    if (selected.has(opt)) {
      onChange(value.filter((v) => v !== opt));
      return;
    }
    if (max != null && value.length >= max) return;
    onChange([...value, opt]);
    setQuery("");
    inputRef.current?.focus();
  }

  function remove(opt: string) {
    onChange(value.filter((v) => v !== opt));
  }

  const display =
    open && query
      ? query
      : value.length === 0
        ? ""
        : value.length === 1
          ? value[0]
          : `${value.length} selected`;

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-label={label ?? placeholder}
          disabled={disabled}
          autoComplete="off"
          value={open ? query : display}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          className={cn(
            "flex h-10 min-h-10 w-full items-center rounded-md border border-input bg-input/30 px-3 pr-9 text-sm text-foreground shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring/40 dark:bg-input/30 dark:hover:bg-input/40",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <ChevronDown
          className={cn(
            "absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50 pointer-events-none transition-transform",
            open && "rotate-180"
          )}
        />
      </div>

      {value.length > 1 && !open && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[11px] text-foreground"
            >
              {v}
              <button
                type="button"
                disabled={disabled}
                aria-label={`Remove ${v}`}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                onClick={() => remove(v)}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-xl">
          <ul className="py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-muted-foreground">{emptyText}</li>
            ) : (
              filtered.map((opt) => {
                const isOn = selected.has(opt);
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggle(opt)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-accent hover:text-accent-foreground",
                        isOn && "bg-accent/50 font-medium"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isOn ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {opt}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
