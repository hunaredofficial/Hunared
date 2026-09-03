import type { Metadata } from "next";
import Link from "next/link";
import { SiteContainer } from "@/components/layout/SiteContainer";
import {
  Globe,
  Users,
  Briefcase,
  BookOpen,
  ShoppingBag,
  Star,
  Target,
  Eye,
  Heart,
  Shield,
  Compass,
  Lightbulb,
  Building2,
  GraduationCap,
  Network,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Hunared is a global careers and opportunity platform — jobs, talent, companies, marketplace, learning, and verified programs in one place for professionals and organizations worldwide.",
};

const features = [
  {
    icon: Briefcase,
    title: "Global Job Board",
    description:
      "Discover roles across industries and experience levels. Post openings, filter by location and skill, and hire with confidence.",
  },
  {
    icon: Users,
    title: "Candidate Directory",
    description:
      "A living talent network where skilled professionals can be found — and where employers discover people ready to contribute.",
  },
  {
    icon: Building2,
    title: "Company Directory",
    description:
      "Explore organizations by industry and services. Build visibility for your brand and connect with the right partners.",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description:
      "List products, services, and community offers. Buy and sell with clear contact paths and moderated listings.",
  },
  {
    icon: BookOpen,
    title: "Learning Hub",
    description:
      "Practical articles on safety, engineering, careers, and professional growth — knowledge that compounds over time.",
  },
  {
    icon: GraduationCap,
    title: "Programs & Credentials",
    description:
      "Training, certification, and career pathways with official verification through Hunared.org.",
  },
];

const values = [
  {
    icon: Heart,
    title: "People First",
    description:
      "We design for real career decisions — finding work, hiring talent, learning skills, and building professional trust.",
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description:
      "Moderation, clear contact rules, and transparent practices so members can engage with confidence.",
  },
  {
    icon: Compass,
    title: "Clarity Over Clutter",
    description:
      "Jobs, talent, companies, marketplace, and learning in one coherent platform — not a maze of disconnected tools.",
  },
  {
    icon: Lightbulb,
    title: "Practical Innovation",
    description:
      "Every feature answers a simple test: does this help someone find opportunity, grow skills, or build a better network?",
  },
];

const stats = [
  { value: "50+", label: "Countries reached" },
  { value: "All-in-one", label: "Career platform" },
  { value: "Jobs + Talent", label: "Two-sided market" },
  { value: "Verified", label: "Program credentials" },
];

const pillars = [
  {
    icon: Network,
    title: "Connect",
    text: "Professionals, employers, and organizations meet in one network — candidates, companies, and opportunities in view.",
  },
  {
    icon: Briefcase,
    title: "Work",
    text: "Publish jobs, apply with clarity, and manage listings with tools built for real hiring workflows.",
  },
  {
    icon: Sparkles,
    title: "Grow",
    text: "Learn through the Education Hub and progress through Hunared programs with credentials you can verify.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-24">
        <SiteContainer className="relative text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            About Hunared
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-tight">
            The global platform for{" "}
            <span className="gradient-text">careers & opportunity</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Hunared brings jobs, talent, companies, marketplace, learning, and
            verified programs together — so professionals and organizations
            worldwide can find each other, grow, and succeed in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/register">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/jobs">Explore jobs</Link>
            </Button>
          </div>
        </SiteContainer>
      </section>

      {/* Stats */}
      <section className="border-b border-border py-10 sm:py-12">
        <SiteContainer>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold gradient-text mb-1">
                  {s.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </SiteContainer>
      </section>

      {/* Story */}
      <section className="py-16 sm:py-20">
        <SiteContainer>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              Built for a{" "}
              <span className="gradient-text">connected world of work</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
              Careers are no longer limited by a single city or channel. Talent
              moves across borders, companies hire across regions, and skills
              need continuous growth. Hunared was created to simplify that
              reality — one platform where opportunity is discoverable, listings
              are clear, and learning stays within reach.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-sm"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </SiteContainer>
      </section>

      {/* Mission & Vision */}
      <section className="border-y border-border bg-muted/20 py-16 sm:py-20">
        <SiteContainer>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-7 sm:p-9">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3">
                Our mission
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                To empower people and organizations to{" "}
                <span className="font-medium text-foreground">
                  find opportunity, hire with clarity, and grow skills
                </span>{" "}
                through a single, trusted global platform — from first job
                search to long-term career development.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-7 sm:p-9">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Eye className="h-6 w-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3">
                Our vision
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A world where{" "}
                <span className="font-medium text-foreground">
                  access to work and learning is not fragmented
                </span>
                . Hunared aims to be the place professionals and companies turn
                to when they need roles, talent, services, knowledge, and
                verified credentials — without switching between a dozen tools.
              </p>
            </div>
          </div>
        </SiteContainer>
      </section>

      {/* Platform pillars */}
      <section className="py-16 sm:py-20">
        <SiteContainer>
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Everything in one{" "}
              <span className="gradient-text">professional ecosystem</span>
            </h2>
            <p className="text-muted-foreground">
              Six core areas designed to work together — so your next step is
              never a dead end.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </SiteContainer>
      </section>

      {/* Values */}
      <section className="border-t border-border bg-muted/20 py-16 sm:py-20">
        <SiteContainer>
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              What we stand for
            </h2>
            <p className="text-muted-foreground">
              Principles that guide product decisions, moderation, and how we
              serve members.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {values.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SiteContainer>
      </section>

      {/* Who it's for */}
      <section className="py-16 sm:py-20">
        <SiteContainer>
          <div className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Who Hunared is for
            </h2>
            <p className="text-muted-foreground">
              One platform, three clear paths — switch anytime as your needs
              change.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Professionals & seekers",
                points: [
                  "Browse and apply to jobs",
                  "Build a public candidate profile",
                  "Save listings and follow opportunities",
                  "Learn via Education Hub & programs",
                ],
              },
              {
                title: "Companies & employers",
                points: [
                  "Post and manage job openings",
                  "Discover candidates worldwide",
                  "Show industry & services publicly",
                  "Hire with clearer contact paths",
                ],
              },
              {
                title: "Sellers & community",
                points: [
                  "List products and services",
                  "Reach a professional audience",
                  "Share announcements and offers",
                  "Grow beyond a single city",
                ],
              },
            ].map((col) => (
              <div
                key={col.title}
                className="rounded-2xl border border-border bg-card p-6 sm:p-7"
              >
                <h3 className="font-semibold text-lg mb-4">{col.title}</h3>
                <ul className="space-y-2.5">
                  {col.points.map((pt) => (
                    <li
                      key={pt}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SiteContainer>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-16 sm:py-20">
        <SiteContainer>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card px-6 py-12 sm:px-12 sm:py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Ready to find your next{" "}
              <span className="gradient-text">opportunity?</span>
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground mb-8">
              Join professionals and organizations using Hunared for jobs,
              talent, marketplace, and learning — worldwide.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="/register">
                  Create free account <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </SiteContainer>
      </section>
    </div>
  );
}
