export type SlotDisplay = { frameClass: string; objectFit: "cover" | "contain" };
export const SLOT_DISPLAY: Record<string, SlotDisplay> = {
  header_leaderboard: { frameClass: "w-full h-[50px] sm:h-[90px]", objectFit: "cover" },
  footer_banner: { frameClass: "w-full h-[50px] sm:h-[90px]", objectFit: "cover" },
  home_hero: { frameClass: "w-full h-[120px] sm:h-[180px] md:h-[220px]", objectFit: "cover" },
  homepage_mid: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  homepage_inline: { frameClass: "w-full max-w-[300px] aspect-[300/250] mx-auto", objectFit: "contain" },
  jobs_list_top: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  jobs_inline: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  job_below_description: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  jobs_sidebar: { frameClass: "w-full aspect-[300/250] max-h-[300px]", objectFit: "contain" },
  market_list_top: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  market_sidebar: { frameClass: "w-full aspect-[300/250] max-h-[300px]", objectFit: "contain" },
  market_detail_below: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  candidates_filters: { frameClass: "w-full aspect-[300/250] max-h-[250px]", objectFit: "contain" },
  candidates_top: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  companies_top: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  companies_filters: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  learning_top: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  resources_top: { frameClass: "w-full h-[90px]", objectFit: "cover" },
  blog_sidebar: { frameClass: "w-full aspect-[300/250] max-h-[300px]", objectFit: "contain" },
  article_detail_below: { frameClass: "w-full h-[90px]", objectFit: "cover" },
};
export function displayForSlot(slotId: string): SlotDisplay {
  return SLOT_DISPLAY[slotId] || { frameClass: "w-full h-[90px]", objectFit: "cover" };
}
