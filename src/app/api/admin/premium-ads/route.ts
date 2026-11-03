import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function requireAdmin(userId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "admin" || data?.role === "team";
}

export async function GET() {
  const { userId } = await auth();
  if (!userId || !(await requireAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("premium_ads")
    .select("*, slot:premium_ad_slots(*)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message, ads: [] }, { status: 500 });
  return NextResponse.json({ ads: data || [] });
}

/**
 * Admin actions:
 * approve | reject | delete | expire | renew | schedule
 */
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !(await requireAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const {
    id,
    action,
    admin_note,
    renew_days,
    starts_at,
    ends_at,
  } = body as {
    id?: string;
    action?: string;
    admin_note?: string;
    renew_days?: number;
    starts_at?: string;
    ends_at?: string;
  };

  const allowed = ["approve", "reject", "delete", "expire", "renew", "schedule"];
  if (!id || !action || !allowed.includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: ad } = await supabase.from("premium_ads").select("*").eq("id", id).maybeSingle();
  if (!ad) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "delete") {
    const { error } = await supabase.from("premium_ads").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "reject") {
    const { data, error } = await supabase
      .from("premium_ads")
      .update({
        status: "rejected",
        admin_note: admin_note || null,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ad: data });
  }

  if (action === "expire") {
    const { data, error } = await supabase
      .from("premium_ads")
      .update({
        status: "expired",
        ends_at: new Date().toISOString(),
        admin_note: admin_note || ad.admin_note,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ad: data });
  }

  if (action === "renew") {
    const days = Math.min(90, Math.max(1, Number(renew_days) || ad.duration_days || 7));
    const base = ad.ends_at && new Date(ad.ends_at) > new Date() ? new Date(ad.ends_at) : new Date();
    const ends = new Date(base);
    ends.setDate(ends.getDate() + days);
    const starts =
      ad.starts_at && new Date(ad.starts_at) < new Date()
        ? ad.starts_at
        : new Date().toISOString();

    const { data, error } = await supabase
      .from("premium_ads")
      .update({
        status: "active",
        duration_days: days,
        starts_at: starts,
        ends_at: ends.toISOString(),
        admin_note: admin_note || ad.admin_note,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ad: data });
  }

  if (action === "schedule") {
    if (!starts_at || !ends_at) {
      return NextResponse.json({ error: "starts_at and ends_at required" }, { status: 400 });
    }
    const start = new Date(starts_at);
    const end = new Date(ends_at);
    if (!(start < end)) {
      return NextResponse.json({ error: "ends_at must be after starts_at" }, { status: 400 });
    }
    const now = new Date();
    const status = start > now ? "scheduled" : "active";
    const { data, error } = await supabase
      .from("premium_ads")
      .update({
        status,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        duration_days: Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000)),
        admin_note: admin_note || ad.admin_note,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ad: data });
  }

  // approve
  const starts = new Date();
  const ends = new Date();
  ends.setDate(ends.getDate() + (ad.duration_days || 7));

  await supabase
    .from("premium_ads")
    .update({ status: "outbid", updated_at: new Date().toISOString() })
    .eq("slot_id", ad.slot_id)
    .eq("status", "active")
    .neq("id", id);

  const { data, error } = await supabase
    .from("premium_ads")
    .update({
      status: "active",
      admin_note: admin_note || null,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (ad.slot_id === "header_leaderboard" || String(ad.slot_id).startsWith("header_")) {
    try {
      await supabase.from("ad_placements").upsert(
        {
          slot_name: ad.slot_id === "header_leaderboard" ? "header" : ad.slot_id,
          is_active: true,
          ad_type: "custom",
          custom_image_url: ad.image_url,
          custom_redirect_url: ad.target_url,
        },
        { onConflict: "slot_name" }
      );
    } catch {
      /* legacy table optional */
    }
  }

  return NextResponse.json({ ad: data });
}
