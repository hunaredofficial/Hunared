import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slot = req.nextUrl.searchParams.get("slot");
  if (!slot) return NextResponse.json({ ad: null });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("premium_ads")
    .select("id, title, target_url, image_url, offered_price_sar, ends_at, slot_id")
    .eq("slot_id", slot)
    .eq("status", "active")
    .gt("ends_at", new Date().toISOString())
    .order("offered_price_sar", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ ad: data || null });
}
