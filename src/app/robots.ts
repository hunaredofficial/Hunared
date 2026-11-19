import type { MetadataRoute } from "next";

/**
 * Production robots — allow search engines to index public pages.
 * Private / auth / API routes remain disallowed.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://hunared.com").replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/api/",
          "/sign-in",
          "/sign-in/",
          "/register",
          "/register/",
          "/agent",
          "/agent/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl.replace(/^https?:\/\//, ""),
  };
}
