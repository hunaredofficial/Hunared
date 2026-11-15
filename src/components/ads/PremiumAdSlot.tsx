"use client";

import { useEffect, useState } from "react";
import { AdSlot } from "@/components/ads/AdSlot";
import { displayForSlot } from "@/lib/premium-ads/slotDisplay";
import { cn } from "@/lib/utils";

type LiveAd = {
  id: string;
  title: string;
  target_url: string;
  image_url: string | null;
  slot_id: string;
};

/**
 * Winning active premium ad for slot(s).
 * Falls back to admin AdSlot when none live.
 * Images are framed to slot size (cover for banners, contain for sidebar).
 * Text-only ads without image are not shown (avoids empty "title" strips).
 */
export function PremiumAdSlot({
  slotId,
  alternateSlotIds = [],
  legacySlotName,
  className = "",
}: {
  slotId: string;
  alternateSlotIds?: string[];
  legacySlotName?: string;
  className?: string;
}) {
  const [ad, setAd] = useState<LiveAd | null>(null);
  const [checked, setChecked] = useState(false);

  const querySlots = [slotId, ...alternateSlotIds].filter(Boolean).join(",");

  useEffect(() => {
    let cancelled = false;
    setChecked(false);
    void fetch(`/api/premium-ads/live?slot=${encodeURIComponent(querySlots)}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        const row = j?.ad as LiveAd | null;
        // Prefer ads with creative image — skip title-only strips
        if (row && row.image_url) setAd(row);
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
        className={cn("w-full rounded-lg bg-muted/10 animate-pulse min-h-[40px]", className)}
        aria-hidden
      />
    );
  }

  if (ad?.image_url) {
    const disp = displayForSlot(ad.slot_id || slotId);
    return (
      <a
        href={ad.target_url || "#"}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={cn(
          "block overflow-hidden rounded-lg border border-border/30 bg-muted/5",
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
            disp.objectFit === "cover" ? "object-cover object-center" : "object-contain object-center"
          )}
        />
        <span className="sr-only">Sponsored: {ad.title}</span>
      </a>
    );
  }

  return <AdSlot slotName={legacySlotName || slotId} className={className} />;
}
