import type { MetadataRoute } from "next";

/**
 * TEMPORARY — site-wide crawl stop while modifications are in progress.
 * Restore production rules (allow public pages) when work is done.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://hunared.com").replace(
    /\/$/,
    ""
  );

  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
      {
        userAgent: "Googlebot",
        disallow: "/",
      },
      {
        userAgent: "Googlebot-Image",
        disallow: "/",
      },
      {
        userAgent: "Bingbot",
        disallow: "/",
      },
    ],
    // No sitemap while crawl is paused
    host: baseUrl.replace(/^https?:\/\//, ""),
  };
}
