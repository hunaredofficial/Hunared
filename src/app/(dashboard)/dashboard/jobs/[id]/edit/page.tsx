import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";
import { EditJobForm } from "@/components/jobs/EditJobForm";
import type { Job } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (!profile) redirect("/dashboard");

  const role = profile.role;
  const isStaff = role === "team" || role === "admin";
  const isEmployer = role === "employer";

  // Employers edit their own posts; team/admin can edit any post from My Job Posts
  if (!isStaff && !isEmployer) redirect("/dashboard");

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (!job) notFound();

  if (!isStaff && job.employer_id !== userId) {
    redirect("/dashboard/jobs");
  }

  return <EditJobForm job={job as Job} />;
}
