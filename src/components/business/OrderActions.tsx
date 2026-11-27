"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export function OrderActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"complete" | "cancel" | null>(null);

  async function updateStatus(status: "completed" | "cancelled") {
    setLoading(status === "completed" ? "complete" : "cancel");
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update order");
      toast.success(status === "completed" ? "Order marked as completed." : "Order cancelled.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className="gap-1.5 h-8 text-xs"
        onClick={() => updateStatus("completed")}
        disabled={loading !== null}
      >
        {loading === "complete" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <CheckCircle2 className="h-3 w-3" />
        )}
        Mark Completed
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 h-8 text-xs text-destructive border-destructive/40 hover:bg-destructive hover:text-white"
        onClick={() => updateStatus("cancelled")}
        disabled={loading !== null}
      >
        {loading === "cancel" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <XCircle className="h-3 w-3" />
        )}
        Cancel
      </Button>
    </div>
  );
}
