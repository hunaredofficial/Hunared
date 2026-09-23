import { HeroSection } from "@/components/home/HeroSection";
import { UserPathSection } from "@/components/home/UserPathSection";
import { MarketplacePreview } from "@/components/home/MarketplacePreview";
import { LearningPreview } from "@/components/home/LearningPreview";
import { HunaredProgram } from "@/components/home/HunaredProgram";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustSafety } from "@/components/home/TrustSafety";
import { CtaBanner } from "@/components/home/CtaBanner";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Hunared — Jobs, Talent, Marketplace & Learning",
  },
  description:
    "Hunared is a global platform for jobs, talent, companies, marketplace, services, property and learning. Search once. Find opportunity.",
};

/**
 * Homepage — Marketplace Discovery Architecture (Phase 1)
 *
 * Priority order:
 * 1. Strong universal search (Hero)
 * 2. Clear user paths / categories
 * 3. Marketplace & Learning previews
 * 4. Programs
 * 5. How it works + Trust
 * 6. CTA
 *
 * Featured Jobs/Talent removed from home (browse via nav + search).
 * Finder is standalone at /finder.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* 1. Search-first hero — the central engine */}
      <HeroSection />

      {/* 2. Category / path entry points */}
      <UserPathSection />

      {/* 3. Marketplace discovery module */}
      <MarketplacePreview />

      {/* 4. Learning */}
      <LearningPreview />

      {/* 5. Programs */}
      <HunaredProgram />

      {/* 6. How it works */}
      <HowItWorks />

      {/* 7. Trust */}
      <TrustSafety />

      {/* 8. Final CTA */}
      <CtaBanner />
    </div>
  );
}
