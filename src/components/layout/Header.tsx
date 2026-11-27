"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
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
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { MessagesHeaderIcon } from "@/components/messages/MessagesHeaderIcon";
import { NotificationsHeaderIcon } from "@/components/notifications/NotificationsHeaderIcon";
import { AgentHeaderButton } from "@/components/agent/AgentHeaderButton";
import { LocationPicker } from "@/components/layout/LocationPicker";
import { HunaredLogo } from "@/components/brand/HunaredLogo";
import { Show, UserButton, useAuth } from "@clerk/nextjs";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

/** Primary nav — simple links with icons (no dropdowns). */
const NAV_ITEMS: NavItem[] = [
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Talent", href: "/candidates", icon: Users },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Business", href: "/business", icon: Tag },
  { label: "Learning", href: "/education", icon: GraduationCap },
];

export function Header() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="fixed z-50 inset-x-0 top-0 w-full border-b border-border/50 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-6">
        <div className="flex h-14 items-center justify-between gap-2 min-w-0">
          <div className="shrink-0 min-w-0 flex items-center self-center">
            <HunaredLogo size="md" />
          </div>

          <nav
            className="hidden lg:flex items-center gap-0.5 relative"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-0.5 min-w-[3.25rem] px-2 py-1 rounded-md transition-colors duration-150",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
                  <span className="text-[11px] font-medium leading-none tracking-tight">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}

            {/* Agent / Notifications / Messages — same icon+label style as nav pages */}
            <div className="relative flex flex-col items-center justify-center gap-0.5 min-w-[3.25rem] px-1.5 py-1 text-muted-foreground hover:text-foreground">
              <AgentHeaderButton className="!h-6 !w-6" />
              <span className="text-[11px] font-medium leading-none tracking-tight pointer-events-none">
                Agent
              </span>
            </div>
            <div className="relative flex flex-col items-center justify-center gap-0.5 min-w-[3.75rem] px-1.5 py-1 text-muted-foreground hover:text-foreground">
              <NotificationsHeaderIcon className="[&_button]:!h-6 [&_button]:!w-6" />
              <span className="text-[11px] font-medium leading-none tracking-tight pointer-events-none">
                Notifications
              </span>
            </div>
            <div className="relative flex flex-col items-center justify-center gap-0.5 min-w-[3.5rem] px-1.5 py-1 text-muted-foreground hover:text-foreground">
              <MessagesHeaderIcon className="!h-6 !w-6" />
              <span className="text-[11px] font-medium leading-none tracking-tight pointer-events-none">
                Messages
              </span>
            </div>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 max-w-full">
            <div className="hidden md:block max-w-[12rem]">
              <LocationPicker />
            </div>

            <Button
              size="sm"
              variant="outline"
              className="hidden md:inline-flex h-8 text-[13px] font-medium border-border/80 rounded-lg px-3"
              asChild
            >
              <Link href="/post">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Post
              </Link>
            </Button>

            {/* Theme + Dashboard (Agent / Notifications / Messages live in main nav) */}
            <div className="flex items-center gap-0.5">
              <ThemeToggle />
              {/* Mobile still shows compact icons */}
              <div className="flex lg:hidden items-center gap-0.5">
                <AgentHeaderButton />
                <NotificationsHeaderIcon />
                <MessagesHeaderIcon />
              </div>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  aria-label="Dashboard"
                  title="Dashboard"
                  className={cn(
                    "relative hidden lg:inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) &&
                      "bg-primary/15 text-primary"
                  )}
                >
                  <LayoutDashboard className="h-5 w-5" strokeWidth={2} />
                </Link>
              </Show>
            </div>

            {/* Auth / avatar */}
            <div className="hidden lg:flex items-center gap-2 pl-1.5 border-l border-border/50">
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
                  className="h-8 text-[13px] font-semibold px-3.5 shadow-sm rounded-lg"
                  asChild
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </Show>
              <Show when="signed-in">
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
          {/* Location + Post (Post under location) — mobile polished */}
          <div className="rounded-2xl border border-border/60 bg-card/80 overflow-hidden shadow-md shadow-black/10">
            <div className="px-3.5 pt-3 pb-2.5 flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary shrink-0 ring-1 ring-primary/15">
                <MapPin className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/90 mb-1">
                  Location
                </p>
                <LocationPicker />
              </div>
            </div>
            <div className="px-3.5 pb-3.5 pt-1">
              <Link
                href="/post"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3 text-[15px] font-semibold text-primary-foreground bg-primary shadow-md shadow-primary/25 hover:opacity-95 active:scale-[0.99] transition"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Post
              </Link>
            </div>
          </div>

          {/* Nav links with icons (no dropdowns) */}
          <nav className="rounded-xl border border-border/70 bg-card/60 overflow-hidden divide-y divide-border/50">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
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
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                </Link>
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
                    href="/dashboard/settings"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Settings className="h-3.5 w-3.5 mr-1.5" />
                    Settings
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
