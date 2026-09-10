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

/**
 * MARKETPLACE only — products & classifieds.
 * Home and Vehicles are separate groups (not merged).
 * Property & Services live in their own tabs.
 */
const MARKETPLACE_GROUPS: {
  group: string;
  items: { label: string; category: string }[];
}[] = [
  {
    group: "Buy & Sell",
    items: [
      { label: "For Sale", category: "for_sale" },
      { label: "Offers & Deals", category: "offers_deals" },
      { label: "Wholesale", category: "wholesale" },
      { label: "Free Items", category: "free_items" },
      { label: "Wanted", category: "wanted" },
    ],
  },
  {
    group: "Electronics & Tech",
    items: [
      { label: "Electronics", category: "electronics" },
      { label: "Mobiles & Accessories", category: "mobiles_accessories" },
      { label: "Tools & Equipment", category: "tools_equipment" },
      { label: "Industrial & Materials", category: "industrial_materials" },
      { label: "Health & Medical", category: "health_medical" },
    ],
  },
  {
    group: "Home & Living",
    items: [
      { label: "Home & Furniture", category: "home_furniture" },
      { label: "Personal & Workwear", category: "personel_workwear" },
      { label: "Kids & Baby", category: "kids_baby" },
      { label: "Food & Agriculture", category: "food_agriculture" },
    ],
  },
  {
    group: "Vehicles",
    items: [
      { label: "Vehicles", category: "vehicles" },
      { label: "For Rent (Equipment)", category: "for_rent" },
    ],
  },
  {
    group: "Pets & Lifestyle",
    items: [
      { label: "Pets & Animals", category: "pets_animals" },
      { label: "Sports & Outdoors", category: "sports_outdoors" },
      { label: "Other", category: "other" },
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

/**
 * PROPERTY tab — housing & real estate only (not mixed into Marketplace products)
 */
const PROPERTY_GROUPS: {
  group: string;
  items: { label: string; category: string; subcategory?: string }[];
}[] = [
  {
    group: "Accommodation",
    items: [
      { label: "Accommodation", category: "accommodation" },
      { label: "Apartments", category: "accommodation", subcategory: "Apartments" },
      { label: "Rooms & Bed Spaces", category: "accommodation", subcategory: "Rooms" },
      { label: "Shared Housing", category: "accommodation", subcategory: "Shared Housing" },
      { label: "Staff / Worker Housing", category: "accommodation", subcategory: "Staff Accommodation" },
      { label: "Hotels & Short Stays", category: "accommodation", subcategory: "Hotels & Short Stays" },
    ],
  },
  {
    group: "For Rent",
    items: [
      { label: "Residential Rentals", category: "for_rent", subcategory: "Residential Properties" },
      { label: "Apartments", category: "for_rent", subcategory: "Apartments" },
      { label: "Houses & Villas", category: "for_rent", subcategory: "Houses" },
      { label: "Commercial Spaces", category: "for_rent", subcategory: "Commercial Properties" },
      { label: "Offices & Shops", category: "for_rent", subcategory: "Offices" },
      { label: "Warehouses", category: "for_rent", subcategory: "Warehouses" },
    ],
  },
  {
    group: "Real Estate",
    items: [
      { label: "Property", category: "property" },
      { label: "Apartments", category: "property", subcategory: "Apartments" },
      { label: "Villas & Houses", category: "property", subcategory: "Villas" },
      { label: "Land & Plots", category: "property", subcategory: "Residential Plots" },
      { label: "Commercial Buildings", category: "property", subcategory: "Commercial Buildings" },
      { label: "Industrial", category: "property", subcategory: "Industrial Properties" },
    ],
  },
  {
    group: "Buy / Business",
    items: [
      { label: "For Sale", category: "for_sale" },
      { label: "Business & Commercial", category: "business_commercial" },
    ],
  },
];

/**
 * SERVICES tab — professional & trade services (own section, not mixed into products)
 */
const SERVICE_GROUPS: {
  group: string;
  items: { label: string; category: string; subcategory?: string }[];
}[] = [
  {
    group: "Trades & Technical",
    items: [
      { label: "Electrical & Power", category: "services", subcategory: "Electrical & Power Services" },
      { label: "Mechanical", category: "services", subcategory: "Mechanical Services" },
      { label: "Plumbing & Water", category: "services", subcategory: "Plumbing & Water Services" },
      { label: "HVAC & Cooling", category: "services", subcategory: "HVAC, Cooling & Refrigeration" },
      { label: "Welding & Fabrication", category: "services", subcategory: "Welding, Fabrication & Metalwork" },
      { label: "Construction & Civil", category: "services", subcategory: "Construction & Civil Works" },
    ],
  },
  {
    group: "Industrial & Safety",
    items: [
      { label: "Industrial Maintenance", category: "services", subcategory: "Industrial Maintenance & Engineering" },
      { label: "Oil & Gas & Energy", category: "services", subcategory: "Oil & Gas & Energy Services" },
      { label: "Instrumentation", category: "services", subcategory: "Instrumentation, Automation & Control" },
      { label: "Inspection & Testing", category: "services", subcategory: "Inspection, Testing & Certification" },
      { label: "HSE, Fire & Safety", category: "services", subcategory: "HSE, Fire & Safety Services" },
      { label: "Scaffolding & Access", category: "services", subcategory: "Scaffolding & Access Services" },
    ],
  },
  {
    group: "IT & Professional",
    items: [
      { label: "IT & Tech Support", category: "services", subcategory: "IT, Computer & Technical Support" },
      { label: "Web & Software", category: "services", subcategory: "Web, Software & App Development" },
      { label: "Digital Marketing", category: "services", subcategory: "Digital Marketing, SEO & E-Commerce" },
      { label: "Business Consulting", category: "services", subcategory: "Business, Management & Professional Consulting" },
      { label: "Accounting & Legal", category: "services", subcategory: "Accounting, Finance & Legal Services" },
      { label: "Education & Training", category: "education_training" },
    ],
  },
  {
    group: "Home & Lifestyle",
    items: [
      { label: "Cleaning & Facilities", category: "services", subcategory: "Cleaning, Housekeeping & Facility Services" },
      { label: "Property Services", category: "services", subcategory: "Property & Real Estate Services" },
      { label: "Automotive", category: "services", subcategory: "Automotive & Vehicle Services" },
      { label: "Beauty & Wellness", category: "services", subcategory: "Beauty, Personal Care & Wellness" },
      { label: "Events & Catering", category: "services", subcategory: "Events, Catering & Hospitality" },
      { label: "All Services", category: "services" },
    ],
  },
];

function marketHref(category: string, subcategory?: string) {
  if (subcategory) {
    return `/market?category=${category}&subcategory=${encodeURIComponent(subcategory)}`;
  }
  return `/market?category=${category}`;
}

export function BrowseCategories() {
  const [tab, setTab] = useState<TabKey | null>("marketplace");

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
          <h2
            id="browse-categories-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight"
          >
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
          <p className="text-center text-sm text-muted-foreground pt-1">
            Select a tab to view categories.
          </p>
        )}

        {/* Careers */}
        {tab === "careers" && (
          <Panel>
            <PanelLink href="/jobs" label="View all jobs →" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
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
          </Panel>
        )}

        {/* Learning */}
        {tab === "learning" && (
          <Panel>
            <PanelLink href="/education" label="View all articles →" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
              Education hub
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {LEARNING_CATEGORIES.map((c) => (
                <CategoryChip key={c.label} label={c.label} href={c.href} />
              ))}
              <CategoryChip label="All articles" href="/education" />
            </div>
          </Panel>
        )}

        {/* MARKETPLACE — products only; Home ≠ Vehicles */}
        {tab === "marketplace" && (
          <div className="space-y-5">
            <div className="flex justify-center">
              <PanelLink href="/market" label="View full marketplace →" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {MARKETPLACE_GROUPS.map(({ group, items }) => (
                <GroupCard key={group} title={group}>
                  {items.map((item) => (
                    <CategoryChip
                      key={`${group}-${item.category}-${item.label}`}
                      label={item.label}
                      small
                      href={marketHref(item.category)}
                    />
                  ))}
                </GroupCard>
              ))}
            </div>
          </div>
        )}

        {/* PROPERTY — own tab, housing & real estate */}
        {tab === "property" && (
          <div className="space-y-5">
            <div className="flex justify-center">
              <PanelLink
                href="/market?category=property"
                label="View property listings →"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {PROPERTY_GROUPS.map(({ group, items }) => (
                <GroupCard key={group} title={group}>
                  {items.map((item) => (
                    <CategoryChip
                      key={`${group}-${item.label}`}
                      label={item.label}
                      small
                      href={marketHref(item.category, item.subcategory)}
                    />
                  ))}
                </GroupCard>
              ))}
            </div>
          </div>
        )}

        {/* SERVICES — own tab, trades & professional */}
        {tab === "services" && (
          <div className="space-y-5">
            <div className="flex justify-center">
              <PanelLink
                href="/market?category=services"
                label="View all services →"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {SERVICE_GROUPS.map(({ group, items }) => (
                <GroupCard key={group} title={group}>
                  {items.map((item) => (
                    <CategoryChip
                      key={`${group}-${item.label}`}
                      label={item.label}
                      small
                      href={marketHref(item.category, item.subcategory)}
                    />
                  ))}
                </GroupCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6 space-y-4">
      {children}
    </div>
  );
}

function PanelLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-primary hover:underline inline-flex justify-center w-full sm:w-auto"
    >
      {label}
    </Link>
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
    <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card space-y-3 hover:border-primary/25 transition-colors h-full min-h-[120px] flex flex-col">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5 content-start flex-1">{children}</div>
    </div>
  );
}
