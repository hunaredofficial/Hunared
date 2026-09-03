import type { Metadata } from "next";
import Link from "next/link";
import { SiteContainer } from "@/components/layout/SiteContainer";
import {
  FileText,
  UserCheck,
  AlertTriangle,
  Scale,
  Ban,
  RefreshCw,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions for using Hunared — the global platform for jobs, talent, companies, marketplace, and learning.",
};

const SECTIONS = [
  { id: "acceptance", label: "Acceptance" },
  { id: "accounts", label: "Accounts" },
  { id: "content", label: "Content & conduct" },
  { id: "listings", label: "Jobs & marketplace" },
  { id: "liability", label: "Liability" },
  { id: "ip", label: "Intellectual property" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact" },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen">
      <section className="relative border-b border-border overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/12 via-background to-background"
          aria-hidden
        />
        <SiteContainer className="relative py-14 sm:py-18 md:py-20">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <FileText className="h-3.5 w-3.5" />
              Legal
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              The rules that govern access to and use of Hunared’s website and
              services worldwide.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated:{" "}
              <span className="text-foreground font-medium">14 August 2026</span>
            </p>
          </div>
        </SiteContainer>
      </section>

      <SiteContainer className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                On this page
              </p>
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block text-sm text-muted-foreground hover:text-primary py-1.5 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </aside>

          <article className="max-w-3xl space-y-10 text-[15px] leading-relaxed text-muted-foreground">
            <section id="acceptance" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                1. Acceptance of terms
              </h2>
              <p>
                By accessing or using Hunared, you agree to these Terms of
                Service and our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                . If you do not agree, do not use the platform.
              </p>
            </section>

            <section id="accounts" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                2. User accounts
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Provide accurate, complete, and current information when you
                  register or update your profile.
                </li>
                <li>
                  You are responsible for activity under your account and for
                  keeping login credentials secure.
                </li>
                <li>
                  Account types (Personal, Seeker, Company) determine available
                  features; misuse of roles is not permitted.
                </li>
                <li>
                  We may suspend or terminate accounts that violate these terms
                  or create risk for other users.
                </li>
              </ul>
            </section>

            <section id="content" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Ban className="h-5 w-5 text-primary" />
                3. User content & conduct
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  You are solely responsible for profiles, CVs, job posts,
                  marketplace listings, and other content you submit.
                </li>
                <li>
                  Do not post false, misleading, fraudulent, illegal,
                  discriminatory, or harmful content.
                </li>
                <li>
                  Do not harass users, scrape the platform without permission, or
                  interfere with security or availability.
                </li>
                <li>
                  We may remove content or restrict access when we reasonably
                  believe these terms or applicable law have been violated.
                </li>
              </ul>
            </section>

            <section id="listings" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                4. Jobs, candidates & marketplace
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Employers and sellers must provide accurate contact and listing
                  details.
                </li>
                <li>
                  Job seekers must ensure profile and application information is
                  truthful.
                </li>
                <li>
                  Listings may be subject to review, moderation, or automatic
                  expiration rules configured on the platform.
                </li>
                <li>
                  Marketplace transactions are between users. Hunared is not a
                  party to purchase agreements unless explicitly stated.
                </li>
              </ul>
            </section>

            <section id="liability" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                5. Platform role & liability
              </h2>
              <p>
                Hunared is a connecting platform for professionals,
                organizations, and marketplace participants. We do not guarantee
                employment outcomes, candidate quality, or the success of any
                listing or transaction.
              </p>
              <p>
                To the fullest extent permitted by law, Hunared is not liable for
                indirect, incidental, or consequential damages arising from use
                of the service. The platform is provided on an “as is” and “as
                available” basis.
              </p>
            </section>

            <section id="ip" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                6. Intellectual property
              </h2>
              <p>
                The Hunared name, logo, design system, and original platform
                software are owned by Hunared or its licensors. You may not copy,
                modify, or distribute our branding or code without prior written
                permission. You retain rights to content you upload, and grant us
                a limited license to host and display it to operate the service.
              </p>
            </section>

            <section id="changes" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                7. Changes to these terms
              </h2>
              <p>
                We may update these Terms from time to time. Material changes
                will be indicated by revising the “Last updated” date on this
                page. Continued use after changes constitutes acceptance of the
                updated terms.
              </p>
            </section>

            <section id="contact" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                8. Contact
              </h2>
              <p>
                For questions about these Terms, use our{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact page
                </Link>
                .
              </p>
            </section>
          </article>
        </div>
      </SiteContainer>
    </div>
  );
}
