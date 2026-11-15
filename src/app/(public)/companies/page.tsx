import { Suspense } from "react";
import { CompaniesDirectory } from "@/components/companies/CompaniesDirectory";
import { PremiumAdSlot } from "@/components/ads/PremiumAdSlot";

export const metadata = {
  title: "Companies",
  description:
    "Discover verified employers, contractors and service providers on Hunared.",
  openGraph: {
    title: "Companies | Hunared",
    description:
      "Discover verified employers, contractors and service providers on Hunared.",
  },
};

export default function CompaniesPage() {
  return (
    <div className="min-h-screen">
      {/* Top banner slot is rendered inside CompaniesDirectory after page header
          so it sits under the Companies title like Jobs. */}
      <Suspense
        fallback={
          <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
            Loading companies…
          </div>
        }
      >
        <CompaniesDirectory />
      </Suspense>
    </div>
  );
}
