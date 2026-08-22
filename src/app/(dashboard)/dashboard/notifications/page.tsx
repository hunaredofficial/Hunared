"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (e: any) {
      toast.error(e.message || "Could not load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
      toast.error("Could not delete notification");
      return;
    }
    const wasUnread = items.find((n) => n.id === id && !n.is_read);
    setItems((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-muted-foreground">
        Loading notifications…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="default">{unreadCount} new</Badge>
          )}
        </h1>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            className="gap-1.5"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground border rounded-lg p-6 text-center">
          No notifications yet. Subscribe to job or marketplace categories to
          get alerts when new items are posted.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {items.map((n) => {
            const href = entityHref(n);
            return (
              <li
                key={n.id}
                className={cn(
                  "flex flex-wrap items-start justify-between gap-3 p-4",
                  !n.is_read && "bg-primary/5"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
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