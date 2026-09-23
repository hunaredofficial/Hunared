import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CvBuilder } from "@/components/cv/CvBuilder";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "CV Builder | Hunared",
  description: "Create and manage professional CVs with AI assistance.",
};

export default async function CvPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/dashboard/cv");

  const user = await currentUser();
  let profileSeed: {
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    profession?: string | null;
    country?: string | null;
    city?: string | null;
    skills?: string | null;
    languages?: string | null;
  } = {
    fullName: user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" "),
    email: user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress,
  };

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("profiles")
      .select(
        "full_name, phone, city, country, profession, job_interests, skills, languages"
      )
      .eq("id", userId)
      .maybeSingle();

    if (data) {
      profileSeed = {
        ...profileSeed,
        fullName: data.full_name || profileSeed.fullName,
        phone: data.phone,
        city: data.city,
        country: data.country,
        profession:
          data.profession ||
          (Array.isArray(data.job_interests) ? data.job_interests[0] : null),
        skills: Array.isArray(data.skills)
          ? data.skills.join(", ")
          : typeof data.skills === "string"
            ? data.skills
            : null,
        languages: Array.isArray(data.languages)
          ? data.languages.join(", ")
          : typeof data.languages === "string"
            ? data.languages
            : null,
      };
    }
  } catch {
    /* profile optional */
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <CvBuilder profile={profileSeed} />
    </div>
  );
}
