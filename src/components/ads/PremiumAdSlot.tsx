"use client";

import { useEffect, useMemo, useState } from "react";
import { AdSlot } from "@/components/ads/AdSlot";
import { displayForSlot } from "@/lib/premium-ads/slotDisplay";
import { expandSlotIds, legacyNameFor } from "@/lib/premium-ads/slotAliases";
import { cn } from "@/lib/utils";

type LiveAd = {
  id: string;
  title: string;
  target_url: string;
  image_url: string | null;
  slot_id: string;
};

/**
 * One creative per slotId. Does not merge unrelated slots.
 * Falls back to admin AdSlot only when legacySlotName is provided.
 */
export function PremiumAdSlot({
  slotId,
  alternateSlotIds = [],
  legacySlotName,
  className = "",
  hideIfEmpty = false,
}: {
  slotId: string;
  alternateSlotIds?: string[];
  legacySlotName?: string;
  className?: string;
  /** When true, render nothing if no premium creative (no AdSense/custom fallback) */
  hideIfEmpty?: boolean;
}) {
  const [ad, setAd] = useState<LiveAd | null>(null);
  const [checked, setChecked] = useState(false);
  const querySlots = useMemo(
    () => expandSlotIds(slotId, alternateSlotIds).join(","),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slotId, alternateSlotIds.join(",")]
  );

  useEffect(() => {
    let cancelled = false;
    setChecked(false);
    setAd(null);
    void fetch(`/api/premium-ads/live?slot=${encodeURIComponent(querySlots)}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j?.ad?.image_url) setAd(j.ad as LiveAd);
        else setAd(null);
        setChecked(true);
      })
      .catch(() => {
        if (!cancelled) {
          setAd(null);
          setChecked(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [querySlots]);

  if (!checked) {
    return (
      <div
        className={cn("w-full min-h-[40px] rounded-lg bg-muted/10 animate-pulse", className)}
        aria-hidden
      />
    );
  }

  if (ad?.image_url) {
    const disp = displayForSlot(slotId);
    return (
      <a
        href={ad.target_url || "#"}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={cn(
          "block overflow-hidden rounded-lg border border-border/30 bg-black/20",
          disp.frameClass,
          className
        )}
        title={ad.title || "Sponsored"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.image_url}
          alt={ad.title || "Advertisement"}
          className={cn(
            "w-full h-full",
            disp.objectFit === "cover"
              ? "object-cover object-center"
              : "object-contain object-center"
          )}
        />
        <span className="sr-only">Sponsored</span>
      </a>
    );
  }

  if (hideIfEmpty) return null;

  if (legacySlotName) {
    return <AdSlot slotName={legacySlotName} className={className} />;
  }

  return null;
}
