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
 * GET ?kind=job|market
 * Jobs use employer_id; listings use seller_id (not user_id).
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const kind = req.nextUrl.searchParams.get("kind") || "job";
  const supabase = createAdminClient();

  if (kind === "market") {
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, status, category, city, country, created_at, seller_id")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false })
      .limit(150);

    if (error) {
      // fallback try user_id for older rows
      const { data: alt, error: e2 } = await supabase
        .from("listings")
        .select("id, title, status, category, city, country, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(150);
      if (e2) return NextResponse.json({ error: e2.message, items: [] }, { status: 500 });
      return NextResponse.json({ items: filterOk(alt || []) });
    }
    return NextResponse.json({ items: filterOk(data || []) });
  }

  // Jobs: employer_id
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, status, category, city, country, created_at, employer_id")
    .eq("employer_id", userId)
    .order("created_at", { ascending: false })
    .limit(150);

  if (error) {
    const { data: alt, error: e2 } = await supabase
      .from("jobs")
      .select("id, title, status, category, city, country, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(150);
    if (e2) return NextResponse.json({ error: e2.message, items: [] }, { status: 500 });
    return NextResponse.json({ items: filterOk(alt || []) });
  }

  return NextResponse.json({ items: filterOk(data || []) });
}

function filterOk(
  rows: { id: string; title: string; status?: string | null; city?: string | null; country?: string | null; category?: string | null; created_at?: string }[]
) {
  const open = rows.filter((r) => {
    if (!r.status) return true;
    return OK_STATUS.has(String(r.status).toLowerCase());
  });
  // If filter empties everything, still return rows (user can promote pending)
  return open.length ? open : rows;
}
