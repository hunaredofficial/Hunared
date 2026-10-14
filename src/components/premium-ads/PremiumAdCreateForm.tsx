"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Upload,
  ImageIcon,
  Check,
  Megaphone,
} from "lucide-react";
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [topBySlot, setTopBySlot] = useState<TopMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [kind, setKind] = useState<PremiumAdKind>("standalone");
  const [slotId, setSlotId] = useState("");
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [designNotes, setDesignNotes] = useState("");
  const [duration, setDuration] = useState(14);
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

  async function onUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/premium-ads/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Upload failed");
      setImageUrl(j.url);
      toast.success("Creative uploaded");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

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
      toast.success("Campaign created — complete payment to request approval");
      router.push("/dashboard/premium-ads");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-12">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading placements…
      </div>
    );
  }

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/premium-ads">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Create campaign
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Choose objective, placement, creative, and budget — then submit for payment and review.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        {/* Left column — setup */}
        <div className="xl:col-span-7 space-y-6">
          {/* Objective */}
          <section className="rounded-2xl border border-border/70 bg-card/40 p-4 sm:p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              1. Objective
            </h2>
            <div className="grid sm:grid-cols-3 gap-2">
              {PREMIUM_AD_KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKind(k.id)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-left transition-all",
                    kind === k.id
                      ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                      : "border-border bg-background/40 hover:bg-muted/40"
                  )}
                >
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    {kind === k.id && <Check className="h-3.5 w-3.5 text-primary" />}
                    {k.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                    {k.description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Placement */}
          <section className="rounded-2xl border border-border/70 bg-card/40 p-4 sm:p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              2. Placement & size
            </h2>
            <div className="grid sm:grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
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
                      "w-full rounded-xl border px-3 py-3 text-left transition-all",
                      slotId === s.id
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : "border-border bg-background/40 hover:bg-muted/40"
                    )}
                  >
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-semibold">{s.label}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                        {s.size_label}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                      {s.description}
                    </p>
                    <p className="text-xs mt-1.5">
                      From{" "}
                      <strong>
                        {min} {s.currency}
                      </strong>
                      {top?.price ? (
                        <span className="text-muted-foreground">
                          {" "}
                          · top bid {top.price}
                        </span>
                      ) : null}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Creative */}
          <section className="rounded-2xl border border-border/70 bg-card/40 p-4 sm:p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              3. Creative
            </h2>
            <div className="space-y-2">
              <label className="text-sm font-medium">Headline</label>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Clear, benefit-focused headline"
                required
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination URL</label>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://hunared.com/… or your site"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ad image</label>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onUpload(f);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-1.5" />
                  )}
                  {uploading ? "Uploading…" : "Upload image"}
                </Button>
                <span className="text-[11px] text-muted-foreground self-center">
                  JPG / PNG / WebP · max 5MB · match slot size for best results
                </span>
              </div>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste image URL"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes for reviewer (optional)</label>
              <textarea
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[64px]"
                value={designNotes}
                onChange={(e) => setDesignNotes(e.target.value)}
                placeholder="Brand colors, offer text, or special instructions"
              />
            </div>
          </section>

          {/* Budget */}
          <section className="rounded-2xl border border-border/70 bg-card/40 p-4 sm:p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              4. Budget & schedule
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <div className="grid grid-cols-2 gap-2">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d.days}
                      type="button"
                      onClick={() => setDuration(d.days)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-sm",
                        duration === d.days
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted/40"
                      )}
                    >
                      <span className="font-medium">{d.label}</span>
                      <span className="block text-[10px] text-muted-foreground">{d.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Your bid ({selected?.currency || "SAR"}) — min {minPrice}
                </label>
                <input
                  type="number"
                  min={minPrice}
                  step="1"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Higher bids can take the top of a busy placement after admin approval.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right column — live preview + summary */}
        <div className="xl:col-span-5 space-y-4">
          <div className="xl:sticky xl:top-6 space-y-4">
            <section className="rounded-2xl border border-border/70 bg-card/50 p-4 sm:p-5 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Preview
              </h2>
              <div
                className="rounded-xl border border-dashed border-border/80 bg-muted/20 overflow-hidden flex items-center justify-center min-h-[100px]"
                style={{
                  aspectRatio: selected
                    ? `${selected.width_px} / ${selected.height_px}`
                    : "16/5",
                  maxHeight: 220,
                }}
              >
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt="Ad preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center px-4 py-6 text-muted-foreground text-xs">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    Upload a creative to preview
                    {selected && (
                      <p className="mt-1 font-mono opacity-70">
                        {selected.width_px}×{selected.height_px}px
                      </p>
                    )}
                  </div>
                )}
              </div>
              {title && (
                <p className="text-sm font-medium line-clamp-2">{title}</p>
              )}
              {targetUrl && (
                <p className="text-[11px] text-primary truncate">{targetUrl}</p>
              )}
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/50 p-4 sm:p-5 space-y-2 text-sm">
              <h2 className="text-sm font-semibold">Campaign summary</h2>
              <div className="flex justify-between gap-2 text-muted-foreground">
                <span>Placement</span>
                <span className="text-foreground text-right">{selected?.label || "—"}</span>
              </div>
              <div className="flex justify-between gap-2 text-muted-foreground">
                <span>Duration</span>
                <span className="text-foreground">{duration} days</span>
              </div>
              <div className="flex justify-between gap-2 text-muted-foreground">
                <span>Bid</span>
                <span className="text-foreground font-semibold">
                  {price === "" ? "—" : `${price} ${selected?.currency || "SAR"}`}
                </span>
              </div>
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-[11px] text-muted-foreground mt-2">
                {PREMIUM_ADS_ADMIN_CONTACT.note}
                <br />
                <a
                  className="text-primary underline"
                  href={`mailto:${PREMIUM_ADS_ADMIN_CONTACT.email}`}
                >
                  {PREMIUM_ADS_ADMIN_CONTACT.email}
                </a>
              </div>
              <Button type="submit" disabled={saving} className="w-full mt-2">
                {saving ? "Creating…" : "Create campaign"}
              </Button>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}
