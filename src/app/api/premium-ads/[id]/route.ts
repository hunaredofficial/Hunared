import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const EDITABLE = new Set([
  "draft",
  "pending_payment",
  "pending_approval",
  "rejected",
  "outbid",
]);

/** GET one ad (owner only) */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const supabase = createAdminClient();
  const { data: ad, error } = await supabase
    .from("premium_ads")
    .select("*, slot:premium_ad_slots(*)")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!ad) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ad });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const supabase = createAdminClient();

  const { data: ad } = await supabase
    .from("premium_ads")
    .select("*, slot:premium_ad_slots(*)")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!ad) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Submit payment reference
  if (body.action === "submit_payment") {
    if (ad.status !== "pending_payment" && ad.status !== "draft") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("premium_ads")
      .update({
        status: "pending_approval",
        payment_note: body.payment_note || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*, slot:premium_ad_slots(*)")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ad: data });
  }

  // Raise bid
  if (body.action === "raise_bid") {
    const amount = Number(body.amount_sar);
    const slot = ad.slot as { min_bid_increment_sar?: number } | null;
    const { data: active } = await supabase
      .from("premium_ads")
      .select("offered_price_sar")
      .eq("slot_id", ad.slot_id)
      .eq("status", "active")
      .gt("ends_at", new Date().toISOString())
      .order("offered_price_sar", { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentTop = active
      ? Number(active.offered_price_sar)
      : Number(ad.offered_price_sar);
    const min = currentTop + Number(slot?.min_bid_increment_sar || 25);
    if (!Number.isFinite(amount) || amount < min) {
      return NextResponse.json({ error: `Bid must be at least ${min}` }, { status: 400 });
    }

    await supabase.from("premium_ad_bids").insert({
      ad_id: id,
      user_id: userId,
      slot_id: ad.slot_id,
      amount_sar: amount,
      note: body.note || "Bid raise",
    });

    const { data, error } = await supabase
      .from("premium_ads")
      .update({
        offered_price_sar: amount,
        status: "pending_payment",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*, slot:premium_ad_slots(*)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ad: data });
  }

  // Full edit of creative / offer
  if (body.action === "update" || !body.action) {
    if (!EDITABLE.has(ad.status) && ad.status !== "active") {
      return NextResponse.json(
        { error: "This ad cannot be edited in its current status" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.title === "string" && body.title.trim()) {
      updates.title = body.title.trim().slice(0, 120);
    }
    if (typeof body.target_url === "string" && body.target_url.trim()) {
      updates.target_url = body.target_url.trim().slice(0, 500);
    }
    if (body.image_url !== undefined) {
      updates.image_url = body.image_url ? String(body.image_url).slice(0, 800) : null;
    }
    if (body.design_notes !== undefined) {
      updates.design_notes = body.design_notes ? String(body.design_notes).slice(0, 2000) : null;
    }
    if (body.duration_days !== undefined) {
      const d = Math.min(90, Math.max(1, Number(body.duration_days) || 7));
      updates.duration_days = d;
    }
    if (body.ad_kind && ["job", "market", "standalone"].includes(body.ad_kind)) {
      updates.ad_kind = body.ad_kind;
    }
    if (body.slot_id && typeof body.slot_id === "string") {
      const { data: slot } = await supabase
        .from("premium_ad_slots")
        .select("id")
        .eq("id", body.slot_id)
        .eq("is_active", true)
        .maybeSingle();
      if (slot) updates.slot_id = body.slot_id;
    }

    // Price change only when not active (or forces re-payment)
    if (body.offered_price_sar !== undefined && ad.status !== "active") {
      const price = Number(body.offered_price_sar);
      if (Number.isFinite(price) && price > 0) {
        updates.offered_price_sar = price;
        await supabase.from("premium_ad_bids").insert({
          ad_id: id,
          user_id: userId,
          slot_id: ad.slot_id,
          amount_sar: price,
          note: "Updated offer",
        });
      }
    }

    // Active creative edit → back to pending_approval for review
    if (ad.status === "active") {
      updates.status = "pending_approval";
      updates.admin_note = "Creative updated by advertiser — re-approval required";
    } else if (ad.status === "rejected" && body.resubmit) {
      updates.status = "pending_payment";
    }

    const { data, error } = await supabase
      .from("premium_ads")
      .update(updates)
      .eq("id", id)
      .select("*, slot:premium_ad_slots(*)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ad: data });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("premium_ads")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .in("status", ["draft", "pending_payment", "rejected", "outbid", "pending_approval"]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
