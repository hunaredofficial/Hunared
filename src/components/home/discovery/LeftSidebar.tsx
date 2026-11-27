"use client";

import Link from "next/link";
import {
  Bookmark,
  Brain,
  Briefcase,
  Building2,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShoppingBag,
  Bell,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";

const LINKS = [
  { href: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/saved", label: "Saved", icon: Bookmark },
  { href: "/dashboard/business", label: "My Listings", icon: ShoppingBag },
  { href: "/dashboard/jobs", label: "My Jobs", icon: Briefcase },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/candidates", label: "Talent", icon: Users },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/mindspace", label: "MindSpace", icon: Brain },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function LeftSidebar() {
  const { isSignedIn } = useAuth();

  return (
    <aside className="space-y-4 sticky top-[4.25rem]">
      <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Quick access
        </p>
        <nav className="space-y-0.5">
          {LINKS.map((item) => (
            <Link
              key={item.href + item.label}
              href={
                !isSignedIn && item.href.startsWith("/dashboard")
                  ? "/sign-in"
                  : item.href
              }
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-muted-foreground",
                "hover:bg-muted/60 hover:text-foreground transition-colors"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0 opacity-80" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">MindSpace</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Take a short break. Refresh your mind with daily puzzles.
        </p>
        <Link
          href="/mindspace"
          className="inline-flex text-xs font-semibold text-primary hover:underline"
        >
          Open MindSpace →
        </Link>
      </div>
    </aside>
  );
}
