"use client";

import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedCard } from "./FeedCard";
import { PremiumAdSlot } from "@/components/ads/PremiumAdSlot";
import { cn } from "@/lib/utils";
import type { FeedItem } from "@/lib/home/feed";
import Link from "next/link";

const FILTERS: { id: "all" | "job" | "listing" | "article"; label: string }[] =
  [
    { id: "all", label: "All" },
    { id: "job", label: "Jobs" },
    { id: "listing", label: "Business" },
    { id: "article", label: "Learning" },
  ];

export function DiscoveryFeedClient({
  initialItems,
  initialCursor,
}: {
  initialItems: FeedItem[];
  initialCursor: string | null;
}) {
  const [type, setType] = useState<"all" | "job" | "listing" | "article">("all");
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  const load = useCallback(
    async (opts: {
      type: typeof type;
      cursor: string | null;
      append: boolean;
    }) => {
      const q = new URLSearchParams({
        type: opts.type,
        limit: "12",
      });
      if (opts.cursor) q.set("cursor", opts.cursor);
      const res = await fetch(`/api/feed?${q.toString()}`);
      const data = (await res.json()) as {
        items: FeedItem[];
        nextCursor: string | null;
      };
      setItems((prev) =>
        opts.append ? [...prev, ...(data.items ?? [])] : data.items ?? []
      );
      setCursor(data.nextCursor ?? null);
    },
    []
  );

  async function onFilter(next: typeof type) {
    if (next === type) return;
    setType(next);
    setSwitching(true);
    try {
      await load({ type: next, cursor: null, append: false });
    } finally {
      setSwitching(false);
    }
  }

  async function onMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      await load({ type, cursor, append: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilter(f.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
              type === f.id
                ? "border-primary bg-primary/15 text-foreground"
                : "border-border/60 bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
        <Link
          href="/mindspace"
          className="shrink-0 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
        >
          MindSpace
        </Link>
      </div>

      {switching ? (
        <div className="flex justify-center py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-10 text-center">
          <p className="text-sm font-medium">Nothing in this filter yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try All, or explore Jobs and Business pages.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={item.id}>
              <FeedCard item={item} />
              {i === 4 ? (
                <div className="my-3">
                  <PremiumAdSlot slotId="homepage_mid" />
                </div>
              ) : null}
            </div>
          ))}
          {cursor ? (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                className="rounded-xl min-w-[10rem]"
                disabled={loading}
                onClick={onMore}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading…
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground py-2">
              You&apos;re caught up
            </p>
          )}
        </div>
      )}
    </div>
  );
}
