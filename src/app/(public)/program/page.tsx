import type { Metadata } from "next";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Globe2,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  BookMarked,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hunared Program — Education, Training & Career Development",
  description:
    "Explore education programs, technical training, certifications, internships, scholarships, and career development opportunities with Hunared Program. Verify certificates and course credentials through official Hunared.org verification.",
};

const OVERVIEW = [
  "Education",
  "Training",
  "Internship",
  "Certification",
  "Scholarship",
  "Career Development",
];

const JOURNEY_STEPS = [
  {
    step: "01",
    title: "Choose a Program",
    description:
      "Select education, training, or certification pathways aligned with your goals.",
  },
  {
    step: "02",
    title: "Complete Training",
    description:
      "Build practical knowledge through structured learning and skills development.",
  },
  {
    step: "03",
    title: "Pass Assessment",
    description:
      "Demonstrate competency through professional evaluation where required.",
  },
  {
    step: "04",
    title: "Receive & Verify Credential",
    description:
      "Obtain your credential and confirm it through official Hunared.org verification.",
  },
];

const WHY_CREDENTIALS = [
  {
    icon: ShieldCheck,
    title: "Verifiable Credentials",
    description:
      "Credentials can be checked through the official Hunared verification system.",
  },
  {
    icon: BookMarked,
    title: "Professional Learning",
    description:
      "Structured programs designed to build practical knowledge and career-ready skills.",
  },
  {
    icon: Globe2,
    title: "Global Recognition",
    description:
      "Training and certification pathways designed for professionals and learners worldwide.",
  },
  {
    icon: Briefcase,
    title: "Career Development",
    description:
      "Connect learning, skills, credentials, and professional opportunities.",
  },
];

const TRUST_ITEMS = [
  "Online Learning",
  "Professional Assessment",
  "Digital Credential",
  "Online Verification",
  "Career Development",
];

/** Official destinations on Hunared.org (external). */
const PROGRAMS_URL = "https://hunared.org/Programs";
const ABOUT_URL = "https://hunared.org/about";
const COURSES_URL = "https://hunared.org/courses";
const VERIFY_URL = "https://hunared.org/verify";
const ORG_URL = "https://hunared.org";

export default function ProgramPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[420px] w-[680px] rounded-full bg-[#2EA8FF]/[0.06] blur-[120px]" />
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Hunared Program
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Grow Your Skills.{" "}
            <span className="bg-gradient-to-r from-[#2EA8FF] via-[#5EF7FF] to-[#356DFF] bg-clip-text text-transparent">
              Build Your Future.
            </span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Education, training, certifications, internships, scholarships, and career
            development opportunities designed to help people build better skills and
            stronger careers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={PROGRAMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 h-11 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Explore Programs
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href={ORG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 h-11 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              Discover Hunared Organization
            </a>
          </div>
        </div>
      </section>

      {/* From Learning to Verified Credential */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              From Learning to Verified Credential
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              A clear path from program selection to a credential you can verify online.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {JOURNEY_STEPS.map(({ step, title, description }) => (
              <div
                key={step}
                className="rounded-2xl border border-border bg-card/60 p-5 space-y-3"
              >
                <span className="text-xs font-bold tracking-wider text-primary">
                  {step}
                </span>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {description}
                </p>
                {step === "04" && (
                  <a
                    href={VERIFY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 pt-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Verify Credential
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses & Certificate Verification (replaces Explore Our Programs) */}
      <section id="verify" className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Courses & Certificate Verification
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Verify Hunared credentials with confidence. Explore official courses and
              verify certificates online through{" "}
              <span className="text-foreground font-medium">Hunared.org</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <a
              href={COURSES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-border bg-card/60 p-6 sm:p-7 hover:border-primary/40 hover:bg-card transition-all duration-200 flex flex-col"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5">
                Explore Courses
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-5 flex-1">
                Browse official Hunared courses and learning pathways on Hunared.org.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Explore Courses
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </a>

            <a
              href={VERIFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-border bg-card/60 p-6 sm:p-7 hover:border-primary/40 hover:bg-card transition-all duration-200 flex flex-col"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5">
                Verify Certificate
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-5 flex-1">
                Confirm a Hunared certificate through official verification on Hunared.org.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Verify Certificate
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </a>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Courses and credential verification are provided on{" "}
            <a
              href={ORG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Hunared.org
            </a>
            . Hunared.com connects you to programs and opportunities.
          </p>
        </div>
      </section>

      {/* What Hunared Program Provides */}
      <section className="py-14 border-y border-border/60 bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            What Hunared Program Provides
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {OVERVIEW.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground"
              >
                <Sparkles className="h-3 w-3 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Building Skills */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Building Skills. Creating Opportunities.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Hunared Program focuses on connecting people with education, skills development,
            training, certifications, internships, scholarships, and career opportunities —
            in a clear, practical, and accessible way.
          </p>
        </div>
      </section>

      {/* Why Hunared Credentials Matter */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Why Hunared Credentials Matter
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Clear, practical value for learners, professionals, and organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHY_CREDENTIALS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card/60 p-5"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-8 sm:px-8 text-center space-y-5">
            <p className="text-sm sm:text-base font-semibold tracking-wide text-foreground">
              Learn. Certify. Verify. Advance.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {TRUST_ITEMS.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-card/70 p-8 sm:p-10 text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Ready to Build Your Future?
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Explore Hunared programs and discover opportunities to learn, grow, and
              advance your career.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <a
                href={ORG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 h-11 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Hunared Organization
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href={ABOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 h-11 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                Learn About Hunared Organization
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
