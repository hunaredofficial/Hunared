import { createAdminClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import type { Listing } from "@/types/database";
import { EditListingForm } from "@/components/market/EditListingForm";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("marketplace_listings")
    .select("*")
    .eq("id", id)
    .eq("seller_id", userId) // Only owner can edit
    .single();

  const listing = data as Listing | null;
  if (!listing) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Listing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Saving will resubmit your listing for admin review.
        </p>
      </div>
      <EditListingForm listing={listing} />
    </div>
  );
}
