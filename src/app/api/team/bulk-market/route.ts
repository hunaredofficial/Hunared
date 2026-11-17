import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
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

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

async function forceListingsPublic(
  supabase: SupabaseAdmin,
  ids: string[],
  countryById: Record<string, string>
) {
  if (!ids.length) return;

  await supabase
    .from("marketplace_listings")
    .update({
      status: "approved",
      closed_at: null,
      close_reason: null,
      expires_at: null,
      listing_type: "standard",
    })
    .in("id", ids);

  for (const id of ids) {
    await supabase
      .from("marketplace_listings")
      .update({
        status: "approved",
        closed_at: null,
        close_reason: null,
        expires_at: null,
        listing_type: "standard",
        country: countryById[id] || "SA",
      })
      .eq("id", id);
  }

  const { data: rows } = await supabase
    .from("marketplace_listings")
    .select("id, status, closed_at, expires_at")
    .in("id", ids);

  const ok = new Set(
    (rows ?? [])
      .filter(
        (r) =>
          r.status === "approved" &&
          r.closed_at == null &&
          (r.expires_at == null || new Date(r.expires_at) > new Date())
      )
      .map((r) => r.id)
  );

  for (const id of ids) {
    if (ok.has(id)) continue;
    await supabase
      .from("marketplace_listings")
      .update({
        status: "approved",
        closed_at: null,
        close_reason: null,
        expires_at: null,
        listing_type: "standard",
      })
      .eq("id", id);
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!canBulkPost(profile?.role)) {
    return NextResponse.json(
      { error: "Team or admin role required." },
      { status: 403 }
    );
  }

  let body: { listings?: BulkListing[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const listings = Array.isArray(body.listings)
    ? body.listings.slice(0, 50)
    : [];
  if (!listings.length) {
    return NextResponse.json(
      { error: "Provide listings: [] (max 50)." },
      { status: 400 }
    );
  }

  const results: {
    index: number;
    ok: boolean;
    id?: string;
    status?: string;
    error?: string;
  }[] = [];

  const createdIds: string[] = [];
  const countryById: Record<string, string> = {};
  const now = Date.now();

  for (let i = 0; i < listings.length; i++) {
    const L = listings[i];
    const title = L.title?.trim();
    const description = L.description?.trim();
    if (!title || !description) {
      results.push({
        index: i,
        ok: false,
        error: "title and description required",
      });
      continue;
    }

    let category = (L.category?.trim() || "for_sale").toLowerCase();
    if (!VALID_CATS.has(category)) category = "for_sale";

    const city = L.city?.trim() || null;
    const country = (L.country?.trim() || "SA").toUpperCase().slice(0, 2);
    const location = L.location?.trim() || city || null;
    const created_at = new Date(
      now - (listings.length - 1 - i) * 1000
    ).toISOString();

    const attempts: Record<string, unknown>[] = [
      {
        seller_id: userId,
        title,
        description,
        price: L.price?.trim() || "",
        currency: L.currency?.trim() || "SAR",
        category,
        subcategory: L.subcategory?.trim() || null,
        country,
        city,
        location,
        contact_phone: L.contact_phone?.trim() || null,
        listing_type: "standard",
        status: "approved",
        closed_at: null,
        close_reason: null,
        expires_at: null,
        image_url: null,
        created_at,
        ...(L.condition?.trim() ? { condition: L.condition.trim() } : {}),
        ...(L.rentalPeriod?.trim()
          ? { rental_period: L.rentalPeriod.trim() }
          : {}),
      },
      {
        seller_id: userId,
        title,
        description,
        price: L.price?.trim() || "",
        currency: L.currency?.trim() || "SAR",
        category,
        country,
        city,
        location,
        contact_phone: L.contact_phone?.trim() || null,
        listing_type: "standard",
        status: "approved",
        closed_at: null,
        expires_at: null,
        created_at,
      },
      {
        seller_id: userId,
        title,
        description,
        price: L.price?.trim() || "",
        currency: L.currency?.trim() || "SAR",
        category,
        status: "approved",
        listing_type: "standard",
        country,
        closed_at: null,
        expires_at: null,
        created_at,
      },
    ];

    let insertedId: string | null = null;
    let lastError = "";

    for (const row of attempts) {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .insert(row)
        .select("id")
        .single();
      if (!error && data?.id) {
        insertedId = data.id;
        break;
      }
      lastError = error?.message || "insert failed";
    }

    if (!insertedId) {
      results.push({ index: i, ok: false, error: lastError });
      continue;
    }

    createdIds.push(insertedId);
    countryById[insertedId] = country;
    results.push({
      index: i,
      ok: true,
      id: insertedId,
      status: "approved",
    });
  }

  if (createdIds.length) {
    await forceListingsPublic(supabase, createdIds, countryById);
  }

  const created = results.filter((r) => r.ok).length;
  if (created > 0) {
    try {
      revalidatePath("/market");
      revalidatePath("/market", "layout");
      revalidatePath("/");
      revalidatePath("/dashboard/market");
      revalidatePath("/dashboard");
      revalidatePath("/search");
      revalidatePath("/api/market");
    } catch {
      /* ignore */
    }
  }

  return NextResponse.json({
    created,
    total: listings.length,
    results,
    ok: created > 0,
    ids: createdIds,
  });
}
