import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedJobsSection } from "@/components/home/FeaturedJobsSection";
import { BrowseCategories } from "@/components/home/BrowseCategories";
import { HunaredProgram } from "@/components/home/HunaredProgram";
import { HunaredFinder } from "@/components/home/HunaredFinder";
import { CtaBanner } from "@/components/home/CtaBanner";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home — Global Jobs, Property, Marketplace & Learning",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Browse shortcuts — centered between Hero and Categories */}
      <section className="relative z-10 pt-16 pb-12 px-4 sm:px-6">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-md brand-glow p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/jobs"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.03]"
              >
                Browse Jobs
                <span aria-hidden>→</span>
              </a>
              <a
                href="/candidates"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full text-sm font-semibold border border-primary/30 text-foreground hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 hover:scale-[1.03]"
              >
                Find Candidates
              </a>
            </div>
          </div>
        </div>
      </section>

      <BrowseCategories />
      {/* <FeaturedJobsSection /> */}
      <HunaredProgram />
      <HunaredFinder />
      <CtaBanner />
    </>
  );
}