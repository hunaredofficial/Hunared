import type { SupabaseClient } from "@supabase/supabase-js";

/** Active job promotions ordered by bid (highest first) */
export async function getPromotedJobIds(
  supabase: SupabaseClient
): Promise<string[]> {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("premium_ads")
    .select("linked_job_id, offered_price_sar")
    .eq("status", "active")
    .eq("ad_kind", "job")
    .not("linked_job_id", "is", null)
    .gt("ends_at", now)
    .order("offered_price_sar", { ascending: false });

  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const r of data || []) {
    const id = r.linked_job_id as string;
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
    .select("linked_listing_id, offered_price_sar")
    .eq("status", "active")
    .eq("ad_kind", "market")
    .not("linked_listing_id", "is", null)
    .gt("ends_at", now)
    .order("offered_price_sar", { ascending: false });

  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const r of data || []) {
    const id = r.linked_listing_id as string;
    if (id && !seen.has(id)) {
      seen.add(id);
      ordered.push(id);
    }
  }
  return ordered;
}

/** Place promoted ids first in given order, then the rest */
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
