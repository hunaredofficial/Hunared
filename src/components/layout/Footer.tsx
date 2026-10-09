"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { HunaredLogo } from "@/components/brand/HunaredLogo";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

const FOOTER_COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Platform",
    links: [
      { href: "/jobs", label: "Jobs" },
      { href: "/candidates", label: "Talent" },
      { href: "/companies", label: "Companies" },
      { href: "/market", label: "Marketplace" },
      { href: "/education", label: "Learning" },
      { href: "/search", label: "Universal search" },
    ],
  },
  {
    title: "Marketplace",
    links: [
      { href: "/market?category=services", label: "Services" },
      { href: "/market?category=property", label: "Property" },
      { href: "/market?category=accommodation", label: "Accommodation" },
      { href: "/market?category=vehicles", label: "Vehicles" },
      { href: "/market?category=electronics", label: "Electronics" },
      { href: "/market?category=lost_found", label: "Lost & Found" },
      { href: "/market?category=offers_deals", label: "Offers & Deals" },
    ],
  },
  {
    title: "Grow",
    links: [
      { href: "/program", label: "Hunared Programs" },
      {
        href: "https://hunared.org/courses",
        label: "Courses",
        external: true,
      },
      { href: "/dashboard/cv", label: "CV Builder" },
      { href: "/finder", label: "Finder Center" },
      { href: "/post", label: "Post an ad" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Hunared" },
      { href: "/contact", label: "Contact us" },
      { href: "/register", label: "Create account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/in/hunaredorganization",
    label: "in",
    name: "LinkedIn",
  },
  { href: "https://x.com/HunaredOrg", label: "𝕏", name: "X" },
  {
    href: "https://www.facebook.com/HunaredOrganization/",
    label: "fb",
    name: "Facebook",
  },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center shrink-0"
              aria-label="Hunared home"
            >
              <HunaredLogo size="md" asLink={false} />
            </Link>
            <p className="text-sm text-muted-foreground max-w-[220px] leading-relaxed">
              Global platform for jobs, talent, companies, marketplace and
              learning — one place for opportunity.
            </p>
            <div className="flex gap-2">
              {SOCIAL_LINKS.map(({ href, label, name }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground text-xs font-bold hover:text-primary hover:border-primary/50 hover:bg-primary/8 transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    {link.external || link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 sm:my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Hunared. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-primary transition-colors">
              Contact
            </Link>
            <span className="hidden sm:inline text-border">·</span>
            <span>hunared.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
