"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  Briefcase,
  GraduationCap,
  Wrench,
  Home,
  ShoppingBag,
  Megaphone,
  Car,
  Laptop,
  Building2,
  Search,
  Gift,
  CalendarDays,
  Users,
  ArrowRight,
  Tag,
  Sofa,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Post an Ad — Step 1: What do you want to post?
 * Category-first marketplace flow. Login required only when publishing.
 */

type AdType = {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string | null;
  examples: string[];
  group: "work" | "marketplace" | "knowledge" | "community";
};

const AD_TYPES: AdType[] = [
  {
    icon: Briefcase,
    title: "Job",
    description: "Hire talent for permanent or temporary roles.",
    href: "/dashboard/jobs/new",
    examples: ["Engineering", "Construction", "Healthcare", "IT"],
    group: "work",
  },
  {
    icon: Tag,
    title: "For Sale",
    description: "Sell products — new or used — to buyers worldwide.",
    href: "/dashboard/market/new?category=for_sale",
    examples: ["Furniture", "Tools", "Appliances", "Fashion"],
    group: "marketplace",
  },
  {
    icon: Home,
    title: "For Rent",
    description: "Rent out items, equipment, or spaces by the day or month.",
    href: "/dashboard/market/new?category=for_rent",
    examples: ["Equipment", "Tools", "Vehicles", "Spaces"],
    group: "marketplace",
  },
  {
    icon: Wrench,
    title: "Service",
    description: "Offer professional, trade, IT, design, and other services.",
    href: "/dashboard/market/new?category=services",
    examples: ["Electrical", "IT", "Logistics", "Design"],
    group: "marketplace",
  },
  {
    icon: Building2,
    title: "Property",
    description: "List houses, land, commercial units, and real estate.",
    href: "/dashboard/market/new?category=property",
    examples: ["House", "Land", "Office", "Shop"],
    group: "marketplace",
  },
  {
    icon: Sofa,
    title: "Accommodation",
    description: "Rooms, apartments, bed spaces, and short-term stays.",
    href: "/dashboard/market/new?category=accommodation",
    examples: ["Apartment", "Room", "Bed space", "Villa"],
    group: "marketplace",
  },
  {
    icon: Car,
    title: "Vehicle",
    description: "Cars, trucks, motorcycles, and other vehicles.",
    href: "/dashboard/market/new?category=vehicles",
    examples: ["Cars", "Trucks", "Motorbikes", "Parts"],
    group: "marketplace",
  },
  {
    icon: Laptop,
    title: "Electronics",
    description: "Phones, laptops, gadgets, and tech accessories.",
    href: "/dashboard/market/new?category=electronics",
    examples: ["Phones", "Laptops", "Audio", "Accessories"],
    group: "marketplace",
  },
  {
    icon: GraduationCap,
    title: "Learning",
    description: "Courses, certifications, internships, and scholarships.",
    href: "/dashboard/articles/new",
    examples: ["Courses", "Certifications", "Internships"],
    group: "knowledge",
  },
  {
    icon: Megaphone,
    title: "Article / News",
    description: "Publish career tips, HSE, engineering, and community news.",
    href: "/dashboard/articles/new",
    examples: ["Career Tips", "HSE", "News"],
    group: "knowledge",
  },
  {
    icon: Search,
    title: "Wanted",
    description: "Post what you are looking for — items, services, or help.",
    href: "/dashboard/market/new?category=wanted",
    examples: ["Items wanted", "Services needed"],
    group: "community",
  },
  {
    icon: Gift,
    title: "Free Items",
    description: "Give away items free to the community.",
    href: "/dashboard/market/new?category=free_items",
    examples: ["Furniture", "Clothes", "Misc"],
    group: "community",
  },
  {
    icon: Users,
    title: "Community",
    description: "Announcements, groups, and local community posts.",
    href: "/dashboard/market/new?category=community",
    examples: ["Announcements", "Groups"],
    group: "community",
  },
  {
    icon: CalendarDays,
    title: "Event",
    description: "Promote events, meetups, and local activities.",
    href: "/dashboard/market/new?category=events",
    examples: ["Meetups", "Workshops", "Fairs"],
    group: "community",
  },
];

const GROUPS: { key: AdType["group"]; label: string; blurb: string }[] = [
  { key: "work", label: "Work & Talent", blurb: "Hire or find opportunities" },
  { key: "marketplace", label: "Marketplace", blurb: "Buy, sell, rent, services & property" },
  { key: "knowledge", label: "Learning & Content", blurb: "Courses, articles and knowledge" },
  { key: "community", label: "Community", blurb: "Wanted, free, events and local" },
];

export default function CreateAdPage() {
  const { isSignedIn } = useAuth();

  function hrefFor(type: AdType): string {
    if (!type.href) return "#";
    if (isSignedIn) return type.href;
    return `/sign-in?redirect_url=${encodeURIComponent(type.href)}`;
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Step header */}
      <div className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            Step 1 of 2
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            What do you want to post?
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
            Choose a category to continue. Anyone can browse Hunared — you&apos;ll
            only need to sign in when you publish.
          </p>

          {/* Simple step dots */}
          <div className="flex items-center gap-2 mt-5">
            <span className="h-1.5 w-10 rounded-full bg-primary" aria-hidden />
            <span className="h-1.5 w-10 rounded-full bg-border" aria-hidden />
            <span className="text-xs text-muted-foreground ml-2">
              Next: fill details & publish
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {GROUPS.map((group) => {
          const items = AD_TYPES.filter((t) => t.group === group.key);
          if (items.length === 0) return null;
          return (
            <section key={group.key}>
              <div className="mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/90">
                  {group.label}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">{group.blurb}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((type) => {
                  const Icon = type.icon;
                  const comingSoon = !type.href;
                  const inner = (
                    <div
                      className={cn(
                        "h-full p-4 rounded-xl border transition-all duration-200 flex flex-col gap-2.5",
                        comingSoon
                          ? "border-border/60 bg-muted/30 opacity-70 cursor-not-allowed"
                          : "border-border bg-card hover:border-primary/45 hover:shadow-md hover:-translate-y-0.5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        {!comingSoon && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base">{type.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                          {type.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-auto pt-1">
                        {type.examples.slice(0, 3).map((ex) => (
                          <span
                            key={ex}
                            className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  );

                  if (comingSoon) {
                    return (
                      <div key={type.title} className="group">
                        {inner}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={type.title}
                      href={hrefFor(type)}
                      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
                    >
                      {inner}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        <p className="text-center text-xs text-muted-foreground pt-2">
          {isSignedIn
            ? "You are signed in — choose a category to open the form."
            : "Not signed in? You can still choose a category; we’ll ask you to sign in before publishing."}
        </p>
      </div>
    </main>
  );
}
