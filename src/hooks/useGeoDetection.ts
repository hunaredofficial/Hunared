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

  /** Clear manual choice and re-detect from IP */
  const clearManualLocation = useCallback(() => {
    try {
      localStorage.removeItem(MANUAL_KEY);
    } catch {
      /* ignore */
    }
    setGeo(emptyGeo({ loading: true }));
    // trigger re-detect by reloading logic below via state
    void detectFromIp(true);
  }, []);

  async function detectFromIp(force = false) {
    try {
      if (!force) {
        const manual = localStorage.getItem(MANUAL_KEY);
        if (manual) {
          const parsed = JSON.parse(manual) as GeoLocation & { timestamp: number };
          setGeo({ ...parsed, loading: false, isManual: true });
          return;
        }

        const cached = localStorage.getItem(DETECTED_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as GeoLocation & { timestamp: number };
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
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) throw new Error("Geo lookup failed");
      const data = await res.json();

      const result: GeoLocation = {
        countryCode: data.country_code ?? null,
        countryName: data.country_name ?? null,
        region: data.region ?? data.region_code ?? null,
        city: data.city ?? null,
        currency: data.country_code
          ? getCurrencyForCountry(data.country_code)
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

  useEffect(() => {
    void detectFromIp(false);
  }, []);

  return { ...geo, setManualLocation, clearManualLocation };
}