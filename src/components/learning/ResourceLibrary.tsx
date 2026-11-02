"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  Loader2,
  Search,
  Upload,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
};

const CATEGORIES: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "safety_hse", label: "Safety & HSE" },
  { value: "engineering", label: "Engineering" },
  { value: "career_tips", label: "Career" },
  { value: "templates", label: "Templates" },
  { value: "guides", label: "Guides" },
  { value: "certificates", label: "Certificates" },
  { value: "general", label: "General" },
];

function formatSize(n?: number | null) {
  if (!n || n <= 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResourceLibrary({ signedIn }: { signedIn: boolean }) {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

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
  }, [load]);

  async function handleDownload(id: string) {
    setDownloading(id);
    try {
      const res = await fetch(`/api/learning/resources/${id}/download`);
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error || "Download failed");
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Resource library
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Download guides, templates, and study files. Sign in to contribute your own.
          </p>
        </div>
        {signedIn ? (
          <Button asChild size="sm" className="shrink-0">
            <Link href="#upload-resource">
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

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search documents…"
            className="w-full h-10 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
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
          <p className="text-sm font-medium">No resources yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Approved guides and templates will appear here. Run the SQL migration and upload
            files after signing in.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-border bg-card/60 p-4 flex flex-col gap-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm leading-snug line-clamp-2">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {r.file_name}
                    {r.file_size ? ` · ${formatSize(r.file_size)}` : ""}
                  </p>
                </div>
              </div>
              {r.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
              )}
              <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {r.category.replace(/_/g, " ")}
                  {typeof r.download_count === "number" && r.download_count > 0
                    ? ` · ${r.download_count} downloads`
                    : ""}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  disabled={downloading === r.id}
                  onClick={() => void handleDownload(r.id)}
                >
                  {downloading === r.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
