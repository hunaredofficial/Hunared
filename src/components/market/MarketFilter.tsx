"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { COUNTRIES } from "@/lib/countries";
import {
  LISTING_CATEGORIES,
  LISTING_SUBCATEGORIES,
  LISTING_CONDITION_OPTIONS,
  LOST_FOUND_STATUS_OPTIONS,
  RENTAL_PERIOD_OPTIONS,
} from "@/lib/constants";
import { useGeo } from "@/components/providers/GeoProvider";
import { CityCombobox } from "@/components/shared/CityCombobox";
import { VoiceSearchButton } from "@/components/shared/VoiceSearchButton";
import { cn } from "@/lib/utils";

const SUBCATEGORIES = LISTING_SUBCATEGORIES;

const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

const DATE_POSTED_OPTIONS = [
  { value: "", label: "Any Time" },
  { value: "today", label: "Today" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "3d", label: "Last 3 Days" },
  { value: "7d", label: "Last 7 Days" },
  { value: "14d", label: "Last 14 Days" },
  { value: "30d", label: "Last 30 Days" },
] as const;

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border/60 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-2.5 text-left text-sm font-medium hover:text-primary transition-colors"
      >
        {title}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="pb-3 space-y-0.5">{children}</div>}
    </div>
  );
}

function RadioRow({
  checked,
  label,
  onSelect,
}: {
  checked: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-left transition-colors",
        checked
          ? "bg-primary/10 text-primary font-medium"
          : "hover:bg-muted text-foreground"
      )}
    >
      <span
        className={cn(
          "h-3.5 w-3.5 shrink-0 rounded-full border",
          checked
            ? "border-primary bg-primary ring-2 ring-primary/30"
            : "border-muted-foreground/40"
        )}
      />
      {label}
    </button>
  );
}

