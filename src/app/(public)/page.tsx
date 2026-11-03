import { HeroSection } from "@/components/home/HeroSection";
import { UserPathSection } from "@/components/home/UserPathSection";
import { MarketplacePreview } from "@/components/home/MarketplacePreview";
import { LearningPreview } from "@/components/home/LearningPreview";
import { HunaredProgram } from "@/components/home/HunaredProgram";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustSafety } from "@/components/home/TrustSafety";
import { CtaBanner } from "@/components/home/CtaBanner";
import type { Metadata } from "next";

import { PremiumAdSlot } from "@/components/ads/PremiumAdSlot";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Hunared",
  },
  description:
    "Hunared is a global platform for jobs, talent, companies, marketplace, services and learning — find opportunity in one place.",
  openGraph: {
    title: "Hunared",
  },
  twitter: {
    title: "Hunared",
  },
};

/**
 * Homepage architecture:
 * Hero + Search → Paths → Marketplace → Learning → Programs
 * → How it works → Trust → CTA
 * Featured Jobs & Talent removed from home (browse via nav).
 * Finder is NOT on the homepage (standalone /finder).
 */
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <PremiumAdSlot slotId="home_hero" legacySlotName="homepage_hero" />
      </div>
      <UserPathSection />
      <MarketplacePreview />
      <LearningPreview />
      <HunaredProgram />
      <HowItWorks />
      <TrustSafety />
      <CtaBanner />
    </div>
  );
}
