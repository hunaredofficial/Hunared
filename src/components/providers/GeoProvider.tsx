"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useGeoDetection } from "@/hooks/useGeoDetection";

type GeoContextValue = ReturnType<typeof useGeoDetection>;

const GeoContext = createContext<GeoContextValue | null>(null);

export function GeoProvider({ children }: { children: ReactNode }) {
  const geo = useGeoDetection();
  const value = useMemo(() => geo, [geo]);
  return <GeoContext.Provider value={value}>{children}</GeoContext.Provider>;
}

export function useGeo() {
  const ctx = useContext(GeoContext);
  if (!ctx) {
    throw new Error("useGeo must be used inside GeoProvider");
  }
  return ctx;
}

/** Safe version — returns nulls if provider missing (optional) */
export function useGeoOptional() {
  return useContext(GeoContext);
}