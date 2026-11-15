/** Groups of ids that share one physical placement on the site */
export const SLOT_ALIAS_GROUPS: string[][] = [
  // Sitewide header
  ["header_leaderboard", "header", "header_mobile"],
  // Footer strip
  ["footer_banner", "footer"],
  // Home hero variants
  ["home_hero", "homepage_hero", "home_hero_billboard"],
  // Home mid / inline
  ["homepage_mid"],
  ["homepage_inline"],
  // Jobs
  ["jobs_list_top"],
  ["jobs_sidebar", "job_sidebar"],
  ["jobs_inline"],
  ["job_below_description"],
  // Market
  ["market_list_top", "market_top"],
  ["market_sidebar"],
  // Talent / companies / learning / articles
  ["candidates_top"],
  ["companies_top"],
  ["learning_top"],
  ["blog_sidebar"],
];

export function expandSlotIds(slotId: string, extra: string[] = []): string[] {
  const wanted = new Set<string>([slotId, ...extra].filter(Boolean));
  for (const group of SLOT_ALIAS_GROUPS) {
    if (group.some((id) => wanted.has(id))) {
      group.forEach((id) => wanted.add(id));
    }
  }
  return Array.from(wanted);
}

export function legacyNameFor(slotId: string): string {
  const map: Record<string, string> = {
    header_leaderboard: "header",
    header_mobile: "header",
    footer_banner: "footer",
    home_hero: "homepage_hero",
    home_hero_billboard: "homepage_hero",
    homepage_hero: "homepage_hero",
    jobs_sidebar: "job_sidebar",
    market_list_top: "market_list_top",
    market_top: "market_list_top",
    candidates_top: "candidates_top",
    companies_top: "companies_top",
    learning_top: "learning_top",
    blog_sidebar: "blog_sidebar",
  };
  return map[slotId] || slotId;
}
