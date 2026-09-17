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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LocationPicker } from "@/components/layout/LocationPicker";
import { HunaredLogo } from "@/components/brand/HunaredLogo";
import { Show, UserButton } from "@clerk/nextjs";

type SimpleLink = { type: "link"; href: string; label: string };
type MegaGroup = {
  type: "mega";
  label: string;
  href: string;
  items: { label: string; href: string }[];
};
type NavItem = SimpleLink | MegaGroup;

const NAV_ITEMS: NavItem[] = [
  { type: "link", href: "/jobs", label: "Jobs" },
  { type: "link", href: "/candidates", label: "Candidates" },
  { type: "link", href: "/companies", label: "Companies" },
  { type: "link", href: "/market", label: "Marketplace" },
  { type: "link", href: "/education", label: "Learning" },
  { type: "link", href: "/program", label: "Program" },
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
          {/* Logo */}
          <div className="shrink-0 min-w-0 flex items-center self-center">
            <HunaredLogo size={scrolled ? "md" : "lg"} />
          </div>

          {/* Desktop Nav */}
          <nav
            ref={megaRef}
            className="hidden lg:flex items-center gap-0.5 relative"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => {
              if (item.type === "link") {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
              return (
                <div key={item.label} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMega(isOpen ? null : item.label)}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium tracking-tight rounded-md transition-colors duration-150",
                      pathname.startsWith(item.href)
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
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-60 rounded-lg border border-border bg-card shadow-lg p-1.5 z-50"
                      role="menu"
                    >
                      {item.items.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          role="menuitem"
                          className="block px-3 py-2 text-sm rounded-md text-foreground hover:bg-muted transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                      <Link
                        href={item.href}
                        role="menuitem"
                        className="block px-3 py-2 mt-0.5 text-sm font-semibold rounded-md text-primary border-t border-border/70 hover:bg-accent transition-colors"
                      >
                        View all {item.label} →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Actions */}
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
                Post an Ad
              </Link>
            </Button>

            <ThemeToggle />

            <div className="hidden lg:flex items-center gap-1.5">
              <Show when="signed-out">
                <Button variant="ghost" size="sm" className="h-8 text-[13px] font-medium" asChild>
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
                    <span className={cn(scrolled ? "hidden xl:inline" : "hidden sm:inline")}>
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

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileOpen ? "max-h-[34rem] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="border-t border-border/50 bg-background/95 px-4 pt-3 pb-4 space-y-0.5 overflow-y-auto max-h-[30rem]">
          <div className="px-3 py-2">
            <LocationPicker />
          </div>

          <Link
            href="/post"
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-md text-primary bg-primary/10 hover:bg-primary/15 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Post an Ad
          </Link>

          {NAV_ITEMS.map((item) => {
            if (item.type === "link") {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
                  {item.items.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="block px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70"
                    >
                      {sub.label}
                    </Link>
                  ))}
                  <Link
                    href={item.href}
                    className="block px-3 py-2 text-sm font-semibold rounded-md text-primary"
                  >
                    View all {item.label} →
                  </Link>
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
