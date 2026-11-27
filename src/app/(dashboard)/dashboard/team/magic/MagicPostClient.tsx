"use client";

/**
 * Team Magic Post — paste many jobs or listings at once.
 * Split → smart-fill every field → review → one-click publish (bulk API).
 */

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Store,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  JOB_CATEGORIES,
  DURATIONS,
  SALARY_TYPES,
  LISTING_CATEGORIES,
} from "@/lib/constants";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import {
  parseMagicJobsBatch,
  parseMagicListingsBatch,
  type MagicJobFields,
  type MagicListingFields,
} from "@/lib/magicPostParser";

type Mode = "jobs" | "listings";

type JobRow = MagicJobFields & { open: boolean; id: string };
type ListingRow = MagicListingFields & { open: boolean; id: string };

const inputCls =
  "w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground block mb-1";
const areaCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-ring";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const BATCH = 50;

export default function MagicPostClient() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("jobs");
  const [raw, setRaw] = useState("");
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastResult, setLastResult] = useState("");

  const count = mode === "jobs" ? jobs.length : listings.length;

  const runParse = useCallback(() => {
    const text = raw.trim();
    if (!text) {
      toast.error("Paste job or listing text first");
      return;
    }
    setParsing(true);
    setLastResult("");
    try {
      if (mode === "jobs") {
        const parsed = parseMagicJobsBatch(text);
        if (!parsed.length) {
          toast.error("Could not detect any job blocks");
          return;
        }
        setJobs(
          parsed.map((p) => ({
            ...p,
            open: false,
            id: uid(),
          }))
        );
        setListings([]);
        toast.success(`Detected ${parsed.length} job${parsed.length === 1 ? "" : "s"}`);
      } else {
        const parsed = parseMagicListingsBatch(text);
        if (!parsed.length) {
          toast.error("Could not detect any listing blocks");
          return;
        }
        setListings(
          parsed.map((p) => ({
            ...p,
            open: false,
            id: uid(),
          }))
        );
        setJobs([]);
        toast.success(
          `Detected ${parsed.length} listing${parsed.length === 1 ? "" : "s"}`
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Parse failed");
    } finally {
      setParsing(false);
    }
  }, [raw, mode]);

  function updateJob(id: string, patch: Partial<JobRow>) {
    setJobs((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  }

  function updateListing(id: string, patch: Partial<ListingRow>) {
    setListings((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  }

  function removeJob(id: string) {
    setJobs((prev) => prev.filter((r) => r.id !== id));
  }

  function removeListing(id: string) {
    setListings((prev) => prev.filter((r) => r.id !== id));
  }

  async function publishAll() {
    if (mode === "jobs") {
      const payload = jobs
        .filter((j) => j.jobTitle.trim() && j.jobDescription.trim())
        .map(({ open: _o, id: _i, ...rest }) => rest);
      if (!payload.length) {
        toast.error("Need at least one job with title and description");
        return;
      }
      setPublishing(true);
      setLastResult("");
      let created = 0;
      const allResults: unknown[] = [];
      try {
        for (let i = 0; i < payload.length; i += BATCH) {
          const chunk = payload.slice(i, i + BATCH);
          const res = await fetch("/api/team/bulk-jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobs: chunk }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Publish failed");
          created += data.created ?? 0;
          allResults.push(data);
        }
        toast.success(`Published ${created} job${created === 1 ? "" : "s"}`);
        setLastResult(JSON.stringify(allResults, null, 2));
        if (created > 0) {
          setJobs([]);
          setRaw("");
          router.refresh();
          window.setTimeout(() => router.push("/dashboard/jobs"), 700);
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Publish failed");
      } finally {
        setPublishing(false);
      }
    } else {
      const payload = listings
        .filter((l) => l.title.trim() && l.description.trim())
        .map(({ open: _o, id: _i, ...rest }) => rest);
      if (!payload.length) {
        toast.error("Need at least one listing with title and description");
        return;
      }
      setPublishing(true);
      setLastResult("");
      let created = 0;
      const allResults: unknown[] = [];
      try {
        for (let i = 0; i < payload.length; i += BATCH) {
          const chunk = payload.slice(i, i + BATCH);
          const res = await fetch("/api/team/bulk-market", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listings: chunk }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Publish failed");
          created += data.created ?? 0;
          allResults.push(data);
        }
        toast.success(
          `Published ${created} listing${created === 1 ? "" : "s"}`
        );
        setLastResult(JSON.stringify(allResults, null, 2));
        if (created > 0) {
          setListings([]);
          setRaw("");
          router.refresh();
          window.setTimeout(() => router.push("/dashboard/market"), 700);
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Publish failed");
      } finally {
        setPublishing(false);
      }
    }
  }

  const validCount = useMemo(() => {
    if (mode === "jobs") {
      return jobs.filter((j) => j.jobTitle.trim() && j.jobDescription.trim())
        .length;
    }
    return listings.filter((l) => l.title.trim() && l.description.trim()).length;
  }, [mode, jobs, listings]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Wand2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Magic Post</h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Team tool: paste{" "}
          <strong className="text-foreground">many jobs or listings</strong> in
          one go (10–100). Magic splits them, smart-fills every field, then you
          publish all with one click. Separate posts with blank lines,{" "}
          <code className="text-xs bg-muted px-1 rounded">---</code>, or numbers
          (1. 2. 3.).
        </p>
      </div>

      {/* Mode */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "jobs" ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setMode("jobs")}
        >
          <Briefcase className="h-4 w-4" /> Jobs
        </Button>
        <Button
          type="button"
          variant={mode === "listings" ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setMode("listings")}
        >
          <Store className="h-4 w-4" /> Business
        </Button>
      </div>

      {/* Paste */}
      <div className="space-y-3">
        <label className={labelCls}>
          Paste all {mode === "jobs" ? "job" : "listing"} posts here
        </label>
        <textarea
          className={cn(areaCls, "min-h-[220px] font-mono text-[13px]")}
          placeholder={
            mode === "jobs"
              ? "----------\n\n----------\n\n----------"
              : "----------\n\n----------\n\n----------"
          }
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => void runParse()}
            disabled={parsing || !raw.trim()}
            className="gap-1.5"
          >
            {parsing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Magic parse
          </Button>
          {count > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setJobs([]);
                setListings([]);
                setLastResult("");
              }}
            >
              Clear preview
            </Button>
          )}
        </div>
      </div>

      {/* Preview */}
      {count > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{count}</span>{" "}
              {mode === "jobs" ? "jobs" : "listings"} ready
              {validCount !== count && (
                <span className="text-amber-500">
                  {" "}
                  · {validCount} valid (title + description)
                </span>
              )}
            </p>
            <Button
              type="button"
              onClick={() => void publishAll()}
              disabled={publishing || validCount === 0}
              className="gap-1.5"
            >
              {publishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Publish all ({validCount})
            </Button>
          </div>

          {mode === "jobs"
            ? jobs.map((row, idx) => (
                <div
                  key={row.id}
                  className="rounded-lg border border-border bg-card overflow-hidden"
                >
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
                    onClick={() => updateJob(row.id, { open: !row.open })}
                  >
                    <span className="text-xs text-muted-foreground w-6">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {row.jobTitle || "Untitled"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[row.companyName, row.city || row.location, row.category]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                    {row.open ? (
                      <ChevronUp className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    )}
                    <span
                      role="button"
                      tabIndex={0}
                      className="p-1.5 rounded-md hover:bg-destructive/15 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeJob(row.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          removeJob(row.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </span>
                  </button>
                  {row.open && (
                    <div className="px-4 pb-4 grid sm:grid-cols-2 gap-3 border-t border-border pt-3">
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Title *</label>
                        <input
                          className={inputCls}
                          value={row.jobTitle}
                          onChange={(e) =>
                            updateJob(row.id, { jobTitle: e.target.value })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Description *</label>
                        <textarea
                          className={areaCls}
                          value={row.jobDescription}
                          onChange={(e) =>
                            updateJob(row.id, {
                              jobDescription: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Company</label>
                        <input
                          className={inputCls}
                          value={row.companyName}
                          onChange={(e) =>
                            updateJob(row.id, { companyName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Phone</label>
                        <input
                          className={inputCls}
                          value={row.companyPhone}
                          onChange={(e) =>
                            updateJob(row.id, { companyPhone: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Category</label>
                        <select
                          className={inputCls}
                          value={row.category}
                          onChange={(e) =>
                            updateJob(row.id, {
                              category: e.target.value,
                              categories: e.target.value
                                ? [e.target.value]
                                : [],
                            })
                          }
                        >
                          <option value="">—</option>
                          {JOB_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Country</label>
                        <select
                          className={inputCls}
                          value={row.country}
                          onChange={(e) =>
                            updateJob(row.id, { country: e.target.value })
                          }
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>City</label>
                        <input
                          className={inputCls}
                          value={row.city}
                          onChange={(e) =>
                            updateJob(row.id, { city: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Positions</label>
                        <input
                          className={inputCls}
                          value={row.positions}
                          onChange={(e) =>
                            updateJob(row.id, { positions: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Salary / rate</label>
                        <input
                          className={inputCls}
                          value={row.salaryRate}
                          onChange={(e) =>
                            updateJob(row.id, { salaryRate: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Salary type</label>
                        <select
                          className={inputCls}
                          value={row.salaryType}
                          onChange={(e) =>
                            updateJob(row.id, { salaryType: e.target.value })
                          }
                        >
                          <option value="">—</option>
                          {SALARY_TYPES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Duration</label>
                        <select
                          className={inputCls}
                          value={row.duration}
                          onChange={(e) =>
                            updateJob(row.id, {
                              duration: e.target.value,
                              employmentType:
                                e.target.value === "Permanent"
                                  ? "permanent"
                                  : "temporary",
                            })
                          }
                        >
                          <option value="">—</option>
                          {DURATIONS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Currency</label>
                        <input
                          className={inputCls}
                          value={row.currency}
                          onChange={(e) =>
                            updateJob(row.id, { currency: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            : listings.map((row, idx) => (
                <div
                  key={row.id}
                  className="rounded-lg border border-border bg-card overflow-hidden"
                >
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40"
                    onClick={() => updateListing(row.id, { open: !row.open })}
                  >
                    <span className="text-xs text-muted-foreground w-6">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {row.title || "Untitled"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[row.category, row.city, row.price]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                    {row.open ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span
                      role="button"
                      tabIndex={0}
                      className="p-1.5 rounded-md hover:bg-destructive/15 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeListing(row.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </span>
                  </button>
                  {row.open && (
                    <div className="px-4 pb-4 grid sm:grid-cols-2 gap-3 border-t border-border pt-3">
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Title *</label>
                        <input
                          className={inputCls}
                          value={row.title}
                          onChange={(e) =>
                            updateListing(row.id, { title: e.target.value })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Description *</label>
                        <textarea
                          className={areaCls}
                          value={row.description}
                          onChange={(e) =>
                            updateListing(row.id, {
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Category</label>
                        <select
                          className={inputCls}
                          value={row.category}
                          onChange={(e) =>
                            updateListing(row.id, { category: e.target.value })
                          }
                        >
                          {LISTING_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Price</label>
                        <input
                          className={inputCls}
                          value={row.price}
                          onChange={(e) =>
                            updateListing(row.id, { price: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Country</label>
                        <select
                          className={inputCls}
                          value={row.country}
                          onChange={(e) =>
                            updateListing(row.id, { country: e.target.value })
                          }
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>City</label>
                        <input
                          className={inputCls}
                          value={row.city}
                          onChange={(e) =>
                            updateListing(row.id, { city: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Phone</label>
                        <input
                          className={inputCls}
                          value={row.contact_phone}
                          onChange={(e) =>
                            updateListing(row.id, {
                              contact_phone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => void publishAll()}
              disabled={publishing || validCount === 0}
              className="gap-1.5"
            >
              {publishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Publish all ({validCount})
            </Button>
          </div>
        </div>
      )}

      {lastResult && (
        <pre className="text-xs bg-muted/50 rounded-lg p-3 overflow-auto max-h-48 border border-border">
          {lastResult}
        </pre>
      )}
    </div>
  );
}
