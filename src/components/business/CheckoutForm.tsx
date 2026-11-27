"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Truck } from "lucide-react";

interface CheckoutFormProps {
  listingId: string;
  sellerId: string;
  unitPrice: string;
  quantity: number;
  currency: string;
  defaultName: string;
  defaultPhone: string;
}

export function CheckoutForm({
  listingId,
  sellerId,
  unitPrice,
  quantity,
  currency,
  defaultName,
  defaultPhone,
}: CheckoutFormProps) {
  const router = useRouter();

  const totalPrice = (parseFloat(unitPrice) * quantity).toFixed(2);

  const [name, setName] = useState(defaultName);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(defaultPhone);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Full name is required"); return; }
    if (!address.trim()) { toast.error("Delivery address is required"); return; }
    if (!phone.trim()) { toast.error("Phone number is required"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          seller_id: sellerId,
          price: totalPrice,
          currency,
          delivery_name: name.trim(),
          delivery_address: address.trim(),
          delivery_phone: phone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to place order");
      router.push(`/market/checkout/success?orderId=${data.order.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Full name */}
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Phone Number <span className="text-destructive">*</span>
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+966 5XX XXX XXXX"
              type="tel"
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Delivery Address <span className="text-destructive">*</span>
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Building, Street, City, Country"
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            />
          </div>

          {/* Payment method — read-only */}
          <div className="flex items-center gap-3 rounded-lg bg-muted/40 border border-border px-4 py-3">
            <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">Cash on Delivery (COD)</p>
              <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full py-5 mt-1">
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Placing Order...</>
            ) : (
              `Confirm Order - ${currency} ${totalPrice}`
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
