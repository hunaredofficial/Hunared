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
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Hunared — our mission, vision, and the 360° platform built to empower expats with jobs, community, marketplace, and education worldwide.",
};

const features = [
  {
    icon: Briefcase,
    title: "Global Job Board",
    description:
      "Verified international opportunities across skill levels and industries, spanning 50+ countries.",
  },
  {
    icon: Users,
    title: "Candidate Directory",
    description:
      "A living talent pool for employers — and a way for professionals to be discovered worldwide.",
  },
  {
    icon: ShoppingBag,
    title: "Hunared Marketplace",
    description:
      "Buy, sell, and offer services within the expat community — from housing to everyday essentials.",
  },
  {
    icon: BookOpen,
    title: "Education Hub",
    description:
      "Practical guides and insights written by expats, for expats — knowledge that travels with you.",
  },
  {
    icon: Globe,
    title: "Global Community",
    description:
      "Connect with professionals who understand relocation, culture shift, and building a life abroad.",
  },
  {
    icon: Star,
    title: "Trusted Platform",
    description:
      "Human-reviewed listings and clear moderation so every interaction stays safe and professional.",
  },
];

const values = [
  {
    icon: Heart,
    title: "Empathy First",
    description:
      "We design for real expat challenges — visas, housing, work, and belonging — not abstract personas.",
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description:
      "Moderation, verified listings, and transparent practices so members can engage with confidence.",
  },
  {
    icon: Compass,
    title: "Clarity Over Clutter",
    description:
      "One integrated platform instead of dozens of apps, groups, and paywalled forums.",
  },
  {
    icon: Lightbulb,
    title: "Practical Innovation",
    description:
      "Every feature answers one question: does this make expat life meaningfully easier?",
  },
];

const stats = [
  { value: "50+", label: "Countries" },
  { value: "10K+", label: "Job Listings" },
  { value: "5K+", label: "Active Members" },
  { value: "360°", label: "Full Coverage" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-background py-24 sm:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
        />
        <SiteContainer className="relative text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-6">
            <Globe className="h-3.5 w-3.5" />
            About Hunared
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Your Complete{" "}
            <span className="gradient-text">360° Platform</span>
            <br className="hidden sm:block" /> for Expat Life
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Hunared unites careers, community, marketplace, and knowledge in one
            trusted space — built by a globally distributed team that lives the
            expat journey every day.
          </p>
        </SiteContainer>
      </section>

      {/* ── Stats strip ───────────────────────────────────────── */}
      <section className="border-b border-border bg-card/50">
        <SiteContainer>
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="py-8 px-4 text-center animate-in fade-in duration-700"
              >
                <p className="text-3xl sm:text-4xl font-bold gradient-text mb-1">
                  {value}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </SiteContainer>
      </section>

      {/* ── Who We Are ────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <SiteContainer>
          <div className="mx-auto max-w-3xl text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Who We Are
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 leading-snug">
              A professional home for{" "}
              <span className="gradient-text">global talent</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-left sm:text-center">
              <p>
                Hunared is a 360° digital platform designed exclusively for
                expatriates and international professionals. We bring together
                job opportunities, a candidate directory, a community
                marketplace, and an education hub — so you no longer need to
                juggle scattered job boards, social groups, and paywalled
                advice.
              </p>
              <p>
                Whether you are preparing to relocate, settling into a new
                country, or advancing a long international career, Hunared
                gives you the tools to find work, connect with peers, buy and
                sell locally, and learn from people who have walked the same
                path.
              </p>
            </div>
          </div>
        </SiteContainer>
      </section>

      {/* ── Mission & Vision ──────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-muted/30 border-y border-border">
        <SiteContainer>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Mission */}
            <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 hover:border-primary/30 hover:shadow-md transition-all duration-300">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                Our Mission
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 leading-snug">
                Empowering expats to{" "}
                <span className="gradient-text">thrive anywhere</span>
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  Moving abroad is one of life&apos;s boldest decisions. Yet for
                  millions of expatriates, the journey remains fragmented —
                  opportunities on one site, housing on another, community
                  advice buried in social feeds.
                </p>
                <p>
                  Our mission is to replace that fragmentation with a single,
                  beautifully integrated platform where every expat can find
                  work, build connections, trade goods and services, and grow —
                  from the first week abroad to decades into an international
                  career.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 hover:border-primary/30 hover:shadow-md transition-all duration-300">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Eye className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                Our Vision
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 leading-snug">
                The world&apos;s most trusted{" "}
                <span className="gradient-text">expat ecosystem</span>
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  We envision a world where relocating for work or life does not
                  mean starting from zero. Hunared aims to be the default
                  digital home for global professionals — the place employers
                  search for international talent and expats turn to for
                  opportunity, community, and practical support.
                </p>
                <p>
                  By uniting careers, marketplace, learning, and community under
                  one trusted roof, we strive to make cross-border living
                  simpler, safer, and more rewarding for everyone involved.
                </p>
              </div>
            </div>
          </div>
        </SiteContainer>
      </section>

      {/* ── Values ────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <SiteContainer>
          <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Our Values
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Principles that{" "}
              <span className="gradient-text">guide every feature</span>
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Our globally distributed team builds with the same standards we
              expect from the platform itself.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {values.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </SiteContainer>
      </section>

      {/* ── Why Choose Hunared ────────────────────────── */}
      <section className="py-20 sm:py-28 bg-muted/30 border-y border-border">
        <SiteContainer>
          <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Why Choose Us
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything you need,{" "}
              <span className="gradient-text">in one place</span>
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Six pillars that make Hunared the most complete expat platform on
              the web.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </SiteContainer>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <SiteContainer className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to start your{" "}
            <span className="gradient-text">expat journey?</span>
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground mb-8">
            Join thousands of expats who found their next opportunity through
            Hunared.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="rounded-xl px-6">
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl px-6"
            >
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </SiteContainer>
      </section>
    </div>
  );
}
