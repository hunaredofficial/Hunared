"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, Plus, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  PREMIUM_AD_STATUS_LABEL,
  type PremiumAdStatus,
  PREMIUM_ADS_ADMIN_CONTACT,
} from "@/lib/premium-ads/constants";
import { cn } from "@/lib/utils";

type Ad = {
  id: string;
  title: string;
  ad_kind: string;
  status: PremiumAdStatus;
  offered_price_sar: number;
  currency: string;
  duration_days: number;
  target_url: string;
  image_url?: string | null;
  payment_note?: string | null;
  admin_note?: string | null;
  ends_at?: string | null;
  slot?: { label: string; size_label: string; id: string };
};

export function PremiumAdsClient() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [payNote, setPayNote] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/premium-ads");
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      setAds(j.ads || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not load ads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submitPayment(id: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/premium-ads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_payment",
          payment_note: payNote[id] || "",
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      toast.success("Submitted for admin approval");
      void load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Premium Ads
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Promote jobs, marketplace listings, or custom creatives. Higher bids can take the top
            slot after admin approval.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/premium-ads/new">
            <Plus className="h-4 w-4 mr-1" />
            Create ad
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border/70 bg-card/40 px-4 py-3 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">How it works</p>
        <ol className="list-decimal list-inside space-y-0.5 text-xs sm:text-sm">
          <li>Choose a slot size and design your creative</li>
          <li>Set your price (must beat the current top bid if the slot is occupied)</li>
          <li>Pay and send payment reference to admin</li>
          <li>Admin approves → your ad goes live for the selected duration</li>
        </ol>
        <p className="text-xs pt-1">
          Admin contact:{" "}
          <a className="text-primary underline" href={`mailto:${PREMIUM_ADS_ADMIN_CONTACT.email}`}>
            {PREMIUM_ADS_ADMIN_CONTACT.email}
          </a>
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : ads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground mb-3">No premium ads yet.</p>
          <Button asChild>
            <Link href="/dashboard/premium-ads/new">Create your first ad</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {ads.map((ad) => (
            <li
              key={ad.id}
              className="rounded-xl border border-border/70 bg-card/50 p-4 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{ad.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ad.slot?.label || ad.slot?.id} · {ad.slot?.size_label} · {ad.ad_kind} ·{" "}
                    {ad.duration_days} days
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    ad.status === "active" && "border-emerald-500/50 text-emerald-400",
                    ad.status === "pending_approval" && "border-amber-500/50 text-amber-400",
                    ad.status === "rejected" && "border-destructive/50 text-destructive"
                  )}
                >
                  {PREMIUM_AD_STATUS_LABEL[ad.status] || ad.status}
                </Badge>
              </div>
              <p className="text-sm">
                Offer:{" "}
                <span className="font-semibold">
                  {ad.offered_price_sar} {ad.currency}
                </span>
                {ad.ends_at && ad.status === "active" && (
                  <span className="text-muted-foreground text-xs ml-2">
                    until {new Date(ad.ends_at).toLocaleDateString()}
                  </span>
                )}
              </p>
              {ad.admin_note && (
                <p className="text-xs text-muted-foreground">Admin: {ad.admin_note}</p>
              )}
              {ad.target_url && (
                <a
                  href={ad.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary inline-flex items-center gap-1"
                >
                  Target URL <ExternalLink className="h-3 w-3" />
                </a>
              )}

              {(ad.status === "pending_payment" || ad.status === "draft") && (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">{PREMIUM_ADS_ADMIN_CONTACT.note}</p>
                  <input
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Payment reference / transfer note"
                    value={payNote[ad.id] || ""}
                    onChange={(e) => setPayNote((p) => ({ ...p, [ad.id]: e.target.value }))}
                  />
                  <Button
                    size="sm"
                    disabled={busy === ad.id}
                    onClick={() => void submitPayment(ad.id)}
                  >
                    {busy === ad.id ? "Submitting…" : "I paid — request approval"}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
