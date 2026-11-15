import type { SupabaseClient } from "@supabase/supabase-js";

/** Active premium campaigns that boost a job or listing to the top of directories */
export async function getPromotedJobIds(
  supabase: SupabaseClient
): Promise<Set<string>> {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("premium_ads")
    .select("linked_job_id")
    .eq("status", "active")
    .eq("ad_kind", "job")
    .not("linked_job_id", "is", null)
    .gt("ends_at", now);
  return new Set(
    (data || [])
      .map((r: { linked_job_id: string | null }) => r.linked_job_id)
      .filter(Boolean) as string[]
  );
}

export async function getPromotedListingIds(
  supabase: SupabaseClient
): Promise<Set<string>> {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("premium_ads")
    .select("linked_listing_id")
    .eq("status", "active")
    .eq("ad_kind", "market")
    .not("linked_listing_id", "is", null)
    .gt("ends_at", now);
  return new Set(
    (data || [])
      .map((r: { linked_listing_id: string | null }) => r.linked_listing_id)
      .filter(Boolean) as string[]
  );
}

/** Stable sort: promoted ids first, then keep relative order of the rest */
export function promoteToFront<T extends { id: string }>(
  items: T[],
  promoted: Set<string>
): T[] {
  if (!promoted.size) return items;
  const top: T[] = [];
  const rest: T[] = [];
  for (const item of items) {
    if (promoted.has(item.id)) top.push(item);
    else rest.push(item);
  }
  return [...top, ...rest];
}
