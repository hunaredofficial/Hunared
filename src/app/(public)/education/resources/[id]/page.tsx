import { createAdminClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourceActions } from "@/components/learning/ResourceActions";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("learning_resources")
      .select("title, description")
      .eq("id", id)
      .eq("status", "approved")
      .maybeSingle();
    if (data?.title) {
      return {
        title: data.title,
        description: data.description || `Learning resource on Hunared — ${data.title}`,
      };
    }
  } catch {
    /* ignore */
  }
  return { title: "Learning resource" };
}

export default async function ResourceDetailPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  const supabase = createAdminClient();

  const { data: row } = await supabase
    .from("learning_resources")
    .select(
      "id, title, description, category, file_name, file_type, file_size, download_count, created_at, uploaded_by, status"
    )
    .eq("id", id)
    .maybeSingle();

  if (!row || (row.status !== "approved" && row.uploaded_by !== userId)) {
    notFound();
  }

  const isOwner = !!userId && row.uploaded_by === userId;
  const size =
    row.file_size && row.file_size > 0
      ? row.file_size < 1024 * 1024
        ? `${(row.file_size / 1024).toFixed(1)} KB`
        : `${(row.file_size / (1024 * 1024)).toFixed(1)} MB`
      : null;

  const isPdf =
    (row.file_type || "").includes("pdf") ||
    (row.file_name || "").toLowerCase().endsWith(".pdf");

  // Signed URL for in-browser open (pdf/images)
  let viewUrl: string | null = null;
  try {
    const { data: signed } = await supabase.storage
      .from("learning-resources")
      .createSignedUrl(row.file_path as string, 60 * 30);
    // file_path not in select - need it
  } catch {
    /* handled below */
  }

  const { data: full } = await supabase
    .from("learning_resources")
    .select("file_path")
    .eq("id", id)
    .maybeSingle();

  if (full?.file_path) {
    const { data: signed } = await supabase.storage
      .from("learning-resources")
      .createSignedUrl(full.file_path, 60 * 30);
    viewUrl = signed?.signedUrl ?? null;
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Link
          href="/education#resources"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to resources
        </Link>

        <div className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8 space-y-5">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                {(row.category || "general").replace(/_/g, " ")}
                {" · "}
                {typeof row.download_count === "number" ? row.download_count : 0} downloads
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{row.title}</h1>
              {row.description && (
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{row.description}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {row.file_name}
                {size ? ` · ${size}` : ""}
                {row.created_at
                  ? ` · ${new Date(row.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}`
                  : ""}
              </p>
            </div>
          </div>

          <ResourceActions
            id={row.id}
            title={row.title}
            isOwner={isOwner}
          />
        </div>

        {viewUrl && isPdf && (
          <div className="rounded-2xl border border-border overflow-hidden bg-background">
            <iframe
              title={row.title}
              src={viewUrl}
              className="w-full min-h-[70vh] border-0"
            />
          </div>
        )}

        {viewUrl && !isPdf && (row.file_type || "").startsWith("image/") && (
          <div className="rounded-2xl border border-border overflow-hidden bg-card/40 p-4 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewUrl} alt={row.title} className="max-w-full max-h-[70vh] object-contain" />
          </div>
        )}
      </div>
    </div>
  );
}
