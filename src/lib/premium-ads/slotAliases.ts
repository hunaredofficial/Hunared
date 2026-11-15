import { LEGACY_TO_CANONICAL } from "@/lib/ads/slots";

export function expandSlotIds(slotId: string, extra: string[] = []): string[] {
  const seeds = [slotId, ...extra].filter(Boolean);
  const wanted = new Set<string>(seeds);
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
  };
  return map[slotId] || slotId;
}
