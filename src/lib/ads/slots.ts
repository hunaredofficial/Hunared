export type AdSlotDef = {
  id: string;
  label: string;
  group: string;
  description: string;
  sizeLabel: string;
  width: number;
  height: number;
  basePriceUsd: number;
  usedOn: string;
};

export const AD_SLOT_CATALOG: AdSlotDef[] = [
  { id: "header_leaderboard", label: "Header Banner", group: "Sitewide", description: "Top under header — one winner sitewide", sizeLabel: "728×90", width: 728, height: 90, basePriceUsd: 29, usedOn: "All public pages" },
  { id: "footer_banner", label: "Footer Strip", group: "Sitewide", description: "Above site footer", sizeLabel: "728×90", width: 728, height: 90, basePriceUsd: 16, usedOn: "All public pages" },
  { id: "home_hero", label: "Home Hero Banner", group: "Home", description: "Under search on homepage", sizeLabel: "1200×320", width: 1200, height: 320, basePriceUsd: 49, usedOn: "Home" },
  { id: "homepage_mid", label: "Home Mid Page", group: "Home", description: "Mid homepage band", sizeLabel: "728×90", width: 728, height: 90, basePriceUsd: 22, usedOn: "Home" },
  { id: "homepage_inline", label: "Home Inline Rectangle", group: "Home", description: "Homepage mid card", sizeLabel: "300×250", width: 300, height: 250, basePriceUsd: 19, usedOn: "Home" },
  { id: "jobs_list_top", label: "Jobs List — Top", group: "Jobs", description: "Above job results", sizeLabel: "728×90", width: 728, height: 90, basePriceUsd: 24, usedOn: "Jobs" },
  { id: "jobs_sidebar", label: "Jobs Sidebar", group: "Jobs", description: "Jobs filters sidebar", sizeLabel: "300×250", width: 300, height: 250, basePriceUsd: 28, usedOn: "Jobs" },
  { id: "jobs_inline", label: "Jobs Inline Card", group: "Jobs", description: "Second strip under jobs top", sizeLabel: "728×90", width: 728, height: 90, basePriceUsd: 16, usedOn: "Jobs" },
  { id: "job_below_description", label: "Job Detail — Below Description", group: "Jobs", description: "Under job description", sizeLabel: "728×90", width: 728, height: 90, basePriceUsd: 18, usedOn: "Job detail" },
  { id: "market_list_top", label: "Marketplace List — Top", group: "Marketplace", description: "Above marketplace results", sizeLabel: "728×90", width: 728, height: 90, basePriceUsd: 22, usedOn: "Marketplace" },
  { id: "market_sidebar", label: "Marketplace Sidebar", group: "Marketplace", description: "Marketplace sidebar", sizeLabel: "300×250", width: 300, height: 250, basePriceUsd: 18, usedOn: "Marketplace" },
  { id: "market_detail_below", label: "Listing Detail — Below Description", group: "Marketplace", description: "Under listing description on detail page", sizeLabel: "728×90", width: 728, height: 90, basePriceUsd: 18, usedOn: "Listing detail" },
  { id: "candidates_top", label: "Talent Page — Top", group: "Talent", description: "Talent directory top", sizeLabel: "728×90", width: 728, height: 90, basePriceUsd: 24, usedOn: "Talent" },
  { id: "companies_top", label: "Companies Page — Top", group: "Companies", description: "Companies directory top", sizeLabel: "728×90", width: 728, height: 90, basePriceUsd: 22, usedOn: "Companies" },
  { id: "companies_filters", label: "Companies — Above Filters", group: "Companies", description: "Banner above company search filters", sizeLabel: "728×90", width: 728, height: 90, basePriceUsd: 18, usedOn: "Companies" },
  { id: "learning_top", label: "Learning Hub — Top", group: "Learning", description: "Education hub top", sizeLabel: "728×90", width: 728, height: 90, basePriceUsd: 20, usedOn: "Learning" },
  { id: "resources_top", label: "Resources — Top", group: "Learning", description: "Learning resources library top", sizeLabel: "728×90", width: 728, height: 90, basePriceUsd: 16, usedOn: "Resources" },
  { id: "blog_sidebar", label: "Articles Sidebar", group: "Articles", description: "Article page sidebar", sizeLabel: "300×250", width: 300, height: 250, basePriceUsd: 15, usedOn: "Articles" },
  { id: "article_detail_below", label: "Article Detail — Below Content", group: "Articles", description: "Under article body", sizeLabel: "728×90", width: 728, height: 90, basePriceUsd: 16, usedOn: "Article detail" },
];

export const BOOKABLE_SLOT_IDS = AD_SLOT_CATALOG.map((s) => s.id);

export const LEGACY_TO_CANONICAL: Record<string, string> = {
  header: "header_leaderboard",
  header_mobile: "header_leaderboard",
  footer: "footer_banner",
  homepage_hero: "home_hero",
  home_hero_billboard: "home_hero",
  job_sidebar: "jobs_sidebar",
  market_top: "market_list_top",
};

export function canonicalSlotId(id: string): string {
  return LEGACY_TO_CANONICAL[id] || id;
}
