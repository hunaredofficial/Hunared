import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function requireAdmin(userId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "admin" || data?.role === "team";
}

/** Admin/team: list pending + all premium ads */
export async function GET() {
  const { userId } = await auth();
  if (!userId || !(await requireAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("premium_ads")
    .select("*, slot:premium_ad_slots(*), profile:profiles!premium_ads_user_id_fkey(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    // fallback without profile join
    const { data: ads } = await supabase
      .from("premium_ads")
      .select("*, slot:premium_ad_slots(*)")
      .order("created_at", { ascending: false })
      .limit(100);
    return NextResponse.json({ ads: ads || [] });
  }
  return NextResponse.json({ ads: data || [] });
}

/** Approve / reject */
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !(await requireAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const { id, action, admin_note } = body;
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: ad } = await supabase.from("premium_ads").select("*").eq("id", id).maybeSingle();
  if (!ad) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  // Approve: activate this ad; mark lower active same slot as outbid
  const starts = new Date();
  const ends = new Date();
  ends.setDate(ends.getDate() + (ad.duration_days || 7));

  await supabase
    .from("premium_ads")
    .update({
      status: "outbid",
      updated_at: new Date().toISOString(),
    })
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

  // Optionally sync into legacy ad_placements for header slot display
  if (ad.slot_id === "header_leaderboard" || ad.slot_id.startsWith("header_")) {
    await supabase.from("ad_placements").upsert(
      {
        slot_name: ad.slot_id === "header_leaderboard" ? "header" : ad.slot_id,
        is_active: true,
        ad_type: "custom",
        custom_image_url: ad.image_url,
        custom_redirect_url: ad.target_url,
      },
      { onConflict: "slot_name" }
    ).then(() => {}).catch(() => {});
  }

  return NextResponse.json({ ad: data });
}
