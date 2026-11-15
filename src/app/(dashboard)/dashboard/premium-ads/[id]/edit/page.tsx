import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PremiumAdEditForm } from "@/components/premium-ads/PremiumAdEditForm";

export const dynamic = "force-dynamic";

export default async function EditPremiumAdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const { id } = await params;
  return (
    <div className="w-full">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground text-center py-16">Loading…</p>
        }
      >
        <PremiumAdEditForm adId={id} />
      </Suspense>
    </div>
  );
}
