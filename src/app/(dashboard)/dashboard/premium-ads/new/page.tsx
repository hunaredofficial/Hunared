import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PremiumAdCreateForm } from "@/components/premium-ads/PremiumAdCreateForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Create Premium Ad | Hunared" };

export default async function NewPremiumAdPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/dashboard/premium-ads/new");
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <PremiumAdCreateForm />
    </Suspense>
  );
}
