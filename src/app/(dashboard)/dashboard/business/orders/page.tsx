import { createAdminClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { OrderWithListing } from "@/types/database";
import { OrderCard } from "@/components/market/OrderCard";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();

  let orders: OrderWithListing[] = [];
  try {
    const { data } = await supabase
      .from("orders")
      .select(
        "*, marketplace_listings(title, image_url), profiles!orders_buyer_id_fkey(full_name, email)"
      )
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });
    orders = (data ?? []) as unknown as OrderWithListing[];
  } catch {
    // empty state
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Incoming Orders</h1>
        <p className="text-sm text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? "s" : ""} received
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">
              No orders yet. Orders for your listings will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
