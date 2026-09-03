import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Hunared",
  description: "How Hunared collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 py-16 mt-10">
      <article className="prose prose-slate dark:prose-invert max-w-3xl mx-auto">
        <h1>Privacy Policy</h1>
        <p className="lead">
          <strong>Last Updated: August 14, 2026</strong>
        </p>
        <p>
          Welcome to Hunared. We are committed to protecting your personal information and
          your right to privacy.
        </p>

        <h2>1. Information We Collect</h2>
        <ul>
          <li>
            <strong>Personal Information:</strong> When you register, we collect your name, email
            address, phone number, location, and profession.
          </li>
          <li>
            <strong>Files and Documents:</strong> If you upload a CV/Resume or profile photo, these
            files are securely stored via our media partner (Cloudinary) and linked to your profile.
          </li>
          <li>
            <strong>Authentication Data:</strong> We use a secure third-party provider (Clerk) to
            manage your login credentials. We do not store your passwords on our direct servers.
          </li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Facilitate account creation and logon processes.</li>
          <li>
            Display your professional profile to potential employers (if you are a job seeker).
          </li>
          <li>Process marketplace listings and interactions.</li>
          <li>Improve our platform and ensure security.</li>
        </ul>

        <h2>3. Third-Party Services &amp; Cookies</h2>
        <p>We utilize third-party services that may collect information or use cookies:</p>
        <ul>
          <li>
            <strong>Google AdSense:</strong> We use Google AdSense to display ads. Google uses
            cookies to serve ads based on your prior visits to our website or other websites. You
            can opt out of personalized advertising by visiting{" "}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ads Settings
            </a>
            .
          </li>
          <li>
            <strong>Infrastructure:</strong> Our database and backend operations are supported by
            Supabase, which complies with modern data security standards.
          </li>
        </ul>

        <h2>4. Data Security</h2>
        <p>
          We implement appropriate technical and organizational security measures to protect your
          personal information. However, please remember that no electronic transmission over the
          internet can be guaranteed to be 100% secure.
        </p>
      </article>
    </main>
  );
}
