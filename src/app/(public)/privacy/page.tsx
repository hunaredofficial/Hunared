import type { Metadata } from "next";
import Link from "next/link";
import { SiteContainer } from "@/components/layout/SiteContainer";
import { Shield, Lock, Cookie, Mail, Database, Eye, Ban } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Hunared collects, uses, stores, and protects personal information — including cookies, advertising, and AdSense-related practices.",
};

const SECTIONS = [
  { id: "who", label: "Who we are" },
  { id: "collect", label: "Information we collect" },
  { id: "use", label: "How we use information" },
  { id: "share", label: "Sharing & third parties" },
  { id: "ads", label: "Advertising & AdSense" },
  { id: "cookies", label: "Cookies & similar tech" },
  { id: "security", label: "Security" },
  { id: "children", label: "Children’s privacy" },
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
              global platform for jobs, talent, companies, marketplace, learning,
              and community tools.
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
            <section id="who" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground">1. Who we are</h2>
              <p>
                Hunared (“we”, “us”, “our”) operates{" "}
                <Link href="/" className="text-primary hover:underline">
                  hunared.com
                </Link>{" "}
                — a platform connecting people and organizations for jobs, talent
                discovery, company profiles, marketplace listings, learning
                resources, programs, Finder Center (lost &amp; found), messaging,
                CV Builder, and related tools. Related program information may
                also appear on{" "}
                <a
                  href="https://hunared.org"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  hunared.org
                </a>
                .
              </p>
            </section>

            <section id="collect" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                2. Information we collect
              </h2>
              <p>Depending on how you use Hunared, we may collect:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Account data</strong> — name,
                  email, phone, username, account type (Personal, Talent, Company,
                  or staff roles), profile photo, and authentication data via our
                  sign-in provider (Clerk).
                </li>
                <li>
                  <strong className="text-foreground">Profile &amp; professional data</strong>{" "}
                  — profession, skills, job interests, CV content you upload or
                  build, company industry/services, location, and public listing
                  preferences.
                </li>
                <li>
                  <strong className="text-foreground">Listings &amp; content</strong>{" "}
                  — jobs, marketplace posts, articles, learning resources, lost
                  &amp; found reports, messages, and files you upload.
                </li>
                <li>
                  <strong className="text-foreground">Usage &amp; device data</strong>{" "}
                  — pages viewed, approximate location (if you allow), browser
                  type, IP address, and diagnostics needed to run and secure the
                  service.
                </li>
                <li>
                  <strong className="text-foreground">Communications</strong> — messages
                  you send through Hunared, and support requests via Contact or Help.
                </li>
              </ul>
            </section>

            <section id="use" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                3. How we use information
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide, operate, and improve accounts, listings, search, messaging, and AI-assisted tools (when enabled).</li>
                <li>Show relevant jobs, talent, companies, and marketplace results — including optional personalization.</li>
                <li>Moderate content, prevent fraud/spam, and enforce our Terms.</li>
                <li>Respond to support requests and send important service notices.</li>
                <li>Measure performance and, where enabled, show advertising (see Advertising &amp; AdSense).</li>
                <li>Comply with law and protect the rights and safety of users and Hunared.</li>
              </ul>
            </section>

            <section id="share" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground">4. Sharing &amp; third parties</h2>
              <p>We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Service providers</strong> — hosting,
                  database (e.g. Supabase), authentication (Clerk), email delivery,
                  analytics, and security vendors under contract.
                </li>
                <li>
                  <strong className="text-foreground">Other users</strong> — when you
                  publish a public profile, job, listing, or message someone, the
                  information you choose to share becomes visible as designed.
                </li>
                <li>
                  <strong className="text-foreground">Advertising partners</strong> — such
                  as Google AdSense / Google advertising services when ads are shown
                  (see below).
                </li>
                <li>
                  <strong className="text-foreground">Legal</strong> — when required by
                  law, court order, or to protect rights and safety.
                </li>
              </ul>
            </section>

            <section id="ads" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" />
                5. Advertising &amp; Google AdSense
              </h2>
              <p>
                Hunared may display third-party advertisements, including ads
                served by <strong className="text-foreground">Google AdSense</strong>{" "}
                and related Google advertising services.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Google and its partners may use cookies and similar technologies
                  to serve ads based on your prior visits to Hunared and/or other
                  websites.
                </li>
                <li>
                  Google’s use of advertising cookies enables it and its partners
                  to serve ads based on your visit to this site and/or other sites
                  on the Internet.
                </li>
                <li>
                  You may opt out of personalized advertising by visiting{" "}
                  <a
                    href="https://www.google.com/settings/ads"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Ads Settings
                  </a>
                  . You can also visit{" "}
                  <a
                    href="https://www.aboutads.info"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    aboutads.info
                  </a>{" "}
                  for more choices.
                </li>
                <li>
                  Third-party vendors, including Google, use cookies to serve ads
                  based on a user’s prior visits. We do not control these vendors’
                  cookies; their policies apply to their processing.
                </li>
              </ul>
              <p>
                For more detail on how Google uses data, see{" "}
                <a
                  href="https://policies.google.com/technologies/partner-sites"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  How Google uses information from sites or apps that use our
                  services
                </a>
                .
              </p>
            </section>

            <section id="cookies" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground">6. Cookies &amp; similar technologies</h2>
              <p>We and our partners use cookies and local storage to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Keep you signed in and remember preferences (e.g. theme, location).</li>
                <li>Understand traffic and improve the product.</li>
                <li>Support advertising features where enabled (see above).</li>
              </ul>
              <p>
                You can control cookies through your browser settings. Disabling
                some cookies may limit certain features (for example, staying
                signed in).
              </p>
            </section>

            <section id="security" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                7. Security
              </h2>
              <p>
                We use industry-standard measures (encryption in transit, access
                controls, and provider security practices) to protect data.
                No method of transmission or storage is 100% secure; we work to
                reduce risk but cannot guarantee absolute security.
              </p>
            </section>

            <section id="children" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Ban className="h-5 w-5 text-primary" />
                8. Children’s privacy
              </h2>
              <p>
                Hunared is intended for users who are at least{" "}
                <strong className="text-foreground">16 years old</strong> (or the
                minimum digital-consent age in your country, if higher). We do not
                knowingly collect personal information from children under 16. If
                you believe a child has provided data, contact us and we will take
                appropriate steps to delete it.
              </p>
            </section>

            <section id="rights" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground">9. Your rights &amp; choices</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Update or delete much of your profile data in Account / Profile settings.</li>
                <li>Control public listing visibility and AI Agent settings where provided.</li>
                <li>Request access, correction, or deletion of personal data where applicable law allows.</li>
                <li>Opt out of personalized ads via Google Ads Settings (link above).</li>
              </ul>
              <p>
                For privacy requests, use the Contact page or the email below. We
                may need to verify your identity before fulfilling certain requests.
              </p>
            </section>

            <section id="contact" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                10. Contact
              </h2>
              <p>
                Questions about this Privacy Policy:{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact Us
                </Link>
                {" · "}
                <Link href="/help" className="text-primary hover:underline">
                  Help Center
                </Link>
                .
              </p>
              <p className="text-xs">
                This policy may be updated from time to time. The “Last updated”
                date at the top will change when we publish material revisions.
              </p>
            </section>
          </article>
        </div>
      </SiteContainer>
    </div>
  );
}
