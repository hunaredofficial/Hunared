import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="relative py-12 sm:py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="section-navy relative overflow-hidden rounded-2xl px-6 py-10 sm:px-10 sm:py-12 md:px-14 md:py-14 text-center shadow-lg">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 right-0 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl"
          />

          <p className="relative text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-blue-300 mb-3">
            Start here
          </p>
          <h2 className="relative text-2xl sm:text-3xl md:text-[2rem] font-bold tracking-tight mb-3 text-white">
            Your next opportunity starts here
          </h2>
          <p className="relative mx-auto max-w-xl text-sm sm:text-base text-muted-on-navy mb-8 leading-relaxed">
            Whether you are looking for work, talent, services, products,
            companies, or knowledge — start with Hunared.
          </p>

          <div className="relative flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="gap-2 min-h-11 bg-white text-[#0B1F3A] hover:bg-blue-50 border-0"
            >
              <Link href="/register">
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-h-11 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/jobs">Explore jobs</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="min-h-11 text-white/90 hover:bg-white/10 hover:text-white"
            >
              <Link href="/search">Search everything</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
