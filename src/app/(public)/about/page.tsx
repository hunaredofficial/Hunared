import type { Metadata } from "next";
import Link from "next/link";
import { SiteContainer } from "@/components/layout/SiteContainer";
import {
  Globe,
  Users,
  Briefcase,
  BookOpen,
  ShoppingBag,
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
  MapPin,
  Lock,
  Zap,
  Layers,
  Search,
  UserPlus,
  Rocket,
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
      "Discover roles across industries and experience levels. Post openings, filter by skill and location, and hire with clear contact paths.",
    href: "/jobs",
  },
  {
    icon: Users,
    title: "Candidate Directory",
    description:
      "A living talent network where skilled professionals can be found — and employers discover people ready to contribute.",
    href: "/candidates",
  },
  {
    icon: Building2,
    title: "Company Directory",
    description:
      "Explore organizations by industry and services. Build brand visibility and connect with the right partners.",
    href: "/companies",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description:
      "List products, services, and offers. Reach a professional audience with moderated, contact-ready listings.",
    href: "/marketplace",
  },
  {
    icon: BookOpen,
    title: "Learning Hub",
    description:
      "Practical articles on safety, engineering, careers, and growth — knowledge that compounds over time.",
    href: "/education",
  },
  {
    icon: GraduationCap,
    title: "Programs & Credentials",
    description:
      "Training and certification pathways with official verification through Hunared.org.",
    href: "/program",
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
  { value: "6", label: "Core platform areas" },
  { value: "1", label: "Account for everything" },
  { value: "24/7", label: "Global access" },
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

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create your account",
    text: "Sign up as Personal, Seeker, or Company. Complete your profile so the right people can find you.",
  },
  {
    icon: Search,
    step: "02",
    title: "Explore or publish",
    text: "Browse jobs, talent, companies, and marketplace — or post openings and listings in minutes.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Engage & grow",
    text: "Apply, hire, learn, and verify credentials. One platform that stays with you as your goals evolve.",
  },
];

const trustItems = [
  {
    icon: Lock,
    title: "Secure accounts",
    text: "Authenticated sessions and protected profiles.",
  },
  {
    icon: Shield,
    title: "Moderated listings",
    text: "Review flows help keep jobs and ads professional.",
  },
  {
    icon: MapPin,
    title: "Global reach",
    text: "Built for opportunity across regions and industries.",
  },
  {
    icon: Zap,
    title: "Fast to start",
    text: "Post a job or complete a profile without friction.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <SiteContainer className="relative py-16 sm:py-24 text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
            <Layers className="h-3.5 w-3.5" />
            Global careers & opportunity platform
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-[3.35rem] leading-[1.15]">
            One platform for work,{" "}
            <span className="gradient-text">talent & growth</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Hunared unites jobs, candidates, companies, marketplace, learning,
            and verified programs — so professionals and organizations worldwide
            can find each other, hire with clarity, and keep developing skills.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/register">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/jobs">Browse jobs</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/program">View programs</Link>
            </Button>
          </div>
        </SiteContainer>
      </section>

      {/* Stats */}
      <section className="border-b border-border py-10 sm:py-12 bg-muted/15">
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

      {/* Story + pillars */}
      <section className="py-16 sm:py-20">
        <SiteContainer>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
              Our story
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              Built for a{" "}
              <span className="gradient-text">connected world of work</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
              Careers are no longer limited by a single city or channel. Talent
              moves across regions, companies hire beyond borders, and skills need
              continuous growth. Hunared simplifies that reality — one place where
              opportunity is discoverable, listings stay clear, and learning is
              always within reach.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-sm hover:border-primary/30 transition-colors"
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

      {/* How it works */}
      <section className="border-y border-border bg-muted/20 py-16 sm:py-20">
        <SiteContainer>
          <div className="mx-auto max-w-2xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
              How it works
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Three steps to get value
            </h2>
            <p className="text-muted-foreground">
              Whether you are hiring, job seeking, or listing services — start
              simply and expand as you need.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map(({ icon: Icon, step, title, text }) => (
              <div
                key={step}
                className="relative rounded-2xl border border-border bg-card p-6 sm:p-7"
              >
                <span className="absolute top-5 right-5 text-3xl font-bold text-primary/15 select-none">
                  {step}
                </span>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </SiteContainer>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-20">
        <SiteContainer>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-7 sm:p-9 relative overflow-hidden">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3">Our mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To empower people and organizations to{" "}
                <span className="font-medium text-foreground">
                  find opportunity, hire with clarity, and grow skills
                </span>{" "}
                through a single, trusted global platform — from first search to
                long-term career development.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-7 sm:p-9 relative overflow-hidden">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Eye className="h-6 w-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3">Our vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                A world where{" "}
                <span className="font-medium text-foreground">
                  access to work and learning is not fragmented
                </span>
                . Hunared aims to be the place professionals and companies turn
                to for roles, talent, services, knowledge, and verified
                credentials — without juggling a dozen tools.
              </p>
            </div>
          </div>
        </SiteContainer>
      </section>

      {/* Platform pillars */}
      <section className="border-t border-border bg-muted/15 py-16 sm:py-20">
        <SiteContainer>
          <div className="mx-auto max-w-2xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
              Platform
            </p>
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
            {features.map(({ icon: Icon, title, description, href }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-sm"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  {title}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </Link>
            ))}
          </div>
        </SiteContainer>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20">
        <SiteContainer>
          <div className="mx-auto max-w-2xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
              Principles
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              What we stand for
            </h2>
            <p className="text-muted-foreground">
              Guides for product decisions, moderation, and how we serve members.
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
      <section className="border-y border-border bg-muted/20 py-16 sm:py-20">
        <SiteContainer>
          <div className="mx-auto max-w-2xl text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
              Members
            </p>
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
                  "Save listings and track opportunities",
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

      {/* Trust strip */}
      <section className="py-14 sm:py-16">
        <SiteContainer>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3 items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-0.5">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SiteContainer>
      </section>

      {/* CTA */}
      <section className="border-t border-border pb-16 sm:pb-20">
        <SiteContainer>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-card px-6 py-12 sm:px-12 sm:py-16 text-center">
            <div
              className="pointer-events-none absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
              aria-hidden
            />
            <h2 className="relative text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Ready for your next{" "}
              <span className="gradient-text">opportunity?</span>
            </h2>
            <p className="relative mx-auto max-w-xl text-muted-foreground mb-8">
              Join professionals and organizations using Hunared for jobs,
              talent, marketplace, and learning — worldwide.
            </p>
            <div className="relative flex flex-wrap items-center justify-center gap-3">
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
