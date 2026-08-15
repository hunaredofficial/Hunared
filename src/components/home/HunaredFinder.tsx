"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, ChevronDown, ArrowRight, LayoutGrid, List } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "lost", label: "Lost" },
  { value: "found", label: "Found" },
];

export function WhyUsSection() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("");

  function handleSearch(e?: FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (country) params.set("country", country);
    if (status) params.set("status", status);
    params.set("type", "finder");
    router.push(`/search?${params.toString()}`);
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Same clean card style as Program / CTA */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-primary/20 brand-glow p-8 sm:p-10 md:p-12 space-y-8">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-10 -right-10 h-60 w-60 rounded-full bg-[var(--brand-from)] opacity-[0.06] blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-[var(--brand-via)] opacity-[0.06] blur-3xl" />
          </div>

          {/* Header */}
          <div className="text-center space-y-3">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Community Service
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              <span className="gradient-text">Hunared Finder</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Lost something? Found an item? Search the community board or report an item
              so people can reconnect with what matters.
            </p>
          </div>

          {/* Simple search */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary pointer-events-none" />
              <input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search lost or found items..."
                className="w-full h-14 pl-12 pr-4 rounded-2xl border border-primary/15 bg-background/70 text-foreground text-base placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/35 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-12 pl-9 pr-8 rounded-xl border border-primary/15 bg-background/70 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="">All Countries</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-12 pl-3 pr-8 rounded-xl border border-primary/15 bg-background/70 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-full font-semibold text-sm text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg transition-all duration-300 hover:scale-[1.015]"
            >
              Search Listings
            </button>
          </form>

          {/* Report actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/sign-in"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-11 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors"
            >
              Report Lost Item
            </Link>
            <Link
              href="/sign-in"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-11 rounded-full text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
            >
              Report Found Item
            </Link>
          </div>

          {/* Easy access links — categories & listings not shown as big grids */}
          <div className="pt-2 border-t border-border/60">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <Link
                href="/search?type=finder"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <LayoutGrid className="h-4 w-4" />
                Browse categories
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/search?type=finder"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <List className="h-4 w-4" />
                Latest community listings
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}