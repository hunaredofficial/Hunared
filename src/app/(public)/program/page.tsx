import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  Wrench,
  Award,
  Factory,
  Target,
  BookOpen,
  HandHeart,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hunared Program — Education, Training & Career Development",
  description:
    "Explore education programs, technical training, certifications, internships, scholarships, and career development opportunities with Hunared Program.",
};

const PROGRAMS = [
  {
    icon: GraduationCap,
    title: "Education Programs",
    description: "Structured learning paths to build foundational and advanced knowledge.",
    href: "https://hunared.org/education-programs",
  },
  {
    icon: Wrench,
    title: "Technical Training",
    description: "Hands-on skills training aligned with industry and workplace needs.",
    href: "https://hunared.org/technical-training",
  },
  {
    icon: Award,
    title: "International Certifications",
    description: "Globally recognized credentials that strengthen your professional profile.",
    href: "https://hunared.org/international-certifications",
  },
  {
    icon: Factory,
    title: "Industrial Certifications",
    description: "Industry-focused certifications for technical and operational roles.",
    href: "https://hunared.org/industrial-certifications",
  },
  {
    icon: Target,
    title: "Internships",
    description: "Real-world experience opportunities to start or grow your career.",
    href: "https://hunared.org/internships",
  },
  {
    icon: BookOpen,
    title: "Scholarships",
    description: "Support programs that help learners access education and training.",
    href: "https://hunared.org/scholarships",
  },
  {
    icon: HandHeart,
    title: "Sponsorship Programs",
    description: "Sponsored pathways that connect talent with growth opportunities.",
    href: "https://hunared.org/sponsorship-programs",
  },
  {
    icon: TrendingUp,
    title: "Career Development",
    description: "Guidance and programs designed to help you advance professionally.",
    href: "https://hunared.org/career-development-programs",
  },
];

const OVERVIEW = [
  "Education",
  "Training",
  "Internship",
  "Certification",
  "Scholarship",
  "Career Development",
];

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
              href="#programs"
              className="inline-flex items-center gap-2 px-6 h-11 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Explore Programs
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="https://hunared.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 h-11 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              Learn About Hunared Program
            </a>
          </div>
        </div>
      </section>

      {/* Program Categories */}
      <section id="programs" className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Explore Our Programs
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Choose a path that matches your goals — from learning and certification to
              internships and career growth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROGRAMS.map(({ icon: Icon, title, description, href }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40 hover:bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Overview strip */}
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

      {/* Trust / Impact */}
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
            <a
              href="#programs"
              className="inline-flex items-center gap-2 px-6 h-11 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Explore Programs
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}