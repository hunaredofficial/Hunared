import { Suspense } from "react";
import { CompaniesDirectory } from "@/components/companies/CompaniesDirectory";

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
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
          Loading companies…
        </div>
      }
    >
      <CompaniesDirectory />
    </Suspense>
  );
}
