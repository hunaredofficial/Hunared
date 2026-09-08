import { getSupabaseClient } from "@/lib/supabase";
import { SearchResultsView } from "@/components/search/SearchResultsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search jobs, candidates, property, marketplace listings, and learning resources across Hunared.",
};

async function searchAll(query: string, country?: string, city?: string) {
  const supabase = getSupabaseClient();

  if (!query.trim()) {
    return { jobs: [], candidates: [], listings: [], articles: [] };
  }

  const term = `%${query.trim()}%`;

  let jobsQuery = supabase
    .from("jobs")
    .select(
      "id, job_title, job_description, category, location, company_name, salary_rate, country, city, employment_type, created_at"
    )
    .eq("status", "approved")
    .or(
      `job_title.ilike.${term},job_description.ilike.${term},category.ilike.${term},location.ilike.${term}`
    )
    .limit(12);
  if (country) jobsQuery = jobsQuery.eq("country", country);
  if (city) jobsQuery = jobsQuery.ilike("city", `%${city}%`);

  let profilesQuery = supabase
    .from("profiles")
    .select("id, full_name, profession, location, avatar_url, country, city")
    .eq("role", "seeker")
    .is("deleted_at", null)
    .or(`full_name.ilike.${term},profession.ilike.${term},location.ilike.${term}`)
    .limit(12);
  if (country) profilesQuery = profilesQuery.eq("country", country);
  if (city) profilesQuery = profilesQuery.ilike("city", `%${city}%`);

  let listingsQuery = supabase
    .from("marketplace_listings")
    .select(
      "id, title, description, category, location, price, currency, image_url, country, city, subcategory"
    )
    .eq("status", "approved")
    .or(`title.ilike.${term},description.ilike.${term},location.ilike.${term}`)
    .limit(12);
  if (country) listingsQuery = listingsQuery.eq("country", country);
  if (city) listingsQuery = listingsQuery.ilike("city", `%${city}%`);

  const articlesQuery = supabase
    .from("articles")
    .select("id, title, content, category, subcategory")
    .eq("status", "approved")
    .or(`title.ilike.${term},content.ilike.${term}`)
    .limit(12);
  // Articles have no location — country/city filters don't apply here

  const [jobsRes, profilesRes, listingsRes, articlesRes] = await Promise.all([
    jobsQuery,
    profilesQuery,
    listingsQuery,
    articlesQuery,
  ]);

  return {
    jobs: jobsRes.data ?? [],
    candidates: profilesRes.data ?? [],
    listings: listingsRes.data ?? [],
    articles: articlesRes.data ?? [],
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
        <SearchResultsView query={query} country={country ?? ""} city={city ?? ""} results={results} />
      </div>
    </main>
  );
}