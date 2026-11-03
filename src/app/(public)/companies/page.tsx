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
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <PremiumAdSlot
          slotId="companies_top"
          legacySlotName="companies_top"
          className="mb-2"
        />
      </div>
      <Suspense
        fallback={
          <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
            Loading companies…
          </div>
        }
      >
        <CompaniesDirectory />
      </Suspense>
    </>
  );
}
