"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { RESOURCE_CATEGORY_OPTIONS } from "@/components/learning/LearningResourcesSection";

const CATEGORIES = RESOURCE_CATEGORY_OPTIONS.filter((c) => c.value);

export function ResourceUploadClient() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Choose a file to upload");
      return;
    }
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!category) {
      toast.error("Category is required");
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
      router.push("/education/resources");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resource Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="e.g. HSE toolbox talk template"
              className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">{title.length}/120</p>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">
              Category <span className="text-destructive">*</span>
            </label>
            <Select
              value={category}
              onValueChange={(v: string | null) => {
                if (v) setCategory(v);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="What is this file useful for? Who should use it?"
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[96px]"
            />
            <p className="text-xs text-muted-foreground mt-1">{description.length}/500</p>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">
              File <span className="text-destructive">*</span>
            </label>
            <div className="rounded-md border border-input bg-background px-3 py-3">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/15 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-2">
                PDF, Word, PowerPoint, Excel, or image — max 15MB
                {file ? ` · Selected: ${file.name}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Publish resource
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => router.push("/education/resources")}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
