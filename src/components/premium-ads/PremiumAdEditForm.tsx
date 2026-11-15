"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  PREMIUM_AD_KINDS,
  DURATION_OPTIONS,
  type PremiumAdKind,
} from "@/lib/premium-ads/constants";
import { cn } from "@/lib/utils";

export function PremiumAdEditForm({ adId }: { adId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTyped, setDeleteTyped] = useState("");
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
        setStatus(ad.status || "");
        setKind((ad.ad_kind as PremiumAdKind) || "standalone");
        setTitle(ad.title || "");
        setTargetUrl(ad.target_url || "");
        setImageUrl(ad.image_url || "");
        setDesignNotes(ad.design_notes || "");
        setDuration(ad.duration_days || 7);
        setPrice(Number(ad.offered_price_sar) || "");
        setSlotLabel(ad.slot?.label || ad.slot_id || "");
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
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !targetUrl.trim()) {
      toast.error("Title and destination URL are required");
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
        status === "active" ? "Saved — pending re-approval" : "Campaign updated"
      );
      router.push("/dashboard/premium-ads");
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  function openDelete() {
    setDeleteTyped("");
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    const live = status === "active" || status === "scheduled";
    if (live && deleteTyped.trim().toLowerCase() !== "delete") {
      toast.error('Type "delete" to confirm');
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/premium-ads/${adId}`, { method: "DELETE" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Delete failed");
      toast.success("Campaign deleted");
      setShowDeleteModal(false);
      router.push("/dashboard/premium-ads");
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  const isLive = status === "active" || status === "scheduled";

  return (
    <div className="w-full flex justify-center px-3 sm:px-4 py-4 sm:py-8">
      <div className="w-full max-w-xl space-y-5">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard/premium-ads">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>

        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Edit campaign</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {slotLabel}
            {status ? ` · ${status}` : ""}
            {status === "active" ? " — save sends for re-approval" : ""}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-card/50 p-4 sm:p-6 space-y-5 shadow-sm"
        >
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Promote
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PREMIUM_AD_KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKind(k.id)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-left transition-colors",
                    kind === k.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted/30"
                  )}
                >
                  <p className="text-sm font-semibold">{k.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Campaign Title</label>
            <input
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your campaign title"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Destination URL</label>
            <input
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://hunared.com/..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Banner Image URL (or upload)</label>
            <div className="flex flex-col sm:flex-row gap-2">
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 shrink-0"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Upload className="h-4 w-4 mr-1.5" />
                )}
                Upload image
              </Button>
              <input
                className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Creative"
                className="mt-2 w-full max-h-36 object-contain rounded-lg border border-border/50 bg-muted/20"
              />
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Notes (optional)</label>
            <textarea
              className="w-full min-h-[72px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y"
              value={designNotes}
              onChange={(e) => setDesignNotes(e.target.value)}
              placeholder="Add any notes for admin (logo, colors, message on the banner)…"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Duration</label>
              <select
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
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
            {status !== "active" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Offer price (USD)</label>
                <input
                  type="number"
                  min={1}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </div>
            ) : null}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={deleting || saving}
              onClick={openDelete}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete campaign
            </Button>
            <Button type="submit" disabled={saving || deleting} className="sm:min-w-[140px]">
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold">Delete campaign?</h2>
            {isLive ? (
              <>
                <p className="text-sm text-muted-foreground">
                  This campaign is <span className="text-foreground font-medium">LIVE</span> and
                  may be showing on the site. Type <span className="font-mono text-foreground">delete</span>{" "}
                  below to confirm permanent removal.
                </p>
                <input
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  value={deleteTyped}
                  onChange={(e) => setDeleteTyped(e.target.value)}
                  placeholder='Type "delete" to confirm'
                  autoFocus
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                This will permanently remove the campaign. This cannot be undone.
              </p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={
                  deleting || (isLive && deleteTyped.trim().toLowerCase() !== "delete")
                }
                onClick={() => void confirmDelete()}
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Deleting…
                  </>
                ) : (
                  "Delete permanently"
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
