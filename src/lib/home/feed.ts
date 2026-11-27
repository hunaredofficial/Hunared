import { createAdminClient } from "@/lib/supabase";

export type FeedItemType =
  | "job"
  | "listing"
  | "article"
  | "company"
  | "candidate";

export type FeedItem = {
  id: string;
  type: FeedItemType;
  title: string;
  description: string | null;
  href: string;
  image: string | null;
  category: string | null;
  location: string | null;
  createdAt: string;
  authorName: string | null;
  authorImage: string | null;
  meta?: Record<string, string | number | null | undefined>;
};

function loc(country?: string | null, city?: string | null) {
  return [city, country].filter(Boolean).join(", ") || null;
}

/** Mixed discovery feed from existing tables (jobs, listings, articles). */
export async function getDiscoveryFeed(limit = 24): Promise<FeedItem[]> {
  const supabase = createAdminClient();
  const per = Math.max(6, Math.ceil(limit / 3));

  const [jobsRes, listingsRes, articlesRes] = await Promise.all([
    supabase
      .from("jobs")
      .select(
        "id, job_title, job_description, country, city, category, employment_type, created_at, company_name, status"
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(per),
    supabase
      .from("marketplace_listings")
      .select(
        "id, title, description, country, city, category, price, currency, created_at, image_url, image_urls, status"
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(per),
    supabase
      .from("articles")
      .select("id, title, content, category, created_at, status")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(per),
  ]);

  const items: FeedItem[] = [];

  for (const j of jobsRes.data ?? []) {
    items.push({
      id: `job-${j.id}`,
      type: "job",
      title: j.job_title,
      description: j.job_description?.slice(0, 220) ?? null,
      href: `/jobs/${j.id}`,
      image: null,
      category: j.category ?? j.employment_type ?? "Job",
      location: loc(j.country, j.city),
      createdAt: j.created_at,
      authorName: j.company_name ?? "Employer",
      authorImage: null,
      meta: { employment: j.employment_type },
    });
  }

  for (const l of listingsRes.data ?? []) {
    const photos = (l.image_urls as string[] | null) ?? [];
    items.push({
      id: `listing-${l.id}`,
      type: "listing",
      title: l.title,
      description: l.description?.slice(0, 220) ?? null,
      href: `/business/${l.id}`,
      image: photos[0] ?? l.image_url ?? null,
      category: l.category ?? "Business",
      location: loc(l.country, l.city),
      createdAt: l.created_at,
      authorName: "Business listing",
      authorImage: null,
      meta: {
        price: l.price,
        currency: l.currency,
      },
    });
  }

  for (const a of articlesRes.data ?? []) {
    items.push({
      id: `article-${a.id}`,
      type: "article",
      title: a.title,
      description: a.content?.slice(0, 220) ?? null,
      href: `/education/${a.id}`,
      image: null,
      category: a.category ?? "Learning",
      location: null,
      createdAt: a.created_at,
      authorName: "Hunared",
      authorImage: null,
    });
  }

  items.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return items.slice(0, limit);
}

export async function getFeedSidebarData() {
  const supabase = createAdminClient();
  const [jobs, companies, listings, articles] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, job_title, country, company_name")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("companies")
      .select("id, name, industry, logo_url, headquarters_country")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("marketplace_listings")
      .select("id, title, price, currency, category")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("articles")
      .select("id, title, category")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    jobs: (jobs.data ?? []).map((j) => ({
      id: j.id,
      title: j.job_title,
      country: j.country,
      company_name: j.company_name,
    })),
    companies: (companies.data ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      industry: Array.isArray(c.industry) ? c.industry[0] : c.industry,
      country: c.headquarters_country,
    })),
    listings: listings.data ?? [],
    articles: articles.data ?? [],
  };
}
