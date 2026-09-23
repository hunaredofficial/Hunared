import { SaveButton } from "@/components/shared/SaveButton";
import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";
import { MapPin, Clock, DollarSign, Users, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, JOB_CATEGORIES } from "@/lib/constants";
import { COUNTRIES } from "@/lib/countries";
import { formatMoney, formatJobSalary } from "@/lib/currencies";
import { JobsFilter } from "@/components/jobs/JobsFilter";
import type { Job } from "@/types/database";
import { auth } from "@clerk/nextjs/server";
import {
  rankByPersonalization,
  scoreJob,
  type PersonalizationProfile,
} from "@/lib/personalization";

interface SearchParams {
  search?: string;
  category?: string;
  country?: string;
  city?: string;
  employmentType?: string;
  page?: string;
  sort?: string;
  payout?: string;
  duration?: string;
  posted?: string;
  dateOrder?: string;
  experience?: string;
}

/** Numeric salary/rate for sorting. Text / missing → null (sorted last). */
function parseRateValue(rate: string | null | undefined): number | null {
  if (rate == null || rate === "") return null;
  const raw = String(rate).trim().toLowerCase();
  if (
    !raw ||
    raw.includes("negotiable") ||
    raw.includes("discuss") ||
    raw === "n/a" ||
    raw === "-"
  ) {
    return null;
  }
  const num = Number(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : null;
}

/** Map duration filter value → matching duration strings / employment types */
function matchesDurationFilter(
  job: { duration?: string | null; employment_type?: string | null },
  filter: string
): boolean {
  if (!filter) return true;
  const dur = (job.duration ?? "").toLowerCase();
  const emp = (job.employment_type ?? "").toLowerCase();

  if (filter === "temporary") {
    return emp === "temporary" || emp === "task_force";
  }
  if (filter === "short_term") {
    // 1–6 Month style durations
    return (
      /^\d+\s*month/.test(dur) ||
      dur.includes("3 month") ||
      dur.includes("6 month")
    );
  }
  if (filter === "long_term") {
    return dur.includes("long term") || dur.includes("1 year");
  }
  if (filter === "permanent") {
    return emp === "permanent" || dur === "permanent";
  }
  if (filter === "shutdown") {
    return dur.includes("shutdown");
  }
  return true;
}

function postedCutoff(posted: string): Date | null {
  if (!posted) return null;
  const now = new Date();
  if (posted === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const hours: Record<string, number> = {
    "24h": 24,
    "3d": 24 * 3,
    "7d": 24 * 7,
    "15d": 24 * 15,
  };
  const h = hours[posted];
  if (!h) return null;
  return new Date(now.getTime() - h * 60 * 60 * 1000);
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const search = sp.search ?? "";
  const category = sp.category ?? "";
  const country = sp.country ?? "";
  const city = sp.city ?? "";
  const employmentType = sp.employmentType ?? "";
  const sort = sp.sort ?? "";
  const payout = sp.payout ?? "";
  const durationFilter = sp.duration ?? "";
  const posted = sp.posted ?? "";
  const dateOrder = sp.dateOrder ?? "";
  const experience = sp.experience ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const limit = 12;
  const from = (page - 1) * limit;

  // Signed-in personalization (profile + saved activity)
  let profile: PersonalizationProfile | null = null;
  let savedJobIds = new Set<string>();
  let isPersonalized = false;
  try {
    const { userId } = await auth();
    if (userId) {
      const supabaseAuth = createAdminClient();
      const { data: prof } = await supabaseAuth
        .from("profiles")
        .select("job_interests, profession, country, city, skill_level, location")
        .eq("id", userId)
        .maybeSingle();
      if (prof) {
        profile = prof;
        isPersonalized = true;
      }
      // Recent saved jobs for activity signal
      const { data: saved } = await supabaseAuth
        .from("saved_items")
        .select("item_id")
        .eq("user_id", userId)
        .eq("item_type", "job")
        .limit(50);
      if (saved?.length) {
        savedJobIds = new Set(saved.map((s) => s.item_id));
      }
    }
  } catch {
    // Auth / DB optional — fall back to non-personalized
  }

  // Personalization forces in-memory ranking when user is signed in and no explicit sort
  const usePersonalSort =
    isPersonalized && !sort && !dateOrder;

  const needsInMemory =
    sort === "comp_asc" ||
    sort === "comp_desc" ||
    sort === "rate_asc" ||
    sort === "rate_desc" ||
    !!durationFilter ||
    !!posted ||
    !!experience ||
    dateOrder === "oldest" ||
    usePersonalSort;

  let jobs: (Partial<Job> & { _matchScore?: number })[] = [];
  let total = 0;
  const categories: string[] = [...JOB_CATEGORIES];

  try {
    const supabase = createAdminClient();

    let query = supabase
      .from("jobs")
      .select(
        "id, job_title, company_name, location, country, city, employment_type, experience_level, salary_rate, salary_type, currency, duration, category, categories, positions, created_at",
        { count: "exact" }
      )
      .eq("status", "approved");

    if (category) query = query.eq("category", category);
    if (country) query = query.eq("country", country);
    if (city) query = query.ilike("city", `%${city}%`);
    if (
      employmentType === "permanent" ||
      employmentType === "temporary" ||
      employmentType === "task_force"
    ) {
      query = query.eq("employment_type", employmentType);
    }
    if (search) query = query.ilike("job_title", `%${search}%`);

    // Payout / salary_type (Hourly, Monthly, After Interview = Negotiable)
    if (payout === "Hourly" || payout === "Monthly" || payout === "After Interview") {
      query = query.eq("salary_type", payout);
    }

    // Date posted cutoff (created_at)
    const cutoff = postedCutoff(posted);
    if (cutoff) {
      query = query.gte("created_at", cutoff.toISOString());
    }

    if (needsInMemory) {
      query = query.order("created_at", { ascending: false }).limit(500);
      const { data, count } = await query;
      let rows = data ?? [];

      // Duration filter (maps to duration + employment_type)
      if (durationFilter) {
        rows = rows.filter((j) => matchesDurationFilter(j, durationFilter));
      }

      // Experience level filter — prefer experience_level column when set
      if (experience) {
        rows = rows.filter((j) => {
          const lvl = String(
            (j as { experience_level?: string | null }).experience_level ?? ""
          ).toLowerCase();
          if (lvl) return lvl === experience.toLowerCase();
          // Fallback for older jobs without the column value
          const emp = (j.employment_type ?? "").toLowerCase();
          const dur = (j.duration ?? "").toLowerCase();
          if (experience === "beginner") {
            return emp === "temporary" || emp === "task_force" || /^\d+\s*month/.test(dur);
          }
          if (experience === "intermediate") {
            return dur.includes("6 month") || dur.includes("1 year");
          }
          if (experience === "advanced" || experience === "expert" || experience === "master") {
            return emp === "permanent" || dur.includes("long term") || dur === "permanent";
          }
          return true;
        });
      }

      // Compensation sort (numeric)
      if (sort === "comp_asc" || sort === "rate_asc") {
        rows = [...rows].sort((a, b) => {
          const ra = parseRateValue(a.salary_rate);
          const rb = parseRateValue(b.salary_rate);
          if (ra == null && rb == null) return 0;
          if (ra == null) return 1;
          if (rb == null) return -1;
          return ra - rb;
        });
      } else if (sort === "comp_desc" || sort === "rate_desc") {
        rows = [...rows].sort((a, b) => {
          const ra = parseRateValue(a.salary_rate);
          const rb = parseRateValue(b.salary_rate);
          if (ra == null && rb == null) return 0;
          if (ra == null) return 1;
          if (rb == null) return -1;
          return rb - ra;
        });
      } else if (dateOrder === "oldest") {
        rows = [...rows].sort(
          (a, b) =>
            new Date(a.created_at ?? 0).getTime() -
            new Date(b.created_at ?? 0).getTime()
        );
      } else if (dateOrder === "newest") {
        rows = [...rows].sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime()
        );
      }

      // Personalization: rank by profile match when signed in
      if (usePersonalSort && profile) {
        const ranked = rankByPersonalization(rows, (j) =>
          scoreJob(j as Parameters<typeof scoreJob>[0], profile, savedJobIds)
        );
        total = ranked.length;
        jobs = ranked.slice(from, from + limit);
      } else {
        total = rows.length;
        jobs = rows.slice(from, from + limit);
      }
    } else {
      // DB-side order
      const ascending = dateOrder === "oldest";
      query = query
        .order("created_at", { ascending })
        .range(from, from + limit - 1);
      const { data, count } = await query;
      jobs = data ?? [];
      total = count ?? 0;
    }
  } catch {
    // DB not configured — show empty state
  }

  const totalPages = Math.ceil(total / limit);
  const hasFilters = !!(
    search ||
    category ||
    country ||
    city ||
    employmentType ||
    sort ||
    payout ||
    durationFilter ||
    posted ||
    dateOrder ||
    experience
  );
  const activeCountry = COUNTRIES.find((c) => c.code === country);

  return (
    <div className="min-h-screen">
      {/* Compact page header */}
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Jobs
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {total > 0
                  ? `${total.toLocaleString()} opportunit${total !== 1 ? "ies" : "y"}`
                  : "Find your next opportunity"}
                {isPersonalized && usePersonalSort && (
                  <span className="ml-2 inline-flex items-center gap-1 text-primary text-sm font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    Personalized for you
                  </span>
                )}
              </p>
            </div>
            <Button size="sm" className="shrink-0 font-semibold" asChild>
              <Link href="/dashboard/jobs/new">Post a Job</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Marketplace layout: sidebar filters + results */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <JobsFilter
                variant="sidebar"
                defaultSearch={search}
                defaultCategory={category}
                defaultCountry={country}
                defaultCity={city}
                defaultSort={sort}
                defaultPayout={payout}
                defaultDuration={durationFilter}
                defaultPosted={posted}
                defaultDateOrder={dateOrder}
                defaultExperience={experience}
                categories={categories}
              />
            </div>
          </aside>

          {/* Main column */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter bar */}
            <div className="lg:hidden mb-4">
              <JobsFilter
                variant="bar"
                defaultSearch={search}
                defaultCategory={category}
                defaultCountry={country}
                defaultCity={city}
                defaultSort={sort}
                defaultPayout={payout}
                defaultDuration={durationFilter}
                defaultPosted={posted}
                defaultDateOrder={dateOrder}
                defaultExperience={experience}
                categories={categories}
              />
            </div>

            {/* Result meta */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-sm text-muted-foreground">
                {total} result{total !== 1 ? "s" : ""}
                {search && ` for "${search}"`}
                {category && ` in ${category}`}
                {employmentType && ` · ${employmentType.replace("_", " ")}`}
                {activeCountry && ` · ${activeCountry.name}`}
                {city && ` · ${city}`}
              </p>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground text-lg">No jobs found.</p>
                {hasFilters && (
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/jobs">Clear filters</Link>
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {page > 1 && (
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/jobs?${buildParams({
                            search,
                            category,
                            country,
                            city,
                            employmentType,
                            sort,
                            payout,
                            duration: durationFilter,
                            posted,
                            dateOrder,
                            experience,
                            page: page - 1,
                          })}`}
                        >
                          Previous
                        </Link>
                      </Button>
                    )}
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    {page < totalPages && (
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/jobs?${buildParams({
                            search,
                            category,
                            country,
                            city,
                            employmentType,
                            sort,
                            payout,
                            duration: durationFilter,
                            posted,
                            dateOrder,
                            experience,
                            page: page + 1,
                          })}`}
                        >
                          Next
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function JobCard({
  job,
}: {
  job: Partial<Job> & { _matchScore?: number };
}) {
  const createdAt = job.created_at
    ? new Date(job.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : "";

  const salaryLabel =
    formatJobSalary(job.salary_rate, job.currency, job.salary_type) ||
    (job.salary_rate && String(job.salary_rate).trim()) ||
    (job.salary_type === "Negotiable" ? "Negotiable" : "") ||
    "";

  const isRecommended = (job._matchScore ?? 0) >= 25;

  const empLabel = job.employment_type
    ? job.employment_type.toLowerCase() === "permanent"
      ? "Permanent"
      : job.employment_type.toLowerCase() === "temporary"
        ? "Temporary"
        : job.employment_type
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/80 bg-card",
        "hover:border-primary/45 hover:shadow-md hover:shadow-primary/5",
        "transition-all duration-200",
        isRecommended && "ring-1 ring-primary/25 border-primary/30"
      )}
    >
      <CardContent className="p-4 flex flex-col h-full gap-3">
        {/* Top: badges */}
        <div className="flex items-center gap-1.5 flex-wrap min-h-[1.25rem]">
          {isRecommended && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide">
              <Sparkles className="h-3 w-3" />
              For you
            </span>
          )}
          {job.category && (
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
                CATEGORY_COLORS[job.category] ?? CATEGORY_COLORS["Other"]
              )}
            >
              {job.category}
            </span>
          )}
          {empLabel && (
            <span className="inline-flex rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {empLabel}
            </span>
          )}
        </div>

        {/* Title + company */}
        <div className="space-y-1">
          <Link href={`/jobs/${job.id}`} className="block">
            <h3 className="text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {job.job_title}
            </h3>
          </Link>
          {job.company_name && (
            <p className="text-sm text-muted-foreground truncate">
              {job.company_name}
            </p>
          )}
        </div>

        {/* Meta row — compact chips */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          {job.location && (
            <span className="inline-flex items-center gap-1 min-w-0">
              <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
              <span className="truncate max-w-[11rem]">{job.location}</span>
            </span>
          )}
          {salaryLabel ? (
            <span className="inline-flex items-center gap-1 font-medium text-foreground/90">
              <DollarSign className="h-3.5 w-3.5 shrink-0 text-primary/80" />
              {salaryLabel}
            </span>
          ) : null}
          {job.duration && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" />
              {job.duration}
            </span>
          )}
          {job.positions != null && Number(job.positions) > 0 && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5 shrink-0 opacity-70" />
              {job.positions} open
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-border/60">
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {createdAt}
          </span>
          <div className="flex items-center gap-1">
            {job.id && (
              <SaveButton itemType="job" itemId={job.id} size="sm" />
            )}
            <Button
              size="sm"
              variant="secondary"
              className="h-7 px-2.5 text-xs font-medium"
              asChild
            >
              <Link href={`/jobs/${job.id}`}>
                View
                <ArrowRight className="h-3 w-3 ml-1 opacity-70" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


function buildParams(p: {
  search: string;
  category: string;
  country: string;
  city: string;
  employmentType: string;
  sort?: string;
  payout?: string;
  duration?: string;
  posted?: string;
  dateOrder?: string;
  experience?: string;
  page: number;
}) {
  const params = new URLSearchParams();
  if (p.search) params.set("search", p.search);
  if (p.category) params.set("category", p.category);
  if (p.country) params.set("country", p.country);
  if (p.city) params.set("city", p.city);
  if (p.employmentType) params.set("employmentType", p.employmentType);
  if (p.sort) params.set("sort", p.sort);
  if (p.payout) params.set("payout", p.payout);
  if (p.duration) params.set("duration", p.duration);
  if (p.posted) params.set("posted", p.posted);
  if (p.dateOrder) params.set("dateOrder", p.dateOrder);
  if (p.experience) params.set("experience", p.experience);
  if (p.page > 1) params.set("page", p.page.toString());
  return params.toString();
}