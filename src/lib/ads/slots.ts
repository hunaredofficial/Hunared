/**
 * Canonical ad placement catalog.
 * One id per physical place on the site — no duplicate banners.
 * Legacy ids remain in LEGACY_SLOT_ALIASES for live lookup only (not bookable).
 */

export type AdSlotDef = {
  id: string;
  label: string;
  group: string;
  description: string;
  sizeLabel: string;
  width: number;
  height: number;
  /** Base USD package price reference (7 days scale in create form) */
  basePriceUsd: number;
  usedOn: string;
};

/** Bookable + rendered placements (unique on page) */
export const AD_SLOT_CATALOG: AdSlotDef[] = [
  {
    id: "header_leaderboard",
    label: "Header Banner",
    group: "Sitewide",
    description: "Top banner under the main header (desktop + mobile responsive)",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 29,
    usedOn: "All public pages",
  },
  {
    id: "footer_banner",
    label: "Footer Strip",
    group: "Sitewide",
    description: "Banner above the site footer",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 16,
    usedOn: "All public pages",
  },
  {
    id: "home_hero",
    label: "Home Hero Banner",
    group: "Home",
    description: "Homepage strip under the search hero",
    sizeLabel: "1200×320",
    width: 1200,
    height: 320,
    basePriceUsd: 49,
    usedOn: "Home page",
  },
  {
    id: "homepage_mid",
    label: "Home Mid Page",
    group: "Home",
    description: "Mid-page homepage band",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 22,
    usedOn: "Home page",
  },
  {
    id: "homepage_inline",
    label: "Home Inline Rectangle",
    group: "Home",
    description: "Homepage mid-page card",
    sizeLabel: "300×250",
    width: 300,
    height: 250,
    basePriceUsd: 19,
    usedOn: "Home page",
  },
  {
    id: "jobs_list_top",
    label: "Jobs List — Top",
    group: "Jobs",
    description: "Above job search results",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 24,
    usedOn: "Jobs directory",
  },
  {
    id: "jobs_sidebar",
    label: "Jobs Sidebar",
    group: "Jobs",
    description: "Desktop jobs filter sidebar",
    sizeLabel: "300×250",
    width: 300,
    height: 250,
    basePriceUsd: 28,
    usedOn: "Jobs directory",
  },
  {
    id: "jobs_inline",
    label: "Jobs Inline Card",
    group: "Jobs",
    description: "Under / between job results",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 16,
    usedOn: "Jobs directory",
  },
  {
    id: "job_below_description",
    label: "Job Detail — Below Description",
    group: "Jobs",
    description: "Under job description on detail page",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 18,
    usedOn: "Job detail",
  },
  {
    id: "market_list_top",
    label: "Marketplace List — Top",
    group: "Marketplace",
    description: "Above marketplace results",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 22,
    usedOn: "Marketplace",
  },
  {
    id: "market_sidebar",
    label: "Marketplace Sidebar",
    group: "Marketplace",
    description: "Desktop marketplace sidebar",
    sizeLabel: "300×250",
    width: 300,
    height: 250,
    basePriceUsd: 18,
    usedOn: "Marketplace",
  },
  {
    id: "candidates_top",
    label: "Talent Page — Top",
    group: "Talent",
    description: "Top of Talent directory",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 24,
    usedOn: "Talent page",
  },
  {
    id: "companies_top",
    label: "Companies Page — Top",
    group: "Companies",
    description: "Top of Companies directory",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 22,
    usedOn: "Companies page",
  },
  {
    id: "learning_top",
    label: "Learning Hub — Top",
    group: "Learning",
    description: "Top of Education / Learning hub",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 20,
    usedOn: "Learning hub",
  },
  {
    id: "blog_sidebar",
    label: "Articles Sidebar",
    group: "Articles",
    description: "Sidebar on article detail pages",
    sizeLabel: "300×250",
    width: 300,
    height: 250,
    basePriceUsd: 15,
    usedOn: "Article pages",
  },
];

/** Ids users can purchase (must match active rows in premium_ad_slots) */
export const BOOKABLE_SLOT_IDS = AD_SLOT_CATALOG.map((s) => s.id);

/**
 * Legacy / duplicate ids → canonical id.
 * Live API expands these so old campaigns still show in the right place.
 * These are NOT bookable.
 */
export const LEGACY_TO_CANONICAL: Record<string, string> = {
  header: "header_leaderboard",
  header_mobile: "header_leaderboard",
  header_mobile_banner: "header_leaderboard",
  footer: "footer_banner",
  homepage_hero: "home_hero",
  home_hero_billboard: "home_hero",
  job_sidebar: "jobs_sidebar",
  market_top: "market_list_top",
};

export function canonicalSlotId(id: string): string {
  return LEGACY_TO_CANONICAL[id] || id;
}

export function slotById(id: string): AdSlotDef | undefined {
  const c = canonicalSlotId(id);
  return AD_SLOT_CATALOG.find((s) => s.id === c);
}
