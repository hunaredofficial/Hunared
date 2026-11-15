import { LEGACY_TO_CANONICAL, BOOKABLE_SLOT_IDS } from "@/lib/ads/slots";

/**
 * Expand a requested placement to all DB slot_ids that map to it
 * (canonical + legacy), so one active campaign wins the physical slot.
 */
export function expandSlotIds(slotId: string, extra: string[] = []): string[] {
  const seeds = [slotId, ...extra].filter(Boolean);
  const wanted = new Set<string>(seeds);

  // Map any seed to canonical, then include all legacy keys that point to it
  for (const s of seeds) {
    const canon = LEGACY_TO_CANONICAL[s] || s;
    wanted.add(canon);
    for (const [legacy, target] of Object.entries(LEGACY_TO_CANONICAL)) {
      if (target === canon) wanted.add(legacy);
    }
  }

  return Array.from(wanted);
}

export function legacyNameFor(slotId: string): string {
  const map: Record<string, string> = {
    header_leaderboard: "header",
    footer_banner: "footer",
    home_hero: "homepage_hero",
    jobs_sidebar: "job_sidebar",
    market_list_top: "market_list_top",
  };
  return map[slotId] || slotId;
}

export { BOOKABLE_SLOT_IDS };
