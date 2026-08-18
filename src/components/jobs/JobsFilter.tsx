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
import { useCallback, useState } from "react";
import { COUNTRIES } from "@/lib/countries";

export function JobsFilter({
  defaultSearch,
  defaultCategory,
  defaultCountry,
  defaultCity,
  categories,
}: {
  defaultSearch: string;
  defaultCategory: string;
  defaultCountry: string;
  defaultCity: string;
  categories: string[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState(defaultSearch);
  const [category, setCategory] = useState(defaultCategory);
  const [country, setCountry] = useState(defaultCountry);
  const [city, setCity] = useState(defaultCity);

  const apply = useCallback(
    (s: string, c: string, co: string, ci: string) => {
      const params = new URLSearchParams();
      if (s) params.set("search", s);
      if (c) params.set("category", c);
      if (co) params.set("country", co);
      if (ci.trim()) params.set("city", ci.trim());
      router.push(`/jobs?${params.toString()}`);
    },
    [router]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") apply(search, category, country, city);
          }}
          className="pl-9"
        />
      </div>
      <Select
        value={category}
        onValueChange={(v: string | null) => {
          const val = v ?? "";
          setCategory(val);
          apply(search, val, country, city);
        }}
      >
        <SelectTrigger className="sm:w-[180px] cursor-pointer">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="" className="cursor-pointer">All categories</SelectItem>
          {Array.from(new Set(categories)).map((c) => (
  <SelectItem key={c} value={c} className="cursor-pointer">
    {c}
  </SelectItem>
))}
        </SelectContent>
      </Select>
      <Select
        value={country}
        onValueChange={(v: string | null) => {
          const val = v ?? "";
          setCountry(val);
          apply(search, category, val, city);
        }}
      >
        <SelectTrigger className="sm:w-[170px] cursor-pointer">
          <SelectValue placeholder="All countries" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="" className="cursor-pointer">All countries</SelectItem>
          {COUNTRIES.map((c) => (
            <SelectItem key={c.code} value={c.code} className="cursor-pointer">
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="City..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") apply(search, category, country, city);
        }}
        className="sm:w-[130px]"
      />
      <Button
        variant="outline"
        onClick={() => apply(search, category, country, city)}
        className="sm:w-auto cursor-pointer"
      >
        Search
      </Button>
      {(search || category || country || city) && (
        <Button
          variant="ghost"
          onClick={() => {
            setSearch("");
            setCategory("");
            setCountry("");
            setCity("");
            router.push("/jobs");
          }}
          className="sm:w-auto cursor-pointer"
        >
          Clear
        </Button>
      )}
    </div>
  );
}