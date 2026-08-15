import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HunaredProgram() {
  return (
    <section className="py-20 bg-muted/30" aria-labelledby="hunared-program-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Same card language as CTA banner */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-primary/20 brand-glow p-10 md:p-16 text-center">
          {/* Soft brand blobs */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-10 -right-10 h-60 w-60 rounded-full bg-[var(--brand-from)] opacity-[0.06] blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-[var(--brand-via)] opacity-[0.06] blur-3xl" />
          </div>

          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            Hunared Program
          </p>

          <h2
            id="hunared-program-heading"
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            <span className="gradient-text">Grow Your Skills. Build Your Future.</span>
          </h2>

          <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg mb-8 leading-relaxed">
            Education, training, certifications, internships, and career development
            opportunities from Hunared Organization.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/program"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-all duration-300 hover:scale-105"
            >
              Explore Programs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}