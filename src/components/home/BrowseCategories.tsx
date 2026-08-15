"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase, GraduationCap, ShoppingBag, Home, Wrench, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Section 3: Browse By Categories (Phase 2 spec).
 * Tabbed category grids — every chip links to the matching filtered page.
 */

type TabKey = "careers" | "learning" | "marketplace" | "property" | "services";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "careers", label: "Careers", icon: Briefcase },
  { key: "learning", label: "Learning Hub", icon: GraduationCap },
  { key: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { key: "property", label: "Property", icon: Home },
  { key: "services", label: "Services", icon: Wrench },
];

// Careers — full spec list (job categories)
const CAREER_CATEGORIES = [
  "Accounting",
  "Administration",
  "Agriculture",
  "Aviation",
  "Architectural",
  "Automotive",
  "Automation",
  "Banking",
  "Business",
  "Chemical",
  "Civil",
  "Coating",
  "Community Services",
  "Construction",
  "Control",
  "Creative",
  "Customer Service",
  "Delivery",
  "Design",
  "Digital Marketing",
  "Domestic Services",
  "Drafting",
  "Education",
  "Electronics",
  "Emergency Services",
  "Energy",
  "Engineering",
  "Entertainment",
  "Environmental",
  "Facilities Management",
  "Fabrication",
  "Finance",
  "Foreman",
  "Freelance",
  "Government",
  "Healthcare",
  "Helper",
  "Hospitality",
  "HVAC",
  "Human Resources",
  "Environmental Health & Safety",
  "Information Technology",
  "Inspection",
  "Instrumentation",
  "Inventory",
  "Landscaping",
  "Labor",
  "Laboratory",
  "Law & Legal",
  "Lifting",
  "Logistics",
  "Maintenance",
  "Management",
  "Manufacturing",
  "Marine",
  "Marketing",
  "Mechanical",
  "Medical",
  "Media",
  "Mining",
  "NGO",
  "Networking",
  "Offshore",
  "Oil & Gas",
  "Others",
  "Painting",
  "Petroleum",
  "Personal Care",
  "Piping",
  "Planning",
  "Plumbing",
  "Printing",
  "Process",
  "Procurement",
  "Production",
  "Professional Services",
  "Property",
  "Publishing",
  "QA & QC",
  "Refrigeration",
  "Real Estate",
  "Remote Work",
  "Research Services",
  "Retail",
  "Rigging",
  "Sales",
  "Security",
  "Skilled Worker",
  "Structural",
  "Supply Chain",
  "Supervisor",
  "Telecommunications",
  "Textile",
  "Training",
  "Transportation",
  "Technician",
  "Utilities",
  "Warehouse",
  "Welding",
  "Work Permit",
];

const LEARNING_CATEGORIES: { label: string; href: string }[] = [
  { label: "Career Tips", href: "/education?category=career_tips" },
  { label: "Engineering", href: "/education?category=engineering" },
  { label: "Safety & HSE", href: "/education?category=safety_hse" },
];

const MARKETPLACE_GROUPS: { group: string; items: string[] }[] = [
  { group: "Electronics", items: ["Mobile Phones", "Laptops", "Computers", "Tablets", "Watches", "Printers"] },
  { group: "Home & Living", items: ["Furniture", "Appliances", "Kitchen Equipment", "Decor"] },
  { group: "Industrial", items: ["Tools", "Machinery", "Safety Equipment", "Construction Equipment"] },
  { group: "Automotive", items: ["Cars", "Motorcycles", "Trucks", "Spare Parts", "Tires"] },
];

// Map marketplace group → the DB category param
const MARKETPLACE_GROUP_CATEGORY: Record<string, string> = {
  Electronics: "electronics",
  "Home & Living": "other",
  Industrial: "other",
  Automotive: "vehicles",
};

const PROPERTY_GROUPS: { group: string; items: string[] }[] = [
  { group: "Residential", items: ["Apartments", "Villas", "Houses", "Rooms", "Bed Spaces"] },
  { group: "Commercial", items: ["Offices", "Shops", "Warehouses", "Factories", "Buildings"] },
  { group: "Land", items: ["Residential Land", "Commercial Land", "Agricultural Land"] },
];

const SERVICE_CATEGORIES = [
  "Electrical", "Mechanical", "Plumbing", "HVAC", "Carpentry", "Painting",
  "Welding", "Fabrication", "IT Support", "Software Development", "Graphic Design",
  "Web Development", "SEO", "Digital Marketing", "Cleaning", "Security",
  "Logistics", "Transportation", "Consulting",
];

export function BrowseCategories() {
  const [tab, setTab] = useState<TabKey | null>(null);

  return (
    <section className="py-16 px-4 sm:px-6" aria-labelledby="browse-categories-heading">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h2 id="browse-categories-heading" className="text-3xl font-bold">
            Browse by Categories
          </h2>
          <p className="text-muted-foreground mt-2">
  Choose a category type below to explore. Nothing is opened until you click.
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
        "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors",
        tab === key
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  ))}
</div>

{/* Hint when nothing selected */}
{tab === null && (
  <p className="text-center text-sm text-muted-foreground">
    Click Careers, Learning Hub, Marketplace, Property, or Services to view categories.
  </p>
)}
        {/* Careers */}
        {tab === "careers" && (
          <div className="flex flex-wrap justify-center gap-2">
            {CAREER_CATEGORIES.map((c) => (
              <CategoryChip key={c} label={c} href={`/jobs?category=${encodeURIComponent(c)}`} />
            ))}
          </div>
        )}

        {/* Learning Hub */}
        {tab === "learning" && (
          <div className="flex flex-wrap justify-center gap-2">
            {LEARNING_CATEGORIES.map((c) => (
              <CategoryChip key={c.label} label={c.label} href={c.href} />
            ))}
          </div>
        )}

        {/* Marketplace */}
        {tab === "marketplace" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MARKETPLACE_GROUPS.map(({ group, items }) => (
              <GroupCard key={group} title={group}>
                {items.map((item) => (
                  <CategoryChip
                    key={item}
                    label={item}
                    small
                    href={`/market?category=${MARKETPLACE_GROUP_CATEGORY[group]}&subcategory=${encodeURIComponent(item)}`}
                  />
                ))}
              </GroupCard>
            ))}
          </div>
        )}

        {/* Property */}
        {tab === "property" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PROPERTY_GROUPS.map(({ group, items }) => (
              <GroupCard key={group} title={group}>
                {items.map((item) => (
                  <CategoryChip
                    key={item}
                    label={item}
                    small
                    href={`/market?category=accommodation&subcategory=${encodeURIComponent(item)}`}
                  />
                ))}
              </GroupCard>
            ))}
          </div>
        )}

        {/* Services */}
        {tab === "services" && (
          <div className="flex flex-wrap justify-center gap-2">
            {SERVICE_CATEGORIES.map((s) => (
              <CategoryChip
                key={s}
                label={s}
                href={`/market?category=services&subcategory=${encodeURIComponent(s)}`}
              />
            ))}
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
      <ChevronRight className={cn("shrink-0 opacity-50", small ? "h-3 w-3" : "h-3.5 w-3.5")} />
    </Link>
  );
}

function GroupCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
