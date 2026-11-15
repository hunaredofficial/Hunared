import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { PremiumAdSlot } from "@/components/ads/PremiumAdSlot";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Site-wide header ads: premium leaderboard (desktop) + mobile banner */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-22">
        <div className="hidden sm:block">
          <PremiumAdSlot
            slotId="header_leaderboard"
            alternateSlotIds={["header"]}
            legacySlotName="header"
            className="mb-3"
            maxHeightClass="max-h-28 sm:max-h-32"
          />
        </div>
        <div className="sm:hidden">
          <PremiumAdSlot
            slotId="header_mobile"
            alternateSlotIds={["header_leaderboard", "header"]}
            legacySlotName="header"
            className="mb-2"
            maxHeightClass="max-h-16"
          />
        </div>
      </div>
      <main className="flex-1">{children}</main>
      {/* Footer premium / admin ad */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <PremiumAdSlot
          slotId="footer_banner"
          alternateSlotIds={["footer"]}
          legacySlotName="footer"
          maxHeightClass="max-h-28"
        />
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
