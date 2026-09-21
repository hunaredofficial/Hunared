import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";
import { CvBuilder } from "@/components/cv/CvBuilder";

export const metadata: Metadata = {
  title: "Free CV Builder | Hunared",
  description:
    "Build a professional CV with AI commands and free templates. Print or save as PDF.",
};

export default async function CvBuilderPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, location, country, city, profession")
    .eq("id", userId)
    .maybeSingle();

  return (
    <CvBuilder
      profile={
        profile
          ? {
              fullName: profile.full_name,
              email: profile.email,
              phone: profile.phone,
              location: profile.location,
              country: profile.country,
              city: profile.city,
              profession: profile.profession,
            }
          : undefined
      }
    />
  );
}
