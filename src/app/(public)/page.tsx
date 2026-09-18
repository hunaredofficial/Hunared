import { HeroSection } from "@/components/home/HeroSection";
import { UserPathSection } from "@/components/home/UserPathSection";
import { FeaturedJobsSection } from "@/components/home/FeaturedJobsSection";
import { FeaturedCandidatesSection } from "@/components/home/FeaturedCandidatesSection";
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
    absolute: "Hunared",
  },
  description:
    "Hunared is a global platform for jobs, talent, companies, marketplace, services and learning — find opportunity in one place.",
};

/**
 * Homepage architecture (v2):
 * Hero + Search → Paths → Jobs → Talent → Marketplace → Learning → Programs
 * → How it works → Trust → CTA
 * Finder is NOT on the homepage (standalone /finder).
 */
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <UserPathSection />
      <FeaturedJobsSection />
      <FeaturedCandidatesSection />
      <MarketplacePreview />
      <LearningPreview />
      <HunaredProgram />
      <HowItWorks />
      <TrustSafety />
      <CtaBanner />
    </div>
  );
}
