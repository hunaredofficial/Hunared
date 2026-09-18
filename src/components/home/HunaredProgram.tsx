import Link from "next/link";
import { ArrowRight, GraduationCap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HunaredProgram() {
  return (
    <section className="relative py-12 sm:py-14 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] p-6 sm:p-8 md:p-10 items-start">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-primary">
                <GraduationCap className="h-3.5 w-3.5" />
                Programs
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                Training & credentials that support your career
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                Explore pathways and verify credentials. Future initiatives are
                clearly marked so you always know what is available now.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Button asChild size="lg" className="gap-2 min-h-11">
                  <Link href="/program">
                    Explore programs <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="min-h-11">
                  <Link
                    href="https://hunared.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ShieldCheck className="h-4 w-4 mr-1.5" />
                    Verify credentials
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-xl border border-border/80 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1.5">
                  Available now
                </p>
                <p className="text-sm font-medium text-foreground mb-0.5">
                  Credential verification
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Confirm certificates through official Hunared.org.
                </p>
              </div>
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Coming soon
                </p>
                <p className="text-sm font-medium text-foreground mb-0.5">
                  Education · Internships · Scholarships · Career development
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Structured training and placement pathways — not yet open for
                  enrollment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
