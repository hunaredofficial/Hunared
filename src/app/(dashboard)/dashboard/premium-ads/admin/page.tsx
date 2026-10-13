import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";
import { PremiumAdsAdminClient } from "@/components/premium-ads/PremiumAdsAdminClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Premium Ads Admin | Hunared" };

export default async function PremiumAdsAdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.role !== "admin" && profile?.role !== "team") {
    redirect("/dashboard/premium-ads");
  }
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <PremiumAdsAdminClient />
    </Suspense>
  );
}
