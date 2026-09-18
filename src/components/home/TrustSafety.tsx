import Link from "next/link";
import { ShieldCheck, BadgeCheck, Lock, Flag, FileText, Globe } from "lucide-react";

const ITEMS = [
  {
    icon: BadgeCheck,
    title: "Professional profiles",
    text: "Structured profiles for candidates and companies with clear contact options.",
  },
  {
    icon: ShieldCheck,
    title: "Moderated listings",
    text: "Jobs and marketplace posts are reviewed for quality and safety.",
  },
  {
    icon: Lock,
    title: "Secure accounts",
    text: "Modern authentication and account controls you can rely on.",
  },
  {
    icon: Flag,
    title: "Community reporting",
    text: "Report issues so the community stays useful for everyone.",
  },
  {
    icon: FileText,
    title: "Clear policies",
    text: "Transparent Terms and Privacy so you know how Hunared works.",
  },
  {
    icon: Globe,
    title: "Global by design",
    text: "Built for international users, countries, and cross-border opportunity.",
  },
];

export function TrustSafety() {
  return (
    <section className="relative py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 space-y-1.5">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Trust & safety
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Built for professionals who care about trust
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Clear profiles, moderated content, and secure accounts — without
            invented claims.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex gap-3.5 rounded-xl border border-border/70 bg-card p-4 sm:p-5"
            >
              <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-0.5">{title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3 text-sm">
          <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <span className="text-border">·</span>
          <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <span className="text-border">·</span>
          <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
            Contact support
          </Link>
        </div>
      </div>
    </section>
  );
}
