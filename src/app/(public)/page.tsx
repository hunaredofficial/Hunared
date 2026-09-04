import { HeroSection } from "@/components/home/HeroSection";
import { BrowseCategories } from "@/components/home/BrowseCategories";
import { HunaredProgram } from "@/components/home/HunaredProgram";
import { HunaredFinder } from "@/components/home/HunaredFinder";
import { CtaBanner } from "@/components/home/CtaBanner";
import { HomePlatformStrip } from "@/components/home/HomePlatformStrip";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home — Global Jobs, Talent, Marketplace & Learning",
  description:
    "Hunared is a global platform for jobs, candidates, companies, marketplace, learning, and verified programs — find opportunity and grow your career in one place.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />

      {/* Primary shortcuts — centered under hero/quick links */}
      <section className="relative z-10 py-6 sm:py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl sm:max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 items-stretch">
            <a
              href="/jobs"
              className="w-full inline-flex flex-col items-center justify-center gap-1 min-h-[3.5rem] px-4 py-3.5 rounded-2xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.015] active:scale-[0.99]"
            >
              <span>Browse Jobs</span>
              <span className="text-[11px] font-normal opacity-90">
                Employment opportunities
              </span>
            </a>
            <a
              href="/candidates"
              className="w-full inline-flex flex-col items-center justify-center gap-1 min-h-[3.5rem] px-4 py-3.5 rounded-2xl text-sm font-semibold border border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 hover:scale-[1.015] active:scale-[0.99]"
            >
              <span>Find Candidates</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                Discover talent
              </span>
            </a>
            <a
              href="/companies"
              className="w-full inline-flex flex-col items-center justify-center gap-1 min-h-[3.5rem] px-4 py-3.5 rounded-2xl text-sm font-semibold border border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 hover:scale-[1.015] active:scale-[0.99]"
            >
              <span>Explore Companies</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                Employers & organizations
              </span>
            </a>
          </div>
        </div>
      </section>

      <HomePlatformStrip />

      <BrowseCategories />

      <HunaredProgram />

      <HunaredFinder />

      <CtaBanner />
    </div>
  );
}
