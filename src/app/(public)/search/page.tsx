import { getSupabaseClient } from "@/lib/supabase";
import { SearchResultsView } from "@/components/search/SearchResultsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search jobs, candidates, companies, marketplace listings, and learning resources across Hunared.",
};

/** Words that do not help match titles (natural-language padding). */
const STOP_WORDS = new Set(
  [
    "a", "an", "the", "and", "or", "of", "to", "for", "in", "on", "at", "near",
    "by", "with", "from", "is", "are", "am", "be", "as", "my", "me", "i", "we",
    "you", "job", "jobs", "work", "works", "vacancy", "vacancies", "opening",
    "openings", "position", "positions", "hiring", "wanted", "required", "urgent",
    "looking", "find", "search", "need", "needs", "want", "please", "any",
    "available", "listing", "listings", "post", "posts", "ad", "ads", "offer",
    "offers", "role", "roles", "career", "careers", "opportunity", "opportunities",
    "company", "companies", "profile", "profiles", "user", "users",
  ].map((w) => w.toLowerCase())
);

/**
 * Split query into meaningful search tokens.
 * "helper jobs in jubail" → ["helper", "jubail"]
 * "@ahmed" → ["ahmed"]
 */
function tokenizeQuery(raw: string): string[] {
  const cleaned = raw
    .toLowerCase()
    .replace(/@/g, " ")
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

  if (tokens.length === 0) {
    for (const p of parts) {
      if (p.length >= 2 && !tokens.includes(p)) tokens.push(p);
    }
  }

  return tokens.slice(0, 8);
}

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
    return {
      jobs: [],
      candidates: [],
      companies: [],
      listings: [],
      articles: [],
    };
  }

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    return {
      jobs: [],
      candidates: [],
      companies: [],
      listings: [],
      articles: [],
    };
  }

  const nowIso = new Date().toISOString();

  // Jobs
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
    jobsQuery = jobsQuery.or(
      orIlike(
        [
          "job_title",
          "job_description",
          "category",
          "location",
          "city",
          "company_name",
        ],
        token
      )
    );
  }
  if (country) jobsQuery = jobsQuery.eq("country", country);
  if (city) jobsQuery = jobsQuery.ilike("city", `%${city}%`);

  // Candidates / profiles — name, profession, location, AND username/handle
  let profilesQuery = supabase
    .from("profiles")
    .select(
      "id, full_name, username, profession, location, avatar_url, country, city"
    )
    .is("deleted_at", null)
    .limit(24);

  // Prefer public talent; still include username hits for any non-deleted profile
  // Role filter: seekers + anyone listed publicly (company owners may have handles too)
  for (const token of tokens) {
    profilesQuery = profilesQuery.or(
      orIlike(
        ["full_name", "username", "profession", "location", "city"],
        token
      )
    );
  }
  if (country) profilesQuery = profilesQuery.eq("country", country);
  if (city) profilesQuery = profilesQuery.ilike("city", `%${city}%`);

  // Companies — name, industry, slug, city
  let companiesQuery = supabase
    .from("companies")
    .select(
      "id, name, slug, industry, city, country, logo_url, hiring, created_at"
    )
    .limit(24);

  for (const token of tokens) {
    companiesQuery = companiesQuery.or(
      orIlike(["name", "industry", "slug", "city", "country"], token)
    );
  }
  if (country) companiesQuery = companiesQuery.eq("country", country);
  if (city) companiesQuery = companiesQuery.ilike("city", `%${city}%`);

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
      orIlike(
        ["title", "description", "location", "city", "category", "subcategory"],
        token
      )
    );
  }
  if (country) listingsQuery = listingsQuery.eq("country", country);
  if (city) listingsQuery = listingsQuery.ilike("city", `%${city}%`);

  // Learning
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

  const [jobsRes, profilesRes, companiesRes, listingsRes, articlesRes] =
    await Promise.all([
      jobsQuery,
      profilesQuery,
      companiesQuery,
      listingsQuery,
      articlesQuery,
    ]);

  function scoreText(text: string): number {
    const lower = (text || "").toLowerCase();
    let s = 0;
    for (const t of tokens) {
      if (lower.includes(t)) s += 1;
      // exact username / handle boost
      if (lower === t || lower === `@${t}`) s += 2;
    }
    return s;
  }

  const jobs = [...(jobsRes.data ?? [])]
    .sort(
      (a, b) =>
        scoreText(`${a.job_title} ${a.company_name} ${a.city}`) -
        scoreText(`${b.job_title} ${b.company_name} ${b.city}`)
    )
    .reverse()
    .slice(0, 12);

  const candidates = [...(profilesRes.data ?? [])]
    .sort(
      (a, b) =>
        scoreText(
          `${a.full_name} ${a.username || ""} ${a.profession} ${a.city}`
        ) -
        scoreText(
          `${b.full_name} ${b.username || ""} ${b.profession} ${b.city}`
        )
    )
    .reverse()
    .slice(0, 12);

  const companies = [...(companiesRes.data ?? [])]
    .sort(
      (a, b) =>
        scoreText(`${a.name} ${a.slug || ""} ${a.industry} ${a.city}`) -
        scoreText(`${b.name} ${b.slug || ""} ${b.industry} ${b.city}`)
    )
    .reverse()
    .slice(0, 12);

  const listings = [...(listingsRes.data ?? [])]
    .sort(
      (a, b) =>
        scoreText(`${a.title} ${a.city} ${a.category}`) -
        scoreText(`${b.title} ${b.city} ${b.category}`)
    )
    .reverse()
    .slice(0, 12);

  const articles = [...(articlesRes.data ?? [])]
    .sort(
      (a, b) =>
        scoreText(`${a.title} ${a.category}`) -
        scoreText(`${b.title} ${b.category}`)
    )
    .reverse()
    .slice(0, 12);

  return {
    jobs,
    candidates,
    companies,
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
