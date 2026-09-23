"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { HunaredLogo } from "@/components/brand/HunaredLogo";

const FOOTER_LINKS = {
  Hunared: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/program", label: "Training & Programs" },
    { href: "https://hunared.org", label: "Verify Credentials" },
  ],
  Discover: [
    { href: "/jobs", label: "Jobs" },
    { href: "/candidates", label: "Talent" },
    { href: "/companies", label: "Companies" },
    { href: "/market", label: "Marketplace" },
    { href: "/education", label: "Learning" },
    { href: "/finder", label: "Hunared Finder" },
  ],
  Marketplace: [
    { href: "/market?category=for_sale", label: "For Sale" },
    { href: "/market?category=for_rent", label: "For Rent" },
    { href: "/market?category=services", label: "Services" },
    { href: "/market?category=property", label: "Property" },
    { href: "/market?category=vehicles", label: "Vehicles" },
    { href: "/market?category=electronics", label: "Electronics" },
    { href: "/market?category=accommodation", label: "Accommodation" },
    { href: "/market?category=wanted", label: "Wanted" },
  ],
  Resources: [
    { href: "/education?category=career_tips", label: "Career Tips" },
    { href: "/education?category=hse", label: "HSE" },
    { href: "/education?category=engineering", label: "Engineering" },
    { href: "/education", label: "Guides & Articles" },
    { href: "/post", label: "Post an Ad" },
  ],
  "For Business": [
    { href: "/dashboard/jobs/new", label: "Post a Job" },
    { href: "/candidates", label: "Find Talent" },
    { href: "/register", label: "Company Profile" },
    { href: "/contact", label: "Advertising" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Cookies" },
    { href: "/terms", label: "Safety & Guidelines" },
  ],
};

const SOCIAL_LINKS = [
  { href: "https://www.linkedin.com/in/hunaredorganization", label: "in", name: "LinkedIn" },
  { href: "https://x.com/HunaredOrg", label: "𝕏", name: "X" },
  { href: "https://www.facebook.com/HunaredOrganization/", label: "fb", name: "Facebook" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-4 pr-2">
            <Link href="/" className="inline-flex items-center shrink-0" aria-label="Hunared home">
              <HunaredLogo size="md" asLink={false} />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Global platform for jobs, talent, companies, marketplace, services, property and learning — opportunity in one place.
            </p>
            <div className="flex gap-2">
              {SOCIAL_LINKS.map(({ href, label, name }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground text-xs font-bold hover:text-primary hover:border-primary/50 hover:bg-primary/8 transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/90">
                {category}
              </h3>
              <ul className="space-y-1.5">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      {...(link.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Hunared. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Find work • Hire talent • Buy & sell • Learn • Grow
          </p>
        </div>
      </div>
    </footer>
  );
}
