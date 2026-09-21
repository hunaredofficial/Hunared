"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  ChevronDown,
  Plus,
  Search,
  Wrench,
  Home,
  Car,
  Laptop,
  Sofa,
  Tag,
  Gift,
  Calendar,
  Users,
  Building2,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LocationPicker } from "@/components/layout/LocationPicker";
import { HunaredLogo } from "@/components/brand/HunaredLogo";
import { Show, UserButton } from "@clerk/nextjs";

type MegaItem = {
  label: string;
  href: string;
  desc?: string;
  icon?: React.ComponentType<{ className?: string }>;
};
type MegaGroup = {
  type: "mega";
  label: string;
  href: string;
  columns?: { title: string; items: MegaItem[] }[];
};
type SimpleLink = { type: "link"; href: string; label: string };
type NavItem = SimpleLink | MegaGroup;

/** Primary nav — links match live page filters (category, employmentType, available). */
const NAV_ITEMS: NavItem[] = [
  {
    type: "mega",
    label: "Jobs",
    href: "/jobs",
    columns: [
      {
        title: "Explore",
        items: [
          { label: "Browse Jobs", href: "/jobs", desc: "All open roles" },
          { label: "Permanent Roles", href: "/jobs?employmentType=permanent", desc: "Full-time positions" },
          { label: "Temporary Work", href: "/jobs?employmentType=temporary", desc: "Short-term roles" },
        ],
      },
      {
        title: "Actions",
        items: [
          { label: "Jobs by Category", href: "/jobs", desc: "Filter on the board" },
          { label: "Jobs by Location", href: "/jobs", desc: "Country & city filters" },
          { label: "Post a Job", href: "/dashboard/jobs/new", desc: "Hire talent" },
        ],
      },
    ],
  },
  {
    type: "mega",
    label: "Talent",
    href: "/candidates",
    columns: [
      {
        title: "Professionals",
        items: [
          { label: "Find Candidates", href: "/candidates", desc: "Professionals ready to work" },
          { label: "Available for Hire", href: "/candidates?available=yes", desc: "Open to opportunities" },
          { label: "By Location", href: "/candidates", desc: "Country & city filters" },
          { label: "Browse All Talent", href: "/candidates", desc: "Full directory" },
        ],
      },
    ],
  },
  {
    type: "mega",
    label: "Companies",
    href: "/companies",
    columns: [
      {
        title: "Directory",
        items: [
          { label: "Company Directory", href: "/companies", desc: "Explore organizations" },
          { label: "By Industry", href: "/companies", desc: "Sectors & services" },
          { label: "By Country", href: "/companies", desc: "Regional employers" },
          { label: "Create Company Profile", href: "/register", desc: "Get listed" },
        ],
      },
    ],
  },
  {
    type: "mega",
    label: "Marketplace",
    href: "/market",
    columns: [
      {
        title: "Buy & Sell",
        items: [
          { label: "For Sale", href: "/market?category=for_sale", icon: Tag },
          { label: "For Rent", href: "/market?category=for_rent", icon: Home },
          { label: "Services", href: "/market?category=services", icon: Wrench },
          { label: "Property", href: "/market?category=property", icon: Building2 },
          { label: "Vehicles", href: "/market?category=vehicles", icon: Car },
          { label: "Electronics", href: "/market?category=electronics", icon: Laptop },
        ],
      },
      {
        title: "More",
        items: [
          { label: "Home & Furniture", href: "/market?category=home_furniture", icon: Sofa },
          { label: "Wanted", href: "/market?category=wanted", icon: Search },
          { label: "Free Items", href: "/market?category=free_items", icon: Gift },
          { label: "Events", href: "/market?category=events", icon: Calendar },
          { label: "Community", href: "/market?category=community", icon: Users },
          { label: "All listings", href: "/market", icon: Tag },
        ],
      },
    ],
  },
  {
    type: "mega",
    label: "Learning",
    href: "/education",
    columns: [
      {
        title: "Knowledge Hub",
        items: [
          { label: "Career Tips", href: "/education?category=career_tips", desc: "Grow your career" },
          { label: "Engineering", href: "/education?category=engineering", desc: "Technical guides" },
          { label: "HSE / Safety", href: "/education?category=safety_hse", desc: "Safety standards" },
          { label: "All Articles", href: "/education", desc: "Browse the hub" },
        ],
      },
    ],
  },
  {
    type: "mega",
    label: "More",
    href: "/program",
    columns: [
      {
        title: "Programs & community",
        items: [
          { label: "Programs & Training", href: "/program", desc: "Credentials & pathways" },
          { label: "Verify Credentials", href: "https://hunared.org", desc: "Official verification" },
          { label: "Hunared Finder", href: "/finder", desc: "Lost & found community" },
          { label: "About Hunared", href: "/about", desc: "Our mission" },
          { label: "Contact", href: "/contact", desc: "Help & support" },
        ],
      },
    ],
  },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMega(null);
  }, [pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setOpenMega(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      className={cn(
        "fixed z-50 left-1/2 -translate-x-1/2 transform-gpu will-change-[width,transform,top]",
        "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        scrolled
          ? "top-3 sm:top-3.5 w-[min(96%,76rem)] max-w-7xl rounded-xl border border-border/80 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)]"
          : "top-0 w-full max-w-full rounded-none border-b border-border/60 bg-background/95"
      )}
    >
      <div
        className={cn(
          "mx-auto w-full px-3 sm:px-5 lg:px-6",
          scrolled ? "max-w-full" : "max-w-7xl px-4 sm:px-6 lg:px-8"
        )}
      >
        <div className="flex h-14 sm:h-15 items-center justify-between gap-2 min-w-0">
          <div className="shrink-0 min-w-0 flex items-center self-center">
            <HunaredLogo size={scrolled ? "md" : "lg"} />
          </div>

          <nav
            ref={megaRef}
            className="hidden lg:flex items-center gap-0.5 relative"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => {
              if (item.type === "link") {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-3 py-1.5 text-[13px] font-medium tracking-tight rounded-md transition-colors duration-150",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-5 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              }

              const isOpen = openMega === item.label;
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/") ||
                (item.label === "More" &&
                  (pathname.startsWith("/program") ||
                    pathname.startsWith("/finder") ||
                    pathname.startsWith("/about") ||
                    pathname.startsWith("/contact")));

              return (
                <div key={item.label} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMega(isOpen ? null : item.label)}
                    onMouseEnter={() => setOpenMega(item.label)}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium tracking-tight rounded-md transition-colors duration-150",
                      isActive || isOpen
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                  >
                    {item.label === "More" ? (
                      <>
                        <MoreHorizontal className="h-3.5 w-3.5 lg:hidden" />
                        <span>More</span>
                      </>
                    ) : (
                      item.label
                    )}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div
                      className={cn(
                        "absolute top-full mt-2 rounded-xl border border-border bg-card shadow-xl p-3 z-50",
                        item.columns && item.columns.length > 1
                          ? "left-1/2 -translate-x-1/2 w-[min(92vw,28rem)]"
                          : "left-0 w-64"
                      )}
                      role="menu"
                      onMouseLeave={() => setOpenMega(null)}
                    >
                      {item.columns && (
                        <div
                          className={cn(
                            "grid gap-4",
                            item.columns.length > 1 ? "grid-cols-2" : "grid-cols-1"
                          )}
                        >
                          {item.columns.map((col) => (
                            <div key={col.title} className="space-y-1">
                              <p className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {col.title}
                              </p>
                              {col.items.map((sub) => (
                                <Link
                                  key={sub.href + sub.label}
                                  href={sub.href}
                                  role="menuitem"
                                  className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                                  {...(sub.href.startsWith("http")
                                    ? { target: "_blank", rel: "noopener noreferrer" }
                                    : {})}
                                >
                                  {sub.icon && (
                                    <sub.icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                                  )}
                                  <span className="min-w-0">
                                    <span className="font-medium block leading-tight">
                                      {sub.label}
                                    </span>
                                    {sub.desc && (
                                      <span className="text-[11px] text-muted-foreground leading-snug block mt-0.5">
                                        {sub.desc}
                                      </span>
                                    )}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                      {item.label !== "More" && (
                        <Link
                          href={item.href}
                          role="menuitem"
                          className="block px-2.5 py-2 mt-2 text-sm font-semibold rounded-lg text-primary border-t border-border/70 hover:bg-accent transition-colors"
                        >
                          View all {item.label} →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 max-w-full">
            <div
              className={cn(
                "hidden md:block transition-all duration-300 overflow-hidden",
                scrolled
                  ? "max-w-0 opacity-0 pointer-events-none scale-95"
                  : "max-w-[12rem] opacity-100"
              )}
            >
              <LocationPicker />
            </div>

            <Button
              size="sm"
              variant="outline"
              className="hidden md:inline-flex h-8 text-[13px] font-medium border-border/80"
              asChild
            >
              <Link href="/post">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Post
              </Link>
            </Button>

            <ThemeToggle />

            <div className="hidden lg:flex items-center gap-1.5">
              <Show when="signed-out">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[13px] font-medium"
                  asChild
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-[13px] font-semibold px-3.5 shadow-sm"
                  asChild
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </Show>
              <Show when="signed-in">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 shrink-0", scrolled && "px-2")}
                  asChild
                >
                  <Link href="/dashboard" className="inline-flex items-center">
                    <LayoutDashboard className="h-4 w-4 sm:mr-1.5" />
                    <span
                      className={cn(scrolled ? "hidden xl:inline" : "hidden sm:inline")}
                    >
                      Dashboard
                    </span>
                  </Link>
                </Button>
                <div className="flex items-center justify-center shrink-0 [&_button]:!outline-none">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8",
                        userButtonTrigger: "focus:shadow-none",
                      },
                    }}
                  />
                </div>
              </Show>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden w-9 h-9"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileOpen ? "max-h-[42rem] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="border-t border-border/50 bg-background/95 px-4 pt-3 pb-4 space-y-0.5 overflow-y-auto max-h-[38rem]">
          <div className="px-3 py-2">
            <LocationPicker />
          </div>

          <Link
            href="/post"
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-md text-primary bg-primary/10 hover:bg-primary/15 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Post
          </Link>

          {NAV_ITEMS.map((item) => {
            if (item.type === "link") {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  )}
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <details key={item.label} className="group">
                <summary className="flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 cursor-pointer list-none">
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="pl-4 space-y-0.5 pb-1">
                  {(item.columns
                    ? item.columns.flatMap((c) => c.items)
                    : []
                  ).map((sub) => (
                    <Link
                      key={sub.href + sub.label}
                      href={sub.href}
                      className="block px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70"
                      {...(sub.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {sub.label}
                    </Link>
                  ))}
                  {item.label !== "More" && (
                    <Link
                      href={item.href}
                      className="block px-3 py-2 text-sm font-semibold rounded-md text-primary"
                    >
                      View all {item.label} →
                    </Link>
                  )}
                </div>
              </details>
            );
          })}

          <div className="flex gap-2 pt-3 border-t border-border/50">
            <Show when="signed-out">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button size="sm" className="flex-1 font-semibold" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </Show>
            <Show when="signed-in">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <div className="flex items-center justify-center flex-1">
                <UserButton />
              </div>
            </Show>
          </div>
        </div>
      </div>
    </header>
  );
}
