import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ad: data });
  }

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
      .select("*")
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
    .in("status", ["draft", "pending_payment", "rejected"]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
