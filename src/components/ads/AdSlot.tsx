"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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

export function AdSlot({ slotName, className = "" }: AdSlotProps) {
  const [placement, setPlacement] = useState<AdPlacement | null>(null);
  const [state, setState] = useState<LoadState>("loading");

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
        className={`bg-muted/20 w-full min-h-[100px] flex items-center justify-center text-muted-foreground text-xs animate-pulse rounded-lg ${className}`}
        aria-hidden="true"
      >
        Advertisement
      </div>
    );
  }

  if (!placement) return null;

  if (placement.ad_type === "custom") {
    return (
      <a
        href={placement.custom_redirect_url ?? "#"}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block w-full ${className}`}
      >
        {placement.custom_image_url && (
          <Image
            src={placement.custom_image_url}
            alt="Advertisement"
            width={728}
            height={90}
            className="w-full h-auto object-contain rounded-lg"
            unoptimized
          />
        )}
      </a>
    );
  }

  if (placement.ad_type === "adsense") {
    return (
      <AdsenseUnit
        slotId={placement.adsense_slot_id ?? ""}
        className={className}
      />
    );
  }

  return null;
}

function AdsenseUnit({
  slotId,
  className = "",
}: {
  slotId: string;
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
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
