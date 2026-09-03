import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const POINTS = [
  {
    icon: BookOpen,
    title: "Structured learning",
    text: "Education, training, and certification pathways.",
  },
  {
    icon: ShieldCheck,
    title: "Verifiable credentials",
    text: "Confirm certificates through official Hunared.org.",
  },
  {
    icon: Briefcase,
    title: "Career-aligned",
    text: "Connect skills development to real opportunities.",
  },
];

export function HunaredProgram() {
  return (
    <section className="relative py-14 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card brand-glow">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-[var(--brand-via)]/10"
          />
          <div className="relative grid gap-8 lg:grid-cols-2 p-6 sm:p-8 md:p-10 lg:p-12 items-center">
            <div className="space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <GraduationCap className="h-3.5 w-3.5" />
                Hunared Program
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                Learn, certify, and{" "}
                <span className="gradient-text">grow your career</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
                Explore education, training, internships, scholarships, and
                career development — with credentials you can verify.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Button asChild size="lg" className="gap-2 min-h-11">
                  <Link href="/program">
                    Explore programs <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="min-h-11">
                  <Link href="https://hunared.org" target="_blank" rel="noopener noreferrer">
                    Verify credentials
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4">
              {POINTS.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="flex gap-3 sm:gap-4 rounded-2xl border border-border/70 bg-background/60 p-4 sm:p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm sm:text-base mb-0.5">
                      {title}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
