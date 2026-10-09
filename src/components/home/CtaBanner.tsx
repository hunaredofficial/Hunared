"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-12 sm:px-12 sm:py-14 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 0%, hsl(var(--primary) / 0.12), transparent 70%)",
            }}
          />
          <div className="relative space-y-5 max-w-2xl mx-auto">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Start here
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Your next opportunity starts here
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Whether you are looking for work, talent, services, products, companies,
              or knowledge — start with Hunared.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <Button asChild size="lg" className="gap-2 min-h-11 px-6">
                <Link href="/register">
                  Create free account <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="min-h-11 text-muted-foreground hover:text-foreground">
                <Link href="/search">Search everything</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
