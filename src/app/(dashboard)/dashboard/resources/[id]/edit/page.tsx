import { createAdminClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { ResourceEditForm } from "@/components/dashboard/ResourceEditForm";

export const metadata: Metadata = {
  title: "Edit Resource",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditResourcePage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("learning_resources")
    .select(
      "id, title, description, category, file_name, file_type, file_size, download_count, created_at, uploaded_by, status"
    )
    .eq("id", id)
    .maybeSingle();

  if (!row || row.uploaded_by !== userId) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Resource</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update title, category, or description. File cannot be replaced here — delete and
          re-upload if you need a new file.
        </p>
      </div>
      <ResourceEditForm
        id={row.id}
        initial={{
          title: row.title,
          description: row.description ?? "",
          category: row.category,
          file_name: row.file_name,
        }}
      />
    </div>
  );
}
