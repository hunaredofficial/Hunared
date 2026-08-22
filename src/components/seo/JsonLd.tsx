// src/components/seo/JsonLd.tsx
// Structured data components (spec: SEO → Organization Schema,
// Breadcrumb Schema, JobPosting Schema).

import type { Job } from "@/types/database";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://hunared.com";

function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Site-wide Organization schema. Add ONCE in src/app/layout.tsx inside <body>. */
export function OrganizationSchema() {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Hunared",
        url: SITE_URL,
        logo: `${SITE_URL}/assets/logos/hunared-mark.png`,
        sameAs: [
          "https://facebook.com/hunared",
          "https://linkedin.com/company/hunared",
          "https://x.com/hunared",
        ],
      }}
    />
  );
}

/** Breadcrumb schema. Use on detail pages (job, listing, article). */
export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${SITE_URL}${item.path}`,
        })),
      }}
    />
  );
}

/** JobPosting schema. Add on the job detail page (/jobs/[id]). */
export function JobPostingSchema({ job }: { job: Job }) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.job_title,
        description: job.job_description,
        datePosted: job.created_at,
        employmentType:
          job.employment_type === "permanent" ? "FULL_TIME" : "TEMPORARY",
        hiringOrganization: {
          "@type": "Organization",
          name: job.company_name,
        },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.city ?? undefined,
            addressCountry: job.country ?? undefined,
          },
        },
        ...(job.salary_rate
          ? {
              baseSalary: {
                "@type": "MonetaryAmount",
                value: { "@type": "QuantitativeValue", value: job.salary_rate },
              },
            }
          : {}),
      }}
    />
  );
}

/*
USAGE:
1. Organization (site-wide): in src/app/layout.tsx add
     import { OrganizationSchema } from "@/components/seo/JsonLd";
   and place <OrganizationSchema /> just inside <body>.

2. JobPosting + Breadcrumb: in src/app/(public)/jobs/[id]/page.tsx,
   after fetching the job, render:
     <JobPostingSchema job={job} />
     <BreadcrumbSchema items={[
       { name: "Home", path: "/" },
       { name: "Jobs", path: "/jobs" },
       { name: job.job_title, path: `/jobs/${job.id}` },
     ]} />
*/
