import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PremiumAdsClient } from "@/components/premium-ads/PremiumAdsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Premium Ads | Hunared",
  description: "Promote jobs, marketplace listings, and custom ads with bidding slots.",
};

export default async function PremiumAdsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/dashboard/premium-ads");
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <PremiumAdsClient />
    </Suspense>
  );
}
