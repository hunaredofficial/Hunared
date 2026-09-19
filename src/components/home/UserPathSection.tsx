import Link from "next/link";
import {
  Briefcase,
  Users,
  Building2,
  ShoppingBag,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PATHS = [
  {
    icon: Briefcase,
    title: "Find a Job",
    text: "Discover employment opportunities worldwide.",
    href: "/jobs",
    cta: "Browse jobs",
  },
  {
    icon: Users,
    title: "Find Talent",
    text: "Connect with professionals ready to work.",
    href: "/candidates",
    cta: "View talent",
  },
  {
    icon: Building2,
    title: "Find a Company",
    text: "Explore organizations and partners.",
    href: "/companies",
    cta: "Explore companies",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    text: "Buy, sell, rent, and find services.",
    href: "/market",
    cta: "Open marketplace",
  },
  {
    icon: BookOpen,
    title: "Learn & Grow",
    text: "Career, engineering, HSE, and skills.",
    href: "/education",
    cta: "Learning hub",
  },
];

export function UserPathSection() {
  return (
    <section className="relative py-10 sm:py-14 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-7 sm:mb-9 space-y-1.5">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Get started
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            What do you want to do?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PATHS.map(({ icon: Icon, title, text, href, cta }) => (
            <Link
              key={title}
              href={href}
              className={cn(
                "group flex flex-col rounded-xl border border-border/80 bg-card p-4 sm:p-5",
                "hover:border-primary/35 hover:shadow-sm",
                "transition-all duration-200"
              )}
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-3">
                {text}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                {cta}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
