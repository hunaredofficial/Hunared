"use client";

import { useMemo, useState, useEffect } from "react";
import { MapPin, ChevronDown, RotateCcw } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { getCitiesForCountry } from "@/lib/cities";
import { useGeoDetection } from "@/hooks/useGeoDetection";
import { cn } from "@/lib/utils";

export function LocationPicker({ className }: { className?: string }) {
  const geo = useGeoDetection();
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (!open) return;
    setCountry(geo.countryCode ?? "");
    // City is manual — do not force detected city into the form
    setCity(geo.isManual ? geo.city ?? "" : "");
  }, [open, geo.countryCode, geo.city, geo.isManual]);

  const cities = useMemo(
    () => getCitiesForCountry(country),
    [country]
  );

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

  // Header: show COUNTRY only
  const label = geo.loading
    ? "Detecting…"
    : geo.countryName || geo.countryCode || "Set location";

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors max-w-[180px] sm:max-w-[240px]"
        title="Your location"
      >
        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="truncate">{label}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-border bg-card p-4 shadow-xl space-y-3">
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
                onClick={() => {
                  geo.clearManualLocation();
                  setOpen(false);
                }}
                className="h-9 px-3 rounded-lg border border-border text-sm inline-flex items-center gap-1 hover:bg-muted"
                title="Detect country automatically"
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
        </>
      )}
    </div>
  );
}
