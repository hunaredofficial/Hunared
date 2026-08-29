import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    redirect("/register?mode=complete");
  }

  return (
    <DashboardShell role={profile.role} fullName={profile.full_name}>
      {children}
    </DashboardShell>
  );
}
