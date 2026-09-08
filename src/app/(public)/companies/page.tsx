import { Metadata } from "next";
import { CompaniesDirectory } from "@/components/companies/CompaniesDirectory";

export const metadata: Metadata = {
  title: "Companies",
  description:
    "Browse companies, employers, contractors, and service providers on Hunared. Search by industry, location, and size.",
  openGraph: {
    title: "Companies | Hunared",
    description:
      "Browse companies, employers, contractors, and service providers on Hunared.",
  },
};

export default function CompaniesPage() {
  return <CompaniesDirectory />;
}
