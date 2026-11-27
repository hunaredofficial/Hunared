export type SlotDisplay = { frameClass: string; objectFit: "cover" | "contain" };

/** Display rules aligned with Jobs / Business (role models) */
export const SLOT_DISPLAY: Record<string, SlotDisplay> = {
  // Full-width top banners (like jobs_list_top)
  header_leaderboard: { frameClass: "w-full h-[50px] sm:h-[90px]", objectFit: "cover" },
  footer_banner: { frameClass: "w-full h-[50px] sm:h-[90px]", objectFit: "cover" },
  home_hero: { frameClass: "w-full h-[120px] sm:h-[180px] md:h-[220px]", objectFit: "cover" },
  homepage_mid: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  homepage_inline: { frameClass: "w-full aspect-[4/3]", objectFit: "cover" },
  homepage_inline_1: { frameClass: "w-full aspect-[4/3]", objectFit: "cover" },
  homepage_inline_2: { frameClass: "w-full aspect-[4/3]", objectFit: "cover" },
  homepage_inline_3: { frameClass: "w-full aspect-[4/3]", objectFit: "cover" },
  jobs_list_top: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  jobs_inline: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  job_below_description: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  market_list_top: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  market_detail_below: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  candidates_top: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  companies_top: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  learning_top: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  resources_top: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  article_detail_below: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  // Sidebars 300×250 (like jobs_sidebar)
  jobs_sidebar: { frameClass: "w-full aspect-[300/250] max-h-[250px]", objectFit: "contain" },
  market_sidebar: { frameClass: "w-full aspect-[300/250] max-h-[250px]", objectFit: "contain" },
  candidates_filters: { frameClass: "w-full aspect-[300/250] max-h-[250px]", objectFit: "contain" },
  companies_filters: { frameClass: "w-full aspect-[300/250] max-h-[250px]", objectFit: "contain" },
  blog_sidebar: { frameClass: "w-full aspect-[300/250] max-h-[250px]", objectFit: "contain" },
};

export function displayForSlot(slotId: string): SlotDisplay {
  return SLOT_DISPLAY[slotId] || { frameClass: "w-full h-[90px]", objectFit: "cover" };
}
