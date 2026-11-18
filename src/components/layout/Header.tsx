"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType } from "react";
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
  BedDouble,
  Briefcase,
  GraduationCap,
  Sparkles,
  MapPin,
  LogIn,
  UserPlus,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { MessagesHeaderIcon } from "@/components/messages/MessagesHeaderIcon";
import { AgentHeaderButton } from "@/components/agent/AgentHeaderButton";
import { LocationPicker } from "@/components/layout/LocationPicker";
import { HunaredLogo } from "@/components/brand/HunaredLogo";
import { Show, UserButton, useAuth } from "@clerk/nextjs";

type MegaItem = {
  label: string;
  href: string;
  desc?: string;
  icon?: ComponentType<{ className?: string }>;
  /** Show only when visitor is not signed in */
  guestOnly?: boolean;
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
          { label: "Temporary Work", href: "/jobs?duration=temporary", desc: "Short-term & contract roles" },
          { label: "Permanent Roles", href: "/jobs?duration=permanent", desc: "Permanent employment only" },
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
          { label: "Available for Hire", href: "/candidates?available=yes", desc: "Open to opportunities only" },
          { label: "Expert Level", href: "/candidates?level=expert", desc: "Senior & expert talent" },
          { label: "Create Candidate Profile", href: "/register?goal=seeker", desc: "Join as talent", guestOnly: true },
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
          { label: "Hiring Now", href: "/companies?hiring=1", desc: "Companies actively hiring" },
          { label: "Verified Only", href: "/companies?verified=1", desc: "Verified employers" },
          { label: "Create Company Profile", href: "/register?goal=employer", desc: "Get listed", guestOnly: true },
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
          { label: "Accommodation", href: "/market?category=accommodation", icon: BedDouble },
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
          { label: "Lost & Found", href: "/market?category=lost_found", icon: Search },
          { label: "Free Items", href: "/market?category=free_items", icon: Gift },
          { label: "Offers & Deals", href: "/market?category=offers_deals", icon: Calendar },
          { label: "Wanted", href: "/market?category=wanted", icon: Search },
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
        title: "Learning",
        items: [
          { label: "Learning Hub", href: "/education", desc: "Articles & knowledge" },
          { label: "Resources", href: "/education/resources", desc: "Download & share files" },
          { label: "CV Builder", href: "/dashboard/cv", desc: "Professional resume" },
        ],
      },
    ],
  },
  {
    type: "mega",
    label: "Programs",
    href: "https://hunared.org/programs",
    columns: [
      {
        title: "Programs",
        items: [
          { label: "Hunared Program", href: "https://hunared.org/programs", desc: "Hunared programs overview" },
          { label: "Training Courses", href: "https://hunared.org/courses", desc: "Training & certification pathways" },
          { label: "Finder Center", href: "/finder", desc: "Lost & found community" },
        ],
      },
    ],
  },
];

