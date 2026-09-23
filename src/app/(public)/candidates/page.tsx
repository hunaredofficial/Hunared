import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";
import { MapPin, ArrowRight, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CandidatesFilter } from "@/components/candidates/CandidatesFilter";
import { COUNTRIES } from "@/lib/countries";
import type { Profile } from "@/types/database";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidates",
  description:
    "Discover skilled professionals and job seekers on Hunared. Browse candidate profiles by profession, location, and availability.",
};

const AVATAR_GRADIENTS = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-500",
  "from-orange-500 to-red-500",
  "from-green-500 to-emerald-500",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-yellow-500",
];

interface SearchParams {
  search?: string;
  profession?: string;
  country?: string;
  city?: string;
  level?: string;
  available?: string;
  page?: string;
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const search = sp.search ?? "";
  const profession = sp.profession ?? "";
  const country = sp.country ?? "";
  const city = sp.city ?? "";
  const level = sp.level ?? "";
  const available = sp.available ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const limit = 16;
  const from = (page - 1) * limit;

  let candidates: Partial<Profile>[] = [];
  let total = 0;

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("profiles")
      .select(
        "id, full_name, profession, location, country, city, avatar_url, username, available_for_hire, skill_level",
        { count: "exact" }
      )
      .eq("role", "seeker")
      .is("deleted_at", null)
      .eq("listed_publicly", true)
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (profession) query = query.eq("profession", profession);
    if (country) query = query.eq("country", country);
    if (city) query = query.ilike("city", `%${city}%`);
    if (level) query = query.eq("skill_level", level);
    if (available === "yes") query = query.eq("available_for_hire", true);
    if (available === "no") query = query.eq("available_for_hire", false);
    if (search) query = query.ilike("full_name", `%${search}%`);

    const { data, count } = await query;
    candidates = data ?? [];
    total = count ?? 0;
  } catch {
    // DB not configured
  }

  const totalPages = Math.ceil(total / limit);
  const hasFilters = !!(
    search ||
    profession ||
    country ||
    city ||
    level ||
    available
  );
  const activeCountry = COUNTRIES.find((c) => c.code === country);

  return (
    <div className="min-h-screen">
      {/* Compact header */}
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Talent</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {total > 0
                  ? `${total.toLocaleString()} professional${total !== 1 ? "s" : ""}`
                  : "Find talent ready to work"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop sidebar filters */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-lg border border-border bg-card p-3">
              <h2 className="text-sm font-semibold mb-3">Filters</h2>
              <CandidatesFilter
                defaultSearch={search}
                defaultProfession={profession}
                defaultCountry={country}
                defaultCity={city}
                defaultLevel={level}
                defaultAvailable={available}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Mobile filters */}
            <div className="lg:hidden mb-4">
              <CandidatesFilter
                defaultSearch={search}
                defaultProfession={profession}
                defaultCountry={country}
                defaultCity={city}
                defaultLevel={level}
                defaultAvailable={available}
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-sm text-muted-foreground">
                {total} result{total !== 1 ? "s" : ""}
                {search && ` for "${search}"`}
                {profession && ` · ${profession}`}
                {activeCountry && ` · ${activeCountry.name}`}
                {city && ` · ${city}`}
                {level && ` · ${level}`}
                {available === "yes" && ` · Available for hire`}
                {available === "no" && ` · Unavailable`}
              </p>
            </div>

            {candidates.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground text-lg">No candidates found.</p>
                {hasFilters && (
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/candidates">Clear filters</Link>
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {candidates.map((c) => (
                    <CandidateCard key={c.id} candidate={c} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {page > 1 && (
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/candidates?${buildParams({
                            search,
                            profession,
                            country,
                            city,
                            level,
                            available,
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
                          href={`/candidates?${buildParams({
                            search,
                            profession,
                            country,
                            city,
                            level,
                            available,
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

function CandidateCard({ candidate }: { candidate: Partial<Profile> }) {
  const initials = (candidate.full_name ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const gradient =
    AVATAR_GRADIENTS[
      (candidate.id?.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length
    ];

  const locationLabel =
    candidate.city || candidate.country
      ? [candidate.city, COUNTRIES.find((c) => c.code === candidate.country)?.name]
          .filter(Boolean)
          .join(", ")
      : candidate.location || null;

  return (
    <Card className="group hover:border-primary/40 hover:shadow-md transition-all duration-200">
      <CardContent className="pt-5 pb-4 flex flex-col items-center text-center h-full">
        <div className="mb-3">
          {candidate.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={candidate.avatar_url}
              alt={candidate.full_name ?? "Candidate"}
              className="h-16 w-16 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div
              className={`h-16 w-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg`}
            >
              {initials}
            </div>
          )}
        </div>

        <h3 className="font-semibold text-foreground text-sm leading-snug">
          {candidate.full_name}
        </h3>
        {candidate.profession && (
          <p className="text-xs text-primary mt-0.5">{candidate.profession}</p>
        )}
        {locationLabel && (
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            {locationLabel}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
          {candidate.skill_level && (
            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
              {candidate.skill_level}
            </span>
          )}
          {candidate.available_for_hire !== false ? (
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              Available
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              Unavailable
            </span>
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          className="mt-4 w-full h-7 text-xs gap-1 group-hover:border-primary/50 py-4"
          asChild
        >
          <Link href={`/candidates/${candidate.id}`}>
            View Profile <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function buildParams(p: {
  search: string;
  profession: string;
  country: string;
  city: string;
  level: string;
  available: string;
  page: number;
}) {
  const params = new URLSearchParams();
  if (p.search) params.set("search", p.search);
  if (p.profession) params.set("profession", p.profession);
  if (p.country) params.set("country", p.country);
  if (p.city) params.set("city", p.city);
  if (p.level) params.set("level", p.level);
  if (p.available) params.set("available", p.available);
  if (p.page > 1) params.set("page", p.page.toString());
  return params.toString();
}