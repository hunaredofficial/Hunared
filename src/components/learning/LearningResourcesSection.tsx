"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  Download,
  FileText,
  Loader2,
  Search,
  Upload,
  FolderOpen,
  Share2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/shared/ShareButton";
import { SaveButton } from "@/components/shared/SaveButton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type LearningResource = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  file_name: string;
  file_type?: string | null;
  file_size?: number | null;
  download_count?: number;
  created_at: string;
  status?: string;
  uploaded_by?: string | null;
};

export const RESOURCE_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "safety_hse", label: "Safety & HSE" },
  { value: "engineering", label: "Engineering" },
  { value: "career_tips", label: "Career" },
  { value: "rights_responsibilities", label: "Rights & Work" },
  { value: "soft_skills", label: "Soft Skills" },
  { value: "industry_news", label: "Industry News" },
  { value: "templates", label: "Templates" },
  { value: "guides", label: "Guides" },
  { value: "checklists", label: "Checklists" },
  { value: "forms", label: "Forms" },
  { value: "procedures", label: "Procedures" },
  { value: "certificates", label: "Certificates" },
  { value: "training_materials", label: "Training Materials" },
  { value: "general", label: "General" },
];

function formatSize(n?: number | null) {
  if (!n || n <= 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function ResourceLibrary({
  signedIn,
  refreshKey,
  onRefresh,
  showHeader = true,
}: {
  signedIn: boolean;
  refreshKey: number;
  onRefresh: () => void;
  showHeader?: boolean;
}) {
  const { userId } = useAuth();
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/learning/resources?${params}`);
      const data = await res.json();
      setResources(data.resources ?? []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [category, q]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  async function handleDownload(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/learning/resources/${id}/download`);
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error || "Download failed");
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
      void load();
    } catch {
      toast.error("Download failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handleShare(id: string, title: string) {
    const url = `${window.location.origin}/education/resources/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url, text: `Learning resource on Hunared: ${title}` });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      } catch {
        toast.error("Could not share");
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this resource permanently?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/learning/resources/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Delete failed");
        return;
      }
      toast.success("Resource deleted");
      onRefresh();
      void load();
    } catch {
      toast.error("Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      {showHeader && (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              Resource library
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Open, download, and share professional guides and study files.
            </p>
          </div>
          {signedIn ? (
            <Button asChild size="sm" className="shrink-0">
              <Link href="/dashboard/resources/new">
                <Upload className="h-4 w-4 mr-1.5" />
                Upload resource
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link href="/sign-in">Sign in to upload</Link>
            </Button>
          )}
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search documents…"
          className="w-full h-10 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {RESOURCE_CATEGORY_OPTIONS.map((c) => (
          <button
            key={c.value || "all"}
            type="button"
            onClick={() => setCategory(c.value)}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-colors",
              category === c.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center px-4">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium">No resources in this view yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Upload a PDF, Word, or guide from the Upload page — it will appear here after publish.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => {
            const mine = !!userId && r.uploaded_by === userId;
            return (
              <li
                key={r.id}
                className="rounded-xl border border-border bg-card/60 p-4 flex flex-col gap-3 hover:border-primary/40 transition-colors"
              >
                <Link href={`/education/resources/${r.id}`} className="flex items-start gap-3 group">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {r.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {r.file_name}
                      {r.file_size ? ` · ${formatSize(r.file_size)}` : ""}
                    </p>
                  </div>
                </Link>
                {r.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] tracking-wide text-muted-foreground mr-auto">
                    {typeof r.download_count === "number" ? r.download_count : 0} downloads
                  </span>
                  <ShareButton
                    url={`/education/resources/${r.id}`}
                    title={r.title}
                    size="icon"
                  />
                  <SaveButton itemType="resource" itemId={r.id} size="icon" />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    disabled={busyId === r.id}
                    onClick={() => void handleDownload(r.id)}
                  >
                    {busyId === r.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download
                      </>
                    )}
                  </Button>
                  {mine && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-destructive hover:text-destructive"
                      title="Delete"
                      disabled={busyId === r.id}
                      onClick={() => void handleDelete(r.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ResourceUploadForm({
  onPublished,
}: {
  onPublished?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Choose a file to upload");
      return;
    }
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/learning/resources/upload", {
        method: "POST",
        body: fd,
      });
      const upData = await up.json();
      if (!up.ok) {
        toast.error(upData.error || "Upload failed");
        return;
      }

      const res = await fetch("/api/learning/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          file_path: upData.file_path,
          file_name: upData.file_name,
          file_type: upData.file_type,
          file_size: upData.file_size,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not save resource");
        return;
      }
      toast.success(data.message || "Resource published");
      setTitle("");
      setDescription("");
      setFile(null);
      setCategory("general");
      onPublished?.();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      id="upload-resource"
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-card/60 p-5 sm:p-6 space-y-4 scroll-mt-28"
    >
      <div>
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          Share a learning resource
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, Word, PowerPoint, Excel, or images up to 15MB. Appears in the library after publish.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium mb-1 block">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. HSE toolbox talk template"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium mb-1 block">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder="What is this file useful for?"
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
          >
            {RESOURCE_CATEGORY_OPTIONS.filter((c) => c.value).map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">File</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/15 file:px-3 file:py-1.5 file:text-xs file:font-medium"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Publish resource
          </>
        )}
      </Button>
    </form>
  );
}

export function LearningResourcesSection({
  signedIn,
  showHeader = true,
}: {
  signedIn: boolean;
  showHeader?: boolean;
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);
  return (
    <div className="space-y-10" id="resources">
      <ResourceLibrary
        signedIn={signedIn}
        refreshKey={refreshKey}
        onRefresh={refresh}
        showHeader={showHeader}
      />
    </div>
  );
}

/** Exported for the dedicated upload page */
export { ResourceUploadForm };
