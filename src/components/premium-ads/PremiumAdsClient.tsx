"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, Plus, ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react";
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

const canEdit = (s: PremiumAdStatus) =>
  ["draft", "pending_payment", "pending_approval", "rejected", "outbid", "active"].includes(s);

const canDelete = (s: PremiumAdStatus) =>
  ["draft", "pending_payment", "rejected", "outbid", "pending_approval", "expired", "active", "scheduled"].includes(s);

export function PremiumAdsClient() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [payNote, setPayNote] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ad | null>(null);
  const [deleteTyped, setDeleteTyped] = useState("");

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

  function openDeleteModal(ad: Ad) {
    setDeleteTarget(ad);
    setDeleteTyped("");
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTyped.trim() !== "Delete") {
      toast.error('Type "Delete" exactly to confirm');
      return;
    }
    const id = deleteTarget.id;
    setBusy(id);
    try {
      const res = await fetch(`/api/premium-ads/${id}`, { method: "DELETE" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Failed");
      if (j.expired || j.status === "expired") {
        toast.success("Ad deleted — marked as Expired");
      } else {
        toast.success("Ad deleted");
      }
      setDeleteTarget(null);
      setDeleteTyped("");
      void load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  function statusLabel(ad: Ad): string {
    if (
      ad.status === "expired" &&
      (ad.admin_note || "").toLowerCase().includes("deleted by advertiser")
    ) {
      return "Deleted · Expired";
    }
    return PREMIUM_AD_STATUS_LABEL[ad.status] || ad.status;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Premium Ads
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Promote jobs, marketplace listings, or custom creatives. Edit anytime before go-live;
            live creative changes need re-approval.
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
          <li>Admin approves → your ad goes live</li>
          <li>Edit title, image, URL, or bid anytime from this list</li>
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
        <div className="rounded-2xl border border-dashed border-border bg-card/30 px-6 py-16 sm:py-20 text-center flex flex-col items-center justify-center max-w-xl mx-auto">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Megaphone className="h-6 w-6 text-primary" />
          </div>
          <p className="text-base font-medium text-foreground mb-1">No premium ads yet</p>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm">
            Promote a job, listing, or brand creative on high-visibility placements across Hunared.
          </p>
          <Button asChild size="lg" className="h-11 px-6">
            <Link href="/dashboard/premium-ads/new">
              <Plus className="h-4 w-4 mr-1.5" />
              Create your first ad
            </Link>
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
                    ad.status === "rejected" && "border-destructive/50 text-destructive",
                    ad.status === "expired" && "border-muted-foreground/40 text-muted-foreground"
                  )}
                >
                  {statusLabel(ad)}
                </Badge>
              </div>
              <p className="text-sm">
                Offer:{" "}
                <span className="font-semibold">
                  ${ad.offered_price_sar} {ad.currency || "USD"}
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

              <div className="flex flex-wrap gap-2">
                {canEdit(ad.status) && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/premium-ads/${ad.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Link>
                  </Button>
                )}
                {canDelete(ad.status) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    disabled={busy === ad.id}
                    onClick={() => openDeleteModal(ad)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                )}
              </div>

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

      {/* Type "Delete" to confirm */}
      {deleteTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold">Delete this ad?</h2>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{deleteTarget.title}</span>
              {(deleteTarget.status === "active" || deleteTarget.status === "scheduled") && (
                <>
                  {" "}
                  is <span className="text-foreground font-medium">LIVE</span> and will be
                  taken offline immediately.
                </>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              Type <span className="font-mono text-foreground font-semibold">Delete</span> to
              confirm. The campaign will move to{" "}
              <span className="text-foreground font-medium">Expired</span> and show as deleted.
            </p>
            <input
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
              value={deleteTyped}
              onChange={(e) => setDeleteTyped(e.target.value)}
              placeholder='Type "Delete" to confirm'
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") void confirmDelete();
              }}
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                disabled={busy === deleteTarget.id}
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteTyped("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={busy === deleteTarget.id || deleteTyped.trim() !== "Delete"}
                onClick={() => void confirmDelete()}
              >
                {busy === deleteTarget.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Deleting…
                  </>
                ) : (
                  "Delete ad"
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
