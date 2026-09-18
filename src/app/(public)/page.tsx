import { HeroSection } from "@/components/home/HeroSection";
import { UserPathSection } from "@/components/home/UserPathSection";
import { HomePlatformStrip } from "@/components/home/HomePlatformStrip";
import { BrowseCategories } from "@/components/home/BrowseCategories";
import { HunaredProgram } from "@/components/home/HunaredProgram";
import { HunaredFinder } from "@/components/home/HunaredFinder";
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
    "Hunared is a global platform for jobs, candidates, companies, marketplace, learning, and verified programs — find opportunity and grow your career in one place.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero + Universal Smart Search */}
      <HeroSection />

      {/* 2. Clear user paths — What are you looking for? */}
      <UserPathSection />

      {/* 3. Platform overview strip */}
      <HomePlatformStrip />

      {/* 4. Browse by categories (Jobs / Learning / Marketplace) */}
      <BrowseCategories />

      {/* 5. Programs */}
      <HunaredProgram />

      {/* 6. Hunared Finder (Lost & Found) */}
      <HunaredFinder />

      {/* 7. How it works */}
      <HowItWorks />

      {/* 8. Trust & safety */}
      <TrustSafety />

      {/* 9. Final CTA */}
      <CtaBanner />
    </div>
  );
}
