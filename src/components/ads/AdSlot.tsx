"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { AdPlacement } from "@/types/database";

// Extend Window type for adsbygoogle
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adsbygoogle: any[];
  }
}

interface AdSlotProps {
  slotName: string;
  className?: string;
}

type LoadState = "loading" | "ready" | "hidden";

/**
 * Standard IAB ad sizes (common defaults):
 * - Leaderboard:        728 × 90
 * - Large Leaderboard:  970 × 90
 * - Mobile banner:      320 × 50
 * - Large mobile:       320 × 100
 * - Medium rectangle:   300 × 250
 * - Large rectangle:    336 × 280
 * - Wide skyscraper:    160 × 600
 */
const SLOT_SIZE: Record<
  string,
  {
    /** Tailwind max-height classes for custom image */
    imgMaxH: string;
    /** Tailwind max-width for container */
    maxW: string;
    /** Placeholder min-height */
    minH: string;
    /** AdSense format */
    adFormat: "auto" | "horizontal" | "rectangle" | "vertical";
  }
> = {
  header: {
    imgMaxH: "max-h-[50px] sm:max-h-[90px]",
    maxW: "max-w-[970px]",
    minH: "min-h-[50px] sm:min-h-[90px]",
    adFormat: "horizontal",
  },
  footer: {
    imgMaxH: "max-h-[50px] sm:max-h-[90px]",
    maxW: "max-w-[728px]",
    minH: "min-h-[50px] sm:min-h-[90px]",
    adFormat: "horizontal",
  },
  sidebar: {
    imgMaxH: "max-h-[250px]",
    maxW: "max-w-[300px]",
    minH: "min-h-[250px]",
    adFormat: "rectangle",
  },
  content: {
    imgMaxH: "max-h-[280px]",
    maxW: "max-w-[336px]",
    minH: "min-h-[250px]",
    adFormat: "rectangle",
  },
  in_feed: {
    imgMaxH: "max-h-[250px]",
    maxW: "max-w-[300px]",
    minH: "min-h-[250px]",
    adFormat: "rectangle",
  },
  // fallback for any other slot name
  default: {
    imgMaxH: "max-h-[50px] sm:max-h-[90px]",
    maxW: "max-w-[728px]",
    minH: "min-h-[50px] sm:min-h-[90px]",
    adFormat: "horizontal",
  },
};

function sizeFor(slotName: string) {
  return SLOT_SIZE[slotName] ?? SLOT_SIZE.default;
}

export function AdSlot({ slotName, className = "" }: AdSlotProps) {
  const [placement, setPlacement] = useState<AdPlacement | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const size = sizeFor(slotName);

  useEffect(() => {
    getSupabaseClient()
      .from("ad_placements")
      .select("*")
      .eq("slot_name", slotName)
      .maybeSingle()
      .then(({ data }) => {
        if (!data || !data.is_active) {
          setState("hidden");
        } else {
          setPlacement(data);
          setState("ready");
        }
      });
  }, [slotName]);

  if (state === "hidden") return null;

  if (state === "loading") {
    return (
      <div
        className={`bg-muted/20 w-full ${size.minH} ${size.maxW} mx-auto flex items-center justify-center text-muted-foreground text-xs animate-pulse rounded-md ${className}`}
        aria-hidden="true"
      >
        Advertisement
      </div>
    );
  }

  if (!placement) return null;

  if (placement.ad_type === "custom") {
    if (!placement.custom_image_url) return null;
    return (
      <div className={`w-full flex justify-center ${className}`}>
        <a
          href={placement.custom_redirect_url || "#"}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={`block w-full ${size.maxW} overflow-hidden rounded-md border border-border/40 bg-muted/10`}
        >
          {/* plain img avoids next/image remote domain config issues */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={placement.custom_image_url}
            alt="Advertisement"
            className={`w-full h-auto ${size.imgMaxH} object-contain mx-auto`}
          />
        </a>
      </div>
    );
  }

  if (placement.ad_type === "adsense") {
    return (
      <div className={`w-full flex justify-center ${className}`}>
        <AdsenseUnit
          slotId={placement.adsense_slot_id ?? ""}
          adFormat={size.adFormat}
          className={`w-full ${size.maxW} ${size.minH}`}
        />
      </div>
    );
  }

  return null;
}

function AdsenseUnit({
  slotId,
  adFormat = "auto",
  className = "",
}: {
  slotId: string;
  adFormat?: "auto" | "horizontal" | "rectangle" | "vertical";
  className?: string;
}) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not loaded yet (dev / no client ID)
    }
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slotId}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
