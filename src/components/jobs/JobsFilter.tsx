"use client";

import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { useGeo } from "@/components/providers/GeoProvider";
import { cn } from "@/lib/utils";

export type CompSort = "" | "comp_asc" | "comp_desc";
export type DateOrder = "" | "newest" | "oldest";

const PAYOUT_OPTIONS = [
  { value: "", label: "Any" },
  { value: "Hourly", label: "Hourly" },
  { value: "Monthly", label: "Monthly" },
  { value: "After Interview", label: "Negotiable" },
] as const;

const DURATION_OPTIONS = [
  { value: "", label: "Any Duration" },
  { value: "shutdown", label: "Shutdown" },
  { value: "temporary", label: "Temporary" },
  { value: "short_term", label: "Short Term" },
  { value: "long_term", label: "Long Term" },
  { value: "permanent", label: "Permanent" },
] as const;

const DATE_POSTED_OPTIONS = [
  { value: "", label: "Any Time" },
  { value: "today", label: "Today" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "3d", label: "Last 3 Days" },
  { value: "7d", label: "Last 7 Days" },
  { value: "15d", label: "Last 15 Days" },
  { value: "30d", label: "Last 30 Days" },
] as const;

const EXPERIENCE_OPTIONS = [
  { value: "", label: "Any" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
  { value: "master", label: "Master" },
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

export function JobsFilter({
  defaultSearch,
  defaultCategory,
  defaultCountry,
  defaultCity,
  defaultSort = "",
  defaultPayout = "",
  defaultDuration = "",
  defaultPosted = "",
  defaultDateOrder = "",
  defaultExperience = "",
  categories,
}: {
  defaultSearch: string;
  defaultCategory: string;
  defaultCountry: string;
  defaultCity: string;
  defaultSort?: string;
  defaultPayout?: string;
  defaultDuration?: string;
  defaultPosted?: string;
  defaultDateOrder?: string;
  defaultExperience?: string;
  categories: string[];
}) {
  const router = useRouter();
  const geo = useGeo();

  const [search, setSearch] = useState(defaultSearch);
  const [category, setCategory] = useState(defaultCategory);
  const [country, setCountry] = useState(defaultCountry);
  const [city, setCity] = useState(defaultCity);

  // Advanced filter state (sheet)
  const [compSort, setCompSort] = useState<CompSort>(
    (defaultSort as CompSort) || ""
  );
  const [payout, setPayout] = useState(defaultPayout);
  const [duration, setDuration] = useState(defaultDuration);
  const [posted, setPosted] = useState(defaultPosted);
  const [dateOrder, setDateOrder] = useState<DateOrder>(
    (defaultDateOrder as DateOrder) || ""
  );
  const [experience, setExperience] = useState(defaultExperience);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    compensation: true,
    payout: false,
    duration: false,
    date: false,
    experience: false,
  });

  const [sheetOpen, setSheetOpen] = useState(false);

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const buildParams = useCallback(
    (overrides: Record<string, string> = {}) => {
      const vals = {
        search,
        category,
        country,
        city,
        sort: compSort,
        payout,
        duration,
        posted,
        dateOrder,
        experience,
        ...overrides,
      };
      const params = new URLSearchParams();
      if (vals.search.trim()) params.set("search", vals.search.trim());
      if (vals.category) params.set("category", vals.category);
      if (vals.country) params.set("country", vals.country);
      if (vals.city.trim()) params.set("city", vals.city.trim());
      if (vals.sort) params.set("sort", vals.sort);
      if (vals.payout) params.set("payout", vals.payout);
      if (vals.duration) params.set("duration", vals.duration);
      if (vals.posted) params.set("posted", vals.posted);
      if (vals.dateOrder) params.set("dateOrder", vals.dateOrder);
      if (vals.experience) params.set("experience", vals.experience);
      return params;
    },
    [
      search,
      category,
      country,
      city,
      compSort,
      payout,
      duration,
      posted,
      dateOrder,
      experience,
    ]
  );

  const applyQuick = useCallback(
    (overrides: Record<string, string> = {}) => {
      router.push(`/jobs?${buildParams(overrides).toString()}`);
    },
    [router, buildParams]
  );

  const applyAdvanced = () => {
    router.push(`/jobs?${buildParams().toString()}`);
    setSheetOpen(false);
  };

  const clearAll = () => {
    setSearch("");
    setCategory("");
    setCountry("");
    setCity("");
    setCompSort("");
    setPayout("");
    setDuration("");
    setPosted("");
    setDateOrder("");
    setExperience("");
    router.push("/jobs");
    setSheetOpen(false);
  };

  // Auto-fill location once when URL has no country/city
  useEffect(() => {
    if (geo.loading) return;
    if (defaultCountry || defaultCity) return;
    if (!geo.countryCode) return;
    setCountry(geo.countryCode);
    if (geo.city) setCity(geo.city);
    applyQuick({
      country: geo.countryCode,
      city: geo.city ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.loading, geo.countryCode, geo.city]);

  const activeAdvancedCount = useMemo(() => {
    let n = 0;
    if (compSort) n++;
    if (payout) n++;
    if (duration) n++;
    if (posted) n++;
    if (dateOrder) n++;
    if (experience) n++;
    return n;
  }, [compSort, payout, duration, posted, dateOrder, experience]);

  const hasAnyFilter = !!(
    search ||
    category ||
    country ||
    city ||
    activeAdvancedCount > 0
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyQuick();
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={category}
          onValueChange={(v: string | null) => {
            const val = v ?? "";
            setCategory(val);
            applyQuick({ category: val });
          }}
        >
          <SelectTrigger className="sm:w-[180px] cursor-pointer">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="" className="cursor-pointer">
              All categories
            </SelectItem>
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
            applyQuick({ country: val });
          }}
        >
          <SelectTrigger className="sm:w-[200px] cursor-pointer">
            <SelectValue placeholder="All countries">
              {country
                ? COUNTRIES.find((c) => c.code === country)?.name ?? country
                : "All countries"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="" className="cursor-pointer">
              All countries
            </SelectItem>
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
            if (e.key === "Enter") applyQuick();
          }}
          className="sm:w-[130px]"
        />

        {/* Advanced Filters — replaces simple Rate dropdown */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
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
          <SheetContent
            side="right"
            className="w-full sm:max-w-md flex flex-col p-0"
          >
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle>Job Filters</SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4">
              <Section
                title="Compensation"
                open={!!openSections.compensation}
                onToggle={() => toggleSection("compensation")}
              >
                <RadioRow
                  checked={compSort === ""}
                  label="Default"
                  onSelect={() => setCompSort("")}
                />
                <RadioRow
                  checked={compSort === "comp_asc"}
                  label="Low to High"
                  onSelect={() => setCompSort("comp_asc")}
                />
                <RadioRow
                  checked={compSort === "comp_desc"}
                  label="High to Low"
                  onSelect={() => setCompSort("comp_desc")}
                />
              </Section>

              <Section
                title="Payout Frequency"
                open={!!openSections.payout}
                onToggle={() => toggleSection("payout")}
              >
                {PAYOUT_OPTIONS.map((o) => (
                  <RadioRow
                    key={o.value || "any"}
                    checked={payout === o.value}
                    label={o.label}
                    onSelect={() => setPayout(o.value)}
                  />
                ))}
              </Section>

              <Section
                title="Job Duration"
                open={!!openSections.duration}
                onToggle={() => toggleSection("duration")}
              >
                {DURATION_OPTIONS.map((o) => (
                  <RadioRow
                    key={o.value || "any"}
                    checked={duration === o.value}
                    label={o.label}
                    onSelect={() => setDuration(o.value)}
                  />
                ))}
              </Section>

              <Section
                title="Date Posted"
                open={!!openSections.date}
                onToggle={() => toggleSection("date")}
              >
                <p className="text-xs text-muted-foreground px-2 mb-1">
                  Posted within
                </p>
                {DATE_POSTED_OPTIONS.map((o) => (
                  <RadioRow
                    key={o.value || "any"}
                    checked={posted === o.value}
                    label={o.label}
                    onSelect={() => setPosted(o.value)}
                  />
                ))}
                <p className="text-xs text-muted-foreground px-2 mt-3 mb-1">
                  Sort by date
                </p>
                <RadioRow
                  checked={dateOrder === ""}
                  label="Default"
                  onSelect={() => setDateOrder("")}
                />
                <RadioRow
                  checked={dateOrder === "newest"}
                  label="Newest First"
                  onSelect={() => setDateOrder("newest")}
                />
                <RadioRow
                  checked={dateOrder === "oldest"}
                  label="Oldest First"
                  onSelect={() => setDateOrder("oldest")}
                />
              </Section>

              <Section
                title="Experience Level"
                open={!!openSections.experience}
                onToggle={() => toggleSection("experience")}
              >
                {EXPERIENCE_OPTIONS.map((o) => (
                  <RadioRow
                    key={o.value || "any"}
                    checked={experience === o.value}
                    label={o.label}
                    onSelect={() => setExperience(o.value)}
                  />
                ))}
              </Section>
            </div>

            <SheetFooter className="border-t px-4 py-3 flex-row gap-2 sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Clear all
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSheetOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={applyAdvanced}>
                  Apply filters
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Button
          variant="outline"
          onClick={() => applyQuick()}
          className="sm:w-auto cursor-pointer"
        >
          Search
        </Button>

        {hasAnyFilter && (
          <Button
            variant="ghost"
            onClick={clearAll}
            className="sm:w-auto cursor-pointer"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Active advanced filter chips */}
      {activeAdvancedCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {compSort === "comp_asc" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Compensation: Low → High
              <button type="button" onClick={() => { setCompSort(""); applyQuick({ sort: "" }); }} aria-label="Remove">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {compSort === "comp_desc" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Compensation: High → Low
              <button type="button" onClick={() => { setCompSort(""); applyQuick({ sort: "" }); }} aria-label="Remove">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {payout && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Payout: {payout === "After Interview" ? "Negotiable" : payout}
              <button type="button" onClick={() => { setPayout(""); applyQuick({ payout: "" }); }} aria-label="Remove">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {duration && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Duration: {DURATION_OPTIONS.find((d) => d.value === duration)?.label ?? duration}
              <button type="button" onClick={() => { setDuration(""); applyQuick({ duration: "" }); }} aria-label="Remove">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {posted && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Posted: {DATE_POSTED_OPTIONS.find((d) => d.value === posted)?.label ?? posted}
              <button type="button" onClick={() => { setPosted(""); applyQuick({ posted: "" }); }} aria-label="Remove">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dateOrder === "newest" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Newest First
              <button type="button" onClick={() => { setDateOrder(""); applyQuick({ dateOrder: "" }); }} aria-label="Remove">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dateOrder === "oldest" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Oldest First
              <button type="button" onClick={() => { setDateOrder(""); applyQuick({ dateOrder: "" }); }} aria-label="Remove">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {experience && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Experience: {EXPERIENCE_OPTIONS.find((e) => e.value === experience)?.label ?? experience}
              <button type="button" onClick={() => { setExperience(""); applyQuick({ experience: "" }); }} aria-label="Remove">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
