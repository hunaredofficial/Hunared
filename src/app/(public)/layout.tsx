import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { PremiumAdSlot } from "@/components/ads/PremiumAdSlot";
import { HunaredAgent } from "@/components/agent/HunaredAgent";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col fello-ambient-bg">
      <Header />
      {/* Single sitewide header banner — one active campaign at a time */}
      <div className="w-full border-b border-border/15">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-24 sm:pt-28 pb-2">
          <PremiumAdSlot
            slotId="header_leaderboard"
            legacySlotName="header"
          />
        </div>
      </div>
      <main className="flex-1">{children}</main>
      <div className="w-full border-t border-border/15">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
          <PremiumAdSlot
            slotId="footer_banner"
            legacySlotName="footer"
          />
        </div>
      </div>
      <Footer />
      <ScrollToTop />
      {/* Listens for hunared-agent-toggle from header + footer on all public pages */}
      <HunaredAgent />
    </div>
  );
}
