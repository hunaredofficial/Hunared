/** Display rules so creatives fit each placement (IAB-oriented) */
export type SlotDisplay = {
  /** Tailwind height classes for the frame */
  frameClass: string;
  /** object-fit for the image */
  objectFit: "cover" | "contain";
  /** Prefer full-bleed cover for banners */
  fullBleed: boolean;
};

export const SLOT_DISPLAY: Record<string, SlotDisplay> = {
  header_leaderboard: {
    frameClass: "h-[50px] sm:h-[90px] w-full max-w-[970px] mx-auto",
    objectFit: "cover",
    fullBleed: true,
  },
  header_mobile: {
    frameClass: "h-[50px] w-full max-w-[320px] mx-auto",
    objectFit: "cover",
    fullBleed: true,
  },
  header: {
    frameClass: "h-[50px] sm:h-[90px] w-full max-w-[970px] mx-auto",
    objectFit: "cover",
    fullBleed: true,
  },
  footer_banner: {
    frameClass: "h-[50px] sm:h-[90px] w-full max-w-[728px] mx-auto",
    objectFit: "cover",
    fullBleed: true,
  },
  footer: {
    frameClass: "h-[50px] sm:h-[90px] w-full max-w-[728px] mx-auto",
    objectFit: "cover",
    fullBleed: true,
  },
  home_hero: {
    frameClass: "h-[90px] sm:h-[120px] w-full max-w-7xl mx-auto",
    objectFit: "cover",
    fullBleed: true,
  },
  homepage_hero: {
    frameClass: "h-[90px] sm:h-[120px] w-full max-w-7xl mx-auto",
    objectFit: "cover",
    fullBleed: true,
  },
  jobs_list_top: {
    frameClass: "h-[90px] w-full",
    objectFit: "cover",
    fullBleed: true,
  },
  market_list_top: {
    frameClass: "h-[90px] w-full",
    objectFit: "cover",
    fullBleed: true,
  },
  candidates_top: {
    frameClass: "h-[90px] w-full",
    objectFit: "cover",
    fullBleed: true,
  },
  companies_top: {
    frameClass: "h-[90px] w-full",
    objectFit: "cover",
    fullBleed: true,
  },
  learning_top: {
    frameClass: "h-[90px] w-full",
    objectFit: "cover",
    fullBleed: true,
  },
  jobs_sidebar: {
    frameClass: "min-h-[250px] max-h-[280px] w-full max-w-[300px]",
    objectFit: "contain",
    fullBleed: false,
  },
  job_sidebar: {
    frameClass: "min-h-[250px] max-h-[280px] w-full max-w-[300px]",
    objectFit: "contain",
    fullBleed: false,
  },
  market_sidebar: {
    frameClass: "min-h-[250px] max-h-[280px] w-full max-w-[300px]",
    objectFit: "contain",
    fullBleed: false,
  },
};

export function displayForSlot(slotId: string): SlotDisplay {
  return (
    SLOT_DISPLAY[slotId] || {
      frameClass: "h-[90px] w-full max-w-[728px] mx-auto",
      objectFit: "cover" as const,
      fullBleed: true,
    }
  );
}
