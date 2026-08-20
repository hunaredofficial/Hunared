"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { COUNTRIES } from "@/lib/countries";
import { LISTING_CATEGORIES } from "@/lib/constants";
import { useGeo } from "@/components/providers/GeoProvider";

export function MarketFilter({
  defaultSearch = "",
  defaultCategory = "",
  defaultSubcategory = "",
  defaultCountry = "",
  defaultCity = "",
}: {
  defaultSearch?: string;
  defaultCategory?: string;
  defaultSubcategory?: string;
  defaultCountry?: string;
  defaultCity?: string;
}) {
  const router = useRouter();
  const geo = useGeo();

  const [search, setSearch] = useState(defaultSearch);
  const [category, setCategory] = useState(defaultCategory);
  const [country, setCountry] = useState(defaultCountry);
  const [city, setCity] = useState(defaultCity);

  // Auto location when URL has no country/city
  useEffect(() => {
    if (geo.loading) return;
    if (defaultCountry || defaultCity) return;
    if (!geo.countryCode) return;

    setCountry(geo.countryCode);
    if (geo.city) setCity(geo.city);

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (defaultSubcategory) params.set("subcategory", defaultSubcategory);
    params.set("country", geo.countryCode);
    if (geo.city) params.set("city", geo.city);
    router.replace(`/market?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.loading, geo.countryCode, geo.city]);

  function apply(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    if (defaultSubcategory) params.set("subcategory", defaultSubcategory);
    if (country) params.set("country", country);
    if (city.trim()) params.set("city", city.trim());
    router.push(`/market?${params.toString()}`);
  }

  return (
    <form onSubmit={apply} className="mt-6 flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[180px]">
        <label className="text-xs text-muted-foreground mb-1 block">Search</label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search listings..."
          className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-sm rounded-md border border-input bg-background px-2 py-2 focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer max-w-[180px]"
        >
          <option value="">All categories</option>
          {LISTING_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Country</label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="text-sm rounded-md border border-input bg-background px-2 py-2 focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer max-w-[200px]"
        >
          <option value="">All countries</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">City</label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Dubai"
          className="w-32 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <Button type="submit" size="lg" className="cursor-pointer">
        Search
      </Button>

      {(search || category || defaultSubcategory || country || city) && (
        <Button variant="ghost" size="sm" asChild>
          <Link href="/market">Clear</Link>
        </Button>
      )}
    </form>
  );
}