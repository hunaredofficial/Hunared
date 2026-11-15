import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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

  // Prefer highest bid active ad with an image creative
  const { data: withImage } = await supabase
    .from("premium_ads")
    .select(
      "id, title, target_url, image_url, offered_price_sar, ends_at, slot_id, status"
    )
    .in("slot_id", slotIds)
    .eq("status", "active")
    .gt("ends_at", now)
    .not("image_url", "is", null)
    .order("offered_price_sar", { ascending: false })
    .limit(1);

  if (withImage?.[0]?.image_url) {
    return NextResponse.json({ ad: withImage[0] });
  }

  // Fallback: any active (even without ends_at strict)
  const { data: anyActive } = await supabase
    .from("premium_ads")
    .select(
      "id, title, target_url, image_url, offered_price_sar, ends_at, slot_id, status"
    )
    .in("slot_id", slotIds)
    .eq("status", "active")
    .not("image_url", "is", null)
    .order("offered_price_sar", { ascending: false })
    .limit(1);

  const row = anyActive?.[0];
  if (row?.image_url) {
    if (!row.ends_at || new Date(row.ends_at) > new Date()) {
      return NextResponse.json({ ad: row });
    }
  }

  return NextResponse.json({ ad: null });
}
