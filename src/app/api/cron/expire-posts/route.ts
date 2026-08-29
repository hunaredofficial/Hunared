import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Close expired jobs and marketplace listings.
 * Schedule via external cron:
 *   POST /api/cron/expire-posts
 *   Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token || token !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: expiredJobs, error: jobsErr } = await supabase
    .from("jobs")
    .update({
      status: "closed",
      closed_at: now,
      close_reason: "expired",
    })
    .eq("status", "approved")
    .is("closed_at", null)
    .not("expires_at", "is", null)
    .lte("expires_at", now)
    .select("id");

  if (jobsErr) {
    console.error("[expire-posts] jobs:", jobsErr.message);
  }

  const { data: expiredListings, error: listErr } = await supabase
    .from("marketplace_listings")
    .update({
      closed_at: now,
      close_reason: "expired",
    })
    .eq("status", "approved")
    .is("closed_at", null)
    .not("expires_at", "is", null)
    .lte("expires_at", now)
    .select("id");

  if (listErr) {
    console.error("[expire-posts] listings:", listErr.message);
  }

  return NextResponse.json({
    ok: true,
    jobsClosed: expiredJobs?.length ?? 0,
    listingsClosed: expiredListings?.length ?? 0,
  });
}
