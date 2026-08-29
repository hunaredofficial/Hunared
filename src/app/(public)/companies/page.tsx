import { Metadata } from "next";
import { CompaniesDirectory } from "@/components/companies/CompaniesDirectory";

export const metadata: Metadata = {
  title: "Companies Directory | Hunared",
  description:
    "Discover companies, employers, contractors, service providers and organizations on Hunared. Search by industry, location, size and more.",
  openGraph: {
    title: "Companies Directory | Hunared",
    description:
      "Discover companies, employers, contractors, service providers and organizations on Hunared.",
  },
};

export default function CompaniesPage() {
  return <CompaniesDirectory />;
}
