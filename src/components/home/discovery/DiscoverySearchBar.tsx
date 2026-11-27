"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { CityCombobox } from "@/components/shared/CityCombobox";
import { OptionsCombobox } from "@/components/shared/OptionsCombobox";
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

  const countryOptions = useMemo(
    () => [
      { value: "", label: "All countries" },
      ...COUNTRIES.map((c) => ({ value: c.code, label: c.name })),
    ],
    []
  );

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
              placeholder="What are you looking for? Search Here"
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

          {/* Category — same dropdown style as City */}
          <div className="lg:w-[9.5rem] shrink-0">
            <OptionsCombobox
              id="discovery-category"
              value={category}
              onChange={setCategory}
              options={CATEGORIES}
              placeholder="All"
              size="md"
              searchable={false}
              className="w-full"
            />
          </div>

          {/* Country — same dropdown style as City */}
          <div className="lg:w-[11rem] shrink-0">
            <OptionsCombobox
              id="discovery-country"
              value={country}
              onChange={(v) => {
                setCountry(v);
                setCity("");
              }}
              options={countryOptions}
              placeholder="All countries"
              size="md"
              searchable
              className="w-full"
            />
          </div>

          {/* City */}
          <div className="lg:w-[11rem] shrink-0">
            <CityCombobox
              id="discovery-city"
              country={country}
              value={city}
              onChange={setCity}
              size="md"
              allowEmpty
              placeholder="All cities"
              className="w-full"
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
