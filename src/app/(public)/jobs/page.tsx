import { SaveButton } from "@/components/shared/SaveButton";
import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";
import { MapPin, Clock, DollarSign, Users, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, JOB_CATEGORIES } from "@/lib/constants";
import { COUNTRIES } from "@/lib/countries";
import { formatMoney, formatJobSalary } from "@/lib/currencies";
import { JobsFilter } from "@/components/jobs/JobsFilter";
import type { Job } from "@/types/database";

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

  const needsInMemory =
    sort === "comp_asc" ||
    sort === "comp_desc" ||
    sort === "rate_asc" ||
    sort === "rate_desc" ||
    !!durationFilter ||
    !!posted ||
    !!experience ||
    dateOrder === "oldest";

  let jobs: Partial<Job>[] = [];
  let total = 0;
  const categories: string[] = [...JOB_CATEGORIES];

  try {
    const supabase = createAdminClient();

    let query = supabase
      .from("jobs")
      .select(
        "id, job_title, company_name, location, country, city, employment_type, salary_rate, salary_type, currency, duration, category, positions, created_at",
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

      // Experience level — jobs table has no dedicated column yet;
      // soft-match on duration/employment heuristics when possible
      if (experience) {
        rows = rows.filter((j) => {
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

      total = rows.length;
      jobs = rows.slice(from, from + limit);
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
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border py-12 pt-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="gradient-text">Job Board</span>
          </h1>
          <p className="text-muted-foreground mb-6">
            {total > 0
              ? `${total.toLocaleString()} opportunit${total !== 1 ? "ies" : "y"} across the globe`
              : "Find your next international opportunity"}
          </p>
          <JobsFilter
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
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {hasFilters && (
          <p className="text-sm text-muted-foreground mb-5">
            {total} result{total !== 1 ? "s" : ""} found
            {search && ` for "${search}"`}
            {category && ` in ${category}`}
            {employmentType && ` · ${employmentType.replace("_", " ")}`}
            {activeCountry && ` · ${activeCountry.name}`}
            {city && ` · ${city}`}
          </p>
        )}

        {jobs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No jobs found.</p>
            {hasFilters && (
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/jobs">Clear filters</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
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
      </section>
    </div>
  );
}

function JobCard({ job }: { job: Partial<Job> }) {
  const createdAt = job.created_at
    ? new Date(job.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : "";

  const salaryLabel = formatJobSalary(
    job.salary_rate,
    job.currency,
    job.salary_type
  );

  return (
    <Card className="group hover:border-primary/40 hover:shadow-md transition-all duration-200">
      <CardContent className="pt-5 pb-4 flex flex-col h-full">
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {job.category && (
            <Badge
              className={cn(
                "text-xs",
                CATEGORY_COLORS[job.category] ?? CATEGORY_COLORS["Other"]
              )}
            >
              {job.category}
            </Badge>
          )}
          {job.employment_type && job.employment_type !== "permanent" && (
            <Badge variant="outline" className="text-xs capitalize">
              {job.employment_type.replace("_", " ")}
            </Badge>
          )}
        </div>

        <Link href={`/jobs/${job.id}`} className="group/title">
          <h3 className="font-semibold text-foreground group-hover/title:text-primary transition-colors leading-snug mb-1">
            {job.job_title}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground mb-3">{job.company_name}</p>

        <div className="space-y-1.5 text-xs text-muted-foreground flex-1">
          {job.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {job.location}
            </div>
          )}
          {salaryLabel ? (
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 shrink-0" />
              {salaryLabel}
            </div>
          ) : null}
          {job.duration && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {job.duration}
            </div>
          )}
          {job.positions && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 shrink-0" />
              {job.positions} position{job.positions !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border gap-2">
          <span className="text-xs text-muted-foreground">{createdAt}</span>
          <div className="flex items-center gap-1.5">
            {job.id && (
              <SaveButton itemType="job" itemId={job.id} size="sm" />
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 text-xs hover:text-primary"
              asChild
            >
              <Link href={`/jobs/${job.id}`}>
                View <ArrowRight className="h-3 w-3" />
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