import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { canBulkPost } from "@/lib/roles";
import { LISTING_CATEGORIES } from "@/lib/constants";

type BulkListing = {
  title?: string;
  description?: string;
  price?: string;
  currency?: string;
  category?: string;
  subcategory?: string;
  condition?: string;
  rentalPeriod?: string;
  country?: string;
  city?: string;
  location?: string;
  contact_phone?: string;
};

const VALID_CATS = new Set(
  LISTING_CATEGORIES.map((c: { value: string }) => c.value)
);

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

    let category = (L.category?.trim() || "for_sale").toLowerCase();
    if (!VALID_CATS.has(category)) category = "for_sale";

    const city = L.city?.trim() || null;
    const country = L.country?.trim() || null;

    // Match single-post market API so public + My Listings queries find the row
    const row: Record<string, unknown> = {
      seller_id: userId,
      title,
      description,
      price: L.price?.trim() || "",
      currency: L.currency?.trim() || "SAR",
      category,
      subcategory: L.subcategory?.trim() || null,
      country,
      city,
      location: L.location?.trim() || city || null,
      contact_phone: L.contact_phone?.trim() || null,
      listing_type: "standard",
      status: "approved",
      closed_at: null,
      close_reason: null,
      expires_at: null,
      image_url: null,
      image_urls: null,
    };
    if (L.condition?.trim()) row.condition = L.condition.trim();
    if (L.rentalPeriod?.trim()) row.rental_period = L.rentalPeriod.trim();

    let { data, error } = await supabase
      .from("marketplace_listings")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      // Drop optional columns that may not exist
      const slim = { ...row };
      delete slim.condition;
      delete slim.rental_period;
      delete slim.image_urls;
      delete slim.close_reason;
      const retry = await supabase
        .from("marketplace_listings")
        .insert(slim)
        .select("id")
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      // Minimal required fields
      const minimal: Record<string, unknown> = {
        seller_id: userId,
        title,
        description,
        price: L.price?.trim() || "",
        currency: L.currency?.trim() || "SAR",
        category,
        status: "approved",
        listing_type: "standard",
      };
      const retry2 = await supabase
        .from("marketplace_listings")
        .insert(minimal)
        .select("id")
        .single();
      data = retry2.data;
      error = retry2.error;
    }

    if (error) results.push({ index: i, ok: false, error: error.message });
    else results.push({ index: i, ok: true, id: data?.id });
  }

  const created = results.filter((r) => r.ok).length;
  return NextResponse.json({
    created,
    total: listings.length,
    results,
    ok: created > 0,
  });
}
