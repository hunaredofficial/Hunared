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
  const now = new Date().toISOString();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("premium_ads")
    .select("id, title, target_url, image_url, offered_price_sar, ends_at, slot_id, status")
    .in("slot_id", slotIds)
    .eq("status", "active")
    .not("image_url", "is", null)
    .neq("image_url", "")
    .order("offered_price_sar", { ascending: false })
    .limit(8);

  const row = (data || []).find(
    (a) => a.image_url && (!a.ends_at || new Date(a.ends_at) > new Date(now))
  );
  return NextResponse.json({ ad: row || null });
}
