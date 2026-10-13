import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** GET — list my ads + slot catalog */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const catalog = req.nextUrl.searchParams.get("catalog") === "1";

  if (catalog) {
    const { data: slots } = await supabase
      .from("premium_ad_slots")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    // Current winning bid / active ad per slot
    const { data: active } = await supabase
      .from("premium_ads")
      .select("id, slot_id, offered_price_sar, ends_at, title, status")
      .eq("status", "active")
      .gt("ends_at", new Date().toISOString());

    const topBySlot: Record<string, { price: number; ends_at: string | null }> = {};
    for (const a of active || []) {
      const p = Number(a.offered_price_sar);
      if (!topBySlot[a.slot_id] || p > topBySlot[a.slot_id].price) {
        topBySlot[a.slot_id] = { price: p, ends_at: a.ends_at };
      }
    }

    return NextResponse.json({ slots: slots || [], topBySlot });
  }

  const { data, error } = await supabase
    .from("premium_ads")
    .select("*, slot:premium_ad_slots(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ads: data || [] });
}

/** POST — create campaign (draft → pending_payment) */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const {
    slot_id,
    ad_kind,
    linked_job_id,
    linked_listing_id,
    title,
    target_url,
    image_url,
    design_notes,
    offered_price_sar,
    duration_days = 7,
    submit_for_payment = true,
  } = body;

  if (!slot_id || !ad_kind || !title || !target_url) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!["job", "market", "standalone"].includes(ad_kind)) {
    return NextResponse.json({ error: "Invalid ad_kind" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: slot } = await supabase
    .from("premium_ad_slots")
    .select("*")
    .eq("id", slot_id)
    .eq("is_active", true)
    .maybeSingle();

  if (!slot) return NextResponse.json({ error: "Invalid slot" }, { status: 400 });

  // Min price = base or current active + increment
  const { data: active } = await supabase
    .from("premium_ads")
    .select("offered_price_sar")
    .eq("slot_id", slot_id)
    .eq("status", "active")
    .gt("ends_at", new Date().toISOString())
    .order("offered_price_sar", { ascending: false })
    .limit(1)
    .maybeSingle();

  const currentTop = active ? Number(active.offered_price_sar) : 0;
  const minPrice =
    currentTop > 0
      ? currentTop + Number(slot.min_bid_increment_sar)
      : Number(slot.base_price_sar);

  const price = Number(offered_price_sar);
  if (!Number.isFinite(price) || price < minPrice) {
    return NextResponse.json(
      { error: `Minimum price for this slot is ${minPrice} ${slot.currency}` },
      { status: 400 }
    );
  }

  const days = Math.min(90, Math.max(1, Number(duration_days) || 7));
  const status = submit_for_payment ? "pending_payment" : "draft";

  const { data: ad, error } = await supabase
    .from("premium_ads")
    .insert({
      user_id: userId,
      slot_id,
      ad_kind,
      linked_job_id: linked_job_id || null,
      linked_listing_id: linked_listing_id || null,
      title: String(title).slice(0, 120),
      target_url: String(target_url).slice(0, 500),
      image_url: image_url || null,
      design_notes: design_notes || null,
      offered_price_sar: price,
      currency: slot.currency,
      duration_days: days,
      status,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("premium_ad_bids").insert({
    ad_id: ad.id,
    user_id: userId,
    slot_id,
    amount_sar: price,
    note: "Initial offer",
  });

  return NextResponse.json({ ad, minPrice });
}
