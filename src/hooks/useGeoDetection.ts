"use client";

import { useCallback, useEffect, useState } from "react";
import { getCurrencyForCountry } from "@/lib/countries";
import { matchCityToList } from "@/lib/cities";

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

type RawGeo = {
  countryCode: string | null;
  countryName: string | null;
  region: string | null;
  city: string | null;
};

function refineCity(raw: RawGeo): RawGeo {
  if (!raw.countryCode || !raw.city) return raw;
  const matched = matchCityToList(raw.city, raw.countryCode);
  return { ...raw, city: matched || raw.city };
}

async function lookupIpGeo(): Promise<RawGeo> {
  // 1) ipwho.is
  try {
    const res = await fetch("https://ipwho.is/", {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.success !== false && data?.country_code) {
        return refineCity({
          countryCode: data.country_code ?? null,
          countryName: data.country ?? null,
          region: data.region ?? data.region_code ?? null,
          city: data.city ?? null,
        });
      }
    }
  } catch {
    /* next */
  }

  // 2) geojs.io
  try {
    const res = await fetch("https://get.geojs.io/v1/ip/geo.json", {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.country_code) {
        return refineCity({
          countryCode: data.country_code ?? null,
          countryName: data.country ?? null,
          region: data.region ?? null,
          city: data.city ?? null,
        });
      }
    }
  } catch {
    /* next */
  }

  // 3) ipapi.co
  try {
    const res = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.country_code && !data?.error) {
        return refineCity({
          countryCode: data.country_code ?? null,
          countryName: data.country_name ?? null,
          region: data.region ?? data.region_code ?? null,
          city: data.city ?? null,
        });
      }
    }
  } catch {
    /* give up */
  }

  throw new Error("All geo providers failed");
}

/** Browser GPS + reverse geocode (more accurate city than IP alone). */
async function lookupBrowserGeo(): Promise<RawGeo | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;

  const position = await new Promise<GeolocationPosition | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 1000 * 60 * 10 }
    );
  });
  if (!position) return null;

  const { latitude, longitude } = position.coords;

  // BigDataCloud reverse geocode — free, no key
  try {
    const url =
      `https://api.bigdatacloud.net/data/reverse-geocode-client` +
      `?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
    if (res.ok) {
      const data = await res.json();
      const countryCode = (data.countryCode as string | undefined) ?? null;
      const city =
        (data.city as string | undefined) ||
        (data.locality as string | undefined) ||
        (data.principalSubdivision as string | undefined) ||
        null;
      if (countryCode) {
        return refineCity({
          countryCode,
          countryName: (data.countryName as string | undefined) ?? null,
          region: (data.principalSubdivision as string | undefined) ?? null,
          city,
        });
      }
    }
  } catch {
    /* fall through */
  }

  return null;
}

export function useGeoDetection() {
  const [geo, setGeo] = useState<GeoLocation>(emptyGeo());

  const setManualLocation = useCallback(
    (loc: {
      countryCode: string;
      countryName?: string;
      region?: string;
      city?: string;
    }) => {
      const matchedCity = matchCityToList(loc.city, loc.countryCode) || loc.city || null;
      const next: GeoLocation = {
        countryCode: loc.countryCode,
        countryName: loc.countryName ?? loc.countryCode,
        region: loc.region ?? null,
        city: matchedCity,
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
          const parsed = JSON.parse(manual) as GeoLocation & { timestamp: number };
          // re-match city against current list
          const city = matchCityToList(parsed.city, parsed.countryCode) || parsed.city;
          setGeo({ ...parsed, city, loading: false, isManual: true });
          return;
        }

        const cached = localStorage.getItem(DETECTED_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as GeoLocation & { timestamp: number };
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            const city = matchCityToList(parsed.city, parsed.countryCode) || parsed.city;
            setGeo({ ...parsed, city, loading: false, isManual: false });
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

  /**
   * Auto: prefer browser GPS city, else IP.
   * Clears manual override and stores as detected (or optional manual save by caller).
   */
  const detectAccurateLocation = useCallback(async (): Promise<{
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

    let data: RawGeo | null = null;
    try {
      data = await lookupBrowserGeo();
    } catch {
      data = null;
    }
    if (!data?.countryCode) {
      try {
        data = await lookupIpGeo();
      } catch {
        data = null;
      }
    }

    if (!data?.countryCode) {
      setGeo((prev) => ({ ...prev, loading: false, error: true }));
      return { countryCode: null, countryName: null, city: null };
    }

    // Prefer list-matched city only (so dropdown selects correctly)
    const city = matchCityToList(data.city, data.countryCode) || data.city || null;

    const result: GeoLocation = {
      countryCode: data.countryCode,
      countryName: data.countryName,
      region: data.region,
      city,
      currency: getCurrencyForCountry(data.countryCode),
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
  }, []);

  const clearManualLocation = useCallback(async () => {
    return detectAccurateLocation();
  }, [detectAccurateLocation]);

  useEffect(() => {
    void detectFromIp(false);
  }, []);

  return {
    ...geo,
    setManualLocation,
    clearManualLocation,
    detectAccurateLocation,
  };
}
