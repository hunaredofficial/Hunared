import { createAdminClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  CalendarDays,
  ExternalLink,
  User,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LISTING_CATEGORIES, LISTING_CATEGORY_COLORS } from "@/lib/constants";
import type { Listing, Profile } from "@/types/database";
import { ListingGallery } from "@/components/market/ListingGallery";
import { NativePurchaseSection } from "@/components/market/NativePurchaseSection";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();

  let listing: Listing | null = null;
  let seller: Partial<Profile> | null = null;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("marketplace_listings")
      .select("*")
      .eq("id", id)
      .eq("status", "approved")
      .single();
    listing = data;

    if (listing) {
      const { data: sellerData } = await supabase
        .from("profiles")
        .select("id, full_name, location, avatar_url")
        .eq("id", listing.seller_id)
        .single();
      seller = sellerData;
    }
  } catch {
    // ignore
  }

  if (!listing) notFound();

  const catLabel =
    LISTING_CATEGORIES.find((c) => c.value === listing!.category)?.label ??
    listing.category;
  const colorClass =
    LISTING_CATEGORY_COLORS[listing.category] ?? "bg-muted text-muted-foreground";

  // Build ordered image list: prefer image_urls[], fall back to single image_url
  const allImages: string[] =
    listing.image_urls && listing.image_urls.length > 0
      ? listing.image_urls
      : listing.image_url
      ? [listing.image_url]
      : [];

  const isAffiliate = listing.listing_type === "affiliate";
  const isNative = listing.listing_type === "native";

  return (
    <div className="min-h-screen bg-background">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" asChild>
          <Link href="/market">
            <ArrowLeft className="h-4 w-4" /> Marketplace
          </Link>
        </Button>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left: Image gallery (7 cols, sticky) ── */}
        <div className="lg:col-span-7 lg:sticky lg:top-24 lg:self-start">
          <ListingGallery images={allImages} title={listing.title} />
        </div>

        {/* ── Right: Product details (5 cols, scrolls normally) ── */}
        <div className="lg:col-span-5">
          <div className="space-y-5">
            {/* Title + price */}
            <div>
              <Badge className={`text-xs border-0 mb-2 ${colorClass}`}>{catLabel}</Badge>
              <h1 className="text-2xl font-bold leading-tight">{listing.title}</h1>
              <p className="text-3xl font-bold text-primary mt-3">
                {listing.currency} {listing.price}
              </p>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              {listing.location && (
  <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
    {listing.location.split(" | ").map((part, i) => {
      const isLink = /^https?:\/\//i.test(part) || part.includes("maps.");
      return isLink ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all"
        >
          Open on Google Maps
        </a>
      ) : (
        <span key={i}>{part}</span>
      );
    })}
  </div>
)}
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                {new Date(listing.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <Separator />

            {/* Seller */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{seller?.full_name ?? "Hunared community member"}</p>
                {seller?.location && (
                  <p className="text-xs text-muted-foreground">{seller.location}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* CTA buttons */}
            <div className="space-y-2.5">
              {isAffiliate && listing.external_link ? (
                <Button className="w-full gap-2 py-6" asChild>
                  <a href={listing.external_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 " /> Buy / View on External Site
                  </a>
                </Button>
              ) : isNative ? (
                <NativePurchaseSection
                  listingId={listing.id}
                  isSignedIn={!!userId}
                />
              ) : null}

              {/* Contact phone — now clickable (tel: link) */}
              {listing.contact_phone ? (
                userId ? (
                  <a
                    href={`tel:${listing.contact_phone.replace(/[^+\d]/g, "")}`}
                    className="flex items-center gap-2 text-sm bg-muted/50 hover:bg-muted rounded-lg px-4 py-3 transition-colors"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium hover:underline">
                      {listing.contact_phone}
                    </span>
                  </a>
                ) : (
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <Link href="/sign-in">
                      <Phone className="h-4 w-4" /> Sign in to see contact
                    </Link>
                  </Button>
                )
              ) : null}

              {/* For standard listings with no phone, show a contact prompt */}
              {!isAffiliate && !isNative && !listing.contact_phone && (
                <p className="text-xs text-muted-foreground text-center">
                  Contact the seller to arrange purchase.
                </p>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">Description</h2>
              <div
                className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: listing.description }}
              />
            </div>

            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/market">← Browse More Listings</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
