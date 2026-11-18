import { getSupabaseClient } from "@/lib/supabase";
import { SearchResultsView } from "@/components/search/SearchResultsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search jobs, candidates, property, marketplace listings, and learning resources across Hunared.",
};

/** Words that do not help match titles (natural-language padding). */
const STOP_WORDS = new Set(
  [
    "a",
    "an",
    "the",
    "and",
    "or",
    "of",
    "to",
    "for",
    "in",
    "on",
    "at",
    "near",
    "by",
    "with",
    "from",
    "is",
    "are",
    "am",
    "be",
    "as",
    "my",
    "me",
    "i",
    "we",
    "you",
    "job",
    "jobs",
    "work",
    "works",
    "vacancy",
    "vacancies",
    "opening",
    "openings",
    "position",
    "positions",
    "hiring",
    "wanted",
    "required",
    "urgent",
    "looking",
    "find",
    "search",
    "need",
    "needs",
    "want",
    "please",
    "any",
    "available",
    "listing",
    "listings",
    "post",
    "posts",
    "ad",
    "ads",
    "offer",
    "offers",
    "role",
    "roles",
    "career",
    "careers",
    "opportunity",
    "opportunities",
  ].map((w) => w.toLowerCase())
);

/**
 * Split query into meaningful search tokens.
 * "helper jobs in jubail" → ["helper", "jubail"]
 */
function tokenizeQuery(raw: string): string[] {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s+-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return [];

  const parts = cleaned.split(" ").filter(Boolean);
  const tokens: string[] = [];
  for (const p of parts) {
    if (p.length < 2) continue;
    if (STOP_WORDS.has(p)) continue;
    if (!tokens.includes(p)) tokens.push(p);
  }

  // If everything was stop words, fall back to original words (min length 2)
  if (tokens.length === 0) {
    for (const p of parts) {
      if (p.length >= 2 && !tokens.includes(p)) tokens.push(p);
    }
  }

  return tokens.slice(0, 8);
}

/** PostgREST-safe ilike value: "%token%" with quoting for special chars. */
function ilikeValue(token: string): string {
  const safe = token.replace(/["\\]/g, "");
  return `"%${safe}%"`;
}

function orIlike(fields: string[], token: string): string {
  const v = ilikeValue(token);
  return fields.map((f) => `${f}.ilike.${v}`).join(",");
}

async function searchAll(query: string, country?: string, city?: string) {
  const supabase = getSupabaseClient();

  if (!query.trim()) {
    return { jobs: [], candidates: [], listings: [], articles: [] };
  }

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    return { jobs: [], candidates: [], listings: [], articles: [] };
  }

  const nowIso = new Date().toISOString();

  // Jobs: each token must match at least one field (AND of ORs)
  const jobFields = [
    "job_title",
    "job_description",
    "category",
    "location",
    "city",
    "company_name",
  ];
  let jobsQuery = supabase
    .from("jobs")
    .select(
      "id, job_title, job_description, category, location, company_name, salary_rate, country, city, employment_type, created_at"
    )
    .eq("status", "approved")
    .is("closed_at", null)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .limit(24);

  for (const token of tokens) {
    jobsQuery = jobsQuery.or(orIlike(jobFields, token));
  }
  if (country) jobsQuery = jobsQuery.eq("country", country);
  if (city) jobsQuery = jobsQuery.ilike("city", `%${city}%`);

  // Candidates (seekers)
  let profilesQuery = supabase
    .from("profiles")
    .select("id, full_name, profession, location, avatar_url, country, city")
    .eq("role", "seeker")
    .is("deleted_at", null)
    .limit(24);

  for (const token of tokens) {
    // headline may not exist on all schemas — keep core fields if or fails later
    profilesQuery = profilesQuery.or(
      orIlike(["full_name", "profession", "location", "city"], token)
    );
  }
  if (country) profilesQuery = profilesQuery.eq("country", country);
  if (city) profilesQuery = profilesQuery.ilike("city", `%${city}%`);

  // Marketplace
  let listingsQuery = supabase
    .from("marketplace_listings")
    .select(
      "id, title, description, category, location, price, currency, image_url, country, city, subcategory"
    )
    .eq("status", "approved")
    .is("closed_at", null)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .limit(24);

  for (const token of tokens) {
    listingsQuery = listingsQuery.or(
      orIlike(["title", "description", "location", "city", "category", "subcategory"], token)
    );
  }
  if (country) listingsQuery = listingsQuery.eq("country", country);
  if (city) listingsQuery = listingsQuery.ilike("city", `%${city}%`);

  // Articles / learning
  let articlesQuery = supabase
    .from("articles")
    .select("id, title, content, category, subcategory")
    .eq("status", "approved")
    .limit(24);

  for (const token of tokens) {
    articlesQuery = articlesQuery.or(
      orIlike(["title", "content", "category", "subcategory"], token)
    );
  }

  const [jobsRes, profilesRes, listingsRes, articlesRes] = await Promise.all([
    jobsQuery,
    profilesQuery,
    listingsQuery,
    articlesQuery,
  ]);

  // Soft rank: more token hits in title/name first
  function scoreText(text: string): number {
    const lower = (text || "").toLowerCase();
    let s = 0;
    for (const t of tokens) {
      if (lower.includes(t)) s += 1;
    }
    return s;
  }

  const jobs = [...(jobsRes.data ?? [])].sort(
    (a, b) =>
      scoreText(`${a.job_title} ${a.company_name} ${a.city}`) -
        scoreText(`${b.job_title} ${b.company_name} ${b.city}`) ||
      0
  ).reverse().slice(0, 12);

  const candidates = [...(profilesRes.data ?? [])].sort(
    (a, b) =>
      scoreText(`${a.full_name} ${a.profession} ${a.city}`) -
        scoreText(`${b.full_name} ${b.profession} ${b.city}`) ||
      0
  ).reverse().slice(0, 12);

  const listings = [...(listingsRes.data ?? [])].sort(
    (a, b) =>
      scoreText(`${a.title} ${a.city} ${a.category}`) -
        scoreText(`${b.title} ${b.city} ${b.category}`) ||
      0
  ).reverse().slice(0, 12);

  const articles = [...(articlesRes.data ?? [])].sort(
    (a, b) =>
      scoreText(`${a.title} ${a.category}`) -
        scoreText(`${b.title} ${b.category}`) ||
      0
  ).reverse().slice(0, 12);

  return {
    jobs,
    candidates,
    listings,
    articles,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; country?: string; city?: string }>;
}) {
  const { q, country, city } = await searchParams;
  const query = q ?? "";
  const results = await searchAll(query, country, city);

  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 py-24 mt-6">
      <div className="max-w-6xl mx-auto">
        <SearchResultsView
          query={query}
          country={country ?? ""}
          city={city ?? ""}
          results={results}
        />
      </div>
    </main>
  );
}
