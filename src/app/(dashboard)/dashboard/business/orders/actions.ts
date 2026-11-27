"use server";

import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/types/database";

const VALID_STATUSES: OrderStatus[] = ["pending", "completed", "cancelled"];

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!VALID_STATUSES.includes(status)) throw new Error("Invalid status");

  const supabase = createAdminClient();

  // Verify the caller is the seller
  const { data: order } = await supabase
    .from("orders")
    .select("seller_id")
    .eq("id", orderId)
    .single();

  if (!order) throw new Error("Order not found");
  if (order.seller_id !== userId) throw new Error("Forbidden");

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/market/orders");
}
