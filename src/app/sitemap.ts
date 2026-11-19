import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://hunared.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/jobs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/candidates`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/market`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/education`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/education/resources`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/companies`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/finder`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/help`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // If keys are missing, return only static routes (build will not crash)
  if (!supabaseUrl || !serviceKey) {
    return staticRoutes;
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, created_at")
      .eq("status", "approved");

    const jobRoutes: MetadataRoute.Sitemap = (jobs ?? []).map((job) => ({
      url: `${baseUrl}/jobs/${job.id}`,
      lastModified: job.created_at ? new Date(job.created_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, created_at")
      .eq("role", "seeker")
      .is("deleted_at", null);

    const candidateRoutes: MetadataRoute.Sitemap = (profiles ?? []).map((profile) => ({
      url: `${baseUrl}/candidates/${profile.id}`,
      lastModified: profile.created_at ? new Date(profile.created_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));


    const { data: listings } = await supabase
      .from("marketplace_listings")
      .select("id, created_at")
      .eq("status", "approved")
      .limit(5000);

    const listingRoutes: MetadataRoute.Sitemap = (listings ?? []).map((row) => ({
      url: `${baseUrl}/market/${row.id}`,
      lastModified: row.created_at ? new Date(row.created_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    const { data: companies } = await supabase
      .from("companies")
      .select("slug, created_at")
      .not("slug", "is", null)
      .limit(2000);

    const companyRoutes: MetadataRoute.Sitemap = (companies ?? [])
      .filter((c) => c.slug)
      .map((c) => ({
        url: `${baseUrl}/companies/${c.slug}`,
        lastModified: c.created_at ? new Date(c.created_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));

    return [...staticRoutes, ...jobRoutes, ...candidateRoutes, ...listingRoutes, ...companyRoutes];

  } catch {
    return staticRoutes;
  }
}