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
  Briefcase,
  ShoppingBag,
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

type PromoteItem = {
  id: string;
  title: string;
  status?: string | null;
  city?: string | null;
  country?: string | null;
  category?: string | null;
};

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

  const [linkedJobId, setLinkedJobId] = useState("");
  const [linkedListingId, setLinkedListingId] = useState("");
  const [promoteItems, setPromoteItems] = useState<PromoteItem[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PromoteItem | null>(null);

  const isPromote = kind === "job" || kind === "market";

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/premium-ads?catalog=1");
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "Failed");
        const list: Slot[] = (j.slots || []).filter(
          (s: Slot) => s.id !== "job_promote" && s.id !== "listing_promote"
        );
        setSlots(list);
        setTopBySlot(j.topBySlot || {});
        if (list[0]) setSlotId(list[0].id);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Could not load slots");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isPromote) {
      setPromoteItems([]);
      setLinkedJobId("");
      setLinkedListingId("");
      setSelectedItem(null);
      return;
    }
    let cancelled = false;
    setLoadingTargets(true);
    setSelectedItem(null);
    setLinkedJobId("");
    setLinkedListingId("");
    void fetch(`/api/premium-ads/promote-targets?kind=${kind}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.error) toast.error(j.error);
        setPromoteItems(j.items || []);
      })
      .catch(() => {
        if (!cancelled) setPromoteItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingTargets(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind, isPromote]);

  const selected = useMemo(() => slots.find((s) => s.id === slotId), [slots, slotId]);

  const minPrice = useMemo(() => {
    if (!selected) return 0;
    const top = topBySlot[selected.id];
    if (top?.price) return top.price + Number(selected.min_bid_increment_sar);
    return Number(selected.base_price_sar);
  }, [selected, topBySlot]);

  useEffect(() => {
    if (isPromote) {
      setPrice(0);
      return;
    }
    if (selected) setPrice(minPrice);
  }, [selected, minPrice, isPromote, duration]);

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
    if (isPromote) {
      if (kind === "job" && !linkedJobId) {
        toast.error("Select a job to promote");
        return;
      }
      if (kind === "market" && !linkedListingId) {
        toast.error("Select a listing to promote");
        return;
      }
    } else {
      if (!slotId || !title.trim() || !targetUrl.trim()) {
        toast.error("Fill placement, headline and URL");
        return;
      }
    }

    setSaving(true);
    try {
      const body = isPromote
        ? {
            ad_kind: kind,
            linked_job_id: kind === "job" ? linkedJobId : null,
            linked_listing_id: kind === "market" ? linkedListingId : null,
            title: selectedItem?.title || title || "Promotion",
            target_url:
              kind === "job"
                ? `https://hunared.com/jobs/${linkedJobId}`
                : `https://hunared.com/market/${linkedListingId}`,
            duration_days: duration,
            offered_price_sar: 0,
          }
        : {
            slot_id: slotId,
            ad_kind: kind,
            title: title.trim(),
            target_url: targetUrl.trim(),
            image_url: imageUrl.trim() || null,
            design_notes: designNotes.trim() || null,
            offered_price_sar: Number(price),
            duration_days: duration,
            submit_for_payment: true,
          };

      const res = await fetch("/api/premium-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      toast.success(
        isPromote
          ? "Promotion submitted — admin will review and go live"
          : "Campaign created — complete payment to request approval"
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
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-12">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
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

      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" />
          Create campaign
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          {isPromote
            ? "Select a published post to rank at the top of search results."
            : "Choose placement, creative, and budget — then submit for payment and review."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
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

          {/* Promote picker */}
          {isPromote && (
            <section className="rounded-2xl border border-border/70 bg-card/40 p-4 sm:p-5 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Select {kind === "job" ? "job" : "listing"} to promote
              </h2>
              <p className="text-xs text-muted-foreground">
                Choose one of your posts. When approved and live, it ranks first in{" "}
                {kind === "job" ? "Jobs" : "Marketplace"} results.
              </p>
              {loadingTargets ? (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading your posts…
                </p>
              ) : promoteItems.length === 0 ? (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm text-amber-700 dark:text-amber-300">
                  No posts found for this account. Publish a{" "}
                  {kind === "job" ? "job" : "listing"} first, then come back.
                  <div className="mt-2">
                    <Button type="button" size="sm" variant="outline" asChild>
                      <Link href={kind === "job" ? "/jobs/new" : "/market/new"}>
                        {kind === "job" ? "Post a job" : "Post a listing"}
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1">
                  {promoteItems.map((item) => {
                    const selectedId = kind === "job" ? linkedJobId : linkedListingId;
                    const on = selectedId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedItem(item);
                          if (kind === "job") {
                            setLinkedJobId(item.id);
                            setLinkedListingId("");
                          } else {
                            setLinkedListingId(item.id);
                            setLinkedJobId("");
                          }
                          setTitle(item.title || "");
                        }}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2.5 text-left transition-all",
                          on
                            ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                            : "border-border bg-background/40 hover:bg-muted/40"
                        )}
                      >
                        <p className="text-sm font-medium line-clamp-1 flex items-center gap-1.5">
                          {kind === "job" ? (
                            <Briefcase className="h-3.5 w-3.5 shrink-0 text-primary" />
                          ) : (
                            <ShoppingBag className="h-3.5 w-3.5 shrink-0 text-primary" />
                          )}
                          {item.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {[item.city, item.country].filter(Boolean).join(", ") || "—"}
                          {item.status ? ` · ${item.status}` : ""}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Placement — Brand only */}
          {!isPromote && (
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
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {s.size_label}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                        {s.description}
                      </p>
                      <p className="text-xs mt-1.5">
                        From <strong>{min} {s.currency || "USD"}</strong>
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Creative — Brand only */}
          {!isPromote && (
            <section className="rounded-2xl border border-border/70 bg-card/40 p-4 sm:p-5 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                3. Creative
              </h2>
              <div className="space-y-2">
                <label className="text-sm font-medium">Campaign Title</label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your campaign title"
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
                  placeholder="https://hunared.com/…"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Banner Image URL (or upload)</label>
                <div className="flex flex-wrap gap-2">
                  <input
                    className="flex-1 min-w-[200px] rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://…"
                  />
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
                    Upload
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (optional)</label>
                <textarea
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm min-h-[72px]"
                  value={designNotes}
                  onChange={(e) => setDesignNotes(e.target.value)}
                  placeholder="Any notes for the ad review team"
                />
              </div>
            </section>
          )}

          {/* Duration */}
          <section className="rounded-2xl border border-border/70 bg-card/40 p-4 sm:p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {isPromote ? "2. Duration" : "4. Duration"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d.days}
                  type="button"
                  onClick={() => setDuration(d.days)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left transition-all",
                    duration === d.days
                      ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                      : "border-border bg-background/40 hover:bg-muted/40"
                  )}
                >
                  <p className="text-sm font-semibold">{d.label}</p>
                  <p className="text-[11px] text-muted-foreground">{d.hint}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Price — Brand only */}
          {!isPromote && (
            <section className="rounded-2xl border border-border/70 bg-card/40 p-4 sm:p-5 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                5. Bid (USD)
              </h2>
              <input
                type="number"
                min={minPrice}
                step={1}
                className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Minimum for this slot: {minPrice} USD</p>
            </section>
          )}
        </div>

        {/* Right — Preview / summary */}
        <div className="xl:col-span-5 space-y-4">
          <div className="rounded-2xl border border-border/70 bg-card/40 p-4 sm:p-5 space-y-4 sticky top-24">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Preview
            </h2>

            {isPromote ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 min-h-[140px]">
                {selectedItem ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {kind === "job" ? "Job ranking boost" : "Listing ranking boost"}
                    </p>
                    <p className="text-base font-semibold leading-snug">{selectedItem.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {[selectedItem.city, selectedItem.country].filter(Boolean).join(", ") || "—"}
                      {selectedItem.status ? ` · ${selectedItem.status}` : ""}
                    </p>
                    <p className="text-xs text-primary mt-2">
                      When live, this post appears first in {kind === "job" ? "Jobs" : "Marketplace"}.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Select a {kind === "job" ? "job" : "listing"} to preview
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 overflow-hidden aspect-[728/90] flex items-center justify-center">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-muted-foreground text-xs p-4">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    {selected?.label || "Banner"} — {selected?.size_label || "728×90"}
                    <br />
                    Upload a creative to preview
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 text-sm">
              <h3 className="font-semibold">Campaign summary</h3>
              <div className="flex justify-between gap-2 text-muted-foreground">
                <span>Type</span>
                <span className="text-foreground font-medium">
                  {kind === "job"
                    ? "Promote job"
                    : kind === "market"
                      ? "Promote listing"
                      : "Brand ad"}
                </span>
              </div>
              {!isPromote && (
                <div className="flex justify-between gap-2 text-muted-foreground">
                  <span>Placement</span>
                  <span className="text-foreground font-medium">{selected?.label || "—"}</span>
                </div>
              )}
              <div className="flex justify-between gap-2 text-muted-foreground">
                <span>Duration</span>
                <span className="text-foreground font-medium">{duration} days</span>
              </div>
              <div className="flex justify-between gap-2 text-muted-foreground">
                <span>{isPromote ? "Fee" : "Bid"}</span>
                <span className="text-foreground font-medium">
                  {isPromote ? "Included — admin review" : `${price || 0} USD`}
                </span>
              </div>
            </div>

            {!isPromote && (
              <p className="text-xs text-muted-foreground rounded-lg bg-muted/40 px-3 py-2">
                {PREMIUM_ADS_ADMIN_CONTACT.note}{" "}
                <a className="text-primary underline" href={`mailto:${PREMIUM_ADS_ADMIN_CONTACT.email}`}>
                  {PREMIUM_ADS_ADMIN_CONTACT.email}
                </a>
              </p>
            )}

            <Button type="submit" disabled={saving} className="w-full h-11">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isPromote ? "Submit promotion" : "Create campaign"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
