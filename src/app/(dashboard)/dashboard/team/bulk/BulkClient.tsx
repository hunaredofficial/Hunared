"use client";

/**
 * Team Bulk Post — same field set as single Job / Marketplace forms.
 * Add multiple rows, then publish all at once (auto-approved).
 */

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Store,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  JOB_CATEGORIES,
  DURATIONS,
  SALARY_TYPES,
  LISTING_CATEGORIES,
  LISTING_CONDITION_OPTIONS,
  RENTAL_PERIOD_OPTIONS,
  LISTING_SUBCATEGORIES,
} from "@/lib/constants";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import {
  parseMagicJobRaw,
  parseMagicListingRaw,
} from "@/lib/magicPostParser";

type JobRow = {
  jobTitle: string;
  jobDescription: string;
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
  country: string;
  city: string;
  workLocation: string;
  employmentType: "permanent" | "temporary";
  duration: string;
  category: string;
  positions: string;
  salaryType: string;
  salaryRate: string;
  currency: string;
  mapLocation: string;
  open: boolean;
  smartRaw: string;
  smartOpen: boolean;
};

type MarketRow = {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  condition: string;
  price: string;
  currency: string;
  country: string;
  city: string;
  contact_phone: string;
  rentalPeriod: string;
  open: boolean;
  smartRaw: string;
  smartOpen: boolean;
};

const emptyJob = (): JobRow => ({
  jobTitle: "",
  jobDescription: "",
  companyName: "",
  companyPhone: "",
  companyEmail: "",
  companyAddress: "",
  country: "SA",
  city: "",
  workLocation: "",
  employmentType: "permanent",
  duration: "Permanent",
  category: "",
  positions: "1",
  salaryType: "",
  salaryRate: "",
  currency: "SAR",
  mapLocation: "",
  open: true,
  smartRaw: "",
  smartOpen: false,
});

const emptyMarket = (): MarketRow => ({
  title: "",
  description: "",
  category: "for_sale",
  subcategory: "",
  condition: "",
  price: "",
  currency: "SAR",
  country: "SA",
  city: "",
  contact_phone: "",
  rentalPeriod: "",
  open: true,
  smartRaw: "",
  smartOpen: false,
});

const inputCls =
  "w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground block mb-1";
const areaCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground min-h-[88px] resize-y focus:outline-none focus:ring-2 focus:ring-ring";

