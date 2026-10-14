"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  PREMIUM_AD_KINDS,
  DURATION_OPTIONS,
  type PremiumAdKind,
} from "@/lib/premium-ads/constants";

export function PremiumAdEditForm({ adId }: { adId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  async function onUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/premium-ads/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Upload failed");
      setImageUrl(j.url);
      toast.success("Image uploaded");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

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
      toast.success(status === "active" ? "Updated — pending re-approval" : "Ad updated");
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
    <div className="w-full max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/premium-ads">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Link>
      </Button>
      <div>
        <h1 className="text-xl font-bold">Edit campaign</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {slotLabel} · {status}
          {status === "active" ? " — save sends for re-approval" : ""}
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-2">
          {PREMIUM_AD_KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              className={
                kind === k.id
                  ? "rounded-xl border border-primary bg-primary/10 px-3 py-2 text-left text-sm font-semibold"
                  : "rounded-xl border border-border px-3 py-2 text-left text-sm"
              }
            >
              {k.label}
            </button>
          ))}
        </div>
        <input
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
          placeholder="Headline"
        />
        <input
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          required
          placeholder="Destination URL"
        />
        <div className="flex flex-wrap gap-2 items-center">
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
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
            Upload image
          </Button>
          <input
            className="flex-1 min-w-[180px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL"
          />
        </div>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="max-h-32 rounded-lg border border-border object-contain" />
        )}
        <textarea
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[64px]"
          value={designNotes}
          onChange={(e) => setDesignNotes(e.target.value)}
          placeholder="Design notes"
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <select
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            {DURATION_OPTIONS.map((d) => (
              <option key={d.days} value={d.days}>
                {d.label}
              </option>
            ))}
          </select>
          {status !== "active" && (
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Bid SAR"
            />
          )}
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
