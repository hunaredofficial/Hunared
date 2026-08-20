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

interface SearchParams {
  category?: string;
  subcategory?: string;
  country?: string;
  city?: string;
  search?: string;
  page?: string;
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
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const limit = 12;
  const from = (page - 1) * limit;

  let listings: Listing[] = [];
  let total = 0;

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("marketplace_listings")
      .select("*", { count: "exact" })
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (category) query = query.eq("category", category as Listing["category"]);
    if (subcategory) query = query.eq("subcategory", subcategory);
    if (country) query = query.eq("country", country);
    if (city) query = query.ilike("city", `%${city}%`);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, count } = await query;
    listings = data ?? [];
    total = count ?? 0;
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
          />
        </div>
      </section>

      {/* Listings */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {(search || activeCat || subcategory || country || city) && (
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
          {listing.currency} {listing.price}
        </p>
        {listing.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {listing.location}
          </div>
        )}
        <Button
          size="sm"
          variant="outline"
          className="mt-3 w-full h-7 text-xs gap-1 group-hover:border-primary/50"
          asChild
        >
          <Link href={`/market/${listing.id}`}>
            View <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
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
  page: number;
}) {
  const params = new URLSearchParams();
  if (p.category) params.set("category", p.category);
  if (p.subcategory) params.set("subcategory", p.subcategory);
  if (p.country) params.set("country", p.country);
  if (p.city) params.set("city", p.city);
  if (p.search) params.set("search", p.search);
  if (p.page > 1) params.set("page", p.page.toString());
  return params.toString();
}