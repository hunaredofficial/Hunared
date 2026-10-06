import type { MetadataRoute } from "next";

/**
 * Block all crawlers while the site is under development.
 * When ready to launch, change to allow indexing and re-submit sitemap in Search Console.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
    // No sitemap while blocked
  };
}
