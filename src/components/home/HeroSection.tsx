"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { useGeo } from "@/components/providers/GeoProvider";
import { getCitiesForCountry } from "@/lib/cities";
import { VoiceSearchButton } from "@/components/shared/VoiceSearchButton";
import { CityCombobox } from "@/components/shared/CityCombobox";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "jobs", label: "Jobs" },
  { value: "candidates", label: "Candidates" },
  { value: "companies", label: "Companies" },
  { value: "marketplace", label: "Marketplace" },
  { value: "services", label: "Services" },
  { value: "learning Hub", label: "Learning Hub" },
  { value: "accommodation", label: "Accommodation" },
  { value: "properties", label: "Properties" },
  { value: "hunared finder", label: "Hunared Finder" },
  { value: "hunared program", label: "Hunared Program" },
];

export function HeroSection() {
  const router = useRouter();
  const geo = useGeo();

  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (geo.loading) return;
    if (!country && geo.countryCode) setCountry(geo.countryCode);
  }, [geo.loading, geo.countryCode, country]);

  function handleSearch(e?: FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (country) params.set("country", country);
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <section className="relative min-h-[auto] sm:min-h-[78vh] flex flex-col items-center justify-center overflow-hidden pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-14">
      {/* Subtle professional background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 h-[420px] w-[680px] rounded-full bg-primary opacity-[0.05] blur-[120px]" />
      </div>

      <div
        className={cn(
          "mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 transition-all duration-600",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >
        <form
          onSubmit={handleSearch}
          className="relative overflow-hidden rounded-2xl bg-card border border-border brand-glow p-5 sm:p-7 md:p-9 space-y-5 sm:space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2.5 sm:space-y-3">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-[11px] sm:text-xs font-semibold tracking-wide text-primary uppercase">
              Universal Smart Search
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-bold tracking-tight leading-[1.15] text-foreground">
              Find work, talent &amp; opportunity{" "}
              <span className="text-primary">worldwide</span>
            </h1>
            <p className="text-sm sm:text-[15px] text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Search jobs, candidates, companies, marketplace, and learning — all in one place.
            </p>
          </div>

          {/* Main search input */}
          <div className="relative">
            <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full h-12 sm:h-14 pl-11 sm:pl-12 pr-12 rounded-xl border border-border bg-background text-foreground text-sm sm:text-base placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition"
              autoComplete="off"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <VoiceSearchButton
                onResult={(t) => {
                  setQuery(t);
                }}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {/* Country */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCity("");
                }}
                data-color-scheme="dark"
                className="w-full h-11 sm:h-12 pl-9 pr-8 rounded-lg border border-border bg-background text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/35 cursor-pointer [color-scheme:dark]"
              >
                <option value="" className="bg-background text-foreground">
                  All Countries
                </option>
                {COUNTRIES.map((c) => (
                  <option
                    key={c.code}
                    value={c.code}
                    className="bg-background text-foreground"
                  >
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* City */}
            <CityCombobox
              id="hero-city"
              country={country}
              value={city}
              onChange={setCity}
              size="lg"
              variant="hero"
            />

            {/* Category */}
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                data-color-scheme="dark"
                className="w-full h-11 sm:h-12 pl-3.5 pr-8 rounded-lg border border-border bg-background text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/35 cursor-pointer [color-scheme:dark]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} className="bg-background text-foreground">
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* CTA */}
          <button
            type="submit"
            className="w-full h-11 sm:h-12 rounded-lg font-semibold text-sm sm:text-[15px] text-primary-foreground bg-primary hover:bg-primary/90 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.99]"
          >
            Search Everything
          </button>
        </form>
      </div>
    </section>
  );
}
