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
      .order("sort_order", { ascending: true });
    const visible = (slots || []).filter(
      (s: { id: string }) => s.id !== "job_promote" && s.id !== "listing_promote"
    );
    return NextResponse.json({ slots: visible });
  }

  const { data, error } = await supabase
    .from("premium_ads")
    .select("*, slot:premium_ad_slots(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ads: data || [] });
}

/** POST — create campaign (banner or ranking promote) */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  let {
    slot_id,
    ad_kind,
    linked_job_id,
    linked_listing_id,
    title,
    target_url,
    image_url,
    design_notes,
    offered_price_sar,
    duration_days = 14,
    submit_for_payment = true,
  } = body;

  if (!ad_kind || !["job", "market", "standalone"].includes(ad_kind)) {
    return NextResponse.json({ error: "Invalid ad_kind" }, { status: 400 });
  }

  const isPromote = ad_kind === "job" || ad_kind === "market";
  const days = Math.min(90, Math.max(1, Number(duration_days) || 14));

  // Promote ranking packages
  const PROMOTE_PKG: Record<number, number> = { 7: 19, 14: 32, 30: 55, 60: 95 };
  const DURATION_MULT: Record<number, number> = { 7: 1, 14: 1.75, 30: 3.2, 60: 5.5 };

  if (isPromote) {
    if (ad_kind === "job" && !linked_job_id) {
      return NextResponse.json({ error: "Select a job to promote" }, { status: 400 });
    }
    if (ad_kind === "market" && !linked_listing_id) {
      return NextResponse.json({ error: "Select a listing to promote" }, { status: 400 });
    }
    slot_id = ad_kind === "job" ? "job_promote" : "listing_promote";
    if (!title) title = ad_kind === "job" ? "Job promotion" : "Listing promotion";
    if (!target_url) {
      target_url =
        ad_kind === "job"
          ? `https://hunared.com/jobs/${linked_job_id}`
          : `https://hunared.com/market/${linked_listing_id}`;
    }
    const pkg = PROMOTE_PKG[days] ?? Math.round(19 * (days / 7));
    // Allow higher bid to outrank others
    const bid = Number(offered_price_sar);
    offered_price_sar = Number.isFinite(bid) && bid > pkg ? bid : pkg;
    image_url = image_url || null;
  } else {
    if (!slot_id || !title || !target_url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
  }

  const supabase = createAdminClient();
  const { data: slot } = await supabase
    .from("premium_ad_slots")
    .select("*")
    .eq("id", slot_id)
    .eq("is_active", true)
    .maybeSingle();

  if (!slot) return NextResponse.json({ error: "Invalid slot" }, { status: 400 });

  let price = Number(offered_price_sar);

  if (!isPromote) {
    const base = Number(slot.base_price_sar) || 0;
    const mult = DURATION_MULT[days] ?? days / 7;
    const packageMin = Math.max(1, Math.round(base * mult));

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
        ? currentTop + Number(slot.min_bid_increment_sar || 1)
        : packageMin;

    if (!Number.isFinite(price) || price < minPrice) {
      return NextResponse.json(
        { error: `Minimum price for this slot is ${minPrice} ${slot.currency || "USD"}` },
        { status: 400 }
      );
    }
  } else if (!Number.isFinite(price) || price < 1) {
    price = PROMOTE_PKG[days] ?? 19;
  }

  const starts = new Date();
  const ends = new Date(starts.getTime() + days * 86400000);
  const status = submit_for_payment ? "pending_payment" : "draft";

  const { data: ad, error } = await supabase
    .from("premium_ads")
    .insert({
      user_id: userId,
      slot_id,
      ad_kind,
      linked_job_id: linked_job_id || null,
      linked_listing_id: linked_listing_id || null,
      title: String(title).trim(),
      target_url: String(target_url).trim(),
      image_url: image_url || null,
      design_notes: design_notes || null,
      offered_price_sar: price,
      currency: slot.currency || "USD",
      duration_days: days,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      status,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ad, minPrice: price, promote: isPromote });
}
