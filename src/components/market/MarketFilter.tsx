"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { LISTING_CATEGORIES } from "@/lib/constants";
import { useGeo } from "@/components/providers/GeoProvider";
import { CityCombobox } from "@/components/shared/CityCombobox";
import { VoiceSearchButton } from "@/components/shared/VoiceSearchButton";
import { cn } from "@/lib/utils";

/** Subcategories by category — mirrors publish form (real data only). */
const SUBCATEGORIES: Record<string, string[]> = {
  accommodation: [
    "Houses for Rent",
    "Apartments",
    "Villas",
    "Rooms",
    "Bed Spaces",
    "Commercial Property",
    "Offices",
    "Shops",
    "Warehouses",
    "Land",
  ],
  property: [
    "Apartment",
    "Villa",
    "Land",
    "Commercial",
    "Office",
    "Shop",
    "Warehouse",
  ],
  vehicles: ["Cars", "Motorcycles", "Trucks", "Spare Parts", "Tires"],
  electronics: [
    "Mobile Phones",
    "Laptops",
    "Computers",
    "Tablets",
    "Watches",
    "Printers",
  ],
  furniture_home: [
    "Furniture",
    "Appliances",
    "Kitchen",
    "Decor",
    "Home Accessories",
  ],
  services: [
    "Electrical",
    "Mechanical",
    "Plumbing",
    "HVAC",
    "Carpentry",
    "Painting",
    "Welding",
    "IT Support",
    "Web Development",
    "Design",
    "Cleaning",
    "Security",
    "Logistics",
    "Transportation",
    "Consulting",
  ],
  for_sale: ["New", "Used", "Like New"],
  for_rent: ["Daily", "Weekly", "Monthly", "Yearly"],
  lost_found: ["Mobile Phones", "Laptops", "Tablets", "Documents", "Keys", "Other"],
};

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
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3 text-left text-sm font-medium hover:text-primary transition-colors"
      >
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="pb-3 space-y-1.5">{children}</div>}
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
        "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm text-left transition-colors",
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

  const [sheetOpen, setSheetOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sort: true,
    price: true,
    date: false,
    type: true,
    condition: false,
    rental: false,
    service: false,
  });

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const availableSubs = category ? SUBCATEGORIES[category] ?? [] : [];

  // Category-aware section visibility (only where real subcategory data exists)
  const showCondition =
    category === "for_sale" ||
    category === "vehicles" ||
    category === "electronics" ||
    category === "furniture_home";
  const showRental = category === "for_rent" || category === "accommodation";
  const showService = category === "services";
  const showType = availableSubs.length > 0 && !showCondition && !showRental && !showService;

  // For for_sale, New/Used/Like New act as condition
  const conditionOptions =
    category === "for_sale"
      ? ["New", "Used", "Like New"]
      : [];

  const rentalOptions =
    category === "for_rent"
      ? ["Daily", "Weekly", "Monthly", "Yearly"]
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
    return params;
  }

  function applyQuick(overrides: Record<string, string> = {}) {
    router.push(`/market?${buildParams(overrides).toString()}`);
  }

  function applyAdvanced() {
    router.push(`/market?${buildParams().toString()}`);
    setSheetOpen(false);
  }

  function clearAll() {
    setSearch("");
    setCategory("");
    setSubcategory("");
    setCountry("");
    setCity("");
    setSort("");
    setMinPrice("");
    setMaxPrice("");
    setPosted("");
    router.push("/market");
    setSheetOpen(false);
  }

  // Auto country only; city stays All Cities
  useEffect(() => {
    if (geo.loading) return;
    if (defaultCountry || defaultCity) return;
    if (!geo.countryCode) return;

    setCountry(geo.countryCode);
    const params = buildParams({
      country: geo.countryCode,
      city: "",
    });
    router.replace(`/market?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.loading, geo.countryCode]);

  // Reset subcategory when category changes away from current
  useEffect(() => {
    if (!category) {
      setSubcategory("");
      return;
    }
    const subs = SUBCATEGORIES[category] ?? [];
    if (subcategory && !subs.includes(subcategory)) {
      setSubcategory("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const activeAdvancedCount = useMemo(() => {
    let n = 0;
    if (sort) n++;
    if (minPrice) n++;
    if (maxPrice) n++;
    if (posted) n++;
    if (subcategory) n++;
    return n;
  }, [sort, minPrice, maxPrice, posted, subcategory]);

  const hasAnyFilter = !!(
    search ||
    category ||
    country ||
    city ||
    activeAdvancedCount > 0
  );

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs text-muted-foreground mb-1 block">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyQuick();
              }}
              placeholder="Search listings..."
              className="w-full pl-9 pr-10 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              <VoiceSearchButton
                size="sm"
                onResult={(t) => {
                  setSearch(t);
                  applyQuick({ search: t });
                }}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Category
          </label>
          <select data-color-scheme="dark"
            value={category}
            onChange={(e) => {
              const v = e.target.value;
              setCategory(v);
              setSubcategory("");
              applyQuick({ category: v, subcategory: "" });
            }}
            className="[color-scheme:dark] text-sm rounded-md border border-input bg-background px-2 py-2 focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer max-w-[180px]"
          >
            <option className="bg-background text-foreground" value="">All categories</option>
            {LISTING_CATEGORIES.map((c) => (
              <option className="bg-background text-foreground" key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Country
          </label>
          <select data-color-scheme="dark"
            value={country}
            onChange={(e) => {
              const v = e.target.value;
              setCountry(v);
              setCity("");
              applyQuick({ country: v, city: "" });
            }}
            className="[color-scheme:dark] text-sm rounded-md border border-input bg-background px-2 py-2 focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer max-w-[200px]"
          >
            <option className="bg-background text-foreground" value="">All countries</option>
            {COUNTRIES.map((c) => (
              <option className="bg-background text-foreground" key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">City</label>
          <CityCombobox
            id="market-city"
            country={country}
            value={city}
            onChange={setCity}
            className="w-40"
            size="sm"
            variant="select"
          />
        </div>

        {/* Advanced Filters panel */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block opacity-0">
            Filters
          </label>
          <Button
            type="button"
            variant="outline"
            className="gap-2 cursor-pointer relative"
            onClick={() => setSheetOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeAdvancedCount > 0 && (
              <Badge
                variant="default"
                className="ml-0.5 h-5 min-w-5 px-1.5 text-[10px]"
              >
                {activeAdvancedCount}
              </Badge>
            )}
          </Button>
        </div>

        <Button type="button" size="lg" className="cursor-pointer" onClick={() => applyQuick()}>
          Search
        </Button>

        {hasAnyFilter && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear
          </Button>
        )}
      </div>

      {/* Active chips */}
      {activeAdvancedCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sort && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {SORT_OPTIONS.find((s) => s.value === sort)?.label ?? sort}
              <button
                type="button"
                onClick={() => {
                  setSort("");
                  applyQuick({ sort: "" });
                }}
                aria-label="Remove sort"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(minPrice || maxPrice) && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Price {minPrice || "0"}–{maxPrice || "∞"}
              <button
                type="button"
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                  applyQuick({ minPrice: "", maxPrice: "" });
                }}
                aria-label="Remove price range"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {posted && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {DATE_POSTED_OPTIONS.find((d) => d.value === posted)?.label ?? posted}
              <button
                type="button"
                onClick={() => {
                  setPosted("");
                  applyQuick({ posted: "" });
                }}
                aria-label="Remove date"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {subcategory && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {subcategory}
              <button
                type="button"
                onClick={() => {
                  setSubcategory("");
                  applyQuick({ subcategory: "" });
                }}
                aria-label="Remove type"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>Marketplace Filters</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4">
            <Section
              title="Sort By"
              open={!!openSections.sort}
              onToggle={() => toggleSection("sort")}
            >
              {SORT_OPTIONS.map((o) => (
                <RadioRow
                  key={o.value || "rec"}
                  checked={sort === o.value}
                  label={o.label}
                  onSelect={() => setSort(o.value)}
                />
              ))}
            </Section>

            <Section
              title="Price"
              open={!!openSections.price}
              onToggle={() => toggleSection("price")}
            >
              <RadioRow
                checked={sort !== "price_asc" && sort !== "price_desc"}
                label="Any Price (default order)"
                onSelect={() => {
                  if (sort === "price_asc" || sort === "price_desc") setSort("");
                }}
              />
              <RadioRow
                checked={sort === "price_asc"}
                label="Low to High"
                onSelect={() => setSort("price_asc")}
              />
              <RadioRow
                checked={sort === "price_desc"}
                label="High to Low"
                onSelect={() => setSort("price_desc")}
              />
              <div className="grid grid-cols-2 gap-2 px-2 pt-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Min Price
                  </label>
                  <input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-2 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Max Price
                  </label>
                  <input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-2 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </Section>

            <Section
              title="Date Posted"
              open={!!openSections.date}
              onToggle={() => toggleSection("date")}
            >
              {DATE_POSTED_OPTIONS.map((o) => (
                <RadioRow
                  key={o.value || "any"}
                  checked={posted === o.value}
                  label={o.label}
                  onSelect={() => setPosted(o.value)}
                />
              ))}
            </Section>

            {/* Type / Subcategory — when category has types */}
            {showType && (
              <Section
                title="Type"
                open={!!openSections.type}
                onToggle={() => toggleSection("type")}
              >
                <RadioRow
                  checked={!subcategory}
                  label="Any"
                  onSelect={() => setSubcategory("")}
                />
                {availableSubs.map((s) => (
                  <RadioRow
                    key={s}
                    checked={subcategory === s}
                    label={s}
                    onSelect={() => setSubcategory(s)}
                  />
                ))}
              </Section>
            )}

            {/* Condition — only for_sale (New / Used / Like New stored as subcategory) */}
            {showCondition && conditionOptions.length > 0 && (
              <Section
                title="Condition"
                open={!!openSections.condition}
                onToggle={() => toggleSection("condition")}
              >
                <RadioRow
                  checked={!subcategory}
                  label="Any"
                  onSelect={() => setSubcategory("")}
                />
                {conditionOptions.map((s) => (
                  <RadioRow
                    key={s}
                    checked={subcategory === s}
                    label={s}
                    onSelect={() => setSubcategory(s)}
                  />
                ))}
              </Section>
            )}

            {/* Vehicles / Electronics / Furniture type when not for_sale condition */}
            {showCondition && category !== "for_sale" && availableSubs.length > 0 && (
              <Section
                title="Type"
                open={!!openSections.type}
                onToggle={() => toggleSection("type")}
              >
                <RadioRow
                  checked={!subcategory}
                  label="Any"
                  onSelect={() => setSubcategory("")}
                />
                {availableSubs.map((s) => (
                  <RadioRow
                    key={s}
                    checked={subcategory === s}
                    label={s}
                    onSelect={() => setSubcategory(s)}
                  />
                ))}
              </Section>
            )}

            {/* Rental period */}
            {showRental && rentalOptions.length > 0 && (
              <Section
                title={category === "for_rent" ? "Rental Period" : "Property Type"}
                open={!!openSections.rental}
                onToggle={() => toggleSection("rental")}
              >
                <RadioRow
                  checked={!subcategory}
                  label="Any"
                  onSelect={() => setSubcategory("")}
                />
                {rentalOptions.map((s) => (
                  <RadioRow
                    key={s}
                    checked={subcategory === s}
                    label={s}
                    onSelect={() => setSubcategory(s)}
                  />
                ))}
              </Section>
            )}

            {/* Services */}
            {showService && (
              <Section
                title="Service Type"
                open={!!openSections.service}
                onToggle={() => toggleSection("service")}
              >
                <RadioRow
                  checked={!subcategory}
                  label="Any"
                  onSelect={() => setSubcategory("")}
                />
                {availableSubs.map((s) => (
                  <RadioRow
                    key={s}
                    checked={subcategory === s}
                    label={s}
                    onSelect={() => setSubcategory(s)}
                  />
                ))}
              </Section>
            )}
          </div>

          <SheetFooter className="border-t px-4 py-3 flex-row gap-2 sm:justify-between">
            <Button type="button" variant="ghost" size="sm" onClick={clearAll} className="gap-1">
              <X className="h-3.5 w-3.5" />
              Clear all
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSheetOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={applyAdvanced}>
                Apply filters
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
