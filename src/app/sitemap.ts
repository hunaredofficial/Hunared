import type { MetadataRoute } from "next";

/**
 * TEMPORARY — empty sitemap while crawl is paused for site modifications.
 * Restore the full production sitemap when work is done.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [];
}
