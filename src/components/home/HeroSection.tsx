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
const QUICK_LINKS: { label: string; href: string; accent?: boolean; external?: boolean }[] = [
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
  { label: "Wanted", href: "/market?category=wanted" },
  { label: "Offers & Deals", href: "/market?category=offers_deals" },
  { label: "Community", href: "/market?category=community" },
  { label: "Learning", href: "/education" },
  { label: "Courses", href: "https://hunared.org/courses", external: true },
  { label: "Training & Certification", href: "https://hunared.org", external: true },
  { label: "Program", href: "/program" },
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

  function handleQuickLink(href: string, external?: boolean) {
    if (external || href.startsWith("http://") || href.startsWith("https://")) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(href);
  }

  return (
    <section className="relative min-h-[auto] sm:min-h-[82vh] flex flex-col items-center justify-center overflow-hidden pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-12">
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
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-card border border-primary/20 brand-glow p-4 sm:p-7 md:p-9 lg:p-11 space-y-4 sm:space-y-5 md:space-y-6"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-[var(--brand-from)] opacity-[0.06] blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-[var(--brand-via)] opacity-[0.06] blur-3xl" />
          </div>

          <div className="text-center space-y-2.5 sm:space-y-3">
            <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-primary">
              Universal Smart Search
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight px-1">
              Find work, talent &amp; opportunity{" "}
              <span className="gradient-text">worldwide</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed px-2">
              Search jobs, candidates, companies, marketplace, and learning in one place.
            </p>
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

        {/* Quick links — softer tones matching site palette */}
        <div className="mt-8 sm:mt-12">
          <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/6 via-card to-[var(--brand-via)]/5 shadow-[0_0_32px_-16px_rgba(59,130,246,0.18)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(var(--brand-from)/0.1),transparent_55%)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-28 right-0 h-64 w-64 rounded-full bg-[var(--brand-from)] opacity-12 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-12 h-52 w-52 rounded-full bg-[var(--brand-via)] opacity-10 blur-3xl"
            />

            <div className="relative px-4 py-6 sm:px-8 sm:py-8 md:px-10 md:py-9">
              <div className="mb-5 sm:mb-6 space-y-1.5">
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Start here
                </p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  Quick Links
                </h3>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Post jobs, hire talent, list services, or learn — jump straight to the right place.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-5 sm:mb-6">
                {QUICK_LINKS.filter((l) => l.accent).map((link) => (
                  <button
                    key={"accent-" + link.href + link.label}
                    type="button"
                    onClick={() => handleQuickLink(link.href, link.external)}
                    className="inline-flex items-center justify-center gap-2 min-h-12 px-5 sm:px-6 rounded-full text-sm sm:text-base font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 ring-1 ring-primary/25 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                {QUICK_LINKS.filter((l) => !l.accent).map((link) => (
                  <button
                    key={link.href + link.label}
                    type="button"
                    onClick={() => handleQuickLink(link.href, link.external)}
                    className="group flex items-center justify-center min-h-[3.25rem] sm:min-h-[3.5rem] px-3 sm:px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-center leading-snug border border-primary/15 bg-background/70 backdrop-blur-sm text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-200"
                  >
                    <span className="whitespace-normal break-words">{link.label}</span>
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