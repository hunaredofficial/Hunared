"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  History,
  Loader2,
  Trash2,
  ExternalLink,
  Settings,
  ShieldOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  event_type: string;
  path: string;
  title: string | null;
  created_at: string;
};

const FILTERS = [
  { id: "", label: "All" },
  { id: "page_view", label: "Pages" },
  { id: "job_view", label: "Jobs" },
  { id: "listing_view", label: "Marketplace" },
  { id: "company_view", label: "Companies" },
  { id: "candidate_view", label: "Talent" },
  { id: "search", label: "Search" },
];

function typeLabel(t: string) {
  return (
    {
      page_view: "Page",
      job_view: "Job",
      listing_view: "Listing",
      company_view: "Company",
      candidate_view: "Talent",
      search: "Search",
      message_open: "Messages",
      cv_open: "CV Builder",
      other: "Other",
    }[t] || t
  );
}

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function HistoryClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = filter ? `?type=${encodeURIComponent(filter)}` : "";
      const res = await fetch(`/api/activity${q}`);
      const j = await res.json();
      setItems(j.items || []);
      if (typeof j.history_enabled === "boolean") setEnabled(j.history_enabled);
    } catch {
      toast.error("Could not load history");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function removeOne(id: string) {
    const res = await fetch("/api/activity", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      toast.error("Could not delete");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function clearAll() {
    if (!confirm("Clear all activity history? This cannot be undone.")) return;
    setClearing(true);
    try {
      const res = await fetch("/api/activity", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAll: true }),
      });
      if (!res.ok) {
        toast.error("Could not clear history");
        return;
      }
      setItems([]);
      toast.success("History cleared");
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Activity history
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pages and listings you opened on Hunared. Only you can see this.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/settings#privacy">
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Privacy settings
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={clearing || !items.length}
            onClick={() => void clearAll()}
          >
            {clearing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            )}
            Clear all
          </Button>
        </div>
      </div>

      {!enabled && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-3 text-sm">
          <ShieldOff className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">History is paused</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              New activity is not being saved. Turn it back on in{" "}
              <Link href="/dashboard/settings#privacy" className="text-primary hover:underline">
                Settings → Privacy
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id || "all"}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-colors",
              filter === f.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card/40 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <History className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-medium">No history yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              When history is on, jobs, marketplace listings, companies, and pages you open appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-primary/90 bg-primary/10 px-1.5 py-0.5 rounded">
                      {typeLabel(item.event_type)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatWhen(item.created_at)}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate mt-0.5">
                    {item.title || item.path}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{item.path}</p>
                </div>
                <Link
                  href={item.path.startsWith("/") ? item.path.split("?")[0] : "/"}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
                  title="Open"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                  title="Remove"
                  onClick={() => void removeOne(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
