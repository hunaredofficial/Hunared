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
      {/* Home Hero Banner / Billboard / Alt — all aliases */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-4">
        <PremiumAdSlot
          slotId="home_hero"
          alternateSlotIds={["homepage_hero", "home_hero_billboard"]}
          legacySlotName="homepage_hero"
        />
      </div>
      <UserPathSection />
      {/* Home Mid Page */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-2">
        <PremiumAdSlot slotId="homepage_mid" legacySlotName="homepage_mid" />
      </div>
      <MarketplacePreview />
      {/* Home Inline Rectangle */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
        <PremiumAdSlot slotId="homepage_inline" legacySlotName="homepage_inline" />
      </div>
      <LearningPreview />
      <HunaredProgram />
      <HowItWorks />
      <TrustSafety />
      <CtaBanner />
    </div>
  );
}
