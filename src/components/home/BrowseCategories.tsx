"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  ShoppingBag,
  Home,
  Wrench,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JOB_CATEGORIES } from "@/lib/constants";

type TabKey = "careers" | "learning" | "marketplace" | "property" | "services";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "careers", label: "Careers", icon: Briefcase },
  { key: "learning", label: "Learning Hub", icon: GraduationCap },
  { key: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { key: "property", label: "Property", icon: Home },
  { key: "services", label: "Services", icon: Wrench },
];



const LEARNING_CATEGORIES: { label: string; href: string }[] = [
  { label: "Career Tips", href: "/education?category=career_tips" },
  { label: "Engineering", href: "/education?category=engineering" },
  { label: "Safety & HSE", href: "/education?category=safety_hse" },
  {
    label: "Rights & Responsibilities",
    href: "/education?category=rights_responsibilities",
  },
];

/** Marketplace groups — matches Post a Listing categories */
const MARKETPLACE_GROUPS: {
  group: string;
  items: { label: string; category: string }[];
}[] = [
  {
    group: "Buy & Sell",
    items: [
      { label: "For Sale", category: "for_sale" },
      { label: "For Rent", category: "for_rent" },
      { label: "Offers & Deals", category: "offers_deals" },
      { label: "Wholesale", category: "wholesale" },
      { label: "Free Items", category: "free_items" },
      { label: "Wanted", category: "wanted" },
    ],
  },
  {
    group: "Products",
    items: [
      { label: "Electronics", category: "electronics" },
      { label: "Furniture & Home", category: "furniture_home" },
      { label: "Vehicles", category: "vehicles" },
      { label: "Other", category: "other" },
    ],
  },
  {
    group: "Business",
    items: [
      { label: "Business & Commercial", category: "business_commercial" },
      { label: "Services", category: "services" },
      { label: "Education & Training", category: "education_training" },
    ],
  },
  {
    group: "Community",
    items: [
      { label: "Lost & Found", category: "lost_found" },
      { label: "Events", category: "events" },
      { label: "Announcements", category: "announcements" },
      { label: "Donations", category: "donations" },
      { label: "Community", category: "community" },
    ],
  },
];

const PROPERTY_GROUPS: {
  group: string;
  items: { label: string; category: string }[];
}[] = [
  {
    group: "Housing",
    items: [
      { label: "Accommodation", category: "accommodation" },
      { label: "Property", category: "property" },
      { label: "For Rent", category: "for_rent" },
    ],
  },
  {
    group: "Buy / Commercial",
    items: [
      { label: "For Sale", category: "for_sale" },
      { label: "Business & Commercial", category: "business_commercial" },
    ],
  },
];

const SERVICE_CATEGORIES: { label: string; category: string }[] = [
  { label: "Services", category: "services" },
  { label: "Education & Training", category: "education_training" },
  { label: "Business & Commercial", category: "business_commercial" },
  { label: "Offers & Deals", category: "offers_deals" },
  { label: "Events", category: "events" },
  { label: "Community", category: "community" },
  { label: "Announcements", category: "announcements" },
];

export function BrowseCategories() {
  const [tab, setTab] = useState<TabKey | null>(null);

  return (
    <section
      className="relative py-14 sm:py-16 md:py-20 px-4 sm:px-6"
      aria-labelledby="browse-categories-heading"
    >
      <div className="max-w-6xl mx-auto space-y-7 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary mb-1">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Explore
          </p>
          <h2 id="browse-categories-heading" className="text-2xl sm:text-3xl font-bold tracking-tight">
            Browse by categories
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Jobs, learning, marketplace, property, and services — open a tab to
            jump in.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab((prev) => (prev === key ? null : key))}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-200",
                tab === key
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                  : "bg-muted/80 text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === null && (
          <p className="text-center text-sm text-muted-foreground py-2">
            Click a tab above to view categories.
          </p>
        )}

        {/* Careers */}
        {tab === "careers" && (
          <div className="rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 text-center">
              Job categories
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {JOB_CATEGORIES.map((c) => (
                <CategoryChip
                  key={c}
                  label={c}
                  href={`/jobs?category=${encodeURIComponent(c)}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Learning */}
        {tab === "learning" && (
          <div className="rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 text-center">
              Education hub
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {LEARNING_CATEGORIES.map((c) => (
                <CategoryChip key={c.label} label={c.label} href={c.href} />
              ))}
              <CategoryChip label="All articles" href="/education" />
            </div>
          </div>
        )}

        {/* Marketplace */}
        {tab === "marketplace" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Link
                href="/market"
                className="text-sm font-medium text-primary hover:underline"
              >
                View full marketplace →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {MARKETPLACE_GROUPS.map(({ group, items }) => (
                <GroupCard key={group} title={group}>
                  {items.map((item) => (
                    <CategoryChip
                      key={item.category}
                      label={item.label}
                      small
                      href={`/market?category=${item.category}`}
                    />
                  ))}
                </GroupCard>
              ))}
            </div>
          </div>
        )}

        {/* Property */}
        {tab === "property" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Link
                href="/market?category=property"
                className="text-sm font-medium text-primary hover:underline"
              >
                View property listings →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {PROPERTY_GROUPS.map(({ group, items }) => (
                <GroupCard key={group} title={group}>
                  {items.map((item) => (
                    <CategoryChip
                      key={item.category + item.label}
                      label={item.label}
                      small
                      href={`/market?category=${item.category}`}
                    />
                  ))}
                </GroupCard>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {tab === "services" && (
          <div className="rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6 space-y-4">
            <div className="flex justify-center">
              <Link
                href="/market?category=services"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all services →
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SERVICE_CATEGORIES.map((s) => (
                <CategoryChip
                  key={s.category}
                  label={s.label}
                  href={`/market?category=${s.category}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryChip({
  label,
  href,
  small,
}: {
  label: string;
  href: string;
  small?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-card text-foreground",
        "hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors",
        small ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"
      )}
    >
      {label}
      <ChevronRight
        className={cn("shrink-0 opacity-50", small ? "h-3 w-3" : "h-3.5 w-3.5")}
      />
    </Link>
  );
}

function GroupCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-2xl border border-border bg-card space-y-3 hover:border-primary/25 transition-colors">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}