"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  ImageIcon,
  Check,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  PREMIUM_AD_KINDS,
  DURATION_OPTIONS,
  PREMIUM_ADS_ADMIN_CONTACT,
  packagePrice,
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
  currency?: string;
};

type TopMap = Record<string, { price: number; ends_at: string | null }>;

function money(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${Math.round(n)}`;
  }
}

export function PremiumAdCreateForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [topBySlot, setTopBySlot] = useState<TopMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [kind, setKind] = useState<PremiumAdKind>("job");
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
        const list: Slot[] = j.slots || [];
        const seen = new Set<string>();
        const unique = list.filter((s) => {
          if (seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        });
        setSlots(unique);
        setTopBySlot(j.topBySlot || {});
        if (unique[0]) setSlotId(unique[0].id);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Could not load slots");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selected = useMemo(() => slots.find((s) => s.id === slotId), [slots, slotId]);
  const currency = selected?.currency || "USD";

  /** Floor for this slot + duration (beats top bid if needed) */
  const minPrice = useMemo(() => {
    if (!selected) return 0;
    const base = packagePrice(Number(selected.base_price_sar) || 0, duration);
    const top = topBySlot[selected.id];
    const inc = Number(selected.min_bid_increment_sar) || 5;
    if (top?.price) return Math.max(base, top.price + inc);
    return base;
  }, [selected, topBySlot, duration]);

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
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !title.trim()) {
      toast.error("Title and placement are required");
      return;
    }
    const p = typeof price === "number" ? price : Number(price);
    if (!p || p < minPrice) {
      toast.error(`Bid must be at least ${money(minPrice, currency)}`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/premium-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          slot_id: selected.id,
          title: title.trim(),
          target_url: targetUrl.trim() || null,
          image_url: imageUrl.trim() || null,
          design_notes: designNotes.trim() || null,
          offered_price_sar: p,
          duration_days: duration,
          submit_for_payment: true,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      toast.success("Campaign created — complete payment for approval");
      router.push("/dashboard/premium-ads");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-20 justify-center">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading placements…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-12 px-1">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard/premium-ads">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
      </div>

      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight">Create campaign</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Choose objective, placement, creative, and budget — then submit for payment and review.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        <div className="xl:col-span-8 space-y-5">
          {/* 1. Objective */}
          <section className="rounded-2xl border border-border bg-card/50 p-4 sm:p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              1. Objective
            </p>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {PREMIUM_AD_KINDS.map((k) => {
                const on = kind === k.id;
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => setKind(k.id)}
                    className={cn(
                      "relative rounded-xl border px-3.5 py-3.5 text-left transition-all",
                      on
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : "border-border bg-background/40 hover:border-primary/30 hover:bg-muted/30"
                    )}
                  >
                    {on && (
                      <span className="absolute top-2.5 right-2.5 text-primary">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <p className="text-sm font-semibold pr-5">{k.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                      {k.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Placement */}
          <section className="rounded-2xl border border-border bg-card/50 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                2. Placement & size
              </p>
              <span className="text-[11px] text-muted-foreground">
                {slots.length} placements · prices for {duration} days
              </span>
            </div>
            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active slots. Run the premium slots SQL seed, then refresh.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2.5 max-h-[min(28rem,55vh)] overflow-y-auto pr-1">
                {slots.map((s) => {
                  const pkg = packagePrice(Number(s.base_price_sar) || 0, duration);
                  const top = topBySlot[s.id];
                  const inc = Number(s.min_bid_increment_sar) || 5;
                  const min = top?.price ? Math.max(pkg, top.price + inc) : pkg;
                  const on = slotId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSlotId(s.id)}
                      className={cn(
                        "rounded-xl border px-3.5 py-3 text-left transition-all",
                        on
                          ? "border-primary bg-primary/10 ring-1 ring-primary/35"
                          : "border-border bg-background/40 hover:border-primary/25"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-snug">{s.label}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                          {s.size_label || `${s.width_px}×${s.height_px}`}
                        </span>
                      </div>
                      {s.description ? (
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                          {s.description}
                        </p>
                      ) : null}
                      <p className="text-xs font-medium text-primary mt-2">
                        From {money(min, s.currency || "USD")}
                        {top?.price ? (
                          <span className="text-muted-foreground font-normal"> · top bid active</span>
                        ) : null}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* 3. Creative — professional */}
          <section className="rounded-2xl border border-border bg-card/50 p-4 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                3. Creative
              </p>
              <span className="text-[10px] text-muted-foreground">
                JPG, PNG, WebP or GIF · max 5MB
              </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-5">
              {/* Upload / preview column */}
              <div className="lg:col-span-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onUpload(f);
                  }}
                />
                <div
                  className={cn(
                    "relative rounded-xl border border-dashed min-h-[160px] flex flex-col items-center justify-center gap-2 p-4 text-center transition-colors",
                    imageUrl
                      ? "border-border bg-muted/15"
                      : "border-border/80 bg-muted/10 hover:border-primary/40 hover:bg-primary/5"
                  )}
                >
                  {imageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Creative"
                        className="max-h-36 w-full object-contain rounded-md"
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          disabled={uploading}
                          onClick={() => fileRef.current?.click()}
                        >
                          {uploading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <Upload className="h-3.5 w-3.5 mr-1" />
                          )}
                          Replace
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-destructive"
                          onClick={() => setImageUrl("")}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-9 w-9 text-muted-foreground/45" />
                      <p className="text-xs text-muted-foreground max-w-[200px]">
                        {selected
                          ? `Recommended ${selected.size_label || `${selected.width_px}×${selected.height_px}`}`
                          : "Select a placement first"}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="mt-1 h-9"
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                            Uploading…
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-1.5" />
                            Upload image
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="lg:col-span-3 space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">
                    Campaign title <span className="text-destructive">*</span>
                  </label>
                  <input
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Safety officer jobs — Jubail"
                    required
                    maxLength={120}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Destination URL</label>
                  <input
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://hunared.com/jobs/..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">
                    Banner image URL{" "}
                    <span className="text-muted-foreground font-normal">(or upload)</span>
                  </label>
                  <input
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://… or use Upload image"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Design notes (optional)</label>
                  <textarea
                    className="w-full min-h-[72px] px-3 py-2 rounded-lg border border-input bg-background text-sm resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={designNotes}
                    onChange={(e) => setDesignNotes(e.target.value)}
                    placeholder="Logo placement, colors, text on creative…"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 4. Duration & bid — professional */}
          <section className="rounded-2xl border border-border bg-card/50 p-4 sm:p-6 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              4. Duration & bid
            </p>

            <div className="space-y-2">
              <label className="text-xs font-medium">Campaign length</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {DURATION_OPTIONS.map((d) => {
                  const on = duration === d.days;
                  const sample = selected
                    ? packagePrice(Number(selected.base_price_sar) || 0, d.days)
                    : null;
                  return (
                    <button
                      key={d.days}
                      type="button"
                      onClick={() => setDuration(d.days)}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-left transition-all",
                        on
                          ? "border-primary bg-primary/10 ring-1 ring-primary/35"
                          : "border-border bg-background/40 hover:border-primary/25"
                      )}
                    >
                      <span className="text-sm font-semibold block">{d.label}</span>
                      <span className="text-[10px] text-muted-foreground">{d.hint}</span>
                      {sample != null ? (
                        <span className="block text-[11px] text-primary font-medium mt-1">
                          {money(sample, currency)}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Longer campaigns cost more (package pricing). Changing duration updates the minimum bid.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-background/50 p-4 grid sm:grid-cols-2 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">
                  Your bid ({currency}) — min {money(minPrice, currency)}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    min={minPrice}
                    step={1}
                    className="w-full h-11 pl-7 pr-3 rounded-lg border border-input bg-background text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    required
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 sm:text-right">
                <p>
                  Base for {duration} days:{" "}
                  <span className="text-foreground font-medium">
                    {selected
                      ? money(
                          packagePrice(Number(selected.base_price_sar) || 0, duration),
                          currency
                        )
                      : "—"}
                  </span>
                </p>
                <p>Higher bids can take a slot if another ad is live (after approval).</p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="xl:col-span-4 space-y-4 xl:sticky xl:top-20 self-start">
          <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              Preview
            </p>
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 min-h-[140px] flex flex-col items-center justify-center gap-2 p-4 text-center">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Creative preview"
                  className="max-h-32 w-full object-contain rounded-md"
                />
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground/45" />
                  <p className="text-xs text-muted-foreground">
                    {selected
                      ? `${selected.label} — ${selected.size_label || `${selected.width_px}×${selected.height_px}`}`
                      : "Select a placement"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Upload a creative to preview</p>
                </>
              )}
            </div>
            {title ? (
              <p className="text-sm font-medium line-clamp-2 text-center sm:text-left">{title}</p>
            ) : null}
            <p className="text-[10px] text-muted-foreground text-center">
              {selected
                ? `${selected.width_px}×${selected.height_px}px · live size ratio`
                : "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold">Campaign summary</h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Placement</dt>
                <dd className="font-medium text-right">{selected?.label || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="font-medium">{duration} days</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-border/60 pt-2">
                <dt className="text-muted-foreground">Bid</dt>
                <dd className="font-semibold text-primary text-base">
                  {price === "" ? "—" : money(Number(price), currency)}
                </dd>
              </div>
            </dl>
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-[11px] text-muted-foreground leading-relaxed">
              {PREMIUM_ADS_ADMIN_CONTACT.note}{" "}
              <a
                className="text-primary underline"
                href={`mailto:${PREMIUM_ADS_ADMIN_CONTACT.email}`}
              >
                {PREMIUM_ADS_ADMIN_CONTACT.email}
              </a>
            </div>
            <Button type="submit" disabled={saving || !slots.length} className="w-full h-11">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating…
                </>
              ) : (
                "Create campaign"
              )}
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
