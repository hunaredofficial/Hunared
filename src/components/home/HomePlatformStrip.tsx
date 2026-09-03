import Link from "next/link";
import {
  Briefcase,
  Users,
  Building2,
  ShoppingBag,
  BookOpen,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

const ITEMS = [
  {
    icon: Briefcase,
    title: "Jobs",
    text: "Find roles or post openings worldwide.",
    href: "/jobs",
  },
  {
    icon: Users,
    title: "Candidates",
    text: "Discover professionals ready to work.",
    href: "/candidates",
  },
  {
    icon: Building2,
    title: "Companies",
    text: "Explore employers and partners.",
    href: "/companies",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    text: "Buy, sell, and offer services.",
    href: "/market",
  },
  {
    icon: BookOpen,
    title: "Learning",
    text: "Guides for careers, safety & skills.",
    href: "/education",
  },
  {
    icon: GraduationCap,
    title: "Programs",
    text: "Training and verified credentials.",
    href: "/program",
  },
];

export function HomePlatformStrip() {
  return (
    <section className="relative py-12 sm:py-14 md:py-16 border-y border-border/60 bg-muted/15">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 space-y-2">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Platform
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Everything you need in{" "}
            <span className="gradient-text">one place</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Careers, talent, companies, marketplace, and learning — designed to
            work together on any device.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {ITEMS.map(({ icon: Icon, title, text, href }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col rounded-2xl border border-border/70 bg-card p-4 sm:p-5 hover:border-primary/40 hover:bg-primary/[0.04] hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-sm sm:text-base mb-1 flex items-center gap-1">
                {title}
                <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                {text}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
