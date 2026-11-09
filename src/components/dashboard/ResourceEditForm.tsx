"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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

export function ResourceEditForm({
  id,
  initial,
}: {
  id: string;
  initial: { title: string; description: string; category: string; file_name: string };
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [category, setCategory] = useState(initial.category);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/learning/resources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not update resource");
        return;
      }
      toast.success(data.message || "Resource updated");
      router.push("/dashboard/resources");
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
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[96px]"
            />
            <p className="text-xs text-muted-foreground mt-1">{description.length}/500</p>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">File</label>
            <p className="text-sm text-muted-foreground rounded-md border border-border bg-muted/30 px-3 py-2">
              {initial.file_name}
              <span className="block text-xs mt-1">
                To replace the file, delete this resource and upload a new one.
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => router.push("/dashboard/resources")}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
