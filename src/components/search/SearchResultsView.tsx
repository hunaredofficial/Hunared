"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  User,
  ShoppingBag,
  GraduationCap,
  Search as SearchIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/lib/countries";
import { useGeo } from "@/components/providers/GeoProvider";
import { CityCombobox } from "@/components/shared/CityCombobox";

type Job = {
  id: string;
  job_title: string;
  job_description: string;
  category: string;
  location: string | null;
  company_name: string;
  salary_rate: string | null;
  country?: string | null;
  city?: string | null;
  employment_type?: string;
  created_at: string;
};

type Candidate = {
  id: string;
  full_name: string;
  profession: string | null;
  location: string | null;
  avatar_url: string | null;
  country?: string | null;
  city?: string | null;
};

type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  price: string;
  currency: string;
  image_url: string | null;
  country?: string | null;
  city?: string | null;
  subcategory?: string | null;
};

type Article = {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory?: string | null;
};

interface Props {
  query: string;
  country: string;
  city: string;
  results: {
    jobs: Job[];
    candidates: Candidate[];
    listings: Listing[];
    articles: Article[];
  };
}

type TabKey = "all" | "jobs" | "candidates" | "listings" | "articles";

export function SearchResultsView({ query, country, city, results }: Props) {
  const router = useRouter();
  const geo = useGeo();
  const [keyword, setKeyword] = useState(query);
  const [selectedCountry, setSelectedCountry] = useState(country);
  const [cityInput, setCityInput] = useState(city);
  const [tab, setTab] = useState<TabKey>("all");

  useEffect(() => {
    setKeyword(query);
    setSelectedCountry(country);
    setCityInput(city);
  }, [query, country, city]);

  const totalCount =
    results.jobs.length +
    results.candidates.length +
    results.listings.length +
    results.articles.length;

  // Auto-prefill COUNTRY only when URL has none (city stays empty = All Cities)
  useEffect(() => {
    if (geo.loading) return;
    if (country) return;
    if (!geo.countryCode) return;

    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    params.set("country", geo.countryCode);
    router.replace(`/search?${params.toString()}`);
  }, [geo.loading, geo.countryCode, country, keyword, router]);

  function updateFilters(
    newKeyword: string,
    newCountry: string,
    newCity: string
  ) {
    const params = new URLSearchParams();
    if (newKeyword.trim()) params.set("q", newKeyword.trim());
    if (newCountry) params.set("country", newCountry);
    if (newCity.trim()) params.set("city", newCity.trim());
    router.push(`/search?${params.toString()}`);
  }

  const TABS: {
    key: TabKey;
    label: string;
    icon: React.ElementType;
    count: number;
  }[] = [
    { key: "all", label: "All", icon: SearchIcon, count: totalCount },
    { key: "jobs", label: "Jobs", icon: Briefcase, count: results.jobs.length },
    {
      key: "candidates",
      label: "Candidates",
      icon: User,
      count: results.candidates.length,
    },
    {
      key: "listings",
      label: "Marketplace",
      icon: ShoppingBag,
      count: results.listings.length,
    },
    {
      key: "articles",
      label: "Learning Hub",
      icon: GraduationCap,
      count: results.articles.length,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
          Universal Search
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
          Search across Jobs, Candidates, Marketplace and Learning Hub.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateFilters(keyword, selectedCountry, cityInput);
          }}
          className="flex flex-col gap-3"
        >
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search..."
            className="w-full h-11 rounded-lg border border-input bg-background px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              data-color-scheme="dark"
              value={selectedCountry}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedCountry(v);
                setCityInput("");
              }}
              className="[color-scheme:dark] w-full h-11 rounded-lg border border-input bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option className="bg-background text-foreground" value="">
                All Countries
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

            <CityCombobox
              id="search-city"
              country={selectedCountry}
              value={cityInput}
              onChange={setCityInput}
              size="md"
              className="w-full"
              inputClassName="h-11 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
          >
            Search
          </button>
        </form>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {TABS.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors shrink-0",
              tab === key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-primary/8 hover:text-primary"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            <span className="text-xs opacity-70">({count})</span>
          </button>
        ))}
      </div>

      {(tab === "all" || tab === "jobs") && results.jobs.length > 0 && (
        <Section title="Jobs" icon={Briefcase}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {results.jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <p className="font-semibold text-foreground">{job.job_title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {job.company_name} &bull; {job.location}
                </p>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {job.job_description}
                </p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {(tab === "all" || tab === "candidates") &&
        results.candidates.length > 0 && (
          <Section title="Candidates" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {results.candidates.map((c) => (
                <Link
                  key={c.id}
                  href={`/candidates/${c.id}`}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  {c.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.avatar_url}
                      alt={c.full_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground">
                      {c.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.profession} &bull; {c.location}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}

      {(tab === "all" || tab === "listings") && results.listings.length > 0 && (
        <Section title="Marketplace" icon={ShoppingBag}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {results.listings.map((l) => (
              <Link
                key={l.id}
                href={`/market/${l.id}`}
                className="block p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <p className="font-semibold text-foreground">{l.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {l.location}
                </p>
                <p className="text-sm font-medium text-primary mt-1">
                  {l.currency} {l.price}
                </p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {(tab === "all" || tab === "articles") && results.articles.length > 0 && (
        <Section title="Learning Hub" icon={GraduationCap}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {results.articles.map((a) => (
              <Link
                key={a.id}
                href={`/education/${a.id}`}
                className="block p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <p className="font-semibold text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {a.content}
                </p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {query && totalCount === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>
            No results found for &ldquo;{query}&rdquo;. Try a different
            keyword.
          </p>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        <Icon className="h-4 w-4" /> {title}
      </h2>
      {children}
    </div>
  );
}
