"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/currencies";
import { SaveButton } from "@/components/shared/SaveButton";

type Tab = "all" | "job" | "listing";

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
          <Button
            variant="outline"
            size="sm"
            onClick={removeAll}
            className="gap-1.5"
          >
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
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              tab === key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-3">
          <p className="font-medium">You have not saved anything yet.</p>
          <p className="text-sm text-muted-foreground">
            Save jobs and listings you like, then open them here later.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button asChild>
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/market">Browse Marketplace</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item) =>
            item.type === "job" ? (
              <div
                key={"job-" + item.job.id}
                className="rounded-2xl border border-border bg-card p-4 space-y-2"
              >
                <p className="text-xs text-muted-foreground">JOB</p>
                <h2 className="font-semibold">{item.job.job_title}</h2>
                {item.unavailable && (
                  <p className="text-xs text-destructive">Unavailable</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {item.job.company_name}
                </p>
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
                  <SaveButton
                    itemType="job"
                    itemId={item.job.id}
                    initialSaved
                  />
                </div>
              </div>
            ) : (
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
                <p className="text-sm text-muted-foreground">
                  {item.listing.location}
                </p>
                <div className="flex gap-2 pt-2">
                  {!item.unavailable && (
                    <Button size="sm" asChild>
                      <Link href={"/market/" + item.listing.id}>
                        View Listing
                      </Link>
                    </Button>
                  )}
                  <SaveButton
                    itemType="listing"
                    itemId={item.listing.id}
                    initialSaved
                  />
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}