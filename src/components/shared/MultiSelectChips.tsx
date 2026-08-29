"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
 * Searchable multi-select with removable chips.
 * Prevents duplicates; selection is optional unless parent validates.
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

  const selected = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options as string[];
    return (options as string[]).filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
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
  }

  function remove(opt: string) {
    onChange(value.filter((v) => v !== opt));
  }

  return (
    <div ref={rootRef} className={cn("relative space-y-2", className)}>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <Badge
              key={v}
              variant="secondary"
              className="gap-1 pr-1 font-normal"
            >
              {v}
              <button
                type="button"
                disabled={disabled}
                aria-label={`Remove ${v}`}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                onClick={() => remove(v)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        aria-label={label ?? placeholder}
        disabled={disabled}
        className="w-full justify-between font-normal"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate text-muted-foreground">
          {value.length === 0 ? placeholder : `${value.length} selected`}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="flex items-center border-b px-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 border-0 shadow-none focus-visible:ring-0"
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </p>
            ) : (
              filtered.map((opt) => {
                const isOn = selected.has(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent",
                      isOn && "bg-accent/60"
                    )}
                    onClick={() => toggle(opt)}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isOn ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{opt}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
