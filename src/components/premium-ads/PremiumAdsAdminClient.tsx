"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PREMIUM_AD_STATUS_LABEL, type PremiumAdStatus } from "@/lib/premium-ads/constants";

type Ad = {
  id: string;
  title: string;
  status: PremiumAdStatus;
  offered_price_sar: number;
  currency: string;
  payment_note?: string | null;
  target_url: string;
  image_url?: string | null;
  user_id: string;
  slot?: { label: string; size_label: string };
};

export function PremiumAdsAdminClient() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/premium-ads");
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Forbidden");
      setAds(j.ads || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(id: string, action: "approve" | "reject") {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/premium-ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      toast.success(action === "approve" ? "Published" : "Rejected");
      void load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-xl font-bold">Premium Ads — Admin</h1>
      <p className="text-sm text-muted-foreground">
        Review payment notes, approve to publish (highest bid wins the slot), or reject.
      </p>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <ul className="space-y-3">
          {ads.map((ad) => (
            <li key={ad.id} className="rounded-xl border border-border/70 bg-card/50 p-4 space-y-2">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-semibold">{ad.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {ad.slot?.label} · {ad.slot?.size_label} · {ad.offered_price_sar} {ad.currency}
                  </p>
                </div>
                <Badge variant="outline">{PREMIUM_AD_STATUS_LABEL[ad.status] || ad.status}</Badge>
              </div>
              {ad.payment_note && (
                <p className="text-xs">Payment note: {ad.payment_note}</p>
              )}
              <a href={ad.target_url} className="text-xs text-primary break-all" target="_blank" rel="noreferrer">
                {ad.target_url}
              </a>
              {(ad.status === "pending_approval" || ad.status === "pending_payment") && (
                <div className="flex gap-2 pt-1">
                  <Button size="sm" disabled={busy === ad.id} onClick={() => void act(ad.id, "approve")}>
                    Approve & publish
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy === ad.id}
                    onClick={() => void act(ad.id, "reject")}
                  >
                    Reject
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
