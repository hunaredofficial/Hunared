"use client";

import { ListingCategoryIcon, isListingPhotoUrl } from "@/components/market/ListingCategoryIcon";

import { useState, useTransition } from "react";
import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { OrderWithListing, OrderStatus } from "@/types/database";
import { updateOrderStatus } from "@/app/(dashboard)/dashboard/business/orders/actions";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export function OrderCard({ order }: { order: OrderWithListing }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(status: OrderStatus | null) {
    if (!status) return;
    startTransition(async () => {
      try {
        await updateOrderStatus(order.id, status);
        toast.success(`Order marked as ${status}.`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update order"
        );
      }
    });
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="py-4">
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Product image */}
            {isListingPhotoUrl(order.marketplace_listings?.image_url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={order.marketplace_listings.image_url}
                alt={order.marketplace_listings.title ?? ""}
                className="h-12 w-12 rounded-lg object-cover border border-border shrink-0"
              />
            ) : (
              <ListingCategoryIcon
                category={(order.marketplace_listings as { category?: string } | null)?.category}
                size="sm"
                boxClassName="h-12 w-12 rounded-lg border border-border shrink-0"
              />
            )}

            {/* Product summary */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-1">
                {order.marketplace_listings?.title ?? "Listing"}
              </p>
              <p className="text-xs text-primary font-semibold mt-0.5">
                {order.currency} {order.price}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(order.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Status badge — visible on sm+ */}
            <Badge
              className={`text-xs border shrink-0 hidden sm:inline-flex ${STATUS_COLORS[order.status] ?? ""}`}
            >
              {order.status}
            </Badge>

            {/* Status updater */}
            <Select
              defaultValue={order.status}
              onValueChange={(val) => handleStatusChange(val as OrderStatus | null)}
              disabled={isPending}
            >
              <SelectTrigger className="w-[130px] h-8 text-xs shrink-0 cursor-pointer">
                {isPending ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  <SelectValue />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="cursor-pointer" value="pending">Pending</SelectItem>
                <SelectItem className="cursor-pointer" value="completed">Completed</SelectItem>
                <SelectItem className="cursor-pointer" value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* View details */}
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs shrink-0 cursor-pointer"
              onClick={() => setDetailsOpen(true)}
            >
              <Eye className="h-3.5 w-3.5" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Buyer details modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            {/* Order summary */}
            <div className="rounded-lg border divide-y">
              <Row label="Product" value={order.marketplace_listings?.title ?? "-"} />
              <Row label="Price" value={`${order.currency} ${order.price}`} />
              <Row
                label="Date"
                value={new Date(order.created_at).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
              <Row
                label="Status"
                value={
                  <Badge
                    className={`text-xs border ${STATUS_COLORS[order.status] ?? ""}`}
                  >
                    {order.status}
                  </Badge>
                }
              />
            </div>

            {/* Buyer info */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Buyer Information
            </p>
            <div className="rounded-lg border divide-y">
              <Row label="Full Name" value={order.delivery_name} />
              <Row label="Email" value={order.profiles?.email ?? "-"} />
              <Row label="Phone" value={order.delivery_phone} />
              <Row label="Delivery Address" value={order.delivery_address} />
              <Row label="Payment Method" value={order.payment_method} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4 px-4 py-2.5">
      <span className="text-muted-foreground w-36 shrink-0 text-xs">{label}</span>
      <span className="font-medium text-xs break-all">{value}</span>
    </div>
  );
}
