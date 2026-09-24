"use client";

import { useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CV_SAMPLES, listSampleCategories } from "@/lib/cv/samples";
import type { CvData } from "@/lib/cv/types";
import { cn } from "@/lib/utils";

export function CvSamples({
  onUse,
  onBack,
}: {
  onUse: (name: string, data: CvData, targetRole?: string) => void;
  onBack: () => void;
}) {
  const categories = useMemo(() => ["All", ...listSampleCategories()], []);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  const list = CV_SAMPLES.filter((s) => {
    if (cat !== "All" && s.meta.category !== cat) return false;
    if (!q.trim()) return true;
    const t = q.toLowerCase();
    return (
      s.meta.profession.toLowerCase().includes(t) ||
      s.meta.category.toLowerCase().includes(t) ||
      s.meta.blurb.toLowerCase().includes(t)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-1" onClick={onBack}>
            ← My CVs
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Sample CV library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pick a complete professional example for your field, then personalize it.
            Sample names and employers are placeholders — replace with your real details.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search profession…"
            className="w-full h-9 rounded-md border border-border bg-background pl-9 pr-3 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs border transition-colors",
                cat === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((s) => (
          <div
            key={s.meta.id}
            className="rounded-xl border border-border bg-card p-4 flex flex-col hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h3 className="font-semibold text-sm">{s.meta.profession}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {s.meta.category} · {s.meta.template}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex-1">{s.meta.blurb}</p>
            <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">
              {s.data.summary}
            </p>
            <Button
              size="sm"
              className="mt-3 w-full"
              onClick={() =>
                onUse(
                  `${s.meta.profession} CV`,
                  {
                    ...s.data,
                    fullName: "",
                    email: "",
                    phone: "",
                  },
                  s.meta.profession
                )
              }
            >
              Use this CV
            </Button>
          </div>
        ))}
      </div>
      {!list.length && (
        <p className="text-sm text-muted-foreground text-center py-10">
          No samples match your search.
        </p>
      )}
    </div>
  );
}
