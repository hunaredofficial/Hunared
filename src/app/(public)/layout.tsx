import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { PremiumAdSlot } from "@/components/ads/PremiumAdSlot";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="w-full border-b border-border/15">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-20 sm:pt-22 pb-2">
          <div className="hidden sm:block">
            <PremiumAdSlot
              slotId="header_leaderboard"
              alternateSlotIds={["header"]}
              legacySlotName="header"
            />
          </div>
          <div className="sm:hidden">
            <PremiumAdSlot
              slotId="header_mobile"
              alternateSlotIds={["header_leaderboard", "header"]}
              legacySlotName="header"
            />
          </div>
        </div>
      </div>
      <main className="flex-1">{children}</main>
      <div className="w-full border-t border-border/15">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
          <PremiumAdSlot
            slotId="footer_banner"
            alternateSlotIds={["footer"]}
            legacySlotName="footer"
          />
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
