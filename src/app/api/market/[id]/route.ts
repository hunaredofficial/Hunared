import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import type { ListingStatus, ListingCategory } from "@/types/database";
import { LISTING_CATEGORIES } from "@/lib/constants";

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


/** GET /api/market/[id] — single listing */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ listing: data });
}

/** PATCH /api/market/[id] — admin: update status */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (caller?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: { status?: string } = await req.json();
  const VALID: ListingStatus[] = ["pending", "approved", "rejected"];

  if (!body.status || !VALID.includes(body.status as ListingStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { error } = await supabase
    .from("marketplace_listings")
    .update({ status: body.status as ListingStatus })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

/** DELETE /api/market/[id] — seller or admin */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const { data: listing } = await supabase
    .from("marketplace_listings")
    .select("seller_id")
    .eq("id", id)
    .single();

  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (listing.seller_id !== userId && caller?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await supabase.from("saved_items").delete().eq("item_type", "listing").eq("item_id", id);
  } catch {
    /* ignore */
  }
  const { error } = await supabase.from("marketplace_listings").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

/** PUT /api/market/[id] — seller edits their own listing; forces status back to pending (or approved if auto-approve is on) */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const { data: listing } = await supabase
    .from("marketplace_listings")
    .select("seller_id")
    .eq("id", id)
    .single();

  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.seller_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: {
    title?: string;
    description?: string;
    price?: string;
    currency?: string;
    category?: string;
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

  const imageUrls = Array.isArray(body.image_urls) ? body.image_urls : [];
  const primaryImageUrl = imageUrls[0] ?? null;

  // Determine target status: auto-approve or send back to pending review
  const autoApprove = await getAutoApproveSetting();
  const newStatus: ListingStatus = autoApprove ? "approved" : "pending";

  const { data, error } = await supabase
    .from("marketplace_listings")
    .update({
      title: body.title.trim(),
      description: body.description.trim(),
      price: body.price?.trim() || "",
      currency: body.currency ?? "USD",
      category: body.category as ListingCategory,
      location: body.location?.trim() || null,
      contact_phone: body.contact_phone?.trim() || null,
      image_url: primaryImageUrl,
      image_urls: imageUrls,
      listing_type: body.listing_type ?? "standard",
      external_link: body.external_link?.trim() || null,
      status: newStatus,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ listing: data });
}

