"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  ChevronDown,
  Search,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Show, UserButton } from "@clerk/nextjs";

/* ── Nav structure: simple links + mega-menu groups ───────────── */

type SimpleLink = { type: "link"; href: string; label: string };
type MegaGroup = {
  type: "mega";
  label: string;
  href: string; // "view all" link
  items: { label: string; href: string }[];
};
type NavItem = SimpleLink | MegaGroup;

const NAV_ITEMS: NavItem[] = [
  { type: "link", href: "/jobs", label: "Jobs" },
  { type: "link", href: "/candidates", label: "Candidates" },
  { type: "link", href: "/market", label: "Marketplace" },
  { type: "link", href: "/education", label: "Learning Hub" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const megaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu / mega menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenMega(null);
    setMobileSearchOpen(false);
  }, [pathname]);

  // Close mega menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setOpenMega(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setMobileSearchOpen(false);
  }

  return (
    <header
      className={cn(
        "fixed z-50 left-1/2 -translate-x-1/2 transform-gpu will-change-[width,transform,top]",
        "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        scrolled
          ? "top-4 w-[90%] max-w-7xl bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border border-border/50 shadow-lg rounded-2xl"
          : "top-0 w-full max-w-full bg-background border-b border-border/40 rounded-none shadow-none"
      )}
    >
      <div className={cn("mx-auto px-4 sm:px-6 lg:px-8", scrolled ? "max-w-full" : "max-w-7xl")}>
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group shrink-0 logo-premium"
            aria-label="Hunared home"
          >
            {/* Logo Icon */}
            <Image
              src="/assets/logos/logo-horizontal.png"
              alt="Hunared Logo"
              width={42}
              height={38}
              quality={100}
              priority
              className="h-10 w-10 object-contain"
            />

            {/* Logo Text */}
            <span
              className="logo-text relative text-[30px] font-extrabold tracking-tight leading-none select-none"
              style={{
                fontFamily: "Inter, Poppins, sans-serif",
              }}
            >
              <span className="logo-text-gradient">Hunared</span>
            </span>
          </Link>

          {/* Desktop Nav with Mega Menu */}
          <nav
            ref={megaRef}
            className="hidden lg:flex items-center gap-1 relative"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => {
              if (item.type === "link") {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200",
                      "hover:text-primary hover:bg-primary/8",
                      pathname === item.href ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                    {pathname === item.href && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary" />
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
                      "flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200",
                      "hover:text-primary hover:bg-primary/8",
                      pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
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
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl border border-border bg-card shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                      role="menu"
                    >
                      {item.items.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          role="menuitem"
                          className="block px-3 py-2 text-sm rounded-lg text-foreground hover:bg-primary/8 hover:text-primary transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                      <Link
                        href={item.href}
                        role="menuitem"
                        className="block px-3 py-2 mt-1 text-sm font-semibold rounded-lg text-primary border-t border-border/60 hover:bg-primary/8 transition-colors"
                      >
                        View all {item.label} →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sticky Search (desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center flex-1 max-w-xs"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, property, services..."
                aria-label="Search Hunared"
                className="w-full h-9 pl-9 pr-3 rounded-full border border-input bg-muted/40 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Post an Ad (desktop) */}
            <Button size="sm" variant="outline" className="hidden md:inline-flex" asChild>
              <Link href="/post">
                <Plus className="h-4 w-4 mr-1" />
                Post an Ad
              </Link>
            </Button>

            <ThemeToggle />

            <div className="hidden lg:flex items-center gap-2">
              <Show when="signed-out">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm px-4 py-4 transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </Show>
              <Show when="signed-in">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-1.5" />
                    Dashboard
                  </Link>
                </Button>
                <UserButton />
              </Show>
            </div>

            {/* Mobile search toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-9 h-9"
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Mobile hamburger */}
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

        {/* Mobile search bar (collapsible) */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            mobileSearchOpen ? "max-h-16 opacity-100 pb-3" : "max-h-0 opacity-0"
          )}
        >
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs, property, services..."
              aria-label="Search Hunared"
              className="w-full h-10 pl-9 pr-3 rounded-full border border-input bg-muted/40 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileOpen ? "max-h-[34rem] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="glass border-t border-border/20 px-4 pt-3 pb-4 space-y-1 overflow-y-auto max-h-[30rem]">
          {/* Post an Ad (mobile) */}
          <Link
            href="/post"
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-lg text-primary bg-primary/8 hover:bg-primary/15 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Post an Ad
          </Link>

          {NAV_ITEMS.map((item) => {
            if (item.type === "link") {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/8"
                  )}
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <details key={item.label} className="group">
                <summary className="flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/8 cursor-pointer list-none">
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="pl-4 space-y-0.5 pb-1">
                  {item.items.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="block px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/8"
                    >
                      {sub.label}
                    </Link>
                  ))}
                  <Link
                    href={item.href}
                    className="block px-3 py-2 text-sm font-semibold rounded-lg text-primary"
                  >
                    View all {item.label} →
                  </Link>
                </div>
              </details>
            );
          })}

          <div className="flex gap-2 pt-2 border-t border-border/40">
            <Show when="signed-out">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button size="sm" className="flex-1" asChild>
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

      <style jsx>{`
        /* ── Premium Logo Base ─────────────────────────────── */
        .logo-premium {
          will-change: transform;
          transition: transform 300ms ease-out;
        }

        .logo-premium:hover {
          transform: scale(1.03);
        }

        /* ── Text container ────────────────────────────────── */
        .logo-text {
          position: relative;
          display: inline-block;
        }

        /* ── Animation stays INSIDE the letters ───────────── */
        .logo-text-gradient {
          background: linear-gradient(
            115deg,
            #2ea8ff 0%,
            #356dff 22%,
            #5ef7ff 45%,
            #2a2f8f 68%,
            #7fdbff 100%
          );
          background-size: 250% 250%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: logoInsideShift 6s ease-in-out infinite;
          will-change: background-position;
        }

        /* Slightly brighter on hover (still inside letters) */
        .logo-premium:hover .logo-text-gradient {
          background: linear-gradient(
            115deg,
            #4eb8ff 0%,
            #4a7fff 22%,
            #7ef9ff 45%,
            #3a3faf 68%,
            #9fe5ff 100%
          );
          background-size: 250% 250%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          transition: background 300ms ease-out;
        }

        /* ── Smooth color movement inside the text ────────── */
        @keyframes logoInsideShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </header>
  );
}