import { SaveButton } from "@/components/shared/SaveButton";
import { formatMoney } from "@/lib/currencies";
import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";
import { ShoppingBag, MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LISTING_CATEGORIES,
  LISTING_CATEGORY_COLORS,
} from "@/lib/constants";
import { COUNTRIES } from "@/lib/countries";
import type { Listing } from "@/types/database";
import { MarketFilter } from "@/components/market/MarketFilter";
import { formatRelativePosted } from "@/lib/relativeDate";

interface SearchParams {
  category?: string;
  subcategory?: string;
  country?: string;
  city?: string;
  search?: string;
  page?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  posted?: string;
}

/** Extract a numeric price for sorting/range. Free/blank/text → null. */
function parsePriceValue(price: string | null | undefined): number | null {
  if (price == null || price === "") return null;
  const raw = String(price).trim().toLowerCase();
  if (
    !raw ||
    raw === "free" ||
    raw === "negotiable" ||
    raw === "n/a" ||
    raw === "-" ||
    raw.includes("negotiable")
  ) {
    return null;
  }
  const num = Number(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : null;
}

function postedCutoff(posted: string): Date | null {
  if (!posted) return null;
  const now = new Date();
  if (posted === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const hours: Record<string, number> = {
    "24h": 24,
    "3d": 24 * 3,
    "7d": 24 * 7,
    "14d": 24 * 14,
    "30d": 24 * 30,
  };
  const h = hours[posted];
  if (!h) return null;
  return new Date(now.getTime() - h * 60 * 60 * 1000);
}

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const category = sp.category ?? "";
  const subcategory = sp.subcategory ?? "";
  const country = sp.country ?? "";
  const city = sp.city ?? "";
  const search = sp.search ?? "";
  const sort = sp.sort ?? "";
  const minPrice = sp.minPrice ?? "";
  const maxPrice = sp.maxPrice ?? "";
  const posted = sp.posted ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const limit = 12;
  const from = (page - 1) * limit;

  const minNum = minPrice ? Number(minPrice) : null;
  const maxNum = maxPrice ? Number(maxPrice) : null;
  const hasPriceRange =
    (minNum != null && Number.isFinite(minNum)) ||
    (maxNum != null && Number.isFinite(maxNum));

  const needsInMemory =
    sort === "price_asc" ||
    sort === "price_desc" ||
    sort === "oldest" ||
    hasPriceRange;

  let listings: Listing[] = [];
  let total = 0;

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("marketplace_listings")
      .select("*", { count: "exact" })
      .eq("status", "approved");

    if (category) query = query.eq("category", category as Listing["category"]);
    if (subcategory) query = query.eq("subcategory", subcategory);
    if (country) query = query.eq("country", country);
    if (city) query = query.ilike("city", `%${city}%`);
    if (search) query = query.ilike("title", `%${search}%`);

    const cutoff = postedCutoff(posted);
    if (cutoff) {
      query = query.gte("created_at", cutoff.toISOString());
    }

    if (needsInMemory) {
      query = query.order("created_at", { ascending: false }).limit(500);
      const { data, count } = await query;
      let rows = data ?? [];

      // Price range filter (numeric)
      if (hasPriceRange) {
        rows = rows.filter((row) => {
          const p = parsePriceValue(row.price);
          if (p == null) return false;
          if (minNum != null && Number.isFinite(minNum) && p < minNum) return false;
          if (maxNum != null && Number.isFinite(maxNum) && p > maxNum) return false;
          return true;
        });
      }

      if (sort === "price_asc") {
        rows = [...rows].sort((a, b) => {
          const pa = parsePriceValue(a.price);
          const pb = parsePriceValue(b.price);
          if (pa == null && pb == null) return 0;
          if (pa == null) return 1;
          if (pb == null) return -1;
          return pa - pb;
        });
      } else if (sort === "price_desc") {
        rows = [...rows].sort((a, b) => {
          const pa = parsePriceValue(a.price);
          const pb = parsePriceValue(b.price);
          if (pa == null && pb == null) return 0;
          if (pa == null) return 1;
          if (pb == null) return -1;
          return pb - pa;
        });
      } else if (sort === "oldest") {
        rows = [...rows].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      } else if (sort === "newest") {
        rows = [...rows].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      total = rows.length;
      listings = rows.slice(from, from + limit);
    } else {
      const ascending = sort === "oldest";
      query = query
        .order("created_at", { ascending })
        .range(from, from + limit - 1);
      const { data, count } = await query;
      listings = data ?? [];
      total = count ?? 0;
    }
  } catch {
    // DB not configured
  }

  const totalPages = Math.ceil(total / limit);
  const activeCat = LISTING_CATEGORIES.find((c) => c.value === category);
  const activeCountry = COUNTRIES.find((c) => c.code === country);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border py-12 pt-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <ShoppingBag className="h-7 w-7 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span className="gradient-text">Hunared Marketplace</span>
            </h1>
          </div>
          <p className="text-muted-foreground max-w-xl">
            Buy, sell, and find services worldwide - property, vehicles,
            electronics, services, and more.
          </p>

          <MarketFilter
            defaultSearch={search}
            defaultCategory={category}
            defaultSubcategory={subcategory}
            defaultCountry={country}
            defaultCity={city}
            defaultSort={sort}
            defaultMinPrice={minPrice}
            defaultMaxPrice={maxPrice}
            defaultPosted={posted}
          />
        </div>
      </section>

      {/* Listings */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {(search || activeCat || subcategory || country || city || sort || minPrice || maxPrice || posted) && (
          <p className="text-sm text-muted-foreground mb-5">
            {total} listing{total !== 1 ? "s" : ""} found
            {activeCat && ` in ${activeCat.label}`}
            {subcategory && ` › ${subcategory}`}
            {activeCountry && ` · ${activeCountry.name}`}
            {city && ` · ${city}`}
            {search && ` matching "${search}"`}
          </p>
        )}

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-lg">No listings found.</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/dashboard/market/new">Post the first listing</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {page > 1 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/market?${buildParams({
                        category,
                        subcategory,
                        country,
                        city,
                        search,
                        sort,
                        minPrice,
                        maxPrice,
                        posted,
                        page: page - 1,
                      })}`}
                    >
                      Previous
                    </Link>
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/market?${buildParams({
                        category,
                        subcategory,
                        country,
                        city,
                        search,
                        sort,
                        minPrice,
                        maxPrice,
                        posted,
                        page: page + 1,
                      })}`}
                    >
                      Next
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Have something to sell?</h2>
          <p className="text-muted-foreground text-sm mb-5">
            Sign in to post a listing. All listings are reviewed before
            publishing.
          </p>
          <Button asChild>
            <Link href="/dashboard/market/new">Post a Listing</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const catLabel =
    LISTING_CATEGORIES.find((c) => c.value === listing.category)?.label ??
    listing.category;
  const colorClass =
    LISTING_CATEGORY_COLORS[listing.category] ??
    "bg-muted text-muted-foreground";

  return (
    <div className="group flex flex-col rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden hover:ring-primary/40 hover:shadow-md transition-all duration-200">
      {listing.image_url ? (
        <div className="aspect-square w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listing.image_url}
            alt={listing.title}
            className="object-cover w-full h-full"
          />
        </div>
      ) : (
        <div className="aspect-square w-full bg-muted flex items-center justify-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        <Badge className={`text-xs border-0 w-fit mb-2 ${colorClass}`}>
          {catLabel}
        </Badge>

        <h3 className="font-semibold text-sm leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
          <Link href={`/market/${listing.id}`}>{listing.title}</Link>
        </h3>

        <p className="text-base font-bold text-primary mt-auto pt-2">
          {formatMoney(listing.price, listing.currency)}
        </p>

        {listing.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {listing.location}
          </div>
        )}

        {listing.created_at && (
          <p className="text-xs text-muted-foreground mt-1">
            {formatRelativePosted(listing.created_at)}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <SaveButton itemType="listing" itemId={listing.id} size="sm" />
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-xs gap-1 group-hover:border-primary/50"
            asChild
          >
            <Link href={`/market/${listing.id}`}>
              View <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function buildParams(p: {
  category: string;
  subcategory: string;
  country: string;
  city: string;
  search: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  posted?: string;
  page: number;
}) {
  const params = new URLSearchParams();
  if (p.category) params.set("category", p.category);
  if (p.subcategory) params.set("subcategory", p.subcategory);
  if (p.country) params.set("country", p.country);
  if (p.city) params.set("city", p.city);
  if (p.search) params.set("search", p.search);
  if (p.sort) params.set("sort", p.sort);
  if (p.minPrice) params.set("minPrice", p.minPrice);
  if (p.maxPrice) params.set("maxPrice", p.maxPrice);
  if (p.posted) params.set("posted", p.posted);
  if (p.page > 1) params.set("page", p.page.toString());
  return params.toString();
}