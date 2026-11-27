import { createAdminClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { LISTING_CATEGORIES, LISTING_CATEGORY_COLORS } from "@/lib/constants";
import { ListingModerationActions } from "@/components/admin/ListingModerationActions";
import { AutoApproveToggle } from "@/components/admin/AutoApproveToggle";
import type { ListingWithSeller } from "@/types/database";

export const dynamic = "force-dynamic";

interface SearchParams {
  status?: string;
  page?: string;
}

export default async function AdminMarketPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();

  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (caller?.role !== "admin") redirect("/dashboard");

  const sp = await searchParams;
  const statusFilter = sp.status ?? "pending";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const limit = 15;
  const from = (page - 1) * limit;

  // Fetch site settings for auto-approve toggle
  let autoApprove = false;
  try {
    const { data: settings } = await supabase
      .from("site_settings")
      .select("auto_approve_market_listings")
      .limit(1)
      .single();
    autoApprove = settings?.auto_approve_market_listings === true;
  } catch {
    // table may not exist yet — default false
  }


  let listings: ListingWithSeller[] = [];
  let total = 0;

  try {
    let query = supabase
      .from("marketplace_listings")
      .select("*, profiles(full_name, username)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter as ListingWithSeller["status"]);
    }

    const { data, count } = await query;
    listings = (data ?? []) as unknown as ListingWithSeller[];
    total = count ?? 0;
  } catch {
    // empty state
  }

  const totalPages = Math.ceil(total / limit);

  let pendingCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;
  try {
    const { data: all } = await supabase
      .from("marketplace_listings")
      .select("status");
    if (all) {
      pendingCount = all.filter((l) => l.status === "pending").length;
      approvedCount = all.filter((l) => l.status === "approved").length;
      rejectedCount = all.filter((l) => l.status === "rejected").length;
    }
  } catch {
    // ignore
  }

  const STATUS_TABS = [
    { label: "Pending", value: "pending", count: pendingCount },
    { label: "Approved", value: "approved", count: approvedCount },
    { label: "Rejected", value: "rejected", count: rejectedCount },
    { label: "All", value: "all", count: pendingCount + approvedCount + rejectedCount },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Business</h1>
        <p className="text-sm text-muted-foreground">Review and moderate listings</p>
      </div>

      {/* Auto-approve toggle */}
      <AutoApproveToggle initialValue={autoApprove} />

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/dashboard/admin/market?status=${tab.value}`}
            className={buttonVariants({
              variant: statusFilter === tab.value ? "default" : "outline",
              size: "sm",
            })}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="pt-0 pb-0 overflow-x-auto">
          {listings.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground">
                No {statusFilter !== "all" ? statusFilter : ""} listings.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">Listing</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Price</th>
                  <th className="text-left py-3 px-4 font-medium">Submitted</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => {
                  const catLabel =
                    LISTING_CATEGORIES.find((c) => c.value === listing.category)?.label ??
                    listing.category;
                  const catColor =
                    LISTING_CATEGORY_COLORS[listing.category] ?? "bg-muted text-muted-foreground";

                  return (
                    <tr
                      key={listing.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {listing.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={listing.image_url}
                              alt={listing.title}
                              className="h-10 w-10 rounded-md object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                              <ShoppingBag className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                          )}
                          <div>
                            {listing.status === "approved" ? (
                              <Link
                                href={`/market/${listing.id}`}
                                target="_blank"
                                className="font-medium hover:text-primary hover:underline transition-colors line-clamp-1"
                              >
                                {listing.title}
                              </Link>
                            ) : (
                              <span className="font-medium line-clamp-1">{listing.title}</span>
                            )}
                            {listing.location && (
                              <p className="text-xs text-muted-foreground">{listing.location}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`text-xs border-0 ${catColor}`}>{catLabel}</Badge>
                      </td>
                      <td className="py-3 px-4 font-medium text-primary">
                        {listing.currency} {listing.price}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {new Date(listing.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <ListingModerationActions
                          listingId={listing.id}
                          currentStatus={listing.status}
                          listing={listing}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/dashboard/admin/market?status=${statusFilter}&page=${page - 1}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/dashboard/admin/market?status=${statusFilter}&page=${page + 1}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
