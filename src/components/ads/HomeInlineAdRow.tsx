"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type LiveAd = {
  id: string;
  title: string;
  target_url: string;
  image_url: string | null;
  slot_id: string;
};

const SLOTS: { id: string; alternates: string[] }[] = [
  { id: "homepage_inline_1", alternates: ["homepage_inline"] },
  { id: "homepage_inline_2", alternates: [] },
  { id: "homepage_inline_3", alternates: [] },
];

/**
 * Homepage mid-band: always three equal tiles.
 * Fetches each slot independently so one missing campaign never hides the others.
 */
export function HomeInlineAdRow({ className = "" }: { className?: string }) {
  const [ads, setAds] = useState<(LiveAd | null)[]>([null, null, null]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOne(slotId: string, alternates: string[]): Promise<LiveAd | null> {
      const q = [slotId, ...alternates].join(",");
      try {
        const res = await fetch(
          `/api/premium-ads/live?slot=${encodeURIComponent(q)}`,
          { cache: "no-store" }
        );
        const j = await res.json();
        if (j?.ad?.image_url) return j.ad as LiveAd;
      } catch {
        /* ignore */
      }
      return null;
    }

    void (async () => {
      const results = await Promise.all(
        SLOTS.map((s) => loadOne(s.id, s.alternates))
      );
      if (!cancelled) {
        setAds(results);
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing to show after load and all empty
  if (ready && ads.every((a) => !a)) return null;

  return (
    <div className={cn("mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-4", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {SLOTS.map((slot, i) => {
          const ad = ads[i];

          if (!ready) {
            return (
              <div
                key={slot.id}
                className="w-full aspect-[4/3] rounded-xl bg-muted/15 animate-pulse border border-border/30"
                aria-hidden
              />
            );
          }

          if (!ad?.image_url) {
            // Keep column structure only when at least one sibling has content;
            // avoid a permanent empty hole on the right.
            return (
              <div
                key={slot.id}
                className="hidden sm:block w-full aspect-[4/3] rounded-xl border border-dashed border-border/20 bg-muted/5"
                aria-hidden
              />
            );
          }

          return (
            <a
              key={slot.id}
              href={ad.target_url || "#"}
              target="_blank"
              rel="noopener noreferrer sponsored"
              title={ad.title || "Sponsored"}
              className={cn(
                "group relative block w-full aspect-[4/3] overflow-hidden rounded-xl",
                "border border-border/50 bg-muted/20",
                "shadow-sm transition hover:border-border hover:shadow-md"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.image_url}
                alt={ad.title || "Advertisement"}
                className="absolute inset-0 h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.02]"
              />
              <span className="sr-only">Sponsored</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
