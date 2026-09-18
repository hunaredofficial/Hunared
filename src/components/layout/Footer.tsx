"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { HunaredLogo } from "@/components/brand/HunaredLogo";

const FOOTER_LINKS = {
  Hunared: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/about", label: "Our Mission" },
  ],
  Opportunities: [
    { href: "/jobs", label: "Jobs" },
    { href: "/candidates", label: "Candidates" },
    { href: "/companies", label: "Companies" },
    { href: "/market", label: "Marketplace" },
  ],
  Learn: [
    { href: "/education", label: "Learning Hub" },
    { href: "/education?category=career_tips", label: "Career Tips" },
    { href: "/education?category=engineering", label: "Engineering" },
    { href: "/education?category=safety_hse", label: "HSE / Safety" },
  ],
  Programs: [
    { href: "/program", label: "Training & Programs" },
    { href: "https://hunared.org", label: "Verify Credentials" },
    { href: "/program", label: "Certifications" },
  ],
  Community: [
    { href: "/market?type=lost_found", label: "Hunared Finder" },
    { href: "/market?type=community", label: "Community" },
    { href: "/market?type=events", label: "Events" },
  ],
  Support: [
    { href: "/contact", label: "Help & Contact" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14 md:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-8 lg:gap-6">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 space-y-4 pr-2">
            <Link
              href="/"
              className="inline-flex items-center shrink-0"
              aria-label="Hunared home"
            >
              <HunaredLogo size="md" asLink={false} />
            </Link>

            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Everything you need. One platform. Jobs, talent, companies,
              marketplace, learning, and programs — global and professional.
            </p>
            <div className="flex gap-2.5">
              {SOCIAL_LINKS.map(({ href, label, name }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground text-xs font-bold hover:text-primary hover:border-primary/50 hover:bg-primary/8 transition-colors duration-200"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
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

        <Separator className="my-8 sm:my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Hunared. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Global professional opportunity platform
          </p>
        </div>
      </div>
    </footer>
  );
}
