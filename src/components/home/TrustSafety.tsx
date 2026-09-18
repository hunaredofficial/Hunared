import Link from "next/link";
import {
  ShieldCheck,
  BadgeCheck,
  Lock,
  Flag,
  FileText,
  Users,
} from "lucide-react";

const ITEMS = [
  {
    icon: BadgeCheck,
    title: "Professional profiles",
    text: "Structured profiles for candidates and companies with clear contact options.",
  },
  {
    icon: ShieldCheck,
    title: "Moderated listings",
    text: "Jobs, marketplace, and community posts are reviewed for quality and safety.",
  },
  {
    icon: Lock,
    title: "Secure accounts",
    text: "Clerk-powered authentication and account controls you can trust.",
  },
  {
    icon: Flag,
    title: "Community reporting",
    text: "Report issues so the community stays safe and useful for everyone.",
  },
  {
    icon: FileText,
    title: "Clear policies",
    text: "Transparent Terms and Privacy so you know how Hunared works.",
  },
  {
    icon: Users,
    title: "Global opportunity",
    text: "Built for international users, countries, and cross-border careers.",
  },
];

export function TrustSafety() {
  return (
    <section className="relative py-14 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 space-y-2">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Trust & safety
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Built for professionals who care about trust
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            We focus on clear profiles, moderated content, and secure accounts —
            without inventing claims we cannot support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:p-6"
            >
              <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
          <Link
            href="/terms"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Terms of Service
          </Link>
          <span className="text-border">·</span>
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-border">·</span>
          <Link
            href="/contact"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Contact support
          </Link>
        </div>
      </div>
    </section>
  );
}
