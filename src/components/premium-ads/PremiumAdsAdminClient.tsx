"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Loader2,
  Trash2,
  X,
  RefreshCw,
  CalendarClock,
  Ban,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PREMIUM_AD_STATUS_LABEL, type PremiumAdStatus } from "@/lib/premium-ads/constants";
import { cn } from "@/lib/utils";

type Ad = {
  id: string;
  title: string;
  target_url: string;
  image_url?: string | null;
  offered_price_sar: number;
  currency: string;
  duration_days: number;
  status: PremiumAdStatus | string;
  payment_note?: string | null;
  admin_note?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string;
  slot?: { id: string; label: string; size_label: string; width_px?: number; height_px?: number } | null;
};

type Filter = "all" | "pending" | "active" | "scheduled" | "expired" | "other";

export function PremiumAdsAdminClient() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("pending");
  const [renewDays, setRenewDays] = useState<Record<string, number>>({});
  const [schedule, setSchedule] = useState<Record<string, { start: string; end: string }>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/premium-ads");
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

  const filtered = useMemo(() => {
    return ads.filter((ad) => {
      if (filter === "all") return true;
      if (filter === "pending")
        return ad.status === "pending_approval" || ad.status === "pending_payment";
      if (filter === "active") return ad.status === "active";
      if (filter === "scheduled") return ad.status === "scheduled";
      if (filter === "expired") return ad.status === "expired" || ad.status === "outbid";
      return !["pending_approval", "pending_payment", "active", "scheduled", "expired", "outbid"].includes(
        ad.status
      );
    });
  }, [ads, filter]);

  async function act(
    id: string,
    action: string,
    extra: Record<string, unknown> = {}
  ) {
    setBusy(id + action);
    try {
      const res = await fetch("/api/admin/premium-ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action,
          admin_note: notes[id] || undefined,
          ...extra,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      toast.success(
        action === "approve"
          ? "Published"
          : action === "reject"
            ? "Rejected"
            : action === "delete"
              ? "Deleted"
              : action === "renew"
                ? "Renewed / extended"
                : action === "schedule"
                  ? "Scheduled"
                  : action === "expire"
                    ? "Expired"
                    : "Updated"
      );
      void load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  const filters: { id: Filter; label: string }[] = [
    { id: "pending", label: "Pending" },
    { id: "active", label: "Live" },
    { id: "scheduled", label: "Scheduled" },
    { id: "expired", label: "Expired / outbid" },
    { id: "all", label: "All" },
  ];

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Premium Ads — Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Approve, reject, delete, renew expired campaigns, and schedule go-live windows.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "text-xs px-3 py-1 rounded-full border transition-colors",
              filter === f.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8">No ads in this view.</p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((ad) => {
            const busyKey = (a: string) => busy === ad.id + a;
            return (
              <li
                key={ad.id}
                className="rounded-xl border border-border/70 bg-card/50 p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-48 shrink-0">
                    <div className="rounded-lg border border-border overflow-hidden bg-muted/20 aspect-video flex items-center justify-center">
                      {ad.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ad.image_url}
                          alt={ad.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                      )}
                    </div>
                    {ad.slot && (
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono text-center">
                        {ad.slot.size_label}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <p className="font-semibold">{ad.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ad.slot?.label || ad.slot?.id || "—"} · {ad.offered_price_sar}{" "}
                          {ad.currency} · {ad.duration_days} days
                        </p>
                      </div>
                      <Badge variant="outline">
                        {PREMIUM_AD_STATUS_LABEL[ad.status as PremiumAdStatus] || ad.status}
                      </Badge>
                    </div>

                    <a
                      href={ad.target_url}
                      className="text-xs text-primary break-all block"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {ad.target_url}
                    </a>

                    {ad.payment_note && (
                      <p className="text-xs bg-muted/40 rounded-md px-2 py-1">
                        Payment note: {ad.payment_note}
                      </p>
                    )}
                    {ad.admin_note && (
                      <p className="text-xs text-muted-foreground">Admin note: {ad.admin_note}</p>
                    )}
                    {(ad.starts_at || ad.ends_at) && (
                      <p className="text-[11px] text-muted-foreground">
                        {ad.starts_at
                          ? `Start ${new Date(ad.starts_at).toLocaleString()}`
                          : ""}
                        {ad.starts_at && ad.ends_at ? " → " : ""}
                        {ad.ends_at ? `End ${new Date(ad.ends_at).toLocaleString()}` : ""}
                      </p>
                    )}

                    <input
                      className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs"
                      placeholder="Admin note (optional)"
                      value={notes[ad.id] || ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [ad.id]: e.target.value }))}
                    />

                    <div className="flex flex-wrap gap-2 pt-1">
                      {(ad.status === "pending_approval" ||
                        ad.status === "pending_payment" ||
                        ad.status === "scheduled") && (
                        <Button
                          size="sm"
                          disabled={!!busy}
                          onClick={() => void act(ad.id, "approve")}
                        >
                          {busyKey("approve") ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5 mr-1" />
                          )}
                          Approve & publish
                        </Button>
                      )}
                      {(ad.status === "pending_approval" ||
                        ad.status === "pending_payment") && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!!busy}
                          onClick={() => void act(ad.id, "reject")}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Reject
                        </Button>
                      )}
                      {(ad.status === "active" || ad.status === "scheduled") && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!!busy}
                          onClick={() => void act(ad.id, "expire")}
                        >
                          <Ban className="h-3.5 w-3.5 mr-1" />
                          End now
                        </Button>
                      )}
                      {(ad.status === "expired" ||
                        ad.status === "outbid" ||
                        ad.status === "active" ||
                        ad.status === "rejected") && (
                        <div className="flex items-center gap-1.5">
                          <select
                            className="h-8 rounded-md border border-border bg-background text-xs px-2"
                            value={renewDays[ad.id] ?? 30}
                            onChange={(e) =>
                              setRenewDays((r) => ({
                                ...r,
                                [ad.id]: Number(e.target.value),
                              }))
                            }
                          >
                            <option value={7}>+7 days</option>
                            <option value={14}>+14 days</option>
                            <option value={30}>+30 days</option>
                            <option value={60}>+60 days</option>
                            <option value={90}>+90 days</option>
                          </select>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!!busy}
                            onClick={() =>
                              void act(ad.id, "renew", {
                                renew_days: renewDays[ad.id] ?? 30,
                              })
                            }
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1" />
                            Renew
                          </Button>
                        </div>
                      )}
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground flex items-center gap-1 list-none">
                          <CalendarClock className="h-3.5 w-3.5" />
                          Schedule
                        </summary>
                        <div className="mt-2 flex flex-wrap items-end gap-2">
                          <label className="space-y-0.5">
                            <span className="text-muted-foreground">Start</span>
                            <input
                              type="datetime-local"
                              className="block h-8 rounded-md border border-border bg-background px-2"
                              value={schedule[ad.id]?.start || ""}
                              onChange={(e) =>
                                setSchedule((s) => ({
                                  ...s,
                                  [ad.id]: {
                                    start: e.target.value,
                                    end: s[ad.id]?.end || "",
                                  },
                                }))
                              }
                            />
                          </label>
                          <label className="space-y-0.5">
                            <span className="text-muted-foreground">End</span>
                            <input
                              type="datetime-local"
                              className="block h-8 rounded-md border border-border bg-background px-2"
                              value={schedule[ad.id]?.end || ""}
                              onChange={(e) =>
                                setSchedule((s) => ({
                                  ...s,
                                  [ad.id]: {
                                    start: s[ad.id]?.start || "",
                                    end: e.target.value,
                                  },
                                }))
                              }
                            />
                          </label>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!busy || !schedule[ad.id]?.start || !schedule[ad.id]?.end}
                            onClick={() =>
                              void act(ad.id, "schedule", {
                                starts_at: new Date(schedule[ad.id].start).toISOString(),
                                ends_at: new Date(schedule[ad.id].end).toISOString(),
                              })
                            }
                          >
                            Apply schedule
                          </Button>
                        </div>
                      </details>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={!!busy}
                        onClick={() => {
                          if (confirm("Permanently delete this campaign?")) {
                            void act(ad.id, "delete");
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
