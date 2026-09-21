"use client";

import { useState, useEffect, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { useGeo } from "@/components/providers/GeoProvider";
import { VoiceSearchButton } from "@/components/shared/VoiceSearchButton";
import { CityCombobox } from "@/components/shared/CityCombobox";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "jobs", label: "Jobs" },
  { value: "candidates", label: "Talent" },
  { value: "companies", label: "Companies" },
  { value: "marketplace", label: "Marketplace" },
  { value: "services", label: "Services" },
  { value: "learning Hub", label: "Learning" },
  { value: "properties", label: "Property" },
  { value: "accommodation", label: "Accommodation" },
];

/** Full popular pool — rotated so the 5 chips change over time / by day */
const POPULAR_POOL = [
  { q: "Instrument Technician", href: "/search?q=Instrument+Technician&category=jobs" },
  { q: "HSE Officer", href: "/search?q=HSE+Officer&category=jobs" },
  { q: "Software Engineer", href: "/search?q=Software+Engineer&category=jobs" },
  { q: "Apartment for Rent", href: "/search?q=Apartment&category=marketplace" },
  { q: "Electrical Services", href: "/search?q=Electrical+Services&category=services" },
  { q: "Mechanical Engineer", href: "/search?q=Mechanical+Engineer&category=jobs" },
  { q: "Project Manager", href: "/search?q=Project+Manager&category=jobs" },
  { q: "Safety Officer", href: "/search?q=Safety+Officer&category=jobs" },
  { q: "Accountant", href: "/search?q=Accountant&category=jobs" },
  { q: "Driver", href: "/search?q=Driver&category=jobs" },
  { q: "Nurse", href: "/search?q=Nurse&category=jobs" },
  { q: "Welder", href: "/search?q=Welder&category=jobs" },
  { q: "Car for Sale", href: "/search?q=Car&category=marketplace" },
  { q: "Laptop", href: "/search?q=Laptop&category=marketplace" },
  { q: "Villa for Rent", href: "/search?q=Villa&category=marketplace" },
  { q: "Plumbing Services", href: "/search?q=Plumbing&category=services" },
  { q: "AC Technician", href: "/search?q=AC+Technician&category=jobs" },
  { q: "Civil Engineer", href: "/search?q=Civil+Engineer&category=jobs" },
  { q: "Office Assistant", href: "/search?q=Office+Assistant&category=jobs" },
  { q: "Furniture", href: "/search?q=Furniture&category=marketplace" },
];

function pickPopular(count = 5) {
  const day =
    Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % POPULAR_POOL.length;
  const out: typeof POPULAR_POOL = [];
  for (let i = 0; i < count; i++) {
    out.push(POPULAR_POOL[(day + i) % POPULAR_POOL.length]);
  }
  return out;
}

export function HeroSection() {
  const router = useRouter();
  const geo = useGeo();

  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [mounted, setMounted] = useState(false);

  const popular = useMemo(() => pickPopular(5), []);

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
    <section className="relative min-h-[auto] sm:min-h-[70vh] flex flex-col items-center justify-center overflow-hidden pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
        <div className="absolute top-[14%] left-1/2 -translate-x-1/2 h-[380px] w-[620px] rounded-full bg-primary opacity-[0.04] blur-[110px]" />
      </div>

      <div
        className={cn(
          "mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 transition-all duration-600",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >
        <form
          onSubmit={handleSearch}
          className="relative overflow-hidden rounded-2xl bg-card border border-border brand-glow p-6 sm:p-8 md:p-10 space-y-6"
        >
          <div className="text-center space-y-2.5">
            <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/8 px-3 py-0.5 text-[11px] sm:text-xs font-semibold tracking-wide text-primary uppercase">
              Universal Search
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold tracking-tight leading-[1.15] text-foreground">
              Find work. Find talent.{" "}
              <span className="text-primary">Find opportunity.</span>
            </h1>
            <p className="text-sm sm:text-[15px] text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Jobs, professionals, companies, services and marketplace — one
              global platform.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Job title, skill, company, product, or service…"
              className="w-full h-14 sm:h-16 pl-12 sm:pl-14 pr-14 rounded-2xl border border-border bg-background text-foreground text-base sm:text-lg placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary/40 transition shadow-sm"
              autoComplete="off"
            />
            <div className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2">
              <VoiceSearchButton onResult={(t) => setQuery(t)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCity("");
                }}
                data-color-scheme="dark"
                className="w-full h-11 sm:h-12 pl-9 pr-8 rounded-lg border border-border bg-background text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer [color-scheme:dark]"
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

            <CityCombobox
              id="hero-city"
              country={country}
              value={city}
              onChange={setCity}
              size="lg"
              variant="hero"
            />

            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                data-color-scheme="dark"
                className="w-full h-11 sm:h-12 pl-3.5 pr-8 rounded-lg border border-border bg-background text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer [color-scheme:dark]"
              >
                {CATEGORIES.map((c) => (
                  <option
                    key={c.value}
                    value={c.value}
                    className="bg-background text-foreground"
                  >
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 sm:h-13 rounded-xl font-semibold text-sm sm:text-base text-primary-foreground bg-primary hover:bg-primary/90 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.99]"
          >
            Search
          </button>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
            <span className="text-[11px] text-muted-foreground mr-0.5">Popular:</span>
            {popular.map((item) => (
              <a
                key={item.q}
                href={item.href}
                className="inline-flex items-center rounded-full border border-border/80 bg-background/80 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                {item.q}
              </a>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}
