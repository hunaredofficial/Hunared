import { createAdminClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Megaphone } from "lucide-react";
import { AdSlotEditor } from "@/components/admin/AdSlotEditor";
import { AddAdSlotForm } from "@/components/admin/AddAdSlotForm";
import { AD_SLOT_BY_ID } from "@/lib/ads/slots";

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

  const list = placements ?? [];

  // Sort: known catalog order first, then unknown
  const sorted = [...list].sort((a, b) => {
    const ia = AD_SLOT_BY_ID[a.slot_name]?.group || "ZZZ";
    const ib = AD_SLOT_BY_ID[b.slot_name]?.group || "ZZZ";
    if (ia !== ib) return ia.localeCompare(ib);
    return a.slot_name.localeCompare(b.slot_name);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Megaphone className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Ad Placements</h1>
            <p className="text-xs text-muted-foreground max-w-xl">
              Site slots for custom banners or Google AdSense. Names match live page components.
              Paid campaigns are managed under{" "}
              <a href="/dashboard/premium-ads/admin" className="text-primary underline">
                Premium Ads
              </a>
              .
            </p>
          </div>
        </div>
        <AddAdSlotForm />
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
        <span>{sorted.length} total slots</span>
        <span>·</span>
        <span className="text-emerald-600 font-medium">
          {sorted.filter((p) => p.is_active).length} active
        </span>
        <span>·</span>
        <span>
          {sorted.filter((p) => p.ad_type === "adsense").length} AdSense /{" "}
          {sorted.filter((p) => p.ad_type === "custom").length} Custom
        </span>
      </div>

      {!sorted.length && (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground space-y-2">
          <Megaphone className="h-8 w-8 mx-auto opacity-30" />
          <p className="text-sm font-medium">No ad slots yet</p>
          <p className="text-xs">
            Run <code className="bg-muted px-1 rounded">supabase/020_ad_slots_align.sql</code> then
            refresh, or click Add Slot.
          </p>
        </div>
      )}

      {!!sorted.length && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((placement) => (
            <AdSlotEditor key={placement.id} placement={placement} />
          ))}
        </div>
      )}

      <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Current site slots
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>
            <strong>Sitewide:</strong> header, header_leaderboard, header_mobile, footer,
            footer_banner
          </li>
          <li>
            <strong>Home:</strong> homepage_hero / home_hero, homepage_mid, homepage_inline
          </li>
          <li>
            <strong>Jobs:</strong> jobs_list_top, jobs_sidebar, jobs_inline, job_below_description
          </li>
          <li>
            <strong>Business:</strong> market_list_top, market_sidebar
          </li>
          <li>
            <strong>Directories:</strong> candidates_top (Talent), companies_top, learning_top
          </li>
          <li>
            <strong>Articles:</strong> blog_sidebar
          </li>
        </ul>
        <p className="text-[11px] text-muted-foreground pt-1">
          In code:{" "}
          <code className="bg-muted px-1 rounded">{'<AdSlot slotName="header" />'}</code> or{" "}
          <code className="bg-muted px-1 rounded">
            {'<PremiumAdSlot slotId="jobs_list_top" legacySlotName="jobs_list_top" />'}
          </code>
        </p>
      </div>
    </div>
  );
}
