import { HeroSection } from "@/components/home/HeroSection";
import { UserPathSection } from "@/components/home/UserPathSection";
import { MarketplacePreview } from "@/components/home/MarketplacePreview";
import { LearningPreview } from "@/components/home/LearningPreview";
import { HunaredProgram } from "@/components/home/HunaredProgram";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustSafety } from "@/components/home/TrustSafety";
import { CtaBanner } from "@/components/home/CtaBanner";
import { PremiumAdSlot } from "@/components/ads/PremiumAdSlot";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Hunared" },
  description:
    "Hunared is a global platform for jobs, talent, companies, marketplace, services and learning — find opportunity in one place.",
  openGraph: { title: "Hunared" },
  twitter: { title: "Hunared" },
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-4">
        <PremiumAdSlot slotId="home_hero" legacySlotName="homepage_hero" />
      </div>
      <UserPathSection />
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-2">
        <PremiumAdSlot slotId="homepage_mid" />
      </div>
      <MarketplacePreview />
      {/* Three equal mid-page tiles (300×250) — fills the band instead of one small centered ad */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <PremiumAdSlot
            slotId="homepage_inline_1"
            alternateSlotIds={["homepage_inline"]}
            legacySlotName="homepage_inline"
            className="w-full"
          />
          <PremiumAdSlot slotId="homepage_inline_2" className="w-full" />
          <PremiumAdSlot slotId="homepage_inline_3" className="w-full" />
        </div>
      </div>
      <LearningPreview />
      <HunaredProgram />
      <HowItWorks />
      <TrustSafety />
      <CtaBanner />
    </div>
  );
}