export function Header() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);

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
    <header className="fixed z-50 inset-x-0 top-0 w-full border-b border-border/60 bg-background/95">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-6">
        <div className="flex h-14 items-center justify-between gap-2 min-w-0">
          <div className="shrink-0 min-w-0 flex items-center self-center">
            <HunaredLogo size="md" />
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
                (item.label === "Programs" && pathname.startsWith("/finder"));

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
                    {item.label}
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
                        "absolute top-full mt-1.5 z-50 overflow-hidden",
                        "rounded-lg border border-border/80 bg-card/95 backdrop-blur-md",
                        "shadow-lg shadow-black/20 ring-1 ring-black/5",
                        "animate-in fade-in-0 zoom-in-95 duration-150",
                        item.columns && item.columns.length > 1
                          ? "left-1/2 -translate-x-1/2 w-max max-w-[min(90vw,20rem)] p-1"
                          : "left-0 w-max min-w-[10.5rem] max-w-[15rem] p-1"
                      )}
                      role="menu"
                      onMouseLeave={() => setOpenMega(null)}
                    >
                      {item.columns && (
                        <div
                          className={cn(
                            "grid",
                            item.columns.length > 1
                              ? "grid-cols-2 gap-1"
                              : "grid-cols-1 gap-0.5"
                          )}
                        >
                          {item.columns.map((col) => (
                            <div key={col.title} className="min-w-0">
                              <p className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
                                {col.title}
                              </p>
                              <div className="space-y-0.5">
                                {col.items
                                  .filter((sub) => !sub.guestOnly || !isSignedIn)
                                  .map((sub) => (
                                    <Link
                                      key={sub.href + sub.label}
                                      href={sub.href}
                                      role="menuitem"
                                      onClick={() => setOpenMega(null)}
                                      className={cn(
                                        "flex items-center gap-2 rounded-md px-2 py-1.5",
                                        "text-[12.5px] text-foreground/90",
                                        "hover:bg-primary/10 hover:text-primary transition-colors"
                                      )}
                                      {...(sub.href.startsWith("http")
                                        ? {
                                            target: "_blank",
                                            rel: "noopener noreferrer",
                                          }
                                        : {})}
                                    >
                                      {sub.icon ? (
                                        <sub.icon className="h-3.5 w-3.5 text-primary/80 shrink-0" />
                                      ) : null}
                                      <span className="min-w-0 leading-tight pr-0.5">
                                        <span className="font-medium block whitespace-nowrap">
                                          {sub.label}
                                        </span>
                                        {sub.desc ? (
                                          <span className="text-[10px] text-muted-foreground leading-tight block whitespace-nowrap mt-0.5 opacity-80">
                                            {sub.desc}
                                          </span>
                                        ) : null}
                                      </span>
                                    </Link>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 max-w-full">
            <div className="hidden md:block max-w-[12rem]">
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

            <AgentHeaderButton />

            <MessagesHeaderIcon />

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
                  className="h-8 shrink-0"
                  asChild
                >
                  <Link href="/dashboard" className="inline-flex items-center">
                    <LayoutDashboard className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Dashboard</span>
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

      {/* Mobile menu — polished full-width drawer */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-out",
          mobileOpen
            ? "max-h-[min(88dvh,44rem)] opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="border-t border-border/60 bg-gradient-to-b from-card via-background to-background px-3 pt-3 pb-5 space-y-3 overflow-y-auto max-h-[min(82dvh,40rem)] overscroll-contain">
          {/* Location chip */}
          <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2.5 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <LocationPicker />
            </div>
          </div>

          {/* Primary CTA */}
          <Link
            href="/post"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3 text-sm font-semibold text-primary-foreground bg-primary shadow-md shadow-primary/25 hover:opacity-95 active:scale-[0.99] transition"
          >
            <Plus className="h-4 w-4" />
            Post
          </Link>

          {/* Nav accordion groups */}
          <nav className="rounded-xl border border-border/70 bg-card/60 overflow-hidden divide-y divide-border/50">
            {NAV_ITEMS.map((item) => {
              if (item.type === "link") {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-foreground hover:bg-muted/60"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              }

              const GroupIcon =
                item.label === "Jobs"
                  ? Briefcase
                  : item.label === "Talent"
                    ? Users
                    : item.label === "Companies"
                      ? Building2
                      : item.label === "Marketplace"
                        ? Tag
                        : item.label === "Learning"
                          ? GraduationCap
                          : item.label === "Programs"
                            ? Sparkles
                            : LayoutDashboard;

              return (
                <details key={item.label} className="group/acc">
                  <summary className="flex items-center gap-3 px-3.5 py-3 text-sm font-semibold text-foreground cursor-pointer list-none select-none hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <GroupIcon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open/acc:rotate-180 shrink-0" />
                  </summary>
                  <div className="pb-2 px-2 space-y-0.5 bg-muted/20">
                    {(item.columns
                      ? item.columns.flatMap((c) => c.items)
                      : []
                    )
                      .filter((sub) => !sub.guestOnly || !isSignedIn)
                      .map((sub) => {
                        const SubIcon = sub.icon;
                        return (
                          <Link
                            key={sub.href + sub.label}
                            href={sub.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-start gap-2 rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
                            {...(sub.href.startsWith("http")
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                          >
                            {SubIcon ? (
                              <SubIcon className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
                            ) : (
                              <span className="mt-2 h-1 w-1 rounded-full bg-primary/50 shrink-0 ml-1.5" />
                            )}
                            <span className="min-w-0">
                              <span className="block font-medium text-foreground/90">
                                {sub.label}
                              </span>
                              {sub.desc ? (
                                <span className="block text-[11px] text-muted-foreground leading-snug mt-0.5">
                                  {sub.desc}
                                </span>
                              ) : null}
                            </span>
                          </Link>
                        );
                      })}
                  </div>
                </details>
              );
            })}
          </nav>

          {/* Auth footer */}
          <div className="pt-1 space-y-2">
            <Show when="signed-out">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 rounded-xl font-medium"
                  asChild
                >
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                    <LogIn className="h-3.5 w-3.5 mr-1.5" />
                    Sign In
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="h-11 rounded-xl font-semibold shadow-sm"
                  asChild
                >
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                    Get Started
                  </Link>
                </Button>
              </div>
            </Show>
            <Show when="signed-in">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 rounded-xl"
                  asChild
                >
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 rounded-xl"
                  asChild
                >
                  <Link
                    href="/dashboard/messages"
                    onClick={() => setMobileOpen(false)}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                    Messages
                  </Link>
                </Button>
                <div className="flex items-center justify-center h-11 w-11 rounded-xl border border-border bg-muted/30">
                  <UserButton />
                </div>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </header>
  );
}
