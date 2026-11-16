/**
 * Canonical ad placement catalog for Admin Ads + Premium Ads.
 * Includes helpers required by admin AdSlotEditor / AddAdSlotForm.
 */

export type AdSlotDef = {
  id: string;
  label: string;
  group: string;
  description: string;
  sizeLabel: string;
  width: number;
  height: number;
  basePriceUsd: number;
  /** @deprecated mirror of basePriceUsd for older admin UI */
  basePriceSar?: number;
  usedOn: string;
};

export const AD_SLOT_CATALOG: AdSlotDef[] = [
  {
    id: "header_leaderboard",
    label: "Header Banner",
    group: "Sitewide",
    description: "Top under header — one winner sitewide",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 29,
    basePriceSar: 29,
    usedOn: "All public pages",
  },
  {
    id: "footer_banner",
    label: "Footer Strip",
    group: "Sitewide",
    description: "Above site footer",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 16,
    basePriceSar: 16,
    usedOn: "All public pages",
  },
  {
    id: "home_hero",
    label: "Home Hero Banner",
    group: "Home",
    description: "Under search on homepage",
    sizeLabel: "1200×320",
    width: 1200,
    height: 320,
    basePriceUsd: 49,
    basePriceSar: 49,
    usedOn: "Home",
  },
  {
    id: "homepage_mid",
    label: "Home Mid Page",
    group: "Home",
    description: "Mid homepage band",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 22,
    basePriceSar: 22,
    usedOn: "Home",
  },
  {
    id: "homepage_inline_1",
    label: "Home Inline — Left",
    group: "Home",
    description: "Homepage mid row, left tile (300×250)",
    sizeLabel: "300×250",
    width: 300,
    height: 250,
    basePriceUsd: 19,
    basePriceSar: 19,
    usedOn: "Home",
  },
  {
    id: "homepage_inline_2",
    label: "Home Inline — Center",
    group: "Home",
    description: "Homepage mid row, center tile (300×250)",
    sizeLabel: "300×250",
    width: 300,
    height: 250,
    basePriceUsd: 19,
    basePriceSar: 19,
    usedOn: "Home",
  },
  {
    id: "homepage_inline_3",
    label: "Home Inline — Right",
    group: "Home",
    description: "Homepage mid row, right tile (300×250)",
    sizeLabel: "300×250",
    width: 300,
    height: 250,
    basePriceUsd: 19,
    basePriceSar: 19,
    usedOn: "Home",
  },
  {
    // Kept for backward compatibility with existing ads / DB rows
    id: "homepage_inline",
    label: "Home Inline Rectangle (legacy)",
    group: "Home",
    description: "Legacy single mid card — prefer homepage_inline_1/2/3",
    sizeLabel: "300×250",
    width: 300,
    height: 250,
    basePriceUsd: 19,
    basePriceSar: 19,
    usedOn: "Home (legacy)",
  },
  {
    id: "jobs_list_top",
    label: "Jobs List — Top",
    group: "Jobs",
    description: "Above job results",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 24,
    basePriceSar: 24,
    usedOn: "Jobs",
  },
  {
    id: "jobs_sidebar",
    label: "Jobs Sidebar",
    group: "Jobs",
    description: "Jobs filters sidebar",
    sizeLabel: "300×250",
    width: 300,
    height: 250,
    basePriceUsd: 28,
    basePriceSar: 28,
    usedOn: "Jobs",
  },
  {
    id: "jobs_inline",
    label: "Jobs Inline Card",
    group: "Jobs",
    description: "Optional second jobs strip",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 16,
    basePriceSar: 16,
    usedOn: "Jobs",
  },
  {
    id: "job_below_description",
    label: "Job Detail — Below Description",
    group: "Jobs",
    description: "Under job description",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 18,
    basePriceSar: 18,
    usedOn: "Job detail",
  },
  {
    id: "job_promote",
    label: "Job ranking boost",
    group: "Jobs",
    description: "Promote a job to top of Jobs results (no banner)",
    sizeLabel: "Ranking",
    width: 0,
    height: 0,
    basePriceUsd: 9,
    basePriceSar: 9,
    usedOn: "Jobs ranking",
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
    basePriceSar: 22,
    usedOn: "Marketplace",
  },
  {
    id: "market_sidebar",
    label: "Marketplace Sidebar",
    group: "Marketplace",
    description: "Marketplace sidebar",
    sizeLabel: "300×250",
    width: 300,
    height: 250,
    basePriceUsd: 18,
    basePriceSar: 18,
    usedOn: "Marketplace",
  },
  {
    id: "market_detail_below",
    label: "Listing Detail — Below Description",
    group: "Marketplace",
    description: "Under listing description",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 18,
    basePriceSar: 18,
    usedOn: "Listing detail",
  },
  {
    id: "listing_promote",
    label: "Listing ranking boost",
    group: "Marketplace",
    description: "Promote a listing to top of Marketplace (no banner)",
    sizeLabel: "Ranking",
    width: 0,
    height: 0,
    basePriceUsd: 9,
    basePriceSar: 9,
    usedOn: "Marketplace ranking",
  },
  {
    id: "candidates_top",
    label: "Talent Page — Top",
    group: "Talent",
    description: "Talent directory top",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 24,
    basePriceSar: 24,
    usedOn: "Talent",
  },
  {
    id: "candidates_filters",
    label: "Talent — Sidebar",
    group: "Talent",
    description: "Talent filters sidebar",
    sizeLabel: "300×250",
    width: 300,
    height: 250,
    basePriceUsd: 18,
    basePriceSar: 18,
    usedOn: "Talent",
  },
  {
    id: "companies_top",
    label: "Companies Page — Top",
    group: "Companies",
    description: "Companies directory top",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 22,
    basePriceSar: 22,
    usedOn: "Companies",
  },
  {
    id: "companies_filters",
    label: "Companies — Sidebar",
    group: "Companies",
    description: "Companies filters sidebar",
    sizeLabel: "300×250",
    width: 300,
    height: 250,
    basePriceUsd: 18,
    basePriceSar: 18,
    usedOn: "Companies",
  },
  {
    id: "learning_top",
    label: "Learning Hub — Top",
    group: "Learning",
    description: "Education hub top",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 20,
    basePriceSar: 20,
    usedOn: "Learning",
  },
  {
    id: "resources_top",
    label: "Resources — Top",
    group: "Learning",
    description: "Learning resources library top",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 16,
    basePriceSar: 16,
    usedOn: "Resources",
  },
  {
    id: "blog_sidebar",
    label: "Articles Sidebar",
    group: "Articles",
    description: "Article page sidebar",
    sizeLabel: "300×250",
    width: 300,
    height: 250,
    basePriceUsd: 15,
    basePriceSar: 15,
    usedOn: "Articles",
  },
  {
    id: "article_detail_below",
    label: "Article Detail — Below Content",
    group: "Articles",
    description: "Under article body",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceUsd: 16,
    basePriceSar: 16,
    usedOn: "Article detail",
  },
];

