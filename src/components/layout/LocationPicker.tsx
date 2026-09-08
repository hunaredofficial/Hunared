"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MapPin, ChevronDown, RotateCcw } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { getCitiesForCountry } from "@/lib/cities";
import { useGeo } from "@/components/providers/GeoProvider";
import { cn } from "@/lib/utils";

const PANEL_W = 288; // w-72
const PANEL_H_EST = 300;

export function LocationPicker({ className }: { className?: string }) {
  // Shared geo state so Save updates filters / rest of app
  const geo = useGeo();
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setCountry(geo.countryCode ?? "");
    setCity(geo.city ?? "");
  }, [open, geo.countryCode, geo.city, geo.isManual]);

  // Place panel fully on screen, always below header, never clipped
  useEffect(() => {
    if (!open) return;

    function place() {
      const el = btnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const gap = 10;
      const headerClear = 72; // keep clear of fixed header

      // Prefer below the button
      let top = r.bottom + gap;
      // If would go off bottom, open above button
      if (top + PANEL_H_EST > window.innerHeight - 12) {
        top = Math.max(headerClear, r.top - gap - PANEL_H_EST);
      }
      // Never under the header
      if (top < headerClear) top = headerClear;

      let left = r.right - PANEL_W;
      if (left < 12) left = 12;
      if (left + PANEL_W > window.innerWidth - 12) {
        left = Math.max(12, window.innerWidth - PANEL_W - 12);
      }

      setPos({ top, left });
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const cities = useMemo(() => getCitiesForCountry(country), [country]);

  function apply() {
    if (!country) return;
    const c = COUNTRIES.find((x) => x.code === country);
    geo.setManualLocation({
      countryCode: country,
      countryName: c?.name ?? country,
      city: city || undefined,
    });
    setOpen(false);
  }

  const label = geo.loading
    ? "Detecting…"
    : geo.countryName || geo.countryCode || "Set location";

  const panel =
    open && mounted
      ? createPortal(
          <>
            {/* Backdrop — closes panel, sits under panel */}
            <div
              className="fixed inset-0 z-[200]"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div
              role="dialog"
              aria-label="Set your location"
              className="fixed z-[210] w-72 rounded-xl border border-border bg-card p-4 shadow-2xl space-y-3"
              style={{ top: pos.top, left: pos.left }}
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Your location
              </p>

              <div>
                <label className="text-xs text-muted-foreground">Country</label>
                <select
                  data-color-scheme="dark"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setCity("");
                  }}
                  className="[color-scheme:dark] mt-1 w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option className="bg-background text-foreground" value="">
                    Select country
                  </option>
                  {COUNTRIES.map((c) => (
                    <option
                      className="bg-background text-foreground"
                      key={c.code}
                      value={c.code}
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">City</label>
                <select
                  data-color-scheme="dark"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!country}
                  className="[color-scheme:dark] mt-1 w-full h-9 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50"
                >
                  <option className="bg-background text-foreground" value="">
                    All cities
                  </option>
                  {cities.map((name) => (
                    <option
                      className="bg-background text-foreground"
                      key={name}
                      value={name}
                    >
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={apply}
                  disabled={!country}
                  className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const detected = await geo.clearManualLocation();
                    if (detected.countryCode) {
                      const match = COUNTRIES.find(
                        (x) => x.code === detected.countryCode
                      );
                      geo.setManualLocation({
                        countryCode: detected.countryCode,
                        countryName:
                          match?.name ??
                          detected.countryName ??
                          detected.countryCode,
                        city: detected.city ?? "",
                      });
                      setCountry(detected.countryCode);
                      setCity(detected.city ?? "");
                    }
                    setOpen(false);
                  }}
                  className="h-9 px-3 rounded-lg border border-border text-sm inline-flex items-center gap-1 hover:bg-muted"
                  title="Detect country and city automatically"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Auto
                </button>
              </div>

              {geo.isManual && (
                <p className="text-[10px] text-muted-foreground">
                  Using your selected location
                </p>
              )}
              {!geo.isManual && !geo.loading && geo.countryCode && (
                <p className="text-[10px] text-muted-foreground">
                  Country auto-detected from your network
                </p>
              )}
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <div className={cn("relative", className)}>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors max-w-[180px] sm:max-w-[240px]"
        title="Your location"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="truncate">{label}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
      </button>
      {panel}
    </div>
  );
}
