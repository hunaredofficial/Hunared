import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { canBulkPost } from "@/lib/roles";

type BulkListing = {
  title?: string;
  description?: string;
  price?: string;
  currency?: string;
  category?: string;
  subcategory?: string;
  country?: string;
  city?: string;
  location?: string;
  contact_phone?: string;
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!canBulkPost(profile?.role)) {
    return NextResponse.json({ error: "Team or admin role required." }, { status: 403 });
  }

  let body: { listings?: BulkListing[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const listings = Array.isArray(body.listings) ? body.listings.slice(0, 50) : [];
  if (!listings.length) {
    return NextResponse.json({ error: "Provide listings: [] (max 50)." }, { status: 400 });
  }

  const results: { index: number; ok: boolean; id?: string; error?: string }[] = [];

  for (let i = 0; i < listings.length; i++) {
    const L = listings[i];
    const title = L.title?.trim();
    const description = L.description?.trim();
    if (!title || !description) {
      results.push({ index: i, ok: false, error: "title and description required" });
      continue;
    }
    const { data, error } = await supabase
      .from("marketplace_listings")
      .insert({
        seller_id: userId,
        title,
        description,
        price: L.price?.trim() || "",
        currency: L.currency?.trim() || "SAR",
        category: L.category?.trim() || "other",
        subcategory: L.subcategory?.trim() || null,
        country: L.country?.trim() || null,
        city: L.city?.trim() || null,
        location: L.location?.trim() || L.city?.trim() || null,
        contact_phone: L.contact_phone?.trim() || null,
        status: "approved",
      })
      .select("id")
      .single();

    if (error) results.push({ index: i, ok: false, error: error.message });
    else results.push({ index: i, ok: true, id: data?.id });
  }

  const created = results.filter((r) => r.ok).length;
  return NextResponse.json({ created, total: listings.length, results });
}
