import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="relative py-14 sm:py-18 md:py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card px-6 py-12 sm:px-10 sm:py-14 md:px-14 md:py-16 text-center brand-glow">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -right-10 h-40 w-40 rounded-full bg-[var(--brand-via)] opacity-20 blur-3xl"
          />

          <div className="relative mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Free to join
          </div>

          <h2 className="relative text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
            Ready for your next{" "}
            <span className="gradient-text">opportunity?</span>
          </h2>
          <p className="relative mx-auto max-w-xl text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed">
            Create a free account to post jobs, list services, build your
            profile, or hire talent — all on one global platform.
          </p>

          <div className="relative flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2 min-h-12">
              <Link href="/register">
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-h-12">
              <Link href="/jobs">Browse jobs</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="min-h-12">
              <Link href="/about">About Hunared</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
