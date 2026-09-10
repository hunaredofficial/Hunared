"use client";

import { Sparkles, Check, X, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type SmartListingParseResult,
  type Confidence,
  confidencePercent,
  hasListingSuggestions,
} from "@/lib/smartListingParser";

export type SmartListingFieldKey =
  | "category"
  | "subcategory"
  | "condition"
  | "rentalPeriod"
  | "price"
  | "currency"
  | "country"
  | "city"
  | "contactPhone"
  | "suggestedDescription";

const FIELD_LABELS: Record<SmartListingFieldKey, string> = {
  category: "Category",
  subcategory: "Subcategory",
  condition: "Condition",
  rentalPeriod: "Rental Period",
  price: "Price",
  currency: "Currency",
  country: "Country",
  city: "City",
  contactPhone: "Contact Phone",
  suggestedDescription: "Description",
};

function confColor(c: Confidence): string {
  if (c === "high") return "text-emerald-600 dark:text-emerald-400";
  if (c === "medium") return "text-amber-600 dark:text-amber-400";
  return "text-muted-foreground";
}

function displayValue(
  key: SmartListingFieldKey,
  result: SmartListingParseResult
): string {
  const s = result[key];
  if (!s) return "";
  if (key === "suggestedDescription") {
    const plain = s.value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return plain.length > 80 ? plain.slice(0, 80) + "…" : plain;
  }
  if (key === "category") return s.label ?? s.value;
  if (key === "country") return s.label ?? s.value;
  return s.value;
}

export function SmartListingFillPanel({
  status,
  result,
  dismissed,
  onApplyAll,
  onApplyOne,
  onDismiss,
  onRefresh,
}: {
  status: "idle" | "analyzing" | "found" | "empty";
  result: SmartListingParseResult | null;
  dismissed: boolean;
  onApplyAll: () => void;
  onApplyOne: (key: SmartListingFieldKey) => void;
  onDismiss: () => void;
  onRefresh: () => void;
}) {
  if (status === "idle") return null;

  if (status === "analyzing") {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Analyzing title & description…
      </div>
    );
  }

  if (dismissed) {
    return (
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground"
          onClick={onRefresh}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Re-analyze listing
        </Button>
      </div>
    );
  }

  if (status === "empty" || !result || !hasListingSuggestions(result)) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground flex items-center justify-between gap-2">
        <span>No auto-fill suggestions yet — add more detail in the title.</span>
        <Button type="button" variant="ghost" size="sm" onClick={onRefresh} className="gap-1 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  const keys = (
    [
      "category",
      "subcategory",
      "condition",
      "rentalPeriod",
      "price",
      "currency",
      "country",
      "city",
      "contactPhone",
      "suggestedDescription",
    ] as SmartListingFieldKey[]
  ).filter((k) => result[k]);

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Smart Fill suggestions</p>
            <p className="text-xs text-muted-foreground">
              Detected from your title & description — review before applying
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground p-1"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ul className="space-y-1.5">
        {keys.map((key) => {
          const s = result[key]!;
          return (
            <li
              key={key}
              className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-card/80 px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <span className="text-xs text-muted-foreground">
                  {FIELD_LABELS[key]}
                </span>
                <p className="font-medium truncate">{displayValue(key, result)}</p>
                <span className={cn("text-[11px]", confColor(s.confidence))}>
                  {confidencePercent(s.confidence)}% match
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0 gap-1 h-8"
                onClick={() => onApplyOne(key)}
              >
                <Check className="h-3.5 w-3.5" />
                Apply
              </Button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="button" size="sm" className="gap-1.5" onClick={onApplyAll}>
          <Sparkles className="h-3.5 w-3.5" />
          Apply all
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
