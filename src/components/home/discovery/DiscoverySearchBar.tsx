"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { CityCombobox } from "@/components/shared/CityCombobox";
import { VoiceSearchButton } from "@/components/shared/VoiceSearchButton";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "jobs", label: "Jobs" },
  { value: "candidates", label: "Talent" },
  { value: "companies", label: "Companies" },
  { value: "marketplace", label: "Business" },
  { value: "learning Hub", label: "Learning" },
];

export function DiscoverySearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (country && country !== "all") params.set("country", country);
    if (city) params.set("city", city);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="border-b border-border/50 bg-card/40">
      <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-6 py-3">
        <form
          onSubmit={onSubmit}
          className={cn(
            "flex flex-col lg:flex-row lg:items-stretch gap-2",
            "rounded-2xl border border-border/70 bg-background/80 p-2 shadow-sm"
          )}
        >
          {/* Keyword */}
          <div className="relative flex-1 min-w-0 flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search jobs, talent, companies, business, learning…"
              className="w-full h-11 rounded-xl border-0 bg-transparent pl-10 pr-10 text-sm focus:outline-none focus:ring-0"
              aria-label="Search"
            />
            <div className="absolute right-2">
              <VoiceSearchButton
                onResult={(text) => setQ(text)}
                className="h-8 w-8"
              />
            </div>
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 rounded-xl border border-border/60 bg-muted/30 px-3 text-sm text-foreground lg:w-[9.5rem] shrink-0"
            aria-label="Category"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value || "all"} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Country */}
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setCity("");
            }}
            className="h-11 rounded-xl border border-border/60 bg-muted/30 px-3 text-sm text-foreground lg:w-[11rem] shrink-0"
            aria-label="Country"
          >
            <option value="">All countries</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>

          {/* City */}
          <div className="lg:w-[11rem] shrink-0">
            <CityCombobox
              country={country}
              value={city}
              onChange={setCity}
              size="md"
              allowEmpty
              placeholder="All cities"
              className="w-full"
              inputClassName="h-11 rounded-xl border border-border/60 bg-muted/30 text-sm"
            />
          </div>

          <button
            type="submit"
            className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition shrink-0"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
