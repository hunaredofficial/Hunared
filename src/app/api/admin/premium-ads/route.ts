import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { clearPremiumPlacementMirror } from "@/lib/premium-ads/clearPlacementMirror";

export const dynamic = "force-dynamic";

async function requireAdmin(userId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return data?.role === "admin" || data?.role === "team";
}

const ACTION_ALIASES: Record<string, string> = {
  approve: "approve",
  reject: "reject",
  delete: "delete",
  expire: "expire",
  end: "expire",
  end_now: "expire",
  stop: "expire",
  restore: "restore",
  reactivate: "restore",
  renew: "renew",
  schedule: "schedule",
};

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

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !(await requireAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const id = String(body.id || body.ad_id || body.campaign_id || "").trim();
  const rawAction = String(body.action || body.op || "").trim().toLowerCase();
  const action = ACTION_ALIASES[rawAction] || rawAction;
  const admin_note =
    typeof body.admin_note === "string" ? body.admin_note : undefined;
  const renew_days = body.renew_days != null ? Number(body.renew_days) : undefined;
  const starts_at = typeof body.starts_at === "string" ? body.starts_at : undefined;
  const ends_at = typeof body.ends_at === "string" ? body.ends_at : undefined;

  if (!id) {
    return NextResponse.json({ error: "Missing campaign id" }, { status: 400 });
  }
  if (!action || !ACTION_ALIASES[action] && !["approve","reject","delete","expire","renew","schedule"].includes(action)) {
    return NextResponse.json(
      { error: `Invalid action "${rawAction}". Use approve, reject, delete, expire, renew, or schedule.` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data: ad, error: findErr } = await supabase
    .from("premium_ads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });
  if (!ad) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  if (action === "delete") {
    await clearPremiumPlacementMirror(supabase, ad.slot_id, ad.image_url);
    const { error } = await supabase.from("premium_ads").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "reject") {
    const { data, error } = await supabase
      .from("premium_ads")
      .update({
        status: "rejected",
        admin_note: admin_note || ad.admin_note || null,
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
        admin_note: admin_note || ad.admin_note || null,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await clearPremiumPlacementMirror(supabase, ad.slot_id, ad.image_url);
    return NextResponse.json({ ad: data });
  }

  if (action === "renew") {
    const days = Math.min(90, Math.max(1, Number(renew_days) || ad.duration_days || 7));
    const base =
      ad.ends_at && new Date(ad.ends_at) > new Date()
        ? new Date(ad.ends_at)
        : new Date();
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
        admin_note: admin_note || ad.admin_note || null,
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
      return NextResponse.json(
        { error: "starts_at and ends_at required for schedule" },
        { status: 400 }
      );
    }
    const start = new Date(starts_at);
    const end = new Date(ends_at);
    if (!(start < end)) {
      return NextResponse.json({ error: "ends_at must be after starts_at" }, { status: 400 });
    }
    const status = start > new Date() ? "scheduled" : "active";
    const { data, error } = await supabase
      .from("premium_ads")
      .update({
        status,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        duration_days: Math.max(
          1,
          Math.ceil((end.getTime() - start.getTime()) / 86400000)
        ),
        admin_note: admin_note || ad.admin_note || null,
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


  if (action === "restore") {
    // Put pending_removal / rejected / expired back to active for remaining duration
    const starts = new Date();
    const ends = new Date();
    ends.setDate(ends.getDate() + (ad.duration_days || 7));
    const { data, error } = await supabase
      .from("premium_ads")
      .update({
        status: "active",
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        admin_note: admin_note || ad.admin_note || "Restored by admin",
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

  // Ranking promote slots (job_promote / listing_promote) allow MULTIPLE active
  // campaigns at once — ordered by bid in getPromotedJobIds / getPromotedListingIds.
  // Only exclusive banner slots should knock out the previous winner.
  const isRankingPromote =
    ad.slot_id === "job_promote" ||
    ad.slot_id === "listing_promote" ||
    ad.ad_kind === "job" ||
    ad.ad_kind === "market";

  if (!isRankingPromote) {
    await supabase
      .from("premium_ads")
      .update({ status: "outbid", updated_at: new Date().toISOString() })
      .eq("slot_id", ad.slot_id)
      .eq("status", "active")
      .neq("id", id);
  }

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

  // Mirror creative into ad_placements for public AdSlot fallbacks
  const legacyMap: Record<string, string> = {
    header_leaderboard: "header",
    header_mobile: "header",
    header: "header",
    footer_banner: "footer",
    footer: "footer",
    home_hero: "homepage_hero",
    homepage_hero: "homepage_hero",
  };
  const legacyName = legacyMap[ad.slot_id] || ad.slot_id;
  if (ad.image_url) {
    try {
      await supabase.from("ad_placements").upsert(
        {
          slot_name: legacyName,
          is_active: true,
          ad_type: "custom",
          custom_image_url: ad.image_url,
          custom_redirect_url: ad.target_url || "",
          adsense_slot_id: "",
        },
        { onConflict: "slot_name" }
      );
    } catch {
      /* optional */
    }
  }

  return NextResponse.json({ ad: data });
}
