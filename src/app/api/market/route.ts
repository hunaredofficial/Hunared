import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { LISTING_CATEGORIES } from "@/lib/constants";
import { COUNTRIES } from "@/lib/countries";
import type { ListingCategory, ListingStatus } from "@/types/database";

const VALID_CATEGORIES = LISTING_CATEGORIES.map((c) => c.value);

/** Returns true when the admin has enabled auto-approve for new/edited listings. */
async function getAutoApproveSetting(): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("auto_approve_market_listings")
      .limit(1)
      .single();
    return data?.auto_approve_market_listings === true;
  } catch {
    return false;
  }
}

/** GET /api/market?category=&subcategory=&country=&city=&search=&page= */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "";
  const subcategory = searchParams.get("subcategory") ?? "";
  const country = searchParams.get("country") ?? "";
  const city = searchParams.get("city") ?? "";
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 12;
  const from = (page - 1) * limit;

  const supabase = createAdminClient();

  let query = supabase
    .from("marketplace_listings")
    .select(
      "id, title, price, currency, category, subcategory, location, country, city, image_url, created_at",
      { count: "exact" }
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (category && VALID_CATEGORIES.includes(category as ListingCategory)) {
    query = query.eq("category", category as ListingCategory);
  }
  if (subcategory) query = query.eq("subcategory", subcategory);
  if (country) query = query.eq("country", country);
  if (city) query = query.ilike("city", `%${city}%`);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ listings: data ?? [], total: count ?? 0 });
}

/** POST /api/market — authenticated users create a listing */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: {
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
    image_urls?: string[];
    listing_type?: string;
    external_link?: string;
  } = await req.json();

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!body.description?.trim()) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }

  const isPriceOptional = [
    "services",
    "free_items",
    "wanted",
    "lost_found",
    "announcements",
    "donations",
    "community",
  ].includes(body.category ?? "");

  if (!isPriceOptional && !body.price?.trim()) {
    return NextResponse.json({ error: "Price is required" }, { status: 400 });
  }

  if (!body.category || !VALID_CATEGORIES.includes(body.category as ListingCategory)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  // Country is optional for listings, but if provided it must be a valid ISO code
  if (body.country && !COUNTRIES.some((c) => c.code === body.country)) {
    return NextResponse.json({ error: "Invalid country" }, { status: 400 });
  }

  const imageUrls = Array.isArray(body.image_urls) ? body.image_urls : [];
  const primaryImageUrl = imageUrls[0] ?? null;

  const supabase = createAdminClient();

  // Determine target status: auto-approve or send to pending review
  const autoApprove = await getAutoApproveSetting();
  const newStatus: ListingStatus = autoApprove ? "approved" : "pending";

  const { data, error } = await supabase
    .from("marketplace_listings")
    .insert({
      seller_id: userId,
      title: body.title.trim(),
      description: body.description.trim(),
      price: body.price?.trim() || "",
      currency: body.currency ?? "USD",
      category: body.category as ListingCategory,
      subcategory: body.subcategory?.trim() || null,
      country: body.country || null,
      city: body.city?.trim() || null,
      location: body.location?.trim() || null,
      contact_phone: body.contact_phone?.trim() || null,
      // Primary image kept for backward compat with grid/detail views
      image_url: primaryImageUrl,
      image_urls: imageUrls,
      listing_type: body.listing_type ?? "standard",
      external_link: body.external_link?.trim() || null,
      status: newStatus,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ listing: data }, { status: 201 });
}
