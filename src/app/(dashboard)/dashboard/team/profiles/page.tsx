import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { canBypassVerification } from "@/lib/roles";
import { TeamProfilesClient } from "@/components/team/TeamProfilesClient";

export default async function TeamProfilesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (!canBypassVerification(profile?.role)) redirect("/dashboard");
  return <TeamProfilesClient />;
}
