"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { HunaredLogo } from "@/components/brand/HunaredLogo";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/jobs", label: "Browse Jobs" },
      { href: "/candidates", label: "Find Talent" },
      { href: "/companies", label: "Companies" },
      { href: "/market", label: "Marketplace" },
    ],
  },
  {
    title: "Tools",
    links: [
      { href: "/education", label: "Learning" },
      { href: "/finder", label: "Finder Center" },
      { href: "/dashboard/cv", label: "CV Builder" },
      { href: "/dashboard/premium-ads", label: "Premium Ads" },
    ],
  },
  {
    title: "Programs",
    links: [
      {
        href: "https://hunared.org/programs",
        label: "Program",
        external: true,
      },
      {
        href: "https://hunared.org/courses",
        label: "Training Courses",
        external: true,
      },
      { href: "/education", label: "Education Hub" },
      { href: "/education/career-tips", label: "Career Tips" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/help", label: "Help Center" },
      { href: "/contact", label: "Contact Us" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

const SOCIAL_LINKS = [
  { href: "https://www.linkedin.com/in/hunaredorganization", label: "in" },
  { href: "https://x.com/HunaredOrg", label: "𝕏" },
  { href: "https://www.facebook.com/HunaredOrganization/", label: "fb" },
];

function FooterAnchor({ link }: { link: FooterLink }) {
  const className =
    "text-sm text-muted-foreground hover:text-foreground transition-colors duration-200";
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top: brand + social */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 py-10 border-b border-border/60">
          <div className="space-y-3 max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center shrink-0"
              aria-label="Hunared home"
            >
              <HunaredLogo size="md" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Global career, marketplace, and learning platform — jobs, talent,
              companies, and community tools in one place.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {SOCIAL_LINKS.map(({ href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground text-xs font-bold hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Link grid — 4 equal columns */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-10">
          {COLUMNS.map((col) => (
            <div key={col.title} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <FooterAnchor link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="opacity-60" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Hunared. All rights reserved.</span>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
            <Link href="/help" className="hover:text-foreground transition-colors">
              Help
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
