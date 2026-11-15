"use client";

import { useEffect, useState } from "react";
import { AdSlot } from "@/components/ads/AdSlot";

type LiveAd = {
  id: string;
  title: string;
  target_url: string;
  image_url: string | null;
  slot_id: string;
};

/**
 * Shows the winning active premium ad for slotId (and optional aliases).
 * Falls back to admin AdSlot (AdSense / custom banner) when no paid ad is live.
 */
export function PremiumAdSlot({
  slotId,
  alternateSlotIds = [],
  legacySlotName,
  className = "",
  maxHeightClass = "max-h-40",
}: {
  slotId: string;
  /** Extra premium slot ids to try (e.g. header + header_leaderboard) */
  alternateSlotIds?: string[];
  /** Admin ad_placements.slot_name for fallback */
  legacySlotName?: string;
  className?: string;
  maxHeightClass?: string;
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
        if (j?.ad) setAd(j.ad);
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
        className={`w-full min-h-[40px] rounded-lg bg-muted/10 animate-pulse ${className}`}
        aria-hidden
      />
    );
  }

  if (ad) {
    return (
      <a
        href={ad.target_url || "#"}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block w-full overflow-hidden rounded-lg border border-border/40 bg-muted/10 ${className}`}
        title={ad.title}
      >
        {ad.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ad.image_url}
            alt={ad.title || "Advertisement"}
            className={`w-full h-auto ${maxHeightClass} object-contain mx-auto`}
          />
        ) : (
          <div className="w-full min-h-[56px] flex items-center justify-center text-sm font-medium px-4 py-3 text-center">
            {ad.title}
          </div>
        )}
        <span className="sr-only">Sponsored</span>
      </a>
    );
  }

  return <AdSlot slotName={legacySlotName || slotId} className={className} />;
}