export default function BulkClient() {
  const [jobs, setJobs] = useState<JobRow[]>([emptyJob()]);
  const [listings, setListings] = useState<MarketRow[]>([emptyMarket()]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [lastResult, setLastResult] = useState("");

  const jobCount = useMemo(
    () => jobs.filter((j) => j.jobTitle.trim() && j.jobDescription.trim()).length,
    [jobs]
  );
  const marketCount = useMemo(
    () => listings.filter((l) => l.title.trim() && l.description.trim()).length,
    [listings]
  );

  function updateJob(i: number, patch: Partial<JobRow>) {
    setJobs((prev) =>
      prev.map((row, idx) => {
        if (idx !== i) return row;
        const next = { ...row, ...patch };
        // Keep employment type in sync with duration (same as job form)
        if (patch.duration !== undefined) {
          next.employmentType =
            patch.duration === "Permanent" ? "permanent" : "temporary";
        }
        if (patch.employmentType === "permanent" && !patch.duration) {
          next.duration = "Permanent";
        }
        return next;
      })
    );
  }

  function updateListing(i: number, patch: Partial<MarketRow>) {
    setListings((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, ...patch } : row))
    );
  }

  function applySmartJob(i: number) {
    const raw = jobs[i]?.smartRaw?.trim() || "";
    if (raw.length < 12) {
      toast.error("Paste more text for Smart Fill");
      return;
    }
    try {
      const f = parseMagicJobRaw(raw);
      const emp =
        f.employmentType === "temporary" ||
        (f.duration && f.duration !== "Permanent")
          ? "temporary"
          : "permanent";
      updateJob(i, {
        jobTitle: f.jobTitle || jobs[i].jobTitle,
        jobDescription: f.jobDescription || jobs[i].jobDescription,
        companyName: f.companyName || jobs[i].companyName,
        companyPhone: f.companyPhone || jobs[i].companyPhone,
        companyEmail: f.companyEmail || jobs[i].companyEmail,
        companyAddress: f.companyAddress || jobs[i].companyAddress,
        country: f.country || jobs[i].country,
        city: f.city || jobs[i].city,
        workLocation: f.workLocation || jobs[i].workLocation,
        employmentType: emp,
        duration:
          f.duration ||
          (emp === "permanent" ? "Permanent" : jobs[i].duration),
        category: f.category || f.categories?.[0] || jobs[i].category,
        positions: f.positions || jobs[i].positions,
        salaryType: f.salaryType || jobs[i].salaryType,
        salaryRate: f.salaryRate || jobs[i].salaryRate,
        currency: f.currency || jobs[i].currency,
        mapLocation: f.mapLocation || jobs[i].mapLocation,
        smartOpen: false,
      });
      toast.success(`Smart Fill applied to job #${i + 1}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Smart Fill failed");
    }
  }

  function applySmartListing(i: number) {
    const raw = listings[i]?.smartRaw?.trim() || "";
    if (raw.length < 12) {
      toast.error("Paste more text for Smart Fill");
      return;
    }
    try {
      const f = parseMagicListingRaw(raw);
      updateListing(i, {
        title: f.title || listings[i].title,
        description: f.description || listings[i].description,
        category: f.category || listings[i].category,
        subcategory: f.subcategory || listings[i].subcategory,
        condition: f.condition || listings[i].condition,
        price: f.price || listings[i].price,
        currency: f.currency || listings[i].currency,
        country: f.country || listings[i].country,
        city: f.city || listings[i].city,
        contact_phone: f.contact_phone || listings[i].contact_phone,
        rentalPeriod: f.rentalPeriod || listings[i].rentalPeriod,
        smartOpen: false,
      });
      toast.success(`Smart Fill applied to listing #${i + 1}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Smart Fill failed");
    }
  }


  async function submitJobs() {
    const payload = jobs
      .filter((j) => j.jobTitle.trim() && j.jobDescription.trim())
      .map(({ open: _o, smartRaw: _s, smartOpen: _so, ...rest }) => rest);
    if (!payload.length) {
      toast.error("Add at least one job with title and description");
      return;
    }
    setJobsLoading(true);
    setLastResult("");
    try {
      const res = await fetch("/api/team/bulk-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(
        `Published ${data.created}/${data.total} jobs` +
          (data.linked ? ` · ${data.linked} linked to team companies` : "")
      );
      setLastResult(JSON.stringify(data, null, 2));
      if (data.created > 0) setJobs([emptyJob()]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setJobsLoading(false);
    }
  }

  async function submitMarket() {
    const payload = listings
      .filter((l) => l.title.trim() && l.description.trim())
      .map(({ open: _o, smartRaw: _s, smartOpen: _so, ...rest }) => rest);
    if (!payload.length) {
      toast.error("Add at least one listing with title and description");
      return;
    }
    setMarketLoading(true);
    setLastResult("");
    try {
      const res = await fetch("/api/team/bulk-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listings: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(`Published ${data.created}/${data.total} listings`);
      setLastResult(JSON.stringify(data, null, 2));
      if (data.created > 0) setListings([emptyMarket()]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setMarketLoading(false);
    }
  }

  function subcatsFor(cat: string): string[] {
    const map = LISTING_SUBCATEGORIES as Record<string, string[] | undefined>;
    return map[cat] || [];
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team bulk post</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Same fields as the normal job and marketplace forms. Add multiple posts,
          then publish all at once. Jobs auto-link to{" "}
          <strong className="text-foreground">team-created company profiles</strong>{" "}
          when the company name matches. Max 50 per submit. Posts are auto-approved.
        </p>
      </div>

      {/* ── Jobs ───────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Jobs
            <span className="text-xs font-normal text-muted-foreground">
              ({jobCount} ready)
            </span>
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={jobs.length >= 50}
            onClick={() => setJobs((p) => [...p, emptyJob()])}
          >
            <Plus className="h-3.5 w-3.5" /> Add job
          </Button>
        </div>

        <div className="space-y-3">
          {jobs.map((row, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-muted/20">
                <button
                  type="button"
                  className="flex-1 flex items-center gap-2 text-left text-sm font-medium min-w-0"
                  onClick={() => updateJob(i, { open: !row.open })}
                >
                  {row.open ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">
                    {row.jobTitle.trim() || `Job #${i + 1}`}
                  </span>
                  {row.companyName && (
                    <span className="text-xs text-muted-foreground truncate">
                      · {row.companyName}
                    </span>
                  )}
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  disabled={jobs.length <= 1}
                  onClick={() => setJobs((p) => p.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {row.open && (
                <div className="p-4 space-y-4">
                  <div className="rounded-lg border border-violet-500/25 bg-violet-500/5 p-3 space-y-2">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-xs font-medium text-violet-300"
                      onClick={() =>
                        updateJob(i, { smartOpen: !row.smartOpen })
                      }
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      Smart Fill
                      <span className="text-muted-foreground font-normal">
                        — paste raw job text (same engine as Post a Job)
                      </span>
                    </button>
                    {row.smartOpen && (
                      <>
                        <textarea
                          className={cn(areaCls, "font-mono text-xs min-h-[100px]")}
                          value={row.smartRaw}
                          onChange={(e) =>
                            updateJob(i, { smartRaw: e.target.value })
                          }
                          placeholder={"Job Title\nCompany: …\nCity: …\n\nDescription…"}
                          spellCheck={false}
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="gap-1.5 bg-violet-600 hover:bg-violet-500 text-white"
                          onClick={() => applySmartJob(i)}
                        >
                          <Wand2 className="h-3.5 w-3.5" />
                          Fill this job from text
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Job title *</label>
                      <input
                        className={inputCls}
                        value={row.jobTitle}
                        onChange={(e) => updateJob(i, { jobTitle: e.target.value })}
                        placeholder="e.g. Senior HSE Engineer"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Job description *</label>
                      <textarea
                        className={areaCls}
                        value={row.jobDescription}
                        onChange={(e) =>
                          updateJob(i, { jobDescription: e.target.value })
                        }
                        placeholder="Role, responsibilities, requirements…"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        Company name (links if team company matches)
                      </label>
                      <input
                        className={inputCls}
                        value={row.companyName}
                        onChange={(e) =>
                          updateJob(i, { companyName: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Category</label>
                      <select
                        className={inputCls}
                        value={row.category}
                        onChange={(e) =>
                          updateJob(i, { category: e.target.value })
                        }
                      >
                        <option value="">Select category</option>
                        {JOB_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Employment type</label>
                      <select
                        className={inputCls}
                        value={row.employmentType}
                        onChange={(e) =>
                          updateJob(i, {
                            employmentType: e.target.value as
                              | "permanent"
                              | "temporary",
                            duration:
                              e.target.value === "permanent"
                                ? "Permanent"
                                : row.duration === "Permanent"
                                  ? "6 Months"
                                  : row.duration,
                          })
                        }
                      >
                        <option value="permanent">Permanent</option>
                        <option value="temporary">Temporary</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Duration</label>
                      <select
                        className={inputCls}
                        value={row.duration}
                        onChange={(e) =>
                          updateJob(i, { duration: e.target.value })
                        }
                      >
                        {DURATIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
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
                          updateJob(i, { country: e.target.value, city: "" })
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
                        onChange={(e) => updateJob(i, { city: e.target.value })}
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Work location / site</label>
                      <input
                        className={inputCls}
                        value={row.workLocation}
                        onChange={(e) =>
                          updateJob(i, { workLocation: e.target.value })
                        }
                        placeholder="Plant, site, area…"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Positions</label>
                      <input
                        className={inputCls}
                        value={row.positions}
                        onChange={(e) =>
                          updateJob(i, { positions: e.target.value })
                        }
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Salary type</label>
                      <select
                        className={inputCls}
                        value={row.salaryType}
                        onChange={(e) =>
                          updateJob(i, { salaryType: e.target.value })
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
                      <label className={labelCls}>Salary / rate</label>
                      <input
                        className={inputCls}
                        value={row.salaryRate}
                        onChange={(e) =>
                          updateJob(i, { salaryRate: e.target.value })
                        }
                        placeholder="e.g. 5000"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Currency</label>
                      <select
                        className={inputCls}
                        value={row.currency}
                        onChange={(e) =>
                          updateJob(i, { currency: e.target.value })
                        }
                      >
                        {["SAR", "AED", "QAR", "KWD", "BHD", "OMR", "USD", "EUR", "GBP", "PKR", "INR", "EGP"].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Company phone</label>
                      <input
                        className={inputCls}
                        value={row.companyPhone}
                        onChange={(e) =>
                          updateJob(i, { companyPhone: e.target.value })
                        }
                        placeholder="Optional for Team"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Company email</label>
                      <input
                        className={inputCls}
                        type="email"
                        value={row.companyEmail}
                        onChange={(e) =>
                          updateJob(i, { companyEmail: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Company address</label>
                      <input
                        className={inputCls}
                        value={row.companyAddress}
                        onChange={(e) =>
                          updateJob(i, { companyAddress: e.target.value })
                        }
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Map / Google Maps link</label>
                      <input
                        className={inputCls}
                        value={row.mapLocation}
                        onChange={(e) =>
                          updateJob(i, { mapLocation: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={() => void submitJobs()}
          disabled={jobsLoading || jobCount === 0}
          className="gap-2"
        >
          {jobsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Publish all jobs ({jobCount})
        </Button>
      </section>

      {/* ── Marketplace ────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-semibold flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            Marketplace listings
            <span className="text-xs font-normal text-muted-foreground">
              ({marketCount} ready)
            </span>
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={listings.length >= 50}
            onClick={() => setListings((p) => [...p, emptyMarket()])}
          >
            <Plus className="h-3.5 w-3.5" /> Add listing
          </Button>
        </div>

        <div className="space-y-3">
          {listings.map((row, i) => {
            const subs = subcatsFor(row.category);
            return (
              <div
                key={i}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-muted/20">
                  <button
                    type="button"
                    className="flex-1 flex items-center gap-2 text-left text-sm font-medium min-w-0"
                    onClick={() => updateListing(i, { open: !row.open })}
                  >
                    {row.open ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate">
                      {row.title.trim() || `Listing #${i + 1}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ·{" "}
                      {LISTING_CATEGORIES.find((c) => c.value === row.category)
                        ?.label || row.category}
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    disabled={listings.length <= 1}
                    onClick={() =>
                      setListings((p) => p.filter((_, idx) => idx !== i))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {row.open && (
                  <div className="p-4 space-y-4">
                    <div className="rounded-lg border border-violet-500/25 bg-violet-500/5 p-3 space-y-2">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-xs font-medium text-violet-300"
                        onClick={() =>
                          updateListing(i, { smartOpen: !row.smartOpen })
                        }
                      >
                        <Wand2 className="h-3.5 w-3.5" />
                        Smart Fill
                        <span className="text-muted-foreground font-normal">
                          — paste raw listing text (same engine as Post a Listing)
                        </span>
                      </button>
                      {row.smartOpen && (
                        <>
                          <textarea
                            className={cn(areaCls, "font-mono text-xs min-h-[100px]")}
                            value={row.smartRaw}
                            onChange={(e) =>
                              updateListing(i, { smartRaw: e.target.value })
                            }
                            placeholder={"Title\nPrice: 5000 SAR\nCity: Riyadh\n\nDetails…"}
                            spellCheck={false}
                          />
                          <Button
                            type="button"
                            size="sm"
                            className="gap-1.5 bg-violet-600 hover:bg-violet-500 text-white"
                            onClick={() => applySmartListing(i)}
                          >
                            <Wand2 className="h-3.5 w-3.5" />
                            Fill this listing from text
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Title *</label>
                        <input
                          className={inputCls}
                          value={row.title}
                          onChange={(e) =>
                            updateListing(i, { title: e.target.value })
                          }
                          placeholder="Listing title"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Description *</label>
                        <textarea
                          className={areaCls}
                          value={row.description}
                          onChange={(e) =>
                            updateListing(i, { description: e.target.value })
                          }
                          placeholder="Details, condition, terms…"
                        />
                      </div>

                      <div>
                        <label className={labelCls}>Category</label>
                        <select
                          className={inputCls}
                          value={row.category}
                          onChange={(e) =>
                            updateListing(i, {
                              category: e.target.value,
                              subcategory: "",
                            })
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
                        <label className={labelCls}>Subcategory</label>
                        <select
                          className={inputCls}
                          value={row.subcategory}
                          onChange={(e) =>
                            updateListing(i, { subcategory: e.target.value })
                          }
                          disabled={!subs.length}
                        >
                          <option value="">—</option>
                          {subs.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelCls}>Condition</label>
                        <select
                          className={inputCls}
                          value={row.condition}
                          onChange={(e) =>
                            updateListing(i, { condition: e.target.value })
                          }
                        >
                          <option value="">—</option>
                          {LISTING_CONDITION_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Rental period</label>
                        <select
                          className={inputCls}
                          value={row.rentalPeriod}
                          onChange={(e) =>
                            updateListing(i, { rentalPeriod: e.target.value })
                          }
                        >
                          <option value="">—</option>
                          {RENTAL_PERIOD_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
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
                            updateListing(i, { price: e.target.value })
                          }
                          placeholder="e.g. 5000"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Currency</label>
                        <select
                          className={inputCls}
                          value={row.currency}
                          onChange={(e) =>
                            updateListing(i, { currency: e.target.value })
                          }
                        >
                          {["SAR", "AED", "QAR", "KWD", "BHD", "OMR", "USD", "EUR", "GBP", "PKR", "INR", "EGP"].map((c) => (
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
                            updateListing(i, {
                              country: e.target.value,
                              city: "",
                            })
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
                            updateListing(i, { city: e.target.value })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Contact phone</label>
                        <input
                          className={inputCls}
                          value={row.contact_phone}
                          onChange={(e) =>
                            updateListing(i, { contact_phone: e.target.value })
                          }
                          placeholder="Optional for Team"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button
          onClick={() => void submitMarket()}
          disabled={marketLoading || marketCount === 0}
          className="gap-2"
        >
          {marketLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Publish all listings ({marketCount})
        </Button>
      </section>

      {lastResult && (
        <details className="rounded-lg border border-border bg-muted/20 p-3 text-xs">
          <summary className="cursor-pointer text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" /> Last API result
          </summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono">
            {lastResult}
          </pre>
        </details>
      )}
    </div>
  );
}
