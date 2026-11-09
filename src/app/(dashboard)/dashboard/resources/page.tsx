import { createAdminClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FolderOpen, Plus, Pencil, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResourceManageActions } from "@/components/dashboard/ResourceManageActions";
import { RESOURCE_CATEGORY_OPTIONS } from "@/components/learning/LearningResourcesSection";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800",
  pending: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  rejected: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
};

type ResourceRow = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  file_name: string;
  file_type?: string | null;
  file_size?: number | null;
  download_count?: number | null;
  created_at: string;
  status?: string | null;
};

function formatSize(n?: number | null) {
  if (!n || n <= 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function MyResourcesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let resources: ResourceRow[] = [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("learning_resources")
      .select(
        "id, title, description, category, file_name, file_type, file_size, download_count, created_at, status"
      )
      .eq("uploaded_by", userId)
      .order("created_at", { ascending: false });
    resources = (data as ResourceRow[]) ?? [];
  } catch {
    // empty
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">My Resources</h1>
          <p className="text-sm text-muted-foreground">
            {resources.length} resource{resources.length !== 1 ? "s" : ""} uploaded
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/dashboard/resources/new">
            <Plus className="h-4 w-4" /> Upload Resource
          </Link>
        </Button>
      </div>

      {resources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">You haven&apos;t uploaded any resources yet.</p>
            <Button className="mt-5 gap-1.5" asChild>
              <Link href="/dashboard/resources/new">
                <Plus className="h-4 w-4" /> Upload your first resource
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {resources.map((r) => {
            const catLabel =
              RESOURCE_CATEGORY_OPTIONS.find((c) => c.value === r.category)?.label ??
              r.category;
            const status = r.status || "approved";

            return (
              <Card key={r.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-4 pb-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {catLabel}
                        </Badge>
                        <Badge className={`text-xs border ${STATUS_COLORS[status] ?? ""}`}>
                          {status}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm line-clamp-1">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {r.file_name}
                        {r.file_size ? ` · ${formatSize(r.file_size)}` : ""}
                        {typeof r.download_count === "number"
                          ? ` · ${r.download_count} downloads`
                          : ""}
                        {" · "}
                        {new Date(r.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {status === "approved" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                        <Link href={`/education/resources/${r.id}`} target="_blank">
                          View
                        </Link>
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" asChild>
                      <Link href={`/dashboard/resources/${r.id}/edit`}>
                        <Pencil className="h-3 w-3" /> Edit
                      </Link>
                    </Button>
                    <ResourceManageActions id={r.id} title={r.title} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
