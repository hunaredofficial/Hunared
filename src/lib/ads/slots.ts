/**
 * Canonical ad placement catalog for Admin Ads + Premium Ads.
 * slot_name / id must match <AdSlot slotName> and PremiumAdSlot slotId in code.
 */

export type AdSlotDef = {
  id: string;
  label: string;
  group: string;
  description: string;
  sizeLabel: string;
  width: number;
  height: number;
  /** Base price for premium catalog (SAR / 14 days reference) */
  basePriceSar: number;
  /** Where it renders on the live site */
  usedOn: string;
};

/** Active slots aligned with current Hunared layout */
export const AD_SLOT_CATALOG: AdSlotDef[] = [
  // Sitewide
  {
    id: "header",
    label: "Header Banner",
    group: "Sitewide",
    description: "Under the main header on every public page",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceSar: 178,
    usedOn: "Public layout",
  },
  {
    id: "header_leaderboard",
    label: "Header Leaderboard",
    group: "Sitewide",
    description: "Premium leaderboard under the header (same band as Header Banner)",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceSar: 178,
    usedOn: "Public layout",
  },
  {
    id: "header_mobile",
    label: "Mobile Header Banner",
    group: "Sitewide",
    description: "Compact top banner on mobile",
    sizeLabel: "320×50",
    width: 320,
    height: 50,
    basePriceSar: 88,
    usedOn: "Public layout (mobile)",
  },
  {
    id: "footer",
    label: "Footer Banner",
    group: "Sitewide",
    description: "Above the site footer",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceSar: 120,
    usedOn: "Public layout",
  },
  {
    id: "footer_banner",
    label: "Footer Banner (Premium)",
    group: "Sitewide",
    description: "Premium footer strip — same area as Footer Banner",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceSar: 120,
    usedOn: "Public layout",
  },

  // Home
  {
    id: "homepage_hero",
    label: "Home Hero Banner",
    group: "Home",
    description: "Homepage strip under the search hero",
    sizeLabel: "1200×320",
    width: 1200,
    height: 320,
    basePriceSar: 358,
    usedOn: "Home page",
  },
  {
    id: "home_hero",
    label: "Home Hero (Premium)",
    group: "Home",
    description: "Premium home hero placement",
    sizeLabel: "1200×320",
    width: 1200,
    height: 320,
    basePriceSar: 358,
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
    basePriceSar: 160,
    usedOn: "Home page",
  },
  {
    id: "homepage_inline",
    label: "Home Inline Rectangle",
    group: "Home",
    description: "Homepage card-style rectangle",
    sizeLabel: "300×250",
    width: 300,
    height: 250,
    basePriceSar: 142,
    usedOn: "Home page",
  },

  // Jobs
  {
    id: "jobs_list_top",
    label: "Jobs List — Top",
    group: "Jobs",
    description: "Above job search results",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceSar: 150,
    usedOn: "Jobs page",
  },
  {
    id: "jobs_sidebar",
    label: "Jobs Sidebar",
    group: "Jobs",
    description: "Desktop jobs left filter column",
    sizeLabel: "300×600",
    width: 300,
    height: 600,
    basePriceSar: 180,
    usedOn: "Jobs page",
  },
  {
    id: "job_sidebar",
    label: "Jobs Sidebar (Legacy)",
    group: "Jobs",
    description: "Alias of Jobs Sidebar — keep for existing placements",
    sizeLabel: "300×600",
    width: 300,
    height: 600,
    basePriceSar: 180,
    usedOn: "Jobs page",
  },
  {
    id: "jobs_inline",
    label: "Jobs Inline Card",
    group: "Jobs",
    description: "Between job result cards",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceSar: 99,
    usedOn: "Jobs page",
  },
  {
    id: "job_below_description",
    label: "Job Detail — Below Description",
    group: "Jobs",
    description: "On job detail under the description",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceSar: 110,
    usedOn: "Job detail page",
  },

  // Marketplace
  {
    id: "market_list_top",
    label: "Marketplace List — Top",
    group: "Marketplace",
    description: "Above marketplace results",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceSar: 140,
    usedOn: "Marketplace page",
  },
  {
    id: "market_sidebar",
    label: "Marketplace Sidebar",
    group: "Marketplace",
    description: "Desktop marketplace filter column",
    sizeLabel: "300×250",
    width: 300,
    height: 250,
    basePriceSar: 120,
    usedOn: "Marketplace page",
  },
  {
    id: "market_top",
    label: "Marketplace Top (Legacy)",
    group: "Marketplace",
    description: "Legacy top slot — prefer market_list_top",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceSar: 140,
    usedOn: "Marketplace page",
  },

  // Talent
  {
    id: "candidates_top",
    label: "Talent Page — Top",
    group: "Talent",
    description: "Top of the Talent (candidates) directory",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceSar: 150,
    usedOn: "Talent page",
  },

  // Companies
  {
    id: "companies_top",
    label: "Companies Page — Top",
    group: "Companies",
    description: "Top of the companies directory",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceSar: 150,
    usedOn: "Companies page",
  },

  // Learning
  {
    id: "learning_top",
    label: "Learning Hub — Top",
    group: "Learning",
    description: "Top of Learning / education pages",
    sizeLabel: "728×90",
    width: 728,
    height: 90,
    basePriceSar: 130,
    usedOn: "Learning pages",
  },

  // Articles
  {
    id: "blog_sidebar",
    label: "Articles Sidebar",
    group: "Articles",
    description: "Sidebar on article / blog pages",
    sizeLabel: "300×250",
    width: 300,
    height: 250,
    basePriceSar: 99,
    usedOn: "Article pages",
  },
];

export const AD_SLOT_BY_ID: Record<string, AdSlotDef> = Object.fromEntries(
  AD_SLOT_CATALOG.map((s) => [s.id, s])
);

export function getAdSlotLabel(slotName: string): string {
  return AD_SLOT_BY_ID[slotName]?.label ?? slotName.replace(/_/g, " ");
}

export function getAdSlotMeta(slotName: string): AdSlotDef | null {
  return AD_SLOT_BY_ID[slotName] ?? null;
}

/** Suggested ids when admin creates a new custom slot */
export const SUGGESTED_AD_SLOTS = AD_SLOT_CATALOG.map((s) => s.id);

/** Premium-bookable catalog (no pure legacy aliases) */
export const PREMIUM_BOOKABLE_SLOT_IDS = [
  "header_leaderboard",
  "header_mobile",
  "home_hero",
  "homepage_inline",
  "jobs_list_top",
  "jobs_sidebar",
  "jobs_inline",
  "market_list_top",
  "market_sidebar",
  "candidates_top",
  "companies_top",
  "learning_top",
  "footer_banner",
] as const;
