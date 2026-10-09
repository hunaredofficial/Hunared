"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";

export function HunaredProgram() {
  return (
    <section className="py-12 sm:py-16 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-0">
            <div className="p-6 sm:p-8 lg:p-10 space-y-5 border-b lg:border-b-0 lg:border-r border-border">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                <GraduationCap className="h-3.5 w-3.5" />
                Programs
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Training & credentials that support your career
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                Explore pathways, courses and professional training. Available
                programs are clearly marked so you always know what you can start today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Button asChild size="lg" className="gap-2 min-h-11">
                  <Link href="/program">
                    Hunared Programs <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="min-h-11 gap-1.5">
                  <a
                    href="https://hunared.org/courses"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Explore Courses
                  </a>
                </Button>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10 grid gap-3 content-start bg-muted/15">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1.5">
                  Available now
                </p>
                <p className="text-sm font-semibold text-foreground mb-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  TUV Training & Certification
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Professional TUV-aligned training and certification pathways to
                  strengthen your skills and credentials for global employers.
                </p>
              </div>
              <div className="rounded-xl border border-dashed border-border/80 bg-background/50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Coming soon
                </p>
                <p className="text-sm font-medium text-foreground mb-1">
                  Education · Internships · Scholarships · Career development
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Structured learning tracks, internship placement, scholarship
                  support and long-term career development programs — opening for
                  enrollment soon. Stay connected to be first to apply.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
