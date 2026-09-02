"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { useGeo } from "@/components/providers/GeoProvider";
import { CITIES_BY_COUNTRY, getCitiesForCountry } from "@/lib/cities";
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

/** Quick links → open related pages (not universal search) */
const QUICK_LINKS: { label: string; href: string; accent?: boolean }[] = [
  { label: "Post an Ad", href: "/dashboard/market/new", accent: true },
  { label: "Post a Job", href: "/dashboard/jobs/new", accent: true },
  { label: "Jobs", href: "/jobs" },
  { label: "Candidates", href: "/candidates" },
  { label: "Companies", href: "/companies" },
  { label: "Marketplace", href: "/market" },
  { label: "For Sale", href: "/market?category=for_sale" },
  { label: "For Rent", href: "/market?category=for_rent" },
  { label: "Accommodation", href: "/market?category=accommodation" },
  { label: "Property", href: "/market?category=property" },
  { label: "Vehicles", href: "/market?category=vehicles" },
  { label: "Electronics", href: "/market?category=electronics" },
  { label: "Services", href: "/market?category=services" },
  { label: "Home & Furniture", href: "/market?category=home_furniture" },
  { label: "Lost & Found", href: "/market?category=lost_found" },
  { label: "Learning", href: "/education" },
  { label: "Program", href: "/program" },
  { label: "Offers & Deals", href: "/market?category=offers_deals" },
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

  // Auto-fill country only (city stays All Cities by default)
  useEffect(() => {
    if (geo.loading) return;
    if (!country && geo.countryCode) setCountry(geo.countryCode);
  }, [geo.loading, geo.countryCode, country]);

  const cities = getCitiesForCountry(country);

  function handleSearch(e?: FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (country) params.set("country", country);
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    router.push(`/search?${params.toString()}`);
  }

  function handleQuickLink(href: string) {
    router.push(href);
  }

  return (
    <section className="relative min-h-[auto] sm:min-h-[88vh] flex flex-col items-center justify-center overflow-hidden pt-24 sm:pt-28 pb-10 sm:pb-16">
      {/* Clean background like other sections */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/25" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[520px] w-[780px] rounded-full bg-[var(--brand-from)] opacity-[0.06] blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/5 h-[300px] w-[400px] rounded-full bg-[var(--brand-via)] opacity-[0.05] blur-[110px]" />
      </div>

      <div
        className={cn(
          "mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        )}
      >
        {/* Larger premium card — same language as CTA / Program */}
        <form
          onSubmit={handleSearch}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-card border border-primary/20 brand-glow p-4 sm:p-8 md:p-10 lg:p-12 space-y-4 sm:space-y-6"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-[var(--brand-from)] opacity-[0.06] blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-[var(--brand-via)] opacity-[0.06] blur-3xl" />
          </div>

          <div className="text-center space-y-2">
            <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-primary">
              Universal Smart Search
            </span>
          </div>

          {/* Large search input */}
          <div className="relative">
            <Search className="absolute left-3.5 sm:left-5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for? Search here..."
              className="w-full h-12 sm:h-16 md:h-[4.25rem] pl-11 sm:pl-14 pr-12 sm:pr-14 rounded-xl sm:rounded-2xl border border-primary/15 bg-background/70 text-foreground text-sm sm:text-base md:text-lg placeholder:text-muted-foreground/65 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary/35 transition"
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

          {/* Filters — larger controls */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-4">
            {/* Country — names only, no codes */}
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCity("");
                }}
                data-color-scheme="dark"
                className="w-full h-12 sm:h-13 pl-10 pr-9 rounded-xl border border-primary/15 bg-background/70 text-sm sm:text-base text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer [color-scheme:dark]"
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
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* City — type any city or pick from list; All Cities when empty */}
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
                className="w-full h-12 sm:h-13 pl-3.5 pr-9 rounded-xl border border-primary/15 bg-background/70 text-sm sm:text-base text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer [color-scheme:dark]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} className="bg-background text-foreground">
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Primary button — same as other sections */}
          <button
            type="submit"
            className="w-full h-11 sm:h-13 md:h-14 rounded-full font-semibold text-sm sm:text-base text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg transition-all duration-300 hover:scale-[1.015] active:scale-[0.99]"
          >
            Search Everything
          </button>
        </form>

        {/* Quick links — premium explore strip */}
        <div className="mt-7 sm:mt-12">
          <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-card shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--brand-from)]/15 via-transparent to-[var(--brand-via)]/10"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-[var(--brand-from)] opacity-25 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[var(--brand-via)] opacity-20 blur-3xl"
            />

            <div className="relative px-4 py-5 sm:px-7 sm:py-7 md:px-9 md:py-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5 sm:mb-6">
                <div className="space-y-1">
                  <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Start here
                  </p>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    Quick Links
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-lg">
                    Post, hire, buy, rent, or learn — one tap to the right place.
                  </p>
                </div>
              </div>

              {/* Accent actions first */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-5">
                {QUICK_LINKS.filter((l) => l.accent).map((link) => (
                  <button
                    key={"accent-" + link.href + link.label}
                    type="button"
                    onClick={() => handleQuickLink(link.href)}
                    className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-4 sm:px-5 rounded-full text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
                {QUICK_LINKS.filter((l) => !l.accent).map((link) => (
                  <button
                    key={link.href + link.label}
                    type="button"
                    onClick={() => handleQuickLink(link.href)}
                    className="group flex items-center justify-center min-h-[2.85rem] sm:min-h-[3.15rem] px-2.5 sm:px-3 py-2 rounded-2xl text-[11px] sm:text-sm font-medium text-center border border-border/80 bg-background/60 backdrop-blur-sm text-foreground/90 hover:border-primary/45 hover:bg-primary/10 hover:text-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-200"
                  >
                    <span className="line-clamp-2 leading-snug">{link.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}