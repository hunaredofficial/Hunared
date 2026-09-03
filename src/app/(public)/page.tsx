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

      {/* Primary shortcuts — tight under hero, mobile-first */}
      <section className="relative z-10 -mt-2 sm:-mt-4 pb-10 sm:pb-12 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-primary/20 bg-card/90 backdrop-blur-md brand-glow p-3.5 sm:p-5 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <a
                href="/jobs"
                className="w-full inline-flex flex-col items-center justify-center gap-1 h-auto min-h-12 px-4 py-3 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
              >
                <span>Browse Jobs</span>
                <span className="text-[11px] font-normal opacity-90">
                  Employment opportunities
                </span>
              </a>
              <a
                href="/candidates"
                className="w-full inline-flex flex-col items-center justify-center gap-1 h-auto min-h-12 px-4 py-3 rounded-xl text-sm font-semibold border border-primary/25 text-foreground hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
              >
                <span>Find Candidates</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Discover talent
                </span>
              </a>
              <a
                href="/companies"
                className="w-full inline-flex flex-col items-center justify-center gap-1 h-auto min-h-12 px-4 py-3 rounded-xl text-sm font-semibold border border-primary/25 text-foreground hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
              >
                <span>Explore Companies</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Employers & organizations
                </span>
              </a>
            </div>
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
