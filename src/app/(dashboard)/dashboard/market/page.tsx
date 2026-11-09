import { createAdminClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Plus, Pencil } from "lucide-react";
import { ListingRowActions } from "@/components/market/ListingRowActions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LISTING_CATEGORIES, LISTING_CATEGORY_COLORS } from "@/lib/constants";
import type { Listing } from "@/types/database";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export default async function MyListingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let listings: Listing[] = [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("marketplace_listings")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });
    listings = data ?? [];
  } catch {
    // empty state
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-sm text-muted-foreground">
            {listings.length} listing{listings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/dashboard/market/new">
            <Plus className="h-4 w-4" /> Post Listing
          </Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">You haven&apos;t posted any listings yet.</p>
            <Button className="mt-5 gap-1.5" asChild>
              <Link href="/dashboard/market/new">
                <Plus className="h-4 w-4" /> Post your first listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const catLabel =
              LISTING_CATEGORIES.find((c) => c.value === listing.category)?.label ??
              listing.category;
            const catColor =
              LISTING_CATEGORY_COLORS[listing.category] ?? "bg-muted text-muted-foreground";

            return (
              <Card key={listing.id} className="hover:border-primary/30 transition-colors overflow-hidden">
                <CardContent className="pt-0 pb-0">
                  <div className="flex gap-4 py-4">
                    {listing.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="h-14 w-14 rounded-lg object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                    {/* Right side: text on top, buttons below on mobile; side-by-side on sm+ */}
                    <div className="flex-1 min-w-0 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={`text-xs border-0 ${catColor}`}>{catLabel}</Badge>
                          <Badge className={`text-xs border ${STATUS_COLORS[listing.status] ?? ""}`}>
                            {listing.status}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm line-clamp-1">{listing.title}</p>
                        <p className="text-xs text-primary font-semibold mt-0.5">
                          {listing.currency} {listing.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
                          <Link href={`/dashboard/market/${listing.id}/edit`}>
                            <Pencil className="h-3 w-3" /> Edit
                          </Link>
                        </Button>
                        {listing.status === "approved" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                            <Link href={`/market/${listing.id}`} target="_blank">View</Link>
                          </Button>
                        )}
                        <ListingRowActions id={listing.id} title={listing.title} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
