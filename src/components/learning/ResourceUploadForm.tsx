"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "safety_hse", label: "Safety & HSE" },
  { value: "engineering", label: "Engineering" },
  { value: "career_tips", label: "Career tips" },
  { value: "templates", label: "Templates" },
  { value: "guides", label: "Guides" },
  { value: "certificates", label: "Certificates" },
];

export function ResourceUploadForm() {
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
      toast.success(data.message || "Submitted for review");
      setTitle("");
      setDescription("");
      setFile(null);
      setCategory("general");
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
          PDF, Word, PowerPoint, Excel, or images up to 15MB. Submissions are reviewed before they
          appear in the library.
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
            {CATEGORIES.map((c) => (
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
            Submit for review
          </>
        )}
      </Button>
    </form>
  );
}
