import { createAdminClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Megaphone } from "lucide-react";
import { AdSlotEditor } from "@/components/admin/AdSlotEditor";
import { AddAdSlotForm } from "@/components/admin/AddAdSlotForm";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();

  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (caller?.role !== "admin") redirect("/dashboard");

  const { data: placements = [] } = await supabase
    .from("ad_placements")
    .select("*")
    .order("slot_name", { ascending: true });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Megaphone className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Ad Placements</h1>
            <p className="text-xs text-muted-foreground">
              Manage Google AdSense and custom banner slots sitewide. User-paid campaigns are reviewed under{" "}
              <a href="/dashboard/premium-ads/admin" className="text-primary underline">
                Premium Ads
              </a>
              .
            </p>
          </div>
        </div>
        <AddAdSlotForm />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{placements?.length ?? 0} total slots</span>
        <span>·</span>
        <span className="text-green-600 font-medium">
          {placements?.filter((p) => p.is_active).length ?? 0} active
        </span>
        <span>·</span>
        <span>
          {placements?.filter((p) => p.ad_type === "adsense").length ?? 0} AdSense /{" "}
          {placements?.filter((p) => p.ad_type === "custom").length ?? 0} Custom
        </span>
      </div>

      {/* No slots yet */}
      {!placements?.length && (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground space-y-2">
          <Megaphone className="h-8 w-8 mx-auto opacity-30" />
          <p className="text-sm font-medium">No ad slots yet</p>
          <p className="text-xs">
            Click &ldquo;Add Slot&rdquo; above to create your first placement.
          </p>
        </div>
      )}

      {/* Slots grid */}
      {!!placements?.length && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {placements.map((placement) => (
            <AdSlotEditor key={placement.id} placement={placement} />
          ))}
        </div>
      )}

      {/* Usage guide */}
      <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          How to use
        </p>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
          <li>
            Add <code className="bg-muted px-1 rounded">NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX</code> to your{" "}
            <code className="bg-muted px-1 rounded">.env.local</code>.
          </li>
          <li>
            Create a slot here with a unique <strong>slot_name</strong> (e.g.{" "}
            <code className="bg-muted px-1 rounded">header</code>).
          </li>
          <li>
            Drop{" "}
            <code className="bg-muted px-1 rounded">
              {"<AdSlot slotName=\"header\" />"}
            </code>{" "}
            anywhere in your page components.
          </li>
          <li>Toggle the slot active — the component auto-hides when inactive.</li>
        </ol>
      </div>
    </div>
  );
}
