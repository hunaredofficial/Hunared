import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Active job promotions ordered by:
 * 1) higher bid first
 * 2) same bid → newer campaign first
 * Multiple promotions from any users all appear (no single-winner).
 */
export async function getPromotedJobIds(
  supabase: SupabaseClient
): Promise<string[]> {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("premium_ads")
    .select("linked_job_id, offered_price_sar, created_at")
    .eq("status", "active")
    .eq("ad_kind", "job")
    .not("linked_job_id", "is", null)
    .gt("ends_at", now)
    .order("offered_price_sar", { ascending: false })
    .order("created_at", { ascending: false });

  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const r of data || []) {
    const id = r.linked_job_id as string | null;
    if (id && !seen.has(id)) {
      seen.add(id);
      ordered.push(id);
    }
  }
  return ordered;
}

export async function getPromotedListingIds(
  supabase: SupabaseClient
): Promise<string[]> {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("premium_ads")
    .select("linked_listing_id, offered_price_sar, created_at")
    .eq("status", "active")
    .eq("ad_kind", "market")
    .not("linked_listing_id", "is", null)
    .gt("ends_at", now)
    .order("offered_price_sar", { ascending: false })
    .order("created_at", { ascending: false });

  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const r of data || []) {
    const id = r.linked_listing_id as string | null;
    if (id && !seen.has(id)) {
      seen.add(id);
      ordered.push(id);
    }
  }
  return ordered;
}

/**
 * Place promoted items first in the given bid/recency order,
 * then the remaining items in their existing order.
 */
export function promoteToFront<T extends { id: string }>(
  items: T[],
  promotedOrdered: string[] | Set<string>
): T[] {
  const order = Array.isArray(promotedOrdered)
    ? promotedOrdered
    : Array.from(promotedOrdered);
  if (!order.length) return items;

  const map = new Map(items.map((i) => [i.id, i]));
  const top: T[] = [];
  const used = new Set<string>();
  for (const id of order) {
    const item = map.get(id);
    if (item) {
      top.push(item);
      used.add(id);
    }
  }
  const rest = items.filter((i) => !used.has(i.id));
  return [...top, ...rest];
}

/** Set helper for badge checks */
export function promotedSet(ids: string[]): Set<string> {
  return new Set(ids);
}
