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
 * Jobs column is job_title (not title). Ownership: employer_id.
 * Listings: title, seller_id.
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const kind = req.nextUrl.searchParams.get("kind") || "job";
  const supabase = createAdminClient();

  if (kind === "market") {
    let { data, error } = await supabase
      .from("listings")
      .select("id, title, status, category, city, country, created_at")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false })
      .limit(150);

    if (error) {
      const alt = await supabase
        .from("listings")
        .select("id, title, status, category, city, country, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(150);
      data = alt.data;
      error = alt.error;
    }
    if (error) return NextResponse.json({ error: error.message, items: [] }, { status: 500 });

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

  // Jobs — job_title column
  let { data, error } = await supabase
    .from("jobs")
    .select("id, job_title, status, category, city, country, created_at")
    .eq("employer_id", userId)
    .order("created_at", { ascending: false })
    .limit(150);

  if (error) {
    // try without status/category if schema differs
    const alt = await supabase
      .from("jobs")
      .select("id, job_title, status, city, country, created_at")
      .eq("employer_id", userId)
      .order("created_at", { ascending: false })
      .limit(150);
    data = alt.data as typeof data;
    error = alt.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message, items: [] }, { status: 500 });
  }

  const rows = (data || []).map((r: Record<string, unknown>) => ({
    id: String(r.id),
    title: String(r.job_title || "Untitled job"),
    status: r.status as string | null,
    city: r.city as string | null,
    country: r.country as string | null,
    category: (r.category as string | null) || null,
    created_at: r.created_at as string | undefined,
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
