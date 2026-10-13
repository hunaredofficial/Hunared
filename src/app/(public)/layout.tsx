import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { HunaredAgent } from "@/components/agent/HunaredAgent";
import { AdSlot } from "@/components/ads/AdSlot";

/**
 * Public shell includes HunaredAgent (usePathname / client hooks).
 * Force dynamic so Next does not static-prerender public routes and fail export.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Header ad — shows only when Admin → Ads slot "header" is Active */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-22">
        <AdSlot slotName="header" className="mb-2" />
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTop />
      <Suspense fallback={null}>
        <HunaredAgent />
      </Suspense>
    </div>
  );
}
