import { HeroSection } from "@/components/home/HeroSection";
import { UserPathSection } from "@/components/home/UserPathSection";
import { MarketplacePreview } from "@/components/home/MarketplacePreview";
import { LearningPreview } from "@/components/home/LearningPreview";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustSafety } from "@/components/home/TrustSafety";
import { CtaBanner } from "@/components/home/CtaBanner";
import { PremiumAdSlot } from "@/components/ads/PremiumAdSlot";
import { HomeInlineAdRow } from "@/components/ads/HomeInlineAdRow";
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
      {/* Three equal mid-page promo tiles */}
      <HomeInlineAdRow />
      <LearningPreview />
      <HowItWorks />
      <TrustSafety />
      <CtaBanner />
    </div>
  );
}
