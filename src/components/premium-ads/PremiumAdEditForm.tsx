"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  PREMIUM_AD_KINDS,
  DURATION_OPTIONS,
  type PremiumAdKind,
} from "@/lib/premium-ads/constants";

export function PremiumAdEditForm({ adId }: { adId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState<PremiumAdKind>("standalone");
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [designNotes, setDesignNotes] = useState("");
  const [duration, setDuration] = useState(7);
  const [price, setPrice] = useState<number | "">("");
  const [slotLabel, setSlotLabel] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/premium-ads/${adId}`);
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "Not found");
        const ad = j.ad;
        setStatus(ad.status);
        setKind(ad.ad_kind);
        setTitle(ad.title || "");
        setTargetUrl(ad.target_url || "");
        setImageUrl(ad.image_url || "");
        setDesignNotes(ad.design_notes || "");
        setDuration(ad.duration_days || 7);
        setPrice(Number(ad.offered_price_sar));
        setSlotLabel(ad.slot?.label || ad.slot_id);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Failed to load");
        router.push("/dashboard/premium-ads");
      } finally {
        setLoading(false);
      }
    })();
  }, [adId, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !targetUrl.trim()) {
      toast.error("Title and target URL are required");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        action: "update",
        title: title.trim(),
        target_url: targetUrl.trim(),
        image_url: imageUrl.trim() || null,
        design_notes: designNotes.trim() || null,
        duration_days: duration,
        ad_kind: kind,
        resubmit: status === "rejected",
      };
      if (status !== "active" && price !== "") {
        body.offered_price_sar = Number(price);
      }
      const res = await fetch(`/api/premium-ads/${adId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      toast.success(
        status === "active"
          ? "Updated — pending re-approval"
          : "Ad updated"
      );
      router.push("/dashboard/premium-ads");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/premium-ads">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Link>
      </Button>
      <div>
        <h1 className="text-xl font-bold">Edit premium ad</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Slot: {slotLabel} · Status: {status}
          {status === "active" && " — saving will send the ad for re-approval"}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Promote</label>
          <div className="grid sm:grid-cols-3 gap-2">
            {PREMIUM_AD_KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                className={
                  kind === k.id
                    ? "rounded-xl border border-primary bg-primary/10 px-3 py-3 text-left"
                    : "rounded-xl border border-border bg-card/40 px-3 py-3 text-left hover:bg-muted/40"
                }
              >
                <p className="text-sm font-semibold">{k.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ad title</label>
          <input
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={120}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Click target URL</label>
          <input
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Creative image URL</label>
          <input
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Design notes</label>
          <textarea
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[72px]"
            value={designNotes}
            onChange={(e) => setDesignNotes(e.target.value)}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Duration</label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d.days} value={d.days}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          {status !== "active" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Offer price (SAR)</label>
              <input
                type="number"
                min={1}
                step="1"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>
          )}
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
