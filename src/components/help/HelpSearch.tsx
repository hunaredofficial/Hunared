"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { searchHelpArticles } from "@/lib/help/search";
import { HELP_CATEGORIES } from "@/lib/help/categories";

export function HelpSearch({ autoFocus }: { autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => (q.trim().length >= 2 ? searchHelpArticles(q, 12) : []), [q]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label className="relative block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus={autoFocus}
          placeholder="Search help… e.g. how to make a CV"
          className="w-full rounded-xl border border-border bg-background/80 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          aria-label="Search help articles"
        />
      </label>
      {q.trim().length >= 2 && (
        <div className="mt-2 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">
              No articles found. Try “CV”, “jobs”, “messages”, or “settings”.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-border/60">
              {results.map((a) => {
                const cat = HELP_CATEGORIES.find((c) => c.id === a.category);
                return (
                  <li key={`${a.category}/${a.slug}`}>
                    <Link
                      href={`/help/${a.category}/${a.slug}`}
                      className="block px-4 py-3 hover:bg-muted/40 transition-colors"
                      onClick={() => setQ("")}
                    >
                      <p className="text-sm font-medium text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {cat?.title} · {a.summary}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
