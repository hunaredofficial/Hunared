"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import {
  parseMagicJobRaw,
  parseMagicListingRaw,
  type MagicJobFields,
  type MagicListingFields,
} from "@/lib/magicPostParser";

type Mode = "job" | "listing";

type Props = {
  mode: Mode;
  onApplyJob?: (fields: MagicJobFields) => void;
  onApplyListing?: (fields: MagicListingFields) => void;
};

/**
 * Team-only Magic Post: paste raw text → auto-fill all form fields.
 * Hidden for non-team / non-admin users.
 */
export function MagicPostPanel({ mode, onApplyJob, onApplyListing }: Props) {
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Team/admin can list team profiles; others get 403
        const res = await fetch("/api/team/create-profile");
        if (!cancelled) setAllowed(res.ok);
      } catch {
        if (!cancelled) setAllowed(false);
      } finally {
        if (!cancelled) setChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!checked || !allowed) return null;

  function run() {
    const text = raw.trim();
    if (text.length < 12) {
      toast.error("Paste more text — at least a title and a few details.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "job") {
        const fields = parseMagicJobRaw(text);
        onApplyJob?.(fields);
        toast.success(
          `Magic Post filled: ${fields.jobTitle.slice(0, 60)}${
            fields.companyName ? ` · ${fields.companyName}` : ""
          }`
        );
      } else {
        const fields = parseMagicListingRaw(text);
        onApplyListing?.(fields);
        toast.success(
          `Magic Post filled: ${fields.title.slice(0, 60)}${
            fields.category ? ` · ${fields.category}` : ""
          }`
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not parse text");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-background to-background p-4 space-y-3">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 rounded-lg bg-violet-500/20 p-1.5 text-violet-300">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
            Magic Post
            <span className="text-[10px] font-medium uppercase tracking-wider text-violet-300/90 rounded-full border border-violet-500/30 px-1.5 py-0.5">
              Team
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Paste raw {mode === "job" ? "job" : "marketplace"} text below. Magic Post
            fills title, description, location, category and other fields automatically.
            You can edit anything after.
          </p>
        </div>
      </div>

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={7}
        placeholder={
          mode === "job"
            ? "Example:\nInstrument Technician — Jubail\nCompany: Gulf Petro\nCountry: Saudi Arabia\nCity: Jubail\nEmployment: Temporary\nDuration: 6 Months\nCategory: Instrumentation\n\nResponsibilities:\n- Calibrate transmitters…\n- Maintain DCS/PLC…"
            : "Example:\nToyota Camry 2019 for sale\nPrice: 45000 SAR\nCity: Riyadh\nCondition: Used\nCategory: Vehicles\n\nClean car, full service history…"
        }
        className="w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm font-mono leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
        spellCheck={false}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={run}
          disabled={busy || raw.trim().length < 8}
          className="gap-2 bg-violet-600 hover:bg-violet-500 text-white"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
          Fill form from raw text
        </Button>
        {raw.trim() && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setRaw("")}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