export function MarketFilter({
  defaultSearch = "",
  defaultCategory = "",
  defaultSubcategory = "",
  defaultCountry = "",
  defaultCity = "",
  defaultSort = "",
  defaultMinPrice = "",
  defaultMaxPrice = "",
  defaultPosted = "",
  defaultStatus = "",
  variant = "bar",
}: {
  defaultSearch?: string;
  defaultCategory?: string;
  defaultSubcategory?: string;
  defaultCountry?: string;
  defaultCity?: string;
  defaultSort?: string;
  defaultMinPrice?: string;
  defaultMaxPrice?: string;
  defaultPosted?: string;
  defaultStatus?: string;
  /** sidebar = all filters in left panel (no right sheet). bar = compact top + one sheet on mobile */
  variant?: "bar" | "sidebar";
}) {
  const router = useRouter();
  const geo = useGeo();

  const [search, setSearch] = useState(defaultSearch);
  const [category, setCategory] = useState(defaultCategory);
  const [country, setCountry] = useState(defaultCountry);
  const [city, setCity] = useState(defaultCity);
  const [sort, setSort] = useState(defaultSort);
  const [minPrice, setMinPrice] = useState(defaultMinPrice);
  const [maxPrice, setMaxPrice] = useState(defaultMaxPrice);
  const [posted, setPosted] = useState(defaultPosted);
  const [subcategory, setSubcategory] = useState(defaultSubcategory);
  const [lfStatus, setLfStatus] = useState(defaultStatus);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    location: true,
    sort: true,
    price: true,
    date: false,
    type: true,
    condition: false,
    rental: false,
    service: false,
    status: true,
  });

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const availableSubs = category ? SUBCATEGORIES[category] ?? [] : [];
  const showCondition = category === "for_sale";
  const showRental = category === "for_rent" || category === "accommodation";
  const showService = category === "services";
  const showStatus = category === "lost_found";
  const showType = availableSubs.length > 0 && !showRental && !showService;
  const conditionOptions = showCondition ? [...LISTING_CONDITION_OPTIONS] : [];
  const rentalOptions =
    category === "for_rent"
      ? [...RENTAL_PERIOD_OPTIONS]
      : category === "accommodation"
        ? availableSubs
        : [];

  function buildParams(overrides: Record<string, string> = {}) {
    const vals = {
      search,
      category,
      subcategory,
      country,
      city,
      sort,
      minPrice,
      maxPrice,
      posted,
      status: lfStatus,
      ...overrides,
    };
    const params = new URLSearchParams();
    if (vals.search.trim()) params.set("search", vals.search.trim());
    if (vals.category) params.set("category", vals.category);
    if (vals.subcategory) params.set("subcategory", vals.subcategory);
    if (vals.country) params.set("country", vals.country);
    if (vals.city.trim()) params.set("city", vals.city.trim());
    if (vals.sort) params.set("sort", vals.sort);
    if (vals.minPrice.trim()) params.set("minPrice", vals.minPrice.trim());
    if (vals.maxPrice.trim()) params.set("maxPrice", vals.maxPrice.trim());
    if (vals.posted) params.set("posted", vals.posted);
    if (vals.status) params.set("status", vals.status);
    return params.toString();
  }

  function applyQuick(overrides: Record<string, string> = {}) {
    const q = buildParams(overrides);
    router.push(q ? `/market?${q}` : "/market");
  }

  function applyAll() {
    applyQuick();
    setSheetOpen(false);
  }

  function clearAll() {
    setSearch("");
    setCategory("");
    setCountry("");
    setCity("");
    setSort("");
    setMinPrice("");
    setMaxPrice("");
    setPosted("");
    setSubcategory("");
    setLfStatus("");
    router.push("/market");
    setSheetOpen(false);
  }

  useEffect(() => {
    setSearch(defaultSearch);
    setCategory(defaultCategory);
    setCountry(defaultCountry);
    setCity(defaultCity);
    setSort(defaultSort);
    setMinPrice(defaultMinPrice);
    setMaxPrice(defaultMaxPrice);
    setPosted(defaultPosted);
    setSubcategory(defaultSubcategory);
    setLfStatus(defaultStatus);
  }, [
    defaultSearch,
    defaultCategory,
    defaultCountry,
    defaultCity,
    defaultSort,
    defaultMinPrice,
    defaultMaxPrice,
    defaultPosted,
    defaultSubcategory,
    defaultStatus,
  ]);

  useEffect(() => {
    if (geo.loading || country || defaultCountry) return;
    if (geo.countryCode) setCountry(geo.countryCode);
  }, [geo.loading, geo.countryCode, country, defaultCountry]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (search) n++;
    if (category) n++;
    if (subcategory) n++;
    if (country) n++;
    if (city) n++;
    if (sort) n++;
    if (minPrice || maxPrice) n++;
    if (posted) n++;
    if (lfStatus) n++;
    return n;
  }, [search, category, subcategory, country, city, sort, minPrice, maxPrice, posted, lfStatus]);

  const advancedBody = (
    <>
      <Section title="Sort by" open={!!openSections.sort} onToggle={() => toggleSection("sort")}>
        {SORT_OPTIONS.map((o) => (
          <RadioRow
            key={o.value || "rec"}
            checked={sort === o.value}
            label={o.label}
            onSelect={() => {
              setSort(o.value);
              if (variant === "sidebar") applyQuick({ sort: o.value });
            }}
          />
        ))}
      </Section>

      <Section title="Price" open={!!openSections.price} onToggle={() => toggleSection("price")}>
        <div className="grid grid-cols-2 gap-2 px-1 pt-1">
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Min</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 50"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full h-8 rounded-md border border-border bg-background px-2 text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Max</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full h-8 rounded-md border border-border bg-background px-2 text-sm"
            />
          </div>
        </div>
        {variant === "sidebar" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2 w-full h-8"
            onClick={() => applyQuick()}
          >
            Apply price
          </Button>
        )}
      </Section>

      <Section title="Date posted" open={!!openSections.date} onToggle={() => toggleSection("date")}>
        {DATE_POSTED_OPTIONS.map((o) => (
          <RadioRow
            key={o.value || "any"}
            checked={posted === o.value}
            label={o.label}
            onSelect={() => {
              setPosted(o.value);
              if (variant === "sidebar") applyQuick({ posted: o.value });
            }}
          />
        ))}
      </Section>

      {showType && (
        <Section title="Type" open={!!openSections.type} onToggle={() => toggleSection("type")}>
          <RadioRow
            checked={!subcategory}
            label="Any"
            onSelect={() => {
              setSubcategory("");
              if (variant === "sidebar") applyQuick({ subcategory: "" });
            }}
          />
          {availableSubs.map((s) => (
            <RadioRow
              key={s}
              checked={subcategory === s}
              label={s}
              onSelect={() => {
                setSubcategory(s);
                if (variant === "sidebar") applyQuick({ subcategory: s });
              }}
            />
          ))}
        </Section>
      )}

      {showCondition && conditionOptions.length > 0 && (
        <Section title="Condition" open={!!openSections.condition} onToggle={() => toggleSection("condition")}>
          <RadioRow
            checked={!subcategory || !conditionOptions.includes(subcategory as (typeof LISTING_CONDITION_OPTIONS)[number])}
            label="Any"
            onSelect={() => {
              setSubcategory("");
              if (variant === "sidebar") applyQuick({ subcategory: "" });
            }}
          />
          {conditionOptions.map((c) => (
            <RadioRow
              key={c}
              checked={subcategory === c}
              label={c}
              onSelect={() => {
                setSubcategory(c);
                if (variant === "sidebar") applyQuick({ subcategory: c });
              }}
            />
          ))}
        </Section>
      )}

      {showRental && rentalOptions.length > 0 && (
        <Section title="Rental period" open={!!openSections.rental} onToggle={() => toggleSection("rental")}>
          <RadioRow
            checked={!subcategory}
            label="Any"
            onSelect={() => {
              setSubcategory("");
              if (variant === "sidebar") applyQuick({ subcategory: "" });
            }}
          />
          {rentalOptions.map((r) => (
            <RadioRow
              key={r}
              checked={subcategory === r}
              label={r}
              onSelect={() => {
                setSubcategory(r);
                if (variant === "sidebar") applyQuick({ subcategory: r });
              }}
            />
          ))}
        </Section>
      )}

      {showStatus && (
        <Section title="Status" open={!!openSections.status} onToggle={() => toggleSection("status")}>
          <RadioRow
            checked={!lfStatus}
            label="Any"
            onSelect={() => {
              setLfStatus("");
              if (variant === "sidebar") applyQuick({ status: "" });
            }}
          />
          {LOST_FOUND_STATUS_OPTIONS.map((s) => (
            <RadioRow
              key={s}
              checked={lfStatus === s.toLowerCase()}
              label={s}
              onSelect={() => {
                const v = s.toLowerCase();
                setLfStatus(v);
                if (variant === "sidebar") applyQuick({ status: v });
              }}
            />
          ))}
        </Section>
      )}
    </>
  );

  const chips = activeCount > 0 && (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {search && (
        <Badge variant="secondary" className="gap-1 text-xs">
          “{search}”
          <button type="button" onClick={() => { setSearch(""); applyQuick({ search: "" }); }} aria-label="Remove">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {category && (
        <Badge variant="secondary" className="gap-1 text-xs">
          {LISTING_CATEGORIES.find((c) => c.value === category)?.label ?? category}
          <button type="button" onClick={() => { setCategory(""); setSubcategory(""); applyQuick({ category: "", subcategory: "" }); }} aria-label="Remove">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {country && (
        <Badge variant="secondary" className="gap-1 text-xs">
          {COUNTRIES.find((c) => c.code === country)?.name ?? country}
          <button type="button" onClick={() => { setCountry(""); setCity(""); applyQuick({ country: "", city: "" }); }} aria-label="Remove">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {city && (
        <Badge variant="secondary" className="gap-1 text-xs">
          {city}
          <button type="button" onClick={() => { setCity(""); applyQuick({ city: "" }); }} aria-label="Remove">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {sort && (
        <Badge variant="secondary" className="gap-1 text-xs">
          {SORT_OPTIONS.find((s) => s.value === sort)?.label ?? sort}
          <button type="button" onClick={() => { setSort(""); applyQuick({ sort: "" }); }} aria-label="Remove">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {(minPrice || maxPrice) && (
        <Badge variant="secondary" className="gap-1 text-xs">
          Price {minPrice || "0"}–{maxPrice || "∞"}
          <button type="button" onClick={() => { setMinPrice(""); setMaxPrice(""); applyQuick({ minPrice: "", maxPrice: "" }); }} aria-label="Remove">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      <button type="button" onClick={clearAll} className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2">
        Clear all
      </button>
    </div>
  );

  /* ── SIDEBAR: everything in one left panel — no right sheet ── */
  if (variant === "sidebar") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Filters</span>
          {activeCount > 0 && (
            <button type="button" onClick={clearAll} className="text-xs text-muted-foreground hover:text-primary">
              Clear all
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search listings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyQuick()}
            className="w-full h-9 rounded-md border border-border bg-background pl-8 pr-9 text-sm"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <VoiceSearchButton size="sm" onResult={(t) => { setSearch(t); applyQuick({ search: t }); }} />
          </div>
        </div>

        <Section title="Category" open={!!openSections.category} onToggle={() => toggleSection("category")}>
          <select
            value={category}
            onChange={(e) => {
              const v = e.target.value;
              setCategory(v);
              setSubcategory("");
              applyQuick({ category: v, subcategory: "" });
            }}
            className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm"
          >
            <option value="">All categories</option>
            {LISTING_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Section>

        <Section title="Location" open={!!openSections.location} onToggle={() => toggleSection("location")}>
          <div className="space-y-2">
            <select
              value={country}
              onChange={(e) => {
                const v = e.target.value;
                setCountry(v);
                setCity("");
                applyQuick({ country: v, city: "" });
              }}
              className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value="">All countries</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            <CityCombobox
              id="market-city-sidebar"
              country={country}
              value={city}
              onChange={(v) => {
                setCity(v);
                applyQuick({ city: v });
              }}
              className="w-full"
              size="sm"
              variant="select"
            />
          </div>
        </Section>

        {advancedBody}

        <Button size="sm" className="w-full" onClick={applyAll}>
          Apply filters
        </Button>
        {chips}
      </div>
    );
  }

  /* ── BAR (mobile / fallback): search row + ONE sheet with all filters ── */
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search listings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyQuick()}
            className="w-full h-9 rounded-md border border-border bg-background pl-9 pr-10 text-sm"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            <VoiceSearchButton size="sm" onResult={(t) => { setSearch(t); applyQuick({ search: t }); }} />
          </div>
        </div>

        <select
          value={category}
          onChange={(e) => {
            const v = e.target.value;
            setCategory(v);
            setSubcategory("");
            applyQuick({ category: v, subcategory: "" });
          }}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm sm:w-[160px]"
        >
          <option value="">All categories</option>
          {LISTING_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <select
          value={country}
          onChange={(e) => {
            const v = e.target.value;
            setCountry(v);
            setCity("");
            applyQuick({ country: v, city: "" });
          }}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm sm:w-[160px]"
        >
          <option value="">All countries</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <Button
            type="button"
            variant="outline"
            className="h-9 gap-2"
            onClick={() => setSheetOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            More filters
            {activeCount > 0 && (
              <Badge className="h-5 min-w-5 px-1.5 text-[10px]">{activeCount}</Badge>
            )}
          </Button>
          <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle>Marketplace filters</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <div className="mb-3">
                <CityCombobox
                  id="market-city-sheet"
                  country={country}
                  value={city}
                  onChange={setCity}
                  className="w-full"
                  size="sm"
                  variant="select"
                />
              </div>
              {advancedBody}
            </div>
            <SheetFooter className="border-t px-4 py-3 flex-row gap-2 sm:justify-between">
              <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                Clear all
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSheetOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={applyAll}>
                  Apply
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Button type="button" className="h-9" onClick={() => applyQuick()}>
          Search
        </Button>
        {activeCount > 0 && (
          <Button type="button" variant="ghost" size="sm" className="h-9" onClick={clearAll}>
            Clear
          </Button>
        )}
      </div>
      {chips}
    </div>
  );
}
