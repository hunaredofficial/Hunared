import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { expandSlotIds } from "@/lib/premium-ads/slotAliases";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("slot");
  if (!raw) return NextResponse.json({ ad: null });
  const requested = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (!requested.length) return NextResponse.json({ ad: null });
  const slotIds = expandSlotIds(requested[0], requested.slice(1));
  const now = new Date();
  const nowIso = now.toISOString();
  const supabase = createAdminClient();

  // Prefer exact requested order: primary slot first, then alternates
  const { data, error } = await supabase
    .from("premium_ads")
    .select(
      "id, title, target_url, image_url, offered_price_sar, ends_at, starts_at, slot_id, status"
    )
    .in("slot_id", slotIds)
    .in("status", ["active", "scheduled"])
    .not("image_url", "is", null)
    .neq("image_url", "")
    .order("offered_price_sar", { ascending: false })
    .limit(24);

  if (error) {
    return NextResponse.json({ ad: null, error: error.message });
  }

  const candidates = (data || []).filter((a) => {
    if (!a.image_url) return false;
    if (a.ends_at && new Date(a.ends_at) <= now) return false;
    if (a.starts_at && new Date(a.starts_at) > now) return false;
    // scheduled only if window has started
    if (a.status === "scheduled" && a.starts_at && new Date(a.starts_at) > now) {
      return false;
    }
    return a.status === "active" || a.status === "scheduled";
  });

  // Prefer ads on the primary slot id, then highest bid
  const primary = requested[0];
  const primaryHits = candidates.filter((a) => a.slot_id === primary);
  const pool = primaryHits.length ? primaryHits : candidates;
  const row = pool[0] || null;

  return NextResponse.json({ ad: row });
}
