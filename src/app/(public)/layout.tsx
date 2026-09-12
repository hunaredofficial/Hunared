import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AdSlot } from "@/components/ads/AdSlot";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Header ad — IAB leaderboard size (728×90 / 970×90, mobile 320×50) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-22">
        <AdSlot slotName="header" className="mb-3" />
      </div>
      <main className="flex-1">{children}</main>
      {/* Footer ad — standard leaderboard */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AdSlot slotName="footer" />
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
