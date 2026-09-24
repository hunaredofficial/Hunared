"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Shield,
  Phone,
  Laptop,
  FileText,
  CreditCard,
  Key,
  Wallet,
  Briefcase,
  Gem,
  MoreHorizontal,
} from "lucide-react";
import { VoiceSearchButton } from "@/components/shared/VoiceSearchButton";
import { CityCombobox } from "@/components/shared/CityCombobox";
import { COUNTRIES } from "@/lib/countries";
import { useGeo } from "@/components/providers/GeoProvider";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ITEM_TYPES = [
  { label: "Mobile Phones", href: "/market?type=lost_found&sub=phones", icon: Phone },
  { label: "Laptops & Tablets", href: "/market?type=lost_found&sub=laptops", icon: Laptop },
  { label: "Electronics", href: "/market?type=lost_found&sub=electronics", icon: Laptop },
  { label: "Documents", href: "/market?type=lost_found&sub=documents", icon: FileText },
  { label: "IDs & Cards", href: "/market?type=lost_found&sub=ids", icon: CreditCard },
  { label: "Keys", href: "/market?type=lost_found&sub=keys", icon: Key },
  { label: "Wallets", href: "/market?type=lost_found&sub=wallets", icon: Wallet },
  { label: "Bags & Luggage", href: "/market?type=lost_found&sub=bags", icon: Briefcase },
  { label: "Jewelry", href: "/market?type=lost_found&sub=jewelry", icon: Gem },
  { label: "Other", href: "/market?type=lost_found", icon: MoreHorizontal },
];

export function FinderExperience() {
  const router = useRouter();
  const geo = useGeo();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<"all" | "lost" | "found">("all");

  useEffect(() => {
    if (geo.loading) return;
    if (!country && geo.countryCode) setCountry(geo.countryCode);
  }, [geo.loading, geo.countryCode, country]);

  function handleSearch(e?: FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    params.set("type", "lost_found");
    if (query.trim()) params.set("q", query.trim());
    if (country) params.set("country", country);
    if (city) params.set("city", city);
    if (status === "lost") params.set("status", "lost");
    if (status === "found") params.set("status", "found");
    router.push(`/market?${params.toString()}`);
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative pt-24 sm:pt-28 pb-10 sm:pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-3">
          <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/8 px-3 py-0.5 text-[11px] font-semibold tracking-wide text-primary uppercase">
            Community service
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Finder Center
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Lost something? Found something? Search the community board or report
            an item so others can help reconnect it with its owner.
          </p>
        </div>
      </section>

      {/* Dominant actions */}
      <section className="pb-8 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/post?type=lost_found&status=lost"
            className="group flex items-start gap-4 rounded-xl border-2 border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                I lost something
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Report a lost item so the community can help.
              </p>
            </div>
          </Link>
          <Link
            href="/post?type=lost_found&status=found"
            className="group flex items-start gap-4 rounded-xl border-2 border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                I found something
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Report a found item to help return it.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Search */}
      <section className="pb-12 px-4 sm:px-6">
        <form
          onSubmit={handleSearch}
          className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4"
        >
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lost or found items…"
              className="w-full h-12 pl-11 pr-12 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <VoiceSearchButton onResult={(t) => setQuery(t)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCity("");
                }}
                className="w-full h-11 pl-9 pr-8 rounded-lg border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
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
            <CityCombobox
              id="finder-city"
              country={country}
              value={city}
              onChange={setCity}
              size="md"
            />
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["all", "lost", "found"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "flex-1 text-xs font-medium py-2.5 capitalize transition-colors",
                    status === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full h-11 font-semibold">
            Search listings
          </Button>
        </form>
      </section>

      {/* Categories */}
      <section className="pb-12 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Browse by item type
          </h2>
          <div className="flex flex-wrap gap-2">
            {ITEM_TYPES.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </div>
          <div className="mt-5">
            <Link
              href="/market?type=lost_found"
              className="text-sm font-semibold text-primary hover:underline"
            >
              View all lost & found listings →
            </Link>
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-border bg-muted/20 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-sm text-foreground mb-2">
                Stay safe
              </h2>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                <li>• Protect personal information — do not share full ID numbers or home addresses publicly.</li>
                <li>• Meet in safe, public locations if exchanging an item.</li>
                <li>• Never share passwords, OTPs, or financial details.</li>
                <li>• Report suspicious activity via Contact.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
