import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { canBulkPost } from "@/lib/roles";
import MagicPostClient from "./MagicPostClient";

export default async function TeamMagicPostPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (!canBulkPost(profile?.role)) redirect("/dashboard");
  return <MagicPostClient />;
}
