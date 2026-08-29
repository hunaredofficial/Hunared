import { Metadata } from "next";
import { CompanyProfile } from "@/components/companies/CompanyProfile";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    title: `${name} | Companies | Hunared`,
    description: `View company profile, jobs, services and reviews for ${name} on Hunared.`,
  };
}

export default async function CompanyProfilePage({ params }: Props) {
  const { slug } = await params;
  return <CompanyProfile slug={slug} />;
}
