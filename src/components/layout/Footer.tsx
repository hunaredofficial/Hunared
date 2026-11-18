"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { HunaredLogo } from "@/components/brand/HunaredLogo";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
  /** Open Hunared Agent drawer instead of navigating */
  openAgent?: boolean;
};

const FOOTER_LINKS: Record<string, FooterLink[]> = {
  Explore: [
    { href: "/jobs", label: "Browse Jobs" },
    { href: "/candidates", label: "Find Talent" },
    { href: "/companies", label: "Companies" },
    { href: "/market", label: "Marketplace" },
    { href: "/education", label: "Education Hub" },
  ],
  Tools: [
    { href: "/post", label: "Post Ads" },
    { href: "/dashboard/cv", label: "CV Builder" },
    { href: "/dashboard/saved", label: "My Saved" },
    { href: "#", label: "Hunared AI", openAgent: true },
    { href: "/dashboard/settings", label: "Settings" },
  ],
  Programs: [
    { href: "https://hunared.org/programs", label: "Hunared Program", external: true },
    { href: "https://hunared.org/programs", label: "Training Courses", external: true },
    { href: "/finder", label: "Finder Center" },
    { href: "/dashboard/premium-ads", label: "Premium Ads" },
    {
      href: "https://hunared.org/referral-program",
      label: "Referral Program",
      external: true,
    },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/help", label: "Help Center" },
    { href: "/contact", label: "Contact Us" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

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

function openHunaredAgent() {
  if (typeof window === "undefined") return;
  // Force the float drawer open (HunaredAgent is mounted on public layout)
  window.dispatchEvent(
    new CustomEvent("hunared-agent-set-open", { detail: { open: true } })
  );
  // Safety net: if drawer did not appear (AI permanently off), open full page
  window.setTimeout(() => {
    const dialog = document.querySelector(
      '[role="dialog"][aria-label="Hunared Agent"]'
    );
    if (!dialog) {
      window.location.href = "/agent";
    }
  }, 150);
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 space-y-4 pr-2">
            <Link
              href="/"
              className="inline-flex items-center shrink-0"
              aria-label="Hunared home"
            >
              <HunaredLogo size="md" asLink={false} />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Global career, marketplace, and learning platform — jobs, talent,
              companies, and community tools in one place.
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

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title} className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground tracking-wide">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    {link.openAgent ? (
                      <button
                        type="button"
                        onClick={openHunaredAgent}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 text-left"
                      >
                        {link.label}
                      </button>
                    ) : link.external || link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
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
          <p className="text-center sm:text-right">
            Global platform for work, talent, business & opportunity
          </p>
        </div>
      </div>
    </footer>
  );
}
