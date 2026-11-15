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
 * Shows the winning active premium ad for slotId.
 * If none is live, falls back to admin custom/AdSense placement via legacySlotName (or slotId).
 */
export function PremiumAdSlot({
  slotId,
  legacySlotName,
  className = "",
}: {
  slotId: string;
  /** Optional admin ad_placements.slot_name when different from premium slot id */
  legacySlotName?: string;
  className?: string;
}) {
  const [ad, setAd] = useState<LiveAd | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/premium-ads/live?slot=${encodeURIComponent(slotId)}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j?.ad) setAd(j.ad);
        setChecked(true);
      })
      .catch(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slotId]);

  if (!checked) {
    return (
      <div
        className={`w-full min-h-[48px] rounded-lg bg-muted/15 animate-pulse ${className}`}
        aria-hidden
      />
    );
  }

  if (ad) {
    return (
      <a
        href={ad.target_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block w-full overflow-hidden rounded-lg border border-border/40 bg-muted/10 ${className}`}
        title={ad.title}
      >
        {ad.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-auto max-h-40 object-contain mx-auto"
          />
        ) : (
          <div className="w-full min-h-[56px] flex items-center justify-center text-sm font-medium px-4 py-3">
            {ad.title}
          </div>
        )}
        <span className="sr-only">Sponsored</span>
      </a>
    );
  }

  // Fallback: admin-managed AdSense / custom banner
  return <AdSlot slotName={legacySlotName || slotId} className={className} />;
}
