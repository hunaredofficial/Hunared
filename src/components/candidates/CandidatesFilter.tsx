"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useMemo, useEffect } from "react";
import { PROFESSIONS } from "@/lib/constants";
import { COUNTRIES } from "@/lib/countries";
import { getCitiesForCountry } from "@/lib/cities";
import { VoiceSearchButton } from "@/components/shared/VoiceSearchButton";
import { CityCombobox } from "@/components/shared/CityCombobox";

const SKILL_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
  "Master",
] as const;

export function CandidatesFilter({
  defaultSearch,
  defaultProfession,
  defaultCountry,
  defaultCity,
  defaultLevel,
  defaultAvailable,
}: {
  defaultSearch: string;
  defaultProfession: string;
  defaultCountry: string;
  defaultCity: string;
  defaultLevel: string;
  defaultAvailable: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(defaultSearch);
  const [profession, setProfession] = useState(defaultProfession || "all");
  const [country, setCountry] = useState(defaultCountry || "all");
  const [city, setCity] = useState(defaultCity);
  const [level, setLevel] = useState(defaultLevel || "all");
  const [available, setAvailable] = useState(defaultAvailable || "all");
  const [countrySearch, setCountrySearch] = useState("");

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  const apply = useCallback(
    (opts: {
      search: string;
      profession: string;
      country: string;
      city: string;
      level: string;
      available: string;
    }) => {
      const params = new URLSearchParams();
      if (opts.search) params.set("search", opts.search);
      if (opts.profession && opts.profession !== "all")
        params.set("profession", opts.profession);
      if (opts.country && opts.country !== "all")
        params.set("country", opts.country);
      if (opts.city.trim()) params.set("city", opts.city.trim());
      if (opts.level && opts.level !== "all") params.set("level", opts.level);
      if (opts.available && opts.available !== "all")
        params.set("available", opts.available);
      router.push(`/candidates?${params.toString()}`);
    },
    [router]
  );

  const runApply = () =>
    apply({ search, profession, country, city, level, available });

  const clear = () => {
    setSearch("");
    setProfession("all");
    setCountry("all");
    setCity("");
    setLevel("all");
    setAvailable("all");
    setCountrySearch("");
    router.push("/candidates");
  };

  const hasFilters =
    search ||
    (profession && profession !== "all") ||
    (country && country !== "all") ||
    city.trim() ||
    (level && level !== "all") ||
    (available && available !== "all");

  const professionLabel =
    profession === "all" ? "All professions" : profession;
  const countryLabel =
    country === "all"
      ? "All countries"
      : COUNTRIES.find((c) => c.code === country)?.name ?? "Country";
  const levelLabel = level === "all" ? "All levels" : level;
  const availableLabel =
    available === "all"
      ? "All availability"
      : available === "yes"
        ? "Available for hire"
        : "Unavailable";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runApply();
            }}
            className="pl-9 pr-10"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            <VoiceSearchButton
              size="sm"
              onResult={(t) => {
                setSearch(t);
                apply({
                  search: t,
                  profession,
                  country,
                  city,
                  level,
                  available,
                });
              }}
            />
          </div>
        </div>

        {/* Profession */}
        <Select
          value={profession}
          onValueChange={(v) => {
            setProfession(v);
            apply({
              search,
              profession: v,
              country,
              city,
              level,
              available,
            });
          }}
        >
          <SelectTrigger className="sm:w-[180px] cursor-pointer">
            <SelectValue>{professionLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background text-foreground border-border">
            <SelectItem value="all">All professions</SelectItem>
            {PROFESSIONS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Country (searchable) */}
        <Select
          value={country}
          onValueChange={(v) => {
            setCountry(v);
            setCity("");
            apply({
              search,
              profession,
              country: v,
              city: "",
              level,
              available,
            });
          }}
        >
          <SelectTrigger className="sm:w-[180px] cursor-pointer">
            <SelectValue>{countryLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background text-foreground border-border">
            <div className="p-2 sticky top-0 bg-background z-10">
              <Input
                placeholder="Search country..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="h-8"
              />
            </div>
            <SelectItem value="all">All countries</SelectItem>
            {filteredCountries.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* City — type any name or pick from list */}
        <div className="sm:w-[160px]">
          <CityCombobox
            id="candidates-city"
            country={country === "all" ? "" : country}
            value={city}
            onChange={setCity}
            size="sm"
            variant="select"
          />
        </div>

        {/* Skill Level */}
        <Select
          value={level}
          onValueChange={(v) => {
            setLevel(v);
            apply({
              search,
              profession,
              country,
              city,
              level: v,
              available,
            });
          }}
        >
          <SelectTrigger className="sm:w-[150px] cursor-pointer">
            <SelectValue>{levelLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background text-foreground border-border">
            <SelectItem value="all">All levels</SelectItem>
            {SKILL_LEVELS.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Available for hire */}
        <Select
          value={available}
          onValueChange={(v) => {
            setAvailable(v);
            apply({
              search,
              profession,
              country,
              city,
              level,
              available: v,
            });
          }}
        >
          <SelectTrigger className="sm:w-[170px] cursor-pointer">
            <SelectValue>{availableLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background text-foreground border-border">
            <SelectItem value="all">All availability</SelectItem>
            <SelectItem value="yes">Available for hire</SelectItem>
            <SelectItem value="no">Unavailable</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={runApply} className="cursor-pointer">
          Search
        </Button>

        {hasFilters && (
          <Button variant="ghost" onClick={clear} className="cursor-pointer">
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}