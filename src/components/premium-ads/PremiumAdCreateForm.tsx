"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  PREMIUM_AD_KINDS,
  DURATION_OPTIONS,
  PREMIUM_ADS_ADMIN_CONTACT,
  type PremiumAdKind,
} from "@/lib/premium-ads/constants";
import { cn } from "@/lib/utils";

type Slot = {
  id: string;
  label: string;
  description: string | null;
  placement: string;
  width_px: number;
  height_px: number;
  size_label: string;
  base_price_sar: number;
  min_bid_increment_sar: number;
  currency: string;
};

type TopMap = Record<string, { price: number; ends_at: string | null }>;

export function PremiumAdCreateForm() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [topBySlot, setTopBySlot] = useState<TopMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [kind, setKind] = useState<PremiumAdKind>("standalone");
  const [slotId, setSlotId] = useState("");
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [designNotes, setDesignNotes] = useState("");
  const [duration, setDuration] = useState(7);
  const [price, setPrice] = useState<number | "">("");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/premium-ads?catalog=1");
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "Failed");
        setSlots(j.slots || []);
        setTopBySlot(j.topBySlot || {});
        if (j.slots?.[0]) setSlotId(j.slots[0].id);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Could not load slots");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selected = useMemo(() => slots.find((s) => s.id === slotId), [slots, slotId]);

  const minPrice = useMemo(() => {
    if (!selected) return 0;
    const top = topBySlot[selected.id];
    if (top?.price) return top.price + Number(selected.min_bid_increment_sar);
    return Number(selected.base_price_sar);
  }, [selected, topBySlot]);

  useEffect(() => {
    if (selected) setPrice(minPrice);
  }, [selected, minPrice]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !title.trim() || !targetUrl.trim()) {
      toast.error("Fill title, target URL, and slot");
      return;
    }
    const p = Number(price);
    if (!Number.isFinite(p) || p < minPrice) {
      toast.error(`Price must be at least ${minPrice} ${selected.currency}`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/premium-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot_id: slotId,
          ad_kind: kind,
          title: title.trim(),
          target_url: targetUrl.trim(),
          image_url: imageUrl.trim() || null,
          design_notes: designNotes.trim() || null,
          offered_price_sar: p,
          duration_days: duration,
          submit_for_payment: true,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      toast.success("Ad created — complete payment to request approval");
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
        <Loader2 className="h-4 w-4 animate-spin" /> Loading slots…
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
        <h1 className="text-xl font-bold">Create premium ad</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose what to promote, pick a slot size, set your bid, then pay for admin approval.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Kind */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Promote</label>
          <div className="grid sm:grid-cols-3 gap-2">
            {PREMIUM_AD_KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-left transition-colors",
                  kind === k.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card/40 hover:bg-muted/40"
                )}
              >
                <p className="text-sm font-semibold">{k.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{k.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Slot */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Slot & size</label>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {slots.map((s) => {
              const top = topBySlot[s.id];
              const min = top?.price
                ? top.price + Number(s.min_bid_increment_sar)
                : Number(s.base_price_sar);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSlotId(s.id)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-3 text-left transition-colors",
                    slotId === s.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card/40 hover:bg-muted/40"
                  )}
                >
                  <div className="flex justify-between gap-2">
                    <p className="text-sm font-semibold">{s.label}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{s.size_label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.description}</p>
                  <p className="text-xs mt-1">
                    From <strong>{min} {s.currency}</strong>
                    {top?.price ? (
                      <span className="text-muted-foreground">
                        {" "}
                        (current top {top.price} — bid +{s.min_bid_increment_sar} min)
                      </span>
                    ) : (
                      <span className="text-muted-foreground"> (base price)</span>
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Design canvas {s.width_px}×{s.height_px}px
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ad title</label>
          <input
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Hiring Instrument Technicians — Jubail"
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
            placeholder="https://hunared.com/jobs/… or your company page"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Creative image URL (optional)</label>
          <input
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://… (match slot size for best results)"
          />
          <p className="text-[11px] text-muted-foreground">
            Design your banner at the slot size above, host the image, paste the URL. Or leave empty
            and note design needs for admin.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Design notes for admin</label>
          <textarea
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[72px]"
            value={designNotes}
            onChange={(e) => setDesignNotes(e.target.value)}
            placeholder="Colors, text, logo, or “we will email the final creative”"
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
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Your price ({selected?.currency || "SAR"}) — min {minPrice}
            </label>
            <input
              type="number"
              min={minPrice}
              step="1"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground text-sm">Payment & approval</p>
          <p>{PREMIUM_ADS_ADMIN_CONTACT.note}</p>
          <p>
            Contact:{" "}
            <a className="text-primary underline" href={`mailto:${PREMIUM_ADS_ADMIN_CONTACT.email}`}>
              {PREMIUM_ADS_ADMIN_CONTACT.email}
            </a>
          </p>
        </div>

        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? "Creating…" : "Create ad & continue to payment"}
        </Button>
      </form>
    </div>
  );
}
