import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** GET ?kind=job|market — user's published items to promote */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const kind = req.nextUrl.searchParams.get("kind") || "job";
  const supabase = createAdminClient();

  if (kind === "market") {
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, status, category, city, country, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return NextResponse.json({ error: error.message, items: [] }, { status: 500 });
    const items = (data || []).filter(
      (r) => !r.status || ["active", "published", "open"].includes(String(r.status))
    );
    return NextResponse.json({ items: items.length ? items : data || [] });
  }

  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, status, category, city, country, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message, items: [] }, { status: 500 });
  const items = (data || []).filter(
    (r) => !r.status || ["active", "published", "open"].includes(String(r.status))
  );
  return NextResponse.json({ items: items.length ? items : data || [] });
}
