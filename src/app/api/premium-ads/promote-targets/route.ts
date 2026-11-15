import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const OK_STATUS = new Set([
  "approved",
  "active",
  "published",
  "open",
  "pending",
  "live",
]);

/**
 * Jobs: table jobs, column job_title, owner employer_id
 * Listings: table marketplace_listings, column title, owner seller_id
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const kind = req.nextUrl.searchParams.get("kind") || "job";
  const supabase = createAdminClient();

  if (kind === "market") {
    const { data, error } = await supabase
      .from("marketplace_listings")
      .select("id, title, status, category, city, country, created_at")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false })
      .limit(150);

    if (error) {
      return NextResponse.json({ error: error.message, items: [] }, { status: 500 });
    }

    const rows = (data || []).map((r) => ({
      id: r.id,
      title: r.title || "Untitled listing",
      status: r.status,
      city: r.city,
      country: r.country,
      category: r.category,
      created_at: r.created_at,
    }));
    return NextResponse.json({ items: filterOk(rows) });
  }

  // Jobs
  const { data, error } = await supabase
    .from("jobs")
    .select("id, job_title, status, category, city, country, created_at")
    .eq("employer_id", userId)
    .order("created_at", { ascending: false })
    .limit(150);

  if (error) {
    return NextResponse.json({ error: error.message, items: [] }, { status: 500 });
  }

  const rows = (data || []).map((r) => ({
    id: r.id,
    title: r.job_title || "Untitled job",
    status: r.status,
    city: r.city,
    country: r.country,
    category: r.category,
    created_at: r.created_at,
  }));
  return NextResponse.json({ items: filterOk(rows) });
}

function filterOk(
  rows: {
    id: string;
    title: string;
    status?: string | null;
    city?: string | null;
    country?: string | null;
    category?: string | null;
    created_at?: string;
  }[]
) {
  const open = rows.filter((r) => {
    if (!r.status) return true;
    return OK_STATUS.has(String(r.status).toLowerCase());
  });
  return open.length ? open : rows;
}
