import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Returns the highest-bid active premium ad for a slot.
 * Accepts comma-separated slot ids: ?slot=header_leaderboard,header
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("slot");
  if (!raw) return NextResponse.json({ ad: null });

  const slotIds = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!slotIds.length) return NextResponse.json({ ad: null });

  const now = new Date().toISOString();
  const supabase = createAdminClient();

  // Primary: active + not expired
  let { data, error } = await supabase
    .from("premium_ads")
    .select(
      "id, title, target_url, image_url, offered_price_sar, ends_at, slot_id, status"
    )
    .in("slot_id", slotIds)
    .eq("status", "active")
    .gt("ends_at", now)
    .order("offered_price_sar", { ascending: false })
    .limit(1);

  if (error) {
    // Fallback without ends_at filter (older rows)
    const fallback = await supabase
      .from("premium_ads")
      .select(
        "id, title, target_url, image_url, offered_price_sar, ends_at, slot_id, status"
      )
      .in("slot_id", slotIds)
      .eq("status", "active")
      .order("offered_price_sar", { ascending: false })
      .limit(1);
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error("[premium-ads/live]", error.message);
    return NextResponse.json({ ad: null });
  }

  const ad = data?.[0] || null;

  // If ends_at missing on row, still show when status is active
  if (!ad) {
    const { data: anyActive } = await supabase
      .from("premium_ads")
      .select(
        "id, title, target_url, image_url, offered_price_sar, ends_at, slot_id, status"
      )
      .in("slot_id", slotIds)
      .eq("status", "active")
      .order("offered_price_sar", { ascending: false })
      .limit(1);
    const row = anyActive?.[0];
    if (row) {
      if (!row.ends_at || new Date(row.ends_at) > new Date()) {
        return NextResponse.json({ ad: row });
      }
    }
    return NextResponse.json({ ad: null });
  }

  return NextResponse.json({ ad });
}
