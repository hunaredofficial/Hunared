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
    text: "Search global employment opportunities and apply with confidence.",
    href: "/jobs",
    cta: "Browse jobs",
  },
  {
    icon: Users,
    title: "Find Talent",
    text: "Discover professionals and candidates ready for your next role.",
    href: "/candidates",
    cta: "View candidates",
  },
  {
    icon: Building2,
    title: "Find a Company",
    text: "Explore organizations, services, and partners worldwide.",
    href: "/companies",
    cta: "Explore companies",
  },
  {
    icon: ShoppingBag,
    title: "Buy & Sell",
    text: "Marketplace for products, services, property, and more.",
    href: "/market",
    cta: "Open marketplace",
  },
  {
    icon: BookOpen,
    title: "Learn & Grow",
    text: "Career guides, HSE, engineering, and professional skills.",
    href: "/education",
    cta: "Visit learning hub",
  },
];

export function UserPathSection() {
  return (
    <section className="relative py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 space-y-2">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Get started
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            What are you looking for?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Choose a path. Everything you need is on one global platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {PATHS.map(({ icon: Icon, title, text, href, cta }) => (
            <Link
              key={title}
              href={href}
              className={cn(
                "group flex flex-col rounded-2xl border border-border/80 bg-card p-5 sm:p-6",
                "hover:border-primary/40 hover:shadow-md hover:shadow-primary/5",
                "transition-all duration-200"
              )}
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-foreground mb-1.5">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                {text}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                {cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
