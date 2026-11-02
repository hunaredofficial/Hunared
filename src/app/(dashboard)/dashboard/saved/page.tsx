"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/currencies";
import { SaveButton } from "@/components/shared/SaveButton";

type Tab = "all" | "job" | "listing" | "article" | "resource";

export default function SavedPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/saved");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems(data.items ?? []);
    } catch {
      toast.error("Could not load saved items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    return items.filter((i) => i.type === tab);
  }, [items, tab]);

  async function removeAll() {
    if (!confirm("Are you sure you want to remove all saved items?")) return;
    const res = await fetch("/api/saved", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ removeAll: true }),
    });
    if (!res.ok) {
      toast.error("Could not clear saved items");
      return;
    }
    setItems([]);
    toast.success("All saved items removed.");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-primary" />
          My Saved {items.length > 0 && `(${items.length})`}
        </h1>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={removeAll} className="gap-1.5">
            <Trash2 className="h-4 w-4" />
            Remove All
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["job", "Jobs"],
            ["listing", "Marketplace"],
            ["article", "Articles"],
            ["resource", "Resources"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={
              "rounded-full px-3 py-1 text-sm border transition-colors " +
              (tab === key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground")
            }
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-12 text-center space-y-2">
          <p className="font-medium">You have not saved anything yet.</p>
          <p className="text-sm text-muted-foreground">
            Save jobs, listings, articles, and learning resources to find them here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => {
            if (item.type === "job") {
              return (
                <div
                  key={"job-" + item.job.id}
                  className="rounded-2xl border border-border bg-card p-4 space-y-2"
                >
                  <p className="text-xs text-muted-foreground">JOB</p>
                  <h2 className="font-semibold">{item.job.job_title}</h2>
                  {item.unavailable && (
                    <p className="text-xs text-destructive">Unavailable</p>
                  )}
                  <p className="text-sm text-muted-foreground">{item.job.company_name}</p>
                  <p className="text-sm">{item.job.location}</p>
                  <p className="text-sm text-primary font-medium">
                    {item.job.salary_type === "After Interview"
                      ? "To be discussed"
                      : formatMoney(item.job.salary_rate, item.job.currency)}
                  </p>
                  <div className="flex gap-2 pt-2">
                    {!item.unavailable && (
                      <Button size="sm" asChild>
                        <Link href={"/jobs/" + item.job.id}>View Job</Link>
                      </Button>
                    )}
                    <SaveButton itemType="job" itemId={item.job.id} initialSaved />
                  </div>
                </div>
              );
            }
            if (item.type === "listing") {
              return (
                <div
                  key={"listing-" + item.listing.id}
                  className="rounded-2xl border border-border bg-card p-4 space-y-2"
                >
                  <p className="text-xs text-muted-foreground">MARKETPLACE</p>
                  <h2 className="font-semibold">{item.listing.title}</h2>
                  {item.unavailable && (
                    <p className="text-xs text-destructive">Unavailable</p>
                  )}
                  <p className="text-sm text-primary font-medium">
                    {formatMoney(item.listing.price, item.listing.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.listing.location}</p>
                  <div className="flex gap-2 pt-2">
                    {!item.unavailable && (
                      <Button size="sm" asChild>
                        <Link href={"/market/" + item.listing.id}>View Listing</Link>
                      </Button>
                    )}
                    <SaveButton itemType="listing" itemId={item.listing.id} initialSaved />
                  </div>
                </div>
              );
            }
            if (item.type === "article") {
              return (
                <div
                  key={"article-" + item.article.id}
                  className="rounded-2xl border border-border bg-card p-4 space-y-2"
                >
                  <p className="text-xs text-muted-foreground">ARTICLE</p>
                  <h2 className="font-semibold">{item.article.title}</h2>
                  {item.unavailable && (
                    <p className="text-xs text-destructive">Unavailable</p>
                  )}
                  {item.article.category && (
                    <p className="text-sm text-muted-foreground capitalize">
                      {String(item.article.category).replace(/_/g, " ")}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    {!item.unavailable && (
                      <Button size="sm" asChild>
                        <Link href={"/education/" + item.article.id}>Read</Link>
                      </Button>
                    )}
                    <SaveButton itemType="article" itemId={item.article.id} initialSaved />
                  </div>
                </div>
              );
            }
            if (item.type === "resource") {
              return (
                <div
                  key={"resource-" + item.resource.id}
                  className="rounded-2xl border border-border bg-card p-4 space-y-2"
                >
                  <p className="text-xs text-muted-foreground">LEARNING RESOURCE</p>
                  <h2 className="font-semibold">{item.resource.title}</h2>
                  {item.unavailable && (
                    <p className="text-xs text-destructive">Unavailable</p>
                  )}
                  {item.resource.file_name && (
                    <p className="text-sm text-muted-foreground truncate">
                      {item.resource.file_name}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    {!item.unavailable && (
                      <Button size="sm" asChild>
                        <Link href={"/education/resources/" + item.resource.id}>Open</Link>
                      </Button>
                    )}
                    <SaveButton itemType="resource" itemId={item.resource.id} initialSaved />
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
