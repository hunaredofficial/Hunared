"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag } from "lucide-react";

interface NativePurchaseSectionProps {
  listingId: string;
  isSignedIn: boolean;
}

export function NativePurchaseSection({
  listingId,
  isSignedIn,
}: NativePurchaseSectionProps) {
  const [qty, setQty] = useState(1);

  if (!isSignedIn) {
    return (
      <Button className="w-full py-6" asChild>
        <Link href={`/sign-in?redirect_url=/market/${listingId}`}>
          Sign in to Purchase
        </Link>
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Quantity</span>
        <div className="flex items-center border border-input rounded-md overflow-hidden">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-2 hover:bg-muted transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="px-4 py-2 text-sm font-semibold min-w-[2.5rem] text-center tabular-nums">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="px-3 py-2 hover:bg-muted transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Purchase button */}
      <Button className="w-full gap-2 py-6" asChild>
        <Link href={`/market/checkout?listingId=${listingId}&qty=${qty}`}>
          <ShoppingBag className="h-4 w-4" />
          Purchase Now{qty > 1 ? ` (x${qty})` : ""}
        </Link>
      </Button>
    </div>
  );
}
