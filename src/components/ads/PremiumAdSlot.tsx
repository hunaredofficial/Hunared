"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AdSlot } from "@/components/ads/AdSlot";

type LiveAd = {
  id: string;
  title: string;
  target_url: string;
  image_url: string | null;
  slot_id: string;
};

/**
 * Renders the highest active/scheduled premium ad for a slot.
 * If none is live, optionally falls back to legacy AdSlot (AdSense / custom).
 */
export function PremiumAdSlot({
  slotId,
  legacySlotName,
  className = "",
}: {
  slotId: string;
  /** Fallback when no paid premium campaign is live */
  legacySlotName?: string;
  className?: string;
}) {
  const [ad, setAd] = useState<LiveAd | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDone(false);
    void fetch(`/api/premium-ads/live?slot=${encodeURIComponent(slotId)}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setAd(j.ad || null);
      })
      .catch(() => {
        if (!cancelled) setAd(null);
      })
      .finally(() => {
        if (!cancelled) setDone(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slotId]);

  if (!done) {
    return <div className={className} aria-hidden />;
  }

  if (ad) {
    return (
      <a
        href={ad.target_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block w-full overflow-hidden rounded-lg border border-border/40 ${className}`}
        title={ad.title}
      >
        {ad.image_url ? (
          <Image
            src={ad.image_url}
            alt={ad.title}
            width={1200}
            height={320}
            className="w-full h-auto object-contain bg-muted/20"
            unoptimized
          />
        ) : (
          <div className="w-full min-h-[60px] flex items-center justify-center bg-muted/30 text-sm font-medium px-4 py-3">
            {ad.title}
          </div>
        )}
        <span className="sr-only">Sponsored</span>
      </a>
    );
  }

  if (legacySlotName) {
    return <AdSlot slotName={legacySlotName} className={className} />;
  }

  return null;
}
