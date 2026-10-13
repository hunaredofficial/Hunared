"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type LiveAd = {
  id: string;
  title: string;
  target_url: string;
  image_url: string | null;
  slot_id: string;
};

/** Renders the highest active approved premium ad for a catalog slot id */
export function PremiumAdSlot({
  slotId,
  className = "",
}: {
  slotId: string;
  className?: string;
}) {
  const [ad, setAd] = useState<LiveAd | null>(null);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/premium-ads/live?slot=${encodeURIComponent(slotId)}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.ad) setAd(j.ad);
        else setHide(true);
      })
      .catch(() => {
        if (!cancelled) setHide(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slotId]);

  if (hide || !ad) return null;

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
          width={970}
          height={250}
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
