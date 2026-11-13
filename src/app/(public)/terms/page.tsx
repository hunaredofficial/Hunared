import type { Metadata } from "next";
import Link from "next/link";
import { SiteContainer } from "@/components/layout/SiteContainer";
import {
  FileText,
  Shield,
  Users,
  Ban,
  Scale,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing use of Hunared — jobs, talent, marketplace, learning, and community features. Includes content and advertising rules.",
};

const SECTIONS = [
  { id: "acceptance", label: "Acceptance" },
  { id: "accounts", label: "Accounts & eligibility" },
  { id: "platform", label: "What Hunared provides" },
  { id: "conduct", label: "Acceptable use" },
  { id: "content", label: "Your content" },
  { id: "ads", label: "Ads & monetization" },
  { id: "liability", label: "Platform role & liability" },
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
              Rules for using Hunared’s website and services. By creating an
              account or using the platform, you agree to these Terms.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated:{" "}
              <span className="text-foreground font-medium">14 November 2026</span>
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
                  className="block text-sm text-muted-foreground hover:text-primary py-1 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </aside>

          <article className="max-w-3xl space-y-12 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <section id="acceptance" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                These Terms of Service (“Terms”) apply to{" "}
                <Link href="/" className="text-primary hover:underline">
                  hunared.com
                </Link>{" "}
                and related Hunared services. If you do not agree, do not use the
                platform. Additional product-specific rules (for example Help
                Center guides) may apply and are part of your agreement when you
                use those features.
              </p>
            </section>

            <section id="accounts" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                2. Accounts &amp; eligibility
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>You must be at least 16 years old (or older if required in your country).</li>
                <li>You must provide accurate registration information and keep it updated.</li>
                <li>
                  Account types include Personal, Talent, and Company (and staff
                  roles assigned by Hunared). You are responsible for activity
                  under your account.
                </li>
                <li>Do not share your login credentials or impersonate others.</li>
              </ul>
            </section>

            <section id="platform" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground">3. What Hunared provides</h2>
              <p>
                Hunared is an online platform for, among other things: job posts
                and applications; talent profiles; company directories;
                marketplace listings (sale, rent, services, property, and more);
                learning articles and resources; CV Builder; messaging; Finder
                Center (lost &amp; found); optional Hunared AI assistant; and
                links to programs on hunared.org. Features may change as we
                improve the product.
              </p>
              <p>
                Hunared is a <strong className="text-foreground">venue and technology provider</strong>.
                We do not employ candidates listed on the site, guarantee hires,
                or become a party to transactions between users unless explicitly
                stated in writing.
              </p>
            </section>

            <section id="conduct" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Ban className="h-5 w-5 text-primary" />
                4. Acceptable use
              </h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Post illegal, fraudulent, hateful, harassing, or sexually exploitative content.</li>
                <li>Post content that infringes intellectual property or privacy rights of others.</li>
                <li>Scam, phish, spam, or mislead users (including fake jobs or marketplace fraud).</li>
                <li>Upload malware or attempt to disrupt or reverse-engineer the service.</li>
                <li>Collect other users’ data without permission or scrape the site in abuse of our systems.</li>
                <li>
                  Post content prohibited by advertising partners’ policies (including
                  Google AdSense prohibited content categories) on pages where ads
                  may appear.
                </li>
              </ul>
              <p>
                We may remove content, limit features, or suspend accounts that
                violate these Terms or applicable law.
              </p>
            </section>

            <section id="content" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                5. Your content
              </h2>
              <p>
                You retain ownership of content you submit (profiles, jobs,
                listings, messages, files). You grant Hunared a worldwide,
                non-exclusive license to host, display, and distribute that
                content as needed to operate and promote the service.
              </p>
              <p>
                You are solely responsible for the accuracy and legality of your
                posts. Public content may be visible to other users and to search
                engines according to your privacy and listing settings.
              </p>
            </section>

            <section id="ads" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                6. Advertising &amp; monetization
              </h2>
              <p>
                Hunared may show third-party ads (including Google AdSense) and
                optional paid placements such as Premium Ads. Ad appearance does
                not mean Hunared endorses the advertiser. Paid or organic listings
                by users must still comply with these Terms and applicable laws.
              </p>
              <p>
                How advertising partners process data is described in our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section id="liability" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                7. Platform role &amp; liability
              </h2>
              <p>
                To the fullest extent permitted by law, Hunared is not liable for
                employment outcomes, the quality of candidates or employers, failed
                marketplace transactions, or user-generated content. The service is
                provided “as is” and “as available.” We do not warrant uninterrupted
                or error-free operation.
              </p>
              <p>
                Where liability cannot be excluded, it is limited to the greater of
                fees you paid to Hunared for the service in the three months before
                the claim, or a minimal amount required by mandatory law.
              </p>
            </section>

            <section id="ip" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground">8. Intellectual property</h2>
              <p>
                The Hunared name, logo, design, and platform software are owned by
                Hunared or its licensors. You may not copy or misuse our branding
                without written permission.
              </p>
            </section>

            <section id="changes" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                9. Changes to these Terms
              </h2>
              <p>
                We may update these Terms. Material changes will be reflected by
                the “Last updated” date. Continued use after changes means you
                accept the revised Terms.
              </p>
            </section>

            <section id="contact" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
              <p>
                Questions about these Terms:{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact Us
                </Link>
                {" · "}
                <Link href="/help" className="text-primary hover:underline">
                  Help Center
                </Link>
                {" · "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
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
