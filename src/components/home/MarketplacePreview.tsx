import Link from "next/link";
import {
  Car,
  Building2,
  Laptop,
  Sofa,
  Wrench,
  Home,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react";

const CATS = [
  { icon: Car, label: "Vehicles", href: "/market?type=vehicles" },
  { icon: Building2, label: "Property", href: "/market?type=property" },
  { icon: Laptop, label: "Electronics", href: "/market?type=electronics" },
  { icon: Sofa, label: "Home & Furniture", href: "/market?type=home_furniture" },
  { icon: Wrench, label: "Services", href: "/market?type=services" },
  { icon: Home, label: "Accommodation", href: "/market?type=accommodation" },
  { icon: MoreHorizontal, label: "More", href: "/market" },
];

export function MarketplacePreview() {
  return (
    <section className="relative py-12 sm:py-16 border-y border-border/50 bg-muted/15">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div className="space-y-1.5">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Marketplace
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Buy, sell, rent & find services
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              High-level categories — full filters live on the marketplace page.
            </p>
          </div>
          <Link
            href="/market"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline shrink-0"
          >
            Explore marketplace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
          {CATS.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-4 text-center hover:border-primary/30 hover:bg-muted/40 transition-colors"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium text-foreground leading-tight">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
