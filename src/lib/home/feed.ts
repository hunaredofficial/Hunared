import { createAdminClient } from "@/lib/supabase";
import {
  scoreJob,
  type PersonalizationProfile,
} from "@/lib/personalization";

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
  /** Personalization score (jobs only); higher = better match */
  score?: number;
};

function loc(country?: string | null, city?: string | null) {
  return [city, country].filter(Boolean).join(", ") || null;
}

type PageOpts = {
  type?: "all" | "job" | "listing" | "article";
  cursor?: string | null;
  limit?: number;
  profile?: PersonalizationProfile | null;
};

function mapJobs(
  rows: {
    id: string;
    job_title: string;
    job_description: string | null;
    country: string | null;
    city: string | null;
    category: string | null;
    employment_type: string | null;
    created_at: string;
    company_name: string | null;
  }[],
  profile?: PersonalizationProfile | null
): FeedItem[] {
  return rows.map((j) => {
    const score = profile
      ? scoreJob(
          {
            id: j.id,
            job_title: j.job_title,
            category: j.category,
            country: j.country,
            city: j.city,
            employment_type: j.employment_type,
            company_name: j.company_name,
          },
          profile
        )
      : 0;
    return {
      id: `job-${j.id}`,
      type: "job" as const,
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
      score,
    };
  });
}

function mapListings(
  rows: {
    id: string;
    title: string;
    description: string | null;
    country: string | null;
    city: string | null;
    category: string | null;
    price: string | null;
    currency: string | null;
    created_at: string;
    image_url: string | null;
    image_urls: string[] | null;
  }[]
): FeedItem[] {
  return rows.map((l) => {
    const photos = l.image_urls ?? [];
    return {
      id: `listing-${l.id}`,
      type: "listing" as const,
      title: l.title,
      description: l.description?.slice(0, 220) ?? null,
      href: `/business/${l.id}`,
      image: photos[0] ?? l.image_url ?? null,
      category: l.category ?? "Business",
      location: loc(l.country, l.city),
      createdAt: l.created_at,
      authorName: "Business listing",
      authorImage: null,
      meta: { price: l.price, currency: l.currency },
    };
  });
}

function mapArticles(
  rows: {
    id: string;
    title: string;
    content: string | null;
    category: string | null;
    created_at: string;
  }[]
): FeedItem[] {
  return rows.map((a) => ({
    id: `article-${a.id}`,
    type: "article" as const,
    title: a.title,
    description: a.content?.slice(0, 220) ?? null,
    href: `/education/${a.id}`,
    image: null,
    category: a.category ?? "Learning",
    location: null,
    createdAt: a.created_at,
    authorName: "Hunared",
    authorImage: null,
  }));
}

/** Paginated mixed feed with optional type filter + soft personalization. */
export async function getDiscoveryFeedPage(opts: PageOpts = {}): Promise<{
  items: FeedItem[];
  nextCursor: string | null;
}> {
  const type = opts.type ?? "all";
  const limit = opts.limit ?? 12;
  const cursor = opts.cursor ?? null;
  const supabase = createAdminClient();
  const per =
    type === "all" ? Math.max(8, Math.ceil(limit * 1.2)) : limit + 2;

  const jobsQ = supabase
    .from("jobs")
    .select(
      "id, job_title, job_description, country, city, category, employment_type, created_at, company_name, status"
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(per);
  if (cursor) jobsQ.lt("created_at", cursor);

  const listQ = supabase
    .from("marketplace_listings")
    .select(
      "id, title, description, country, city, category, price, currency, created_at, image_url, image_urls, status"
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(per);
  if (cursor) listQ.lt("created_at", cursor);

  const artQ = supabase
    .from("articles")
    .select("id, title, content, category, created_at, status")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(per);
  if (cursor) artQ.lt("created_at", cursor);

  const needJobs = type === "all" || type === "job";
  const needList = type === "all" || type === "listing";
  const needArt = type === "all" || type === "article";

  const [jobsRes, listingsRes, articlesRes] = await Promise.all([
    needJobs ? jobsQ : Promise.resolve({ data: [] as never[] }),
    needList ? listQ : Promise.resolve({ data: [] as never[] }),
    needArt ? artQ : Promise.resolve({ data: [] as never[] }),
  ]);

  let items: FeedItem[] = [
    ...(needJobs ? mapJobs(jobsRes.data ?? [], opts.profile) : []),
    ...(needList ? mapListings(listingsRes.data ?? []) : []),
    ...(needArt ? mapArticles(articlesRes.data ?? []) : []),
  ];

  // Sort: personalized jobs float slightly; then by date
  items.sort((a, b) => {
    const sa = a.score ?? 0;
    const sb = b.score ?? 0;
    if (sa !== sb && (sa > 0 || sb > 0)) return sb - sa;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const page = items.slice(0, limit);
  const nextCursor =
    page.length === limit
      ? page[page.length - 1]?.createdAt ?? null
      : null;

  return { items: page, nextCursor };
}

/** Convenience: first page only (SSR homepage). */
export async function getDiscoveryFeed(
  limit = 24,
  profile?: PersonalizationProfile | null
): Promise<FeedItem[]> {
  const { items } = await getDiscoveryFeedPage({ limit, profile, type: "all" });
  return items;
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
      industry: Array.isArray(c.industry) ? c.industry[0] : (c.industry as string | null),
      country: c.headquarters_country,
    })),
    listings: listings.data ?? [],
    articles: articles.data ?? [],
  };
}
