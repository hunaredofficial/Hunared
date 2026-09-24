"use client";

import {
  FileText,
  Plus,
  Copy,
  Trash2,
  Pencil,
  MoreHorizontal,
  Library,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCompletionPercent } from "@/lib/cv/completion";
import { CV_TEMPLATES } from "@/lib/cv/templates";
import type { CvDocument } from "@/lib/cv/types";
import { cn } from "@/lib/utils";

export function CvLibrary({
  docs,
  onCreate,
  onSamples,
  onOpen,
  onDuplicate,
  onDelete,
  onRename,
}: {
  docs: CvDocument[];
  onCreate: () => void;
  onSamples: () => void;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CV Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, upload, use professional samples, and improve with AI.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onSamples} className="gap-1.5">
            <Library className="h-4 w-4" />
            Sample CVs
          </Button>
          <Button onClick={onCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Create / Upload
          </Button>
        </div>
      </div>

      {docs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-medium">No CVs yet</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Start from a sample for your profession, upload an existing CV, or
            build from scratch with AI assistance.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            <Button onClick={onSamples} variant="outline" className="gap-1.5">
              <Library className="h-4 w-4" />
              Browse samples
            </Button>
            <Button onClick={onCreate} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create new
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {docs.map((doc) => {
            const pct = getCompletionPercent(doc.data);
            const tpl =
              CV_TEMPLATES.find((t) => t.id === doc.template)?.name ||
              doc.template;
            const updated = new Date(doc.updatedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return (
              <div
                key={doc.id}
                className="group rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => onOpen(doc.id)}
                  className="text-left min-w-0"
                >
                  <h3 className="font-semibold text-[15px] truncate group-hover:text-primary transition-colors">
                    {doc.name}
                  </h3>
                  {doc.targetRole && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      Target: {doc.targetRole}
                    </p>
                  )}
                </button>
                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Template</span>
                    <span className="text-foreground/80">{tpl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated</span>
                    <span className="text-foreground/80">{updated}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span>Completion</span>
                    <span
                      className={cn(
                        "font-medium tabular-nums",
                        pct >= 80 ? "text-emerald-500" : "text-muted-foreground"
                      )}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap gap-1.5">
                  <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={() => onOpen(doc.id)}>
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => onDuplicate(doc.id)}>
                    <Copy className="h-3 w-3" /> Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs gap-1 text-destructive"
                    onClick={() => {
                      if (confirm(`Delete “${doc.name}”?`)) onDelete(doc.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs gap-1 ml-auto"
                    onClick={() => {
                      const name = prompt("Rename CV", doc.name);
                      if (name?.trim()) onRename(doc.id, name.trim());
                    }}
                  >
                    <MoreHorizontal className="h-3 w-3" /> Rename
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
