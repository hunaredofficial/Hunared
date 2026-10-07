"use client";

/**
 * Team Bulk Post — full job & marketplace fields (same as single post forms).
 * Multiple rows → publish all at once. Auto Smart Fill uses the same
 * parseJobText + SmartJobFillPanel engine as Post a Job (no separate Magic box).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
} from "lucide-react";
import {
  JOB_CATEGORIES,
  DURATIONS,
  SALARY_TYPES,
  EXPERIENCE_LEVELS,
  LISTING_CATEGORIES,
  LISTING_CONDITION_OPTIONS,
  RENTAL_PERIOD_OPTIONS,
  LISTING_SUBCATEGORIES,
} from "@/lib/constants";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import {
  parseJobText,
  hasSuggestions,
  type SmartJobParseResult,
} from "@/lib/smartJobParser";
import {
  parseListingText,
  type SmartListingParseResult,
} from "@/lib/smartListingParser";
import {
  SmartJobFillPanel,
  type SmartFillFieldKey,
} from "@/components/jobs/SmartJobFill";
import { MultiSelectChips } from "@/components/shared/MultiSelectChips";
import { CityCombobox } from "@/components/shared/CityCombobox";

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
  employmentType: "permanent" | "temporary" | "";
  duration: string;
  category: string;
  categories: string[];
  subcategory: string;
  experienceLevel: string;
  positions: string;
  salaryType: string;
  salaryRate: string;
  currency: string;
  mapLocation: string;
  open: boolean;
  smartStatus: "idle" | "analyzing" | "found" | "empty";
  smartResult: SmartJobParseResult | null;
  smartDismissed: boolean;
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
  categories: [],
  subcategory: "",
  experienceLevel: "any",
  positions: "",
  salaryType: "",
  salaryRate: "",
  currency: "SAR",
  mapLocation: "",
  open: true,
  smartStatus: "idle",
  smartResult: null,
  smartDismissed: false,
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
});

const inputCls =
  "w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground block mb-1";
const areaCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-ring";

const CURRENCY_OPTS = [
  "SAR",
  "AED",
  "QAR",
  "KWD",
  "BHD",
  "OMR",
  "USD",
  "EUR",
  "GBP",
  "PKR",
  "INR",
  "EGP",
];

function val<T>(f?: { value: T } | null | undefined): T | undefined {
  return f?.value;
}

export default function BulkClient() {
  const [jobs, setJobs] = useState<JobRow[]>([emptyJob()]);
  const [listings, setListings] = useState<MarketRow[]>([emptyMarket()]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [lastResult, setLastResult] = useState("");
  const jobTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

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
        if (patch.duration !== undefined) {
          next.employmentType =
            patch.duration === "Permanent" ? "permanent" : "temporary";
        }
        if (patch.employmentType === "permanent" && patch.duration === undefined) {
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

  /** Same engine as Post a Job — debounce on title/description */
  const runJobSmart = useCallback((i: number, title: string, description: string) => {
    if (jobTimers.current[i]) clearTimeout(jobTimers.current[i]);
    const blob = `${title}\n${description}`.trim();
    if (blob.length < 20) {
      updateJob(i, { smartStatus: "idle", smartResult: null, smartDismissed: false });
      return;
    }
    updateJob(i, { smartStatus: "analyzing", smartDismissed: false });
    jobTimers.current[i] = setTimeout(() => {
      try {
        const result = parseJobText(title.slice(0, 180), description || blob);
        const found = hasSuggestions(result);
        updateJob(i, {
          smartStatus: found ? "found" : "empty",
          smartResult: result,
        });
      } catch {
        updateJob(i, { smartStatus: "empty", smartResult: null });
      }
    }, 450);
  }, []);

  function applyJobField(i: number, key: SmartFillFieldKey) {
    const row = jobs[i];
    const r = row?.smartResult;
    if (!r) return;
    const patch: Partial<JobRow> = {};
    if (key === "jobTitle" && val(r.jobTitle)) patch.jobTitle = String(val(r.jobTitle));
    if (key === "category" && val(r.category)) {
      patch.category = String(val(r.category));
      patch.categories = [String(val(r.category))];
    }
    if (key === "categories" && val(r.categories)?.length) {
      patch.categories = val(r.categories)!.map(String);
      patch.category = String(val(r.categories)![0]);
    }
    if (key === "country" && val(r.country)) patch.country = String(val(r.country));
    if (key === "city" && val(r.city)) patch.city = String(val(r.city));
    if (key === "currency" && val(r.currency)) patch.currency = String(val(r.currency));
    if (key === "salaryRate" && val(r.salaryRate))
      patch.salaryRate = String(val(r.salaryRate));
    if (key === "salaryType" && val(r.salaryType))
      patch.salaryType = String(val(r.salaryType));
    if (key === "duration" && val(r.duration)) {
      patch.duration = String(val(r.duration));
      patch.employmentType =
        patch.duration === "Permanent" ? "permanent" : "temporary";
    }
    if (key === "employmentType" && val(r.employmentType)) {
      const e = String(val(r.employmentType)).toLowerCase();
      if (e === "permanent" || e === "temporary") patch.employmentType = e;
    }
    if (key === "companyName" && val(r.companyName))
      patch.companyName = String(val(r.companyName));
    if (key === "companyPhone" && val(r.companyPhone))
      patch.companyPhone = String(val(r.companyPhone));
    if (key === "companyEmail" && val(r.companyEmail))
      patch.companyEmail = String(val(r.companyEmail));
    if (key === "companyAddress" && val(r.companyAddress))
      patch.companyAddress = String(val(r.companyAddress));
    if (key === "mapLocation" && val(r.mapLocation))
      patch.mapLocation = String(val(r.mapLocation));
    if (key === "workLocation" && val(r.workLocation))
      patch.workLocation = String(val(r.workLocation));
    if (key === "positions" && val(r.positions))
      patch.positions = String(val(r.positions));
    updateJob(i, patch);
  }

  function applyAllJobSmart(i: number) {
    const r = jobs[i]?.smartResult;
    if (!r) return;
    const keys: SmartFillFieldKey[] = [
      "jobTitle",
      "category",
      "categories",
      "country",
      "city",
      "currency",
      "salaryRate",
      "salaryType",
      "duration",
      "employmentType",
      "companyName",
      "companyPhone",
      "companyEmail",
      "companyAddress",
      "mapLocation",
      "workLocation",
      "positions",
    ];
    // Apply sequentially into one patch
    let patch: Partial<JobRow> = {};
    const row = jobs[i];
    const r2 = row.smartResult!;
    if (val(r2.jobTitle)) patch.jobTitle = String(val(r2.jobTitle));
    if (val(r2.categories)?.length) {
      patch.categories = val(r2.categories)!.map(String);
      patch.category = String(val(r2.categories)![0]);
    } else if (val(r2.category)) {
      patch.category = String(val(r2.category));
      patch.categories = [String(val(r2.category))];
    }
    if (val(r2.country)) patch.country = String(val(r2.country));
    if (val(r2.city)) patch.city = String(val(r2.city));
    if (val(r2.currency)) patch.currency = String(val(r2.currency));
    if (val(r2.salaryRate)) patch.salaryRate = String(val(r2.salaryRate));
    if (val(r2.salaryType)) patch.salaryType = String(val(r2.salaryType));
    if (val(r2.duration)) {
      patch.duration = String(val(r2.duration));
      patch.employmentType =
        patch.duration === "Permanent" ? "permanent" : "temporary";
    }
    if (val(r2.employmentType)) {
      const e = String(val(r2.employmentType)).toLowerCase();
      if (e === "permanent" || e === "temporary") patch.employmentType = e as "permanent" | "temporary";
    }
    if (val(r2.companyName)) patch.companyName = String(val(r2.companyName));
    if (val(r2.companyPhone)) patch.companyPhone = String(val(r2.companyPhone));
    if (val(r2.companyEmail)) patch.companyEmail = String(val(r2.companyEmail));
    if (val(r2.companyAddress))
      patch.companyAddress = String(val(r2.companyAddress));
    if (val(r2.mapLocation)) patch.mapLocation = String(val(r2.mapLocation));
    if (val(r2.workLocation)) patch.workLocation = String(val(r2.workLocation));
    if (val(r2.positions)) patch.positions = String(val(r2.positions));
    // Never overwrite description — user pasted text must stay as-is
    updateJob(i, { ...patch, smartDismissed: true });
    toast.success(`Smart Fill applied to job #${i + 1}`);
  }

  /** Market: auto-apply high-confidence fields after paste (same parser as listing form) */
  function onMarketDescriptionChange(i: number, description: string) {
    updateListing(i, { description });
    const row = listings[i];
    const title = row?.title || "";
    const blob = `${title}\n${description}`.trim();
    if (blob.length < 24) return;
    try {
      const result: SmartListingParseResult = parseListingText(
        title.slice(0, 180) || description.split("\n")[0]?.slice(0, 180) || "",
        description
      );
      const patch: Partial<MarketRow> = {};
      if (val(result.category)) patch.category = String(val(result.category));
      if (val(result.subcategory))
        patch.subcategory = String(val(result.subcategory));
      if (val(result.condition)) patch.condition = String(val(result.condition));
      if (val(result.price)) patch.price = String(val(result.price));
      if (val(result.currency)) patch.currency = String(val(result.currency));
      if (val(result.country)) patch.country = String(val(result.country));
      if (val(result.city)) patch.city = String(val(result.city));
      if (val(result.contactPhone))
        patch.contact_phone = String(val(result.contactPhone));
      if (val(result.rentalPeriod))
        patch.rentalPeriod = String(val(result.rentalPeriod));
      if (Object.keys(patch).length) {
        updateListing(i, patch);
      }
    } catch {
      /* ignore */
    }
  }

  async function submitJobs() {
    const payload = jobs
      .filter((j) => j.jobTitle.trim() && j.jobDescription.trim())
      .map(
        ({
          open: _o,
          smartStatus: _s,
          smartResult: _r,
          smartDismissed: _d,
          ...rest
        }) => rest
      );
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
      .map(({ open: _o, ...rest }) => rest);
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
          Same fields as Post a Job / Post a Listing. Add multiple rows, then
          publish all at once. Paste into title or description —{" "}
          <strong className="text-foreground">Smart Fill</strong> appears
          automatically (same engine as single post). Jobs auto-link to
          team-created companies when the name matches. Max 50 per submit.
        </p>
      </div>

      {/* Jobs */}
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
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Job title *</label>
                      <input
                        className={inputCls}
                        value={row.jobTitle}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateJob(i, { jobTitle: v });
                          runJobSmart(i, v, row.jobDescription);
                        }}
                        placeholder="e.g. Senior HSE Engineer"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Job description *</label>
                      <textarea
                        className={areaCls}
                        value={row.jobDescription}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateJob(i, { jobDescription: v });
                          runJobSmart(i, row.jobTitle, v);
                        }}
                        placeholder="Paste full job text or write description…"
                      />
                    </div>
                  </div>

                  <SmartJobFillPanel
                    status={row.smartStatus}
                    result={row.smartResult}
                    dismissed={row.smartDismissed}
                    onApplyAll={() => applyAllJobSmart(i)}
                    onApplyOne={(key) => applyJobField(i, key)}
                    onDismiss={() => updateJob(i, { smartDismissed: true })}
                    onRefresh={() =>
                      runJobSmart(i, row.jobTitle, row.jobDescription)
                    }
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Job Categories *</label>
                      <MultiSelectChips
                        options={JOB_CATEGORIES}
                        value={row.categories}
                        onChange={(next) =>
                          updateJob(i, {
                            categories: next,
                            category: next[0] ?? "",
                          })
                        }
                        placeholder="Select one or more categories"
                        searchPlaceholder="Search categories…"
                        label="Job categories"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Subcategory</label>
                      <input
                        className={inputCls}
                        value={row.subcategory}
                        onChange={(e) =>
                          updateJob(i, { subcategory: e.target.value })
                        }
                        placeholder="e.g. NEBOSH, IOSH"
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
                      <CityCombobox
                        id={`bulk-job-city-${i}`}
                        country={row.country}
                        value={row.city}
                        onChange={(v) => updateJob(i, { city: v })}
                        size="md"
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
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Experience level</label>
                      <select
                        className={inputCls}
                        value={row.experienceLevel}
                        onChange={(e) =>
                          updateJob(i, { experienceLevel: e.target.value })
                        }
                      >
                        {EXPERIENCE_LEVELS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Number of positions</label>
                      <input
                        className={inputCls}
                        type="number"
                        min={1}
                        max={999}
                        value={row.positions}
                        onChange={(e) =>
                          updateJob(i, { positions: e.target.value })
                        }
                        placeholder="e.g. 3"
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
                        {CURRENCY_OPTS.map((c) => (
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

      {/* Marketplace */}
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
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Title *</label>
                        <input
                          className={inputCls}
                          value={row.title}
                          onChange={(e) =>
                            updateListing(i, { title: e.target.value })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Description *</label>
                        <textarea
                          className={areaCls}
                          value={row.description}
                          onChange={(e) =>
                            onMarketDescriptionChange(i, e.target.value)
                          }
                          placeholder="Paste listing text or write details…"
                        />
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Category, price, city and more auto-fill from pasted text
                          (same parser as Post a Listing).
                        </p>
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
                          {CURRENCY_OPTS.map((c) => (
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
                        <CityCombobox
                          id={`bulk-mkt-city-${i}`}
                          country={row.country}
                          value={row.city}
                          onChange={(v) => updateListing(i, { city: v })}
                          size="md"
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
          <summary className="cursor-pointer text-muted-foreground">
            Last API result
          </summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono">
            {lastResult}
          </pre>
        </details>
      )}
    </div>
  );
}
