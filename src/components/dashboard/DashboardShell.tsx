"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  User,
  Briefcase,
  Plus,
  Users,
  Globe,
  Menu,
  ChevronRight,
  BookOpen,
  ShieldCheck,
  ShoppingBag,
  PackageOpen,
  Megaphone,
  DatabaseBackup,
  Sun,
  Moon,
  Bookmark,
  Bell,
  BellRing,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { HunaredLogo } from "@/components/brand/HunaredLogo";
import type { UserRole } from "@/types/database";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

function getNavItems(role: UserRole): NavItem[] {
  if (role === "employer") {
    return [
      {
        href: "/dashboard",
        label: "Overview",
        icon: <LayoutDashboard className="h-4 w-4" />,
        exact: true,
      },
      {
        href: "/dashboard/jobs",
        label: "My Job Posts",
        icon: <Briefcase className="h-4 w-4" />,
      },
      {
        href: "/dashboard/jobs/new",
        label: "Post a Job",
        icon: <Plus className="h-4 w-4" />,
      },
      {
        href: "/dashboard/profile",
        label: "Company Profile",
        icon: <User className="h-4 w-4" />,
      },
      {
        href: "/candidates",
        label: "Browse Candidates",
        icon: <Users className="h-4 w-4" />,
      },
      {
        href: "/dashboard/saved",
        label: "My Saved",
        icon: <Bookmark className="h-4 w-4" />,
      },
      {
        href: "/dashboard/subscriptions",
        label: "My Subscriptions",
        icon: <BellRing className="h-4 w-4" />,
      },
      {
        href: "/dashboard/notifications",
        label: "Notifications",
        icon: <Bell className="h-4 w-4" />,
      },
      {
        href: "/dashboard/articles",
        label: "My Articles",
        icon: <BookOpen className="h-4 w-4" />,
      },
      {
        href: "/dashboard/market",
        label: "My Listings",
        icon: <ShoppingBag className="h-4 w-4" />,
        exact: true,
      },
      {
        href: "/dashboard/market/orders",
        label: "Incoming Orders",
        icon: <PackageOpen className="h-4 w-4" />,
      },
    ];
  }

  if (role === "admin") {
    return [
      {
        href: "/dashboard",
        label: "Overview",
        icon: <LayoutDashboard className="h-4 w-4" />,
        exact: true,
      },
      {
        href: "/dashboard/admin/users",
        label: "Users",
        icon: <Users className="h-4 w-4" />,
      },
      {
        href: "/dashboard/admin/jobs",
        label: "Job Queue",
        icon: <Briefcase className="h-4 w-4" />,
      },
      {
        href: "/dashboard/admin/articles",
        label: "Articles",
        icon: <BookOpen className="h-4 w-4" />,
      },
      {
        href: "/dashboard/admin/market",
        label: "Marketplace",
        icon: <ShoppingBag className="h-4 w-4" />,
      },
      {
        href: "/dashboard/admin/security",
        label: "Security",
        icon: <ShieldCheck className="h-4 w-4" />,
      },
      {
        href: "/dashboard/admin/ads",
        label: "Ads",
        icon: <Megaphone className="h-4 w-4" />,
      },
      {
        href: "/dashboard/admin/backups",
        label: "Backups",
        icon: <DatabaseBackup className="h-4 w-4" />,
      },
    ];
  }

  // seeker (default)
  return [
    {
      href: "/dashboard",
      label: "Overview",
      icon: <LayoutDashboard className="h-4 w-4" />,
      exact: true,
    },
    {
      href: "/dashboard/profile",
      label: "My Profile",
      icon: <User className="h-4 w-4" />,
    },
    {
      href: "/jobs",
      label: "Browse Jobs",
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      href: "/candidates",
      label: "Browse Candidates",
      icon: <Users className="h-4 w-4" />,
    },
    {
      href: "/dashboard/saved",
      label: "My Saved",
      icon: <Bookmark className="h-4 w-4" />,
    },
    {
      href: "/dashboard/subscriptions",
      label: "My Subscriptions",
      icon: <BellRing className="h-4 w-4" />,
    },
    {
      href: "/dashboard/notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
    },
    {
      href: "/dashboard/articles",
      label: "My Articles",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      href: "/dashboard/market",
      label: "My Listings",
      icon: <ShoppingBag className="h-4 w-4" />,
      exact: true,
    },
    {
      href: "/dashboard/market/orders",
      label: "Incoming Orders",
      icon: <PackageOpen className="h-4 w-4" />,
    },
  ];
}

function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

interface SidebarContentProps {
  role: UserRole;
  fullName: string;
  navItems: NavItem[];
  pathname: string;
  onNavClick?: () => void;
}

function SidebarContent({
  role,
  fullName,
  navItems,
  pathname,
  onNavClick,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4 border-b">
        <HunaredLogo className="h-7 w-auto" />
      </div>

      <div className="px-4 py-3 border-b">
        <p className="text-sm font-medium truncate">{fullName}</p>
        <p className="text-xs text-muted-foreground capitalize">{role}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
              {active && <ChevronRight className="ml-auto h-4 w-4 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-3 py-3 flex items-center justify-between gap-2">
        <ThemeToggleButton />
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}

interface DashboardShellProps {
  role: UserRole;
  fullName: string;
  children: React.ReactNode;
}

export function DashboardShell({
  role,
  fullName,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = getNavItems(role);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-card md:flex md:flex-col">
        <SidebarContent
          role={role}
          fullName={fullName}
          navItems={navItems}
          pathname={pathname}
        />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b bg-card px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-md hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <HunaredLogo className="h-6 w-auto" />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggleButton />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-card md:hidden">
            <SidebarContent
              role={role}
              fullName={fullName}
              navItems={navItems}
              pathname={pathname}
              onNavClick={() => setMobileOpen(false)}
            />
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="md:pl-64">
        <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 pb-12 max-w-[90rem] mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}