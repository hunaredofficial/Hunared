import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slot = req.nextUrl.searchParams.get("slot");
  if (!slot) return NextResponse.json({ ad: null });

  const now = new Date().toISOString();
  const supabase = createAdminClient();

  // Prefer active; also allow scheduled that already started
  const { data: active } = await supabase
    .from("premium_ads")
    .select("id, title, target_url, image_url, offered_price_sar, ends_at, slot_id, status, starts_at")
    .eq("slot_id", slot)
    .in("status", ["active", "scheduled"])
    .lte("starts_at", now)
    .gt("ends_at", now)
    .order("offered_price_sar", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ ad: active || null });
}
