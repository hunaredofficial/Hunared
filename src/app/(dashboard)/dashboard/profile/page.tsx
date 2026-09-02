import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";
import { ProfileEditForm } from "@/components/dashboard/ProfileEditForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) redirect("/register");

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Keep your information up to date. Switch account type anytime.
        </p>
      </div>
      <ProfileEditForm initialProfile={profile} />
    </div>
  );
}
