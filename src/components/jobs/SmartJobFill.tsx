"use client";

import { Sparkles, Check, X, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type SmartJobParseResult,
  type Confidence,
  confidencePercent,
  hasSuggestions,
} from "@/lib/smartJobParser";

export type SmartFillFieldKey =
  | "category"
  | "categories"
  | "country"
  | "city"
  | "currency"
  | "salaryRate"
  | "salaryType"
  | "duration"
  | "employmentType"
  | "jobTitle"
  | "companyEmail"
  | "companyPhone";

const FIELD_LABELS: Record<SmartFillFieldKey, string> = {
  category: "Category",
  categories: "Categories",
  country: "Country",
  city: "City",
  currency: "Currency",
  salaryRate: "Rate",
  salaryType: "Rate Type",
  duration: "Duration",
  employmentType: "Job Type",
  jobTitle: "Job Title",
  companyEmail: "Email",
  companyPhone: "Phone / WhatsApp",
};

function confColor(c: Confidence): string {
  if (c === "high") return "text-emerald-600 dark:text-emerald-400";
  if (c === "medium") return "text-amber-600 dark:text-amber-400";
  return "text-muted-foreground";
}

export function SmartJobFillPanel({
  status,
  result,
  dismissed,
  onApplyAll,
  onApplyOne,
  onDismiss,
  onRefresh,
}: {
  status: "idle" | "analyzing" | "found" | "empty";
  result: SmartJobParseResult | null;
  dismissed: boolean;
  onApplyAll: () => void;
  onApplyOne: (key: SmartFillFieldKey) => void;
  onDismiss: () => void;
  onRefresh: () => void;
}) {
  if (status === "idle") return null;

  if (status === "analyzing") {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Analyzing job title & description…
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
          className="gap-1.5 text-xs"
          onClick={onRefresh}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Smart Fill Again
        </Button>
      </div>
    );
  }

  if (status === "empty" || !result || !hasSuggestions(result)) {
    return (
      <div className="rounded-xl border border-dashed px-4 py-3 text-xs text-muted-foreground flex items-center justify-between gap-2">
        <span>No additional information detected from the text.</span>
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onRefresh}>
          <RefreshCw className="h-3 w-3" /> Retry
        </Button>
      </div>
    );
  }

  const rows: { key: SmartFillFieldKey; label: string; display: string; conf: Confidence }[] = [];

  (Object.keys(FIELD_LABELS) as SmartFillFieldKey[]).forEach((key) => {
    const field = result[key];
    if (!field) return;
    rows.push({
      key,
      label: FIELD_LABELS[key],
      display: field.label,
      conf: field.confidence,
    });
  });

  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-background to-background shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-primary/10 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          Smart Fill detected
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md"
          aria-label="Dismiss suggestions"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ul className="px-4 py-3 space-y-2">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex flex-wrap items-center justify-between gap-2 text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-muted-foreground shrink-0">{row.label}</span>
              <span className="font-medium truncate">{row.display}</span>
              <span className={cn("text-[10px] font-medium tabular-nums", confColor(row.conf))}>
                {confidencePercent(row.conf)}%
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs shrink-0"
              onClick={() => onApplyOne(row.key)}
            >
              Apply
            </Button>
          </li>
        ))}
      </ul>

      {result.keywords.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {result.keywords.slice(0, 8).map((k) => (
            <span
              key={k}
              className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
            >
              {k}
            </span>
          ))}
        </div>
      )}

      <div className="px-4 py-3 border-t border-primary/10 flex flex-wrap gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onDismiss}>
          Ignore
        </Button>
        <Button type="button" size="sm" className="gap-1.5" onClick={onApplyAll}>
          <Sparkles className="h-3.5 w-3.5" />
          Apply Suggestions
        </Button>
      </div>
    </div>
  );
}
