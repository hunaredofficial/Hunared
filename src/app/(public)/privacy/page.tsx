import type { Metadata } from "next";
import Link from "next/link";
import { SiteContainer } from "@/components/layout/SiteContainer";
import { Shield, Lock, Cookie, Mail, Database, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Hunared collects, uses, stores, and protects personal information on our global careers and opportunity platform.",
};

const SECTIONS = [
  { id: "collect", label: "Information we collect" },
  { id: "use", label: "How we use information" },
  { id: "share", label: "Sharing & third parties" },
  { id: "cookies", label: "Cookies & ads" },
  { id: "security", label: "Security" },
  { id: "rights", label: "Your rights" },
  { id: "contact", label: "Contact" },
];

export default function PrivacyPolicyPage() {
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
              <Shield className="h-3.5 w-3.5" />
              Legal
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              How we collect, use, and protect your information on Hunared — a
              global platform for jobs, talent, companies, marketplace, and
              learning.
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
            <p className="text-foreground">
              Hunared (“we”, “us”, “our”) is committed to protecting personal
              information and respecting your privacy. This policy explains what
              we collect, why we collect it, and the choices you have.
            </p>

            <section id="collect" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                1. Information we collect
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Account data:</strong>{" "}
                  name, email, phone, location, profession, role (personal /
                  seeker / company), and profile details you choose to provide.
                </li>
                <li>
                  <strong className="text-foreground">Files:</strong> profile
                  photos, logos, CVs, and listing images stored with our media
                  partner (Cloudinary) and linked to your account.
                </li>
                <li>
                  <strong className="text-foreground">
                    Authentication:
                  </strong>{" "}
                  login is handled by Clerk. We do not store your password on
                  our application servers.
                </li>
                <li>
                  <strong className="text-foreground">
                    Listings & messages:
                  </strong>{" "}
                  job posts, marketplace listings, contact form submissions, and
                  related metadata needed to operate the service.
                </li>
                <li>
                  <strong className="text-foreground">Usage data:</strong>{" "}
                  approximate device/browser information and pages visited to
                  improve performance and security.
                </li>
              </ul>
            </section>

            <section id="use" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                2. How we use information
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Create and manage accounts and sessions.</li>
                <li>
                  Display public profiles, jobs, companies, and marketplace
                  listings according to your settings.
                </li>
                <li>Enable search, applications, and platform messaging flows.</li>
                <li>Moderate content, prevent abuse, and secure the platform.</li>
                <li>Respond to contact requests and support inquiries.</li>
                <li>Improve product quality, reliability, and user experience.</li>
              </ul>
            </section>

            <section id="share" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                3. Sharing & third parties
              </h2>
              <p>
                We do not sell your personal information. We share data only as
                needed to run the service, including:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Clerk</strong> —
                  authentication and session management.
                </li>
                <li>
                  <strong className="text-foreground">Supabase</strong> —
                  database and application data storage.
                </li>
                <li>
                  <strong className="text-foreground">Cloudinary</strong> —
                  media uploads (images, documents).
                </li>
                <li>
                  <strong className="text-foreground">Email delivery</strong> —
                  transactional messages (for example verification and contact
                  form delivery) via configured SMTP.
                </li>
                <li>
                  Legal or safety requirements when we are required to disclose
                  information by law or to protect users and the platform.
                </li>
              </ul>
              <p>
                Information you publish on public profiles or listings may be
                visible to other users and search engines according to your
                visibility settings.
              </p>
            </section>

            <section id="cookies" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" />
                4. Cookies & advertising
              </h2>
              <p>
                We use essential cookies for authentication and site operation.
                Where advertising is enabled (for example Google AdSense),
                third parties may use cookies to serve ads based on prior visits.
                You can manage ad personalization via{" "}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Ads Settings
                </a>
                .
              </p>
            </section>

            <section id="security" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                5. Security
              </h2>
              <p>
                We apply industry-standard safeguards including encrypted
                transport (HTTPS), access controls, and trusted infrastructure
                providers. No method of transmission or storage is 100% secure;
                we work continuously to reduce risk.
              </p>
            </section>

            <section id="rights" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                6. Your rights & choices
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Access and update profile information from your dashboard.</li>
                <li>
                  Control public visibility of candidate or company profiles
                  where those settings are offered.
                </li>
                <li>
                  Request deletion of your account and associated personal data,
                  subject to legal retention needs.
                </li>
                <li>
                  Opt out of non-essential marketing communications where
                  applicable.
                </li>
              </ul>
            </section>

            <section id="contact" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                7. Contact
              </h2>
              <p>
                Questions about this policy or your data can be sent through our{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact page
                </Link>
                .
              </p>
              <p className="text-sm">
                Related:{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>
              </p>
            </section>
          </article>
        </div>
      </SiteContainer>
    </div>
  );
}