/** Visible bookable slots (excludes ranking-only promote slots from placement picker) */
export const BOOKABLE_SLOT_IDS = AD_SLOT_CATALOG.filter(
  (s) => s.id !== "job_promote" && s.id !== "listing_promote"
).map((s) => s.id);

export const PREMIUM_BOOKABLE_SLOT_IDS = BOOKABLE_SLOT_IDS;

export const AD_SLOT_BY_ID: Record<string, AdSlotDef> = Object.fromEntries(
  AD_SLOT_CATALOG.map((s) => [s.id, s])
);

export function getAdSlotLabel(slotName: string): string {
  return AD_SLOT_BY_ID[slotName]?.label ?? slotName.replace(/_/g, " ");
}

export function getAdSlotMeta(slotName: string): AdSlotDef | null {
  return AD_SLOT_BY_ID[slotName] ?? null;
}

export const SUGGESTED_AD_SLOTS = AD_SLOT_CATALOG.map((s) => s.id);

export const LEGACY_TO_CANONICAL: Record<string, string> = {
  header: "header_leaderboard",
  header_mobile: "header_leaderboard",
  header_mobile_banner: "header_leaderboard",
  footer: "footer_banner",
  homepage_hero: "home_hero",
  home_hero_billboard: "home_hero",
  job_sidebar: "jobs_sidebar",
  market_top: "market_list_top",
  // Old single mid-card → left tile of the new 3-up row
  homepage_inline: "homepage_inline_1",
};

export function canonicalSlotId(id: string): string {
  return LEGACY_TO_CANONICAL[id] || id;
}

export function slotById(id: string): AdSlotDef | undefined {
  const c = canonicalSlotId(id);
  return AD_SLOT_BY_ID[c] ?? AD_SLOT_BY_ID[id];
}
