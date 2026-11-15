import type { SupabaseClient } from "@supabase/supabase-js";

/** Map premium slot_id → admin ad_placements.slot_name used as fallback */
export const PREMIUM_TO_LEGACY_SLOT: Record<string, string> = {
  header_leaderboard: "header",
  header_mobile: "header",
  header: "header",
  footer_banner: "footer",
  footer: "footer",
  home_hero: "homepage_hero",
  homepage_hero: "homepage_hero",
  jobs_sidebar: "job_sidebar",
  job_sidebar: "job_sidebar",
  jobs_list_top: "jobs_list_top",
  market_list_top: "market_list_top",
  market_sidebar: "market_sidebar",
  candidates_top: "candidates_top",
  companies_top: "companies_top",
  learning_top: "learning_top",
};

/**
 * After a premium campaign ends or is deleted, remove the mirrored custom banner
 * from ad_placements so AdSlot does not keep showing it.
 */
export async function clearPremiumPlacementMirror(
  supabase: SupabaseClient,
  slotId: string | null | undefined,
  imageUrl?: string | null
) {
  if (!slotId) return;
  const legacy = PREMIUM_TO_LEGACY_SLOT[slotId] || slotId;
  const names = Array.from(new Set([slotId, legacy]));

  for (const slot_name of names) {
    try {
      const { data: row } = await supabase
        .from("ad_placements")
        .select("id, custom_image_url, ad_type")
        .eq("slot_name", slot_name)
        .maybeSingle();

      if (!row) continue;
      // Only clear custom banners that look like our mirror (custom + same image, or any custom if image matches)
      const sameImage =
        !imageUrl ||
        !row.custom_image_url ||
        row.custom_image_url === imageUrl;

      if (row.ad_type === "custom" && sameImage) {
        await supabase
          .from("ad_placements")
          .update({
            is_active: false,
            custom_image_url: null,
            custom_redirect_url: null,
          })
          .eq("slot_name", slot_name);
      }
    } catch {
      /* non-fatal */
    }
  }
}
