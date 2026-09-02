import { ShareButton } from "@/components/shared/ShareButton";
import { SaveButton } from "@/components/shared/SaveButton";
import { RelatedCarousel } from "@/components/shared/RelatedCarousel";
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
  MessageCircle,
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
import { formatRelativePosted, formatPostedExact } from "@/lib/relativeDate";

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

  let relatedListings: Listing[] = [];
  try {
    const supabase = createAdminClient();
    if (listing.category) {
      const { data } = await supabase
        .from("marketplace_listings")
        .select("*")
        .eq("status", "approved")
        .eq("category", listing.category)
        .neq("id", id)
        .order("created_at", { ascending: false })
        .limit(24);
      relatedListings = (data as Listing[]) ?? [];
    }
  } catch {
    // non-fatal
  }

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
              <div className="flex items-start justify-between gap-3 mb-2">
                <Badge className={`text-xs border-0 ${colorClass}`}>
                  {catLabel}
                </Badge>
                <div className="flex items-center gap-2">
                  <ShareButton
                    url={`/market/${listing.id}`}
                    title={listing.title}
                    size="sm"
                  />
                  <SaveButton
                    itemType="listing"
                    itemId={listing.id}
                    size="sm"
                  />
                </div>
              </div>
              <h1 className="text-2xl font-bold leading-tight">
                {listing.title}
              </h1>
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
                    const isLink =
                      /^https?:\/\//i.test(part) || part.includes("maps.");
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
              <span className="flex items-center gap-1.5" title={formatPostedExact(listing.created_at)}>
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                Posted: {formatRelativePosted(listing.created_at).replace(/^Posted\s+/i, "")}
                <span className="text-muted-foreground/70">
                  ({formatPostedExact(listing.created_at)})
                </span>
              </span>
            </div>

            <Separator />

            {/* Seller */}
            <div className="flex items-center gap-3">
              {seller?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={seller.avatar_url}
                  alt={seller.full_name ?? "Seller"}
                  className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium">
                  {seller?.full_name ?? "Hunared community member"}
                </p>
                {seller?.location && (
                  <p className="text-xs text-muted-foreground">
                    {seller.location}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* CTA buttons */}
            <div className="space-y-2.5">
              {isAffiliate && listing.external_link ? (
                <Button className="w-full gap-2 py-6" asChild>
                  <a
                    href={listing.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 " /> Buy / View on External
                    Site
                  </a>
                </Button>
              ) : isNative ? (
                <NativePurchaseSection
                  listingId={listing.id}
                  isSignedIn={!!userId}
                />
              ) : null}

              {/* Contact info — visible to everyone when seller published it */}
              {listing.contact_phone ? (
                <div className="space-y-2">
                  <a
                    href={`tel:${listing.contact_phone.replace(/[^+\d]/g, "")}`}
                    className="flex items-center gap-2 text-sm bg-muted/50 hover:bg-muted rounded-lg px-4 py-3 transition-colors"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium hover:underline">
                      {listing.contact_phone}
                    </span>
                  </a>
                  {/* WhatsApp — only when a usable phone number exists */}
                  <a
                    href={`https://wa.me/${listing.contact_phone.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 rounded-lg px-4 py-3 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    <span className="font-medium">Contact on WhatsApp</span>
                  </a>
                </div>
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

        <RelatedCarousel
          title="Similar listings"
          items={relatedListings.map((item) => ({
            kind: "listing" as const,
            id: item.id,
            title: item.title,
            subtitle: item.category,
            location: item.location || [item.city, item.country].filter(Boolean).join(", "),
            category: item.category,
            date: new Date(item.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            image: item.image_urls?.[0] || item.image_url || null,
          }))}
        />
      </div>
    </div>
  );
}
