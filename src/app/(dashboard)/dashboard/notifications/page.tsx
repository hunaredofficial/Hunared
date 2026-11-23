"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Briefcase,
  CheckCheck,
  CreditCard,
  ExternalLink,
  Info,
  Package,
  Tag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  categoryForType,
  CATEGORY_META,
  type NotifCategory,
} from "@/lib/notificationPrefs";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  entity_type: "job" | "listing" | "order" | "article" | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
};

type FilterKey = "all" | NotifCategory;

const FILTERS: { key: FilterKey; label: string; icon: typeof Bell }[] = [
  { key: "all", label: "All", icon: Bell },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "market", label: "Market", icon: Tag },
  { key: "orders", label: "Orders", icon: Package },
  { key: "subscription", label: "Subscription", icon: CreditCard },
  { key: "system", label: "System", icon: Info },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function entityHref(n: Notification): string | null {
  if (!n.entity_id || !n.entity_type) return null;
  if (n.entity_type === "job") return `/jobs/${n.entity_id}`;
  if (n.entity_type === "listing") return `/market/${n.entity_id}`;
  if (n.entity_type === "order") return `/dashboard/market/orders`;
  if (n.entity_type === "article") return `/articles/${n.entity_id}`;
  return null;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (e: unknown) {
      toast.error((e as Error).message || "Could not load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter(
      (n) => categoryForType(n.type, n.title, n.body) === filter
    );
  }, [items, filter]);

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: items.length,
      jobs: 0,
      market: 0,
      orders: 0,
      subscription: 0,
      system: 0,
    };
    for (const n of items) {
      const cat = categoryForType(n.type, n.title, n.body);
      c[cat] += 1;
    }
    return c;
  }, [items]);

  async function markRead(id: string) {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      toast.error("Could not mark as read");
      return;
    }
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function markAllRead() {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    if (!res.ok) {
      toast.error("Could not mark all as read");
      return;
    }
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    toast.success("All notifications marked as read");
  }

  async function remove(id: string) {
    const res = await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      toast.error("Could not delete");
      return;
    }
    const wasUnread = items.find((n) => n.id === id && !n.is_read);
    setItems((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={markAllRead}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(({ key, label, icon: Icon }) => {
          const active = filter === key;
          const n = counts[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {n > 0 && (
                <span
                  className={cn(
                    "min-w-[1.1rem] h-4 px-1 rounded-full text-[10px] font-bold leading-none flex items-center justify-center",
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            {filter === "all"
              ? "No notifications yet"
              : `No ${CATEGORY_META[filter as NotifCategory]?.label ?? filter} notifications`}
          </p>
        </div>
      ) : (
        <ul className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
          {filtered.map((n) => {
            const href = entityHref(n);
            const cat = categoryForType(n.type, n.title, n.body);
            const CatIcon =
              FILTERS.find((f) => f.key === cat)?.icon ?? Info;
            return (
              <li
                key={n.id}
                className={cn(
                  "flex flex-wrap items-start justify-between gap-3 p-4",
                  !n.is_read && "bg-primary/5"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <CatIcon className="h-3 w-3" />
                      {CATEGORY_META[cat].label}
                    </span>
                    <p className="font-medium">{n.title}</p>
                  </div>
                  {n.body && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {n.body}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(n.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {href && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => {
                        if (!n.is_read) markRead(n.id);
                      }}
                    >
                      <Link href={href}>
                        Open <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  )}
                  {!n.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markRead(n.id)}
                      title="Mark as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(n.id)}
                    title="Delete"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
