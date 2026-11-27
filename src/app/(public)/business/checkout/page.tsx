import { createAdminClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import type { Listing } from "@/types/database";
import { CheckoutForm } from "@/components/market/CheckoutForm";
import { ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ listingId?: string; qty?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const sp = await searchParams;
  const listingId = sp.listingId;
  if (!listingId) notFound();

  const rawQty = parseInt(sp.qty ?? "1", 10);
  const qty = Number.isFinite(rawQty) && rawQty > 0 ? rawQty : 1;

  const supabase = createAdminClient();

  const { data } = await supabase
    .from("marketplace_listings")
    .select("*")
    .eq("id", listingId)
    .eq("status", "approved")
    .eq("listing_type", "native")
    .single();

  const listing = data as Listing | null;
  if (!listing) notFound();

  // Fetch buyer's profile to pre-fill name / phone
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, location")
    .eq("id", userId)
    .single();

  const primaryImage =
    (listing.image_urls && listing.image_urls[0]) ?? listing.image_url ?? null;

  return (
    <div className="min-h-screen bg-background pt-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold mb-1">Checkout</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Review your order and enter delivery details.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── Order summary (left) ── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border p-5 space-y-4 lg:sticky lg:top-24 lg:self-start">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Order Summary
              </h2>
              <div className="flex gap-4 items-start">
                {primaryImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryImage}
                    alt={listing.title}
                    className="h-20 w-20 rounded-xl object-cover border border-border shrink-0"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <ShoppingBag className="h-7 w-7 text-muted-foreground/30" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-sm leading-snug line-clamp-2">{listing.title}</p>
                  {listing.location && (
                    <p className="text-xs text-muted-foreground mt-0.5">{listing.location}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unit Price</span>
                  <span className="font-medium">{listing.currency} {listing.price}</span>
                </div>
                {qty > 1 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">x{qty}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="font-medium">Cash on Delivery</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-1 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">
                    {listing.currency} {(parseFloat(listing.price) * qty).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery form (right) */}
          <div className="lg:col-span-3">
            <CheckoutForm
              listingId={listing.id}
              sellerId={listing.seller_id}
              unitPrice={listing.price}
              quantity={qty}
              currency={listing.currency ?? "USD"}
              defaultName={profile?.full_name ?? ""}
              defaultPhone={profile?.phone ?? ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
