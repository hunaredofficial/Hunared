"use client";

import { useCallback, useEffect, useState } from "react";
import { getCurrencyForCountry } from "@/lib/countries";

export interface GeoLocation {
  countryCode: string | null;
  countryName: string | null;
  region: string | null;
  city: string | null;
  currency: string | null;
  loading: boolean;
  error: boolean;
  /** true when user picked location manually */
  isManual: boolean;
}

const DETECTED_KEY = "hunared_geo_detection";
const MANUAL_KEY = "hunared_geo_manual";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h

function emptyGeo(partial?: Partial<GeoLocation>): GeoLocation {
  return {
    countryCode: null,
    countryName: null,
    region: null,
    city: null,
    currency: null,
    loading: true,
    error: false,
    isManual: false,
    ...partial,
  };
}

/** Try multiple free IP geo APIs (production-safe fallbacks) */
async function lookupIpGeo(): Promise<{
  countryCode: string | null;
  countryName: string | null;
  region: string | null;
  city: string | null;
}> {
  // 1) ipwho.is — reliable free, no key
  try {
    const res = await fetch("https://ipwho.is/", {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.success !== false && data?.country_code) {
        return {
          countryCode: data.country_code ?? null,
          countryName: data.country ?? null,
          region: data.region ?? data.region_code ?? null,
          city: data.city ?? null,
        };
      }
    }
  } catch {
    /* try next */
  }

  // 2) geojs.io — free, no key
  try {
    const res = await fetch("https://get.geojs.io/v1/ip/geo.json", {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.country_code) {
        return {
          countryCode: data.country_code ?? null,
          countryName: data.country ?? null,
          region: data.region ?? null,
          city: data.city ?? null,
        };
      }
    }
  } catch {
    /* try next */
  }

  // 3) ipapi.co — free tier (may rate-limit on production)
  try {
    const res = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.country_code && !data?.error) {
        return {
          countryCode: data.country_code ?? null,
          countryName: data.country_name ?? null,
          region: data.region ?? data.region_code ?? null,
          city: data.city ?? null,
        };
      }
    }
  } catch {
    /* give up */
  }

  throw new Error("All geo providers failed");
}

export function useGeoDetection() {
  const [geo, setGeo] = useState<GeoLocation>(emptyGeo());

  /** Save a manual location and prefer it over auto-detect */
  const setManualLocation = useCallback(
    (loc: {
      countryCode: string;
      countryName?: string;
      region?: string;
      city?: string;
    }) => {
      const next: GeoLocation = {
        countryCode: loc.countryCode,
        countryName: loc.countryName ?? loc.countryCode,
        region: loc.region ?? null,
        city: loc.city ?? null,
        currency: getCurrencyForCountry(loc.countryCode),
        loading: false,
        error: false,
        isManual: true,
      };
      setGeo(next);
      try {
        localStorage.setItem(
          MANUAL_KEY,
          JSON.stringify({ ...next, timestamp: Date.now() })
        );
      } catch {
        /* ignore */
      }
    },
    []
  );

  async function detectFromIp(force = false) {
    try {
      if (!force) {
        const manual = localStorage.getItem(MANUAL_KEY);
        if (manual) {
          const parsed = JSON.parse(manual) as GeoLocation & {
            timestamp: number;
          };
          setGeo({ ...parsed, loading: false, isManual: true });
          return;
        }

        const cached = localStorage.getItem(DETECTED_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as GeoLocation & {
            timestamp: number;
          };
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            setGeo({ ...parsed, loading: false, isManual: false });
            return;
          }
        }
      }
    } catch {
      /* fall through */
    }

    try {
      const data = await lookupIpGeo();
      const result: GeoLocation = {
        countryCode: data.countryCode,
        countryName: data.countryName,
        region: data.region,
        city: data.city,
        currency: data.countryCode
          ? getCurrencyForCountry(data.countryCode)
          : null,
        loading: false,
        error: false,
        isManual: false,
      };

      setGeo(result);
      try {
        localStorage.setItem(
          DETECTED_KEY,
          JSON.stringify({ ...result, timestamp: Date.now() })
        );
      } catch {
        /* ignore */
      }
    } catch {
      setGeo((prev) => ({ ...prev, loading: false, error: true }));
    }
  }

  /** Clear manual choice and re-detect from IP. Returns detected location. */
  const clearManualLocation = useCallback(async (): Promise<{
    countryCode: string | null;
    countryName: string | null;
    city: string | null;
  }> => {
    try {
      localStorage.removeItem(MANUAL_KEY);
      localStorage.removeItem(DETECTED_KEY);
    } catch {
      /* ignore */
    }
    setGeo(emptyGeo({ loading: true }));
    try {
      const data = await lookupIpGeo();
      const result = {
        countryCode: data.countryCode,
        countryName: data.countryName,
        region: data.region,
        city: data.city,
        currency: data.countryCode
          ? getCurrencyForCountry(data.countryCode)
          : null,
        loading: false,
        error: false,
        isManual: false,
      };
      setGeo(result);
      try {
        localStorage.setItem(
          DETECTED_KEY,
          JSON.stringify({ ...result, timestamp: Date.now() })
        );
      } catch {
        /* ignore */
      }
      return {
        countryCode: result.countryCode,
        countryName: result.countryName,
        city: result.city,
      };
    } catch {
      setGeo((prev) => ({ ...prev, loading: false, error: true }));
      return { countryCode: null, countryName: null, city: null };
    }
  }, []);

  useEffect(() => {
    void detectFromIp(false);
  }, []);

  return { ...geo, setManualLocation, clearManualLocation };
}
