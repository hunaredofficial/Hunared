import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const sp = await searchParams;
  const orderId = sp.orderId;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Order Placed!</h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Your order has been sent to the seller. They will contact you to arrange Cash on
            Delivery.
          </p>
          {orderId && (
            <p className="text-xs text-muted-foreground mt-2">
              Order ID: <span className="font-mono">{orderId}</span>
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild>
            <Link href="/business">Back to Business</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/business">My Listings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
