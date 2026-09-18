import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="relative py-12 sm:py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-10 sm:px-10 sm:py-12 md:px-14 md:py-14 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-primary/8 blur-3xl"
          />

          <p className="relative text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
            Start here
          </p>
          <h2 className="relative text-2xl sm:text-3xl md:text-[2rem] font-bold tracking-tight mb-3">
            Your next opportunity starts here
          </h2>
          <p className="relative mx-auto max-w-xl text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed">
            Whether you are looking for work, talent, services, products,
            companies, or knowledge — start with Hunared.
          </p>

          <div className="relative flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2 min-h-11">
              <Link href="/register">
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-h-11">
              <Link href="/jobs">Explore jobs</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="min-h-11">
              <Link href="/search">Search everything</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
