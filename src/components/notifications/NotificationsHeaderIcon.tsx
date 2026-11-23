"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Briefcase,
  Tag,
  Package,
  CreditCard,
  Info,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  loadNotificationPrefs,
  isTypeEnabled,
  categoryForType,
  CATEGORY_META,
  type NotificationPrefs,
  type NotifCategory,
} from "@/lib/notificationPrefs";

type NotifRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
};

const CAT_ICON: Record<NotifCategory, typeof Bell> = {
  jobs: Briefcase,
  market: Tag,
  orders: Package,
  subscription: CreditCard,
  system: Info,
};

/**
 * Header notifications bell — unread badge, category sections, respects Settings prefs.
 * Signed-in only. Hidden when showHeaderBell is false.
 */
export function NotificationsHeaderIcon({ className }: { className?: string }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [items, setItems] = useState<NotifRow[]>([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPrefs(loadNotificationPrefs());
    const onPrefs = () => setPrefs(loadNotificationPrefs());
    window.addEventListener("hunared-notif-prefs", onPrefs);
    window.addEventListener("storage", onPrefs);
    return () => {
      window.removeEventListener("hunared-notif-prefs", onPrefs);
      window.removeEventListener("storage", onPrefs);
    };
  }, []);

  const load = useCallback(() => {
    if (!isSignedIn) return;
    void fetch("/api/notifications?unreadOnly=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.notifications) setItems(j.notifications as NotifRow[]);
      })
      .catch(() => {});
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) {
      setItems([]);
      return;
    }
    load();
    const t = window.setInterval(load, 15000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    const onRefresh = () => load();
    window.addEventListener("hunared-notif-refresh", onRefresh);
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("hunared-notif-refresh", onRefresh);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [isSignedIn, load]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const visible = useMemo(() => {
    return items.filter((n) =>
      prefs ? isTypeEnabled(prefs, n.type, n.title, n.body) : !n.is_read
    );
  }, [items, prefs]);

  const grouped = useMemo(() => {
    const map = new Map<NotifCategory, NotifRow[]>();
    for (const n of visible) {
      const cat = categoryForType(n.type, n.title, n.body);
      const list = map.get(cat) || [];
      list.push(n);
      map.set(cat, list);
    }
    return Array.from(map.entries()).sort(
      (a, b) => CATEGORY_META[a[0]].order - CATEGORY_META[b[0]].order
    );
  }, [visible]);

  if (!isLoaded || !isSignedIn) return null;
  if (prefs && !prefs.showHeaderBell) return null;

  const count = prefs?.silenceAll ? 0 : visible.length;
  const aria =
    count > 0 ? `Notifications, ${count} unread` : "Notifications";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        title={aria}
        aria-label={aria}
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          if (!open) load();
        }}
        className={cn(
          "relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          "text-muted-foreground hover:text-foreground hover:bg-muted/80",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        )}
      >
        <Bell className="h-4 w-4" strokeWidth={2} />
        {count > 0 && (
          <span
            className={cn(
              "absolute top-0.5 right-0.5 min-w-[0.95rem] h-[0.95rem] px-0.5",
              "rounded-full bg-primary text-primary-foreground",
              "text-[9px] font-bold leading-none flex items-center justify-center",
              "ring-2 ring-background pointer-events-none"
            )}
          >
            {count > 99 ? "99+" : count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 top-full mt-1.5 z-50 w-[min(100vw-1.5rem,22rem)]",
            "rounded-xl border border-border bg-card shadow-xl overflow-hidden"
          )}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-sm font-semibold">Notifications</span>
            {count > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {count} new
              </span>
            )}
          </div>

          {prefs?.silenceAll && (
            <p className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
              All alerts are silenced. Turn off Silence in Settings to see
              badges.
            </p>
          )}

          {visible.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No new notifications
            </p>
          ) : (
            <div className="max-h-[min(60vh,22rem)] overflow-y-auto">
              {grouped.map(([cat, list]) => {
                const Icon = CAT_ICON[cat];
                return (
                  <div key={cat} className="border-b border-border/60 last:border-0">
                    <div className="sticky top-0 z-[1] flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 backdrop-blur-sm">
                      <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {CATEGORY_META[cat].label}
                      </span>
                      <span className="text-[10px] text-muted-foreground/80">
                        ({list.length})
                      </span>
                    </div>
                    <ul className="divide-y divide-border/40">
                      {list.slice(0, 4).map((n) => (
                        <li key={n.id}>
                          <button
                            type="button"
                            className={cn(
                              "w-full text-left px-3 py-2.5 hover:bg-muted/40 transition-colors",
                              !n.is_read && "bg-primary/5"
                            )}
                            onClick={() => {
                              void fetch("/api/notifications", {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ id: n.id }),
                              }).then(() => {
                                setItems((prev) =>
                                  prev.filter((x) => x.id !== n.id)
                                );
                                window.dispatchEvent(
                                  new Event("hunared-notif-refresh")
                                );
                              });
                              setOpen(false);
                              if (n.entity_type === "job" && n.entity_id) {
                                window.location.href = `/jobs/${n.entity_id}`;
                              } else if (
                                n.entity_type === "listing" &&
                                n.entity_id
                              ) {
                                window.location.href = `/market/${n.entity_id}`;
                              } else if (n.entity_type === "order") {
                                window.location.href =
                                  "/dashboard/market/orders";
                              } else {
                                window.location.href =
                                  "/dashboard/notifications";
                              }
                            }}
                          >
                            <p className="text-[13px] font-medium line-clamp-1">
                              {n.title}
                            </p>
                            {n.body ? (
                              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                                {n.body}
                              </p>
                            ) : null}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-border px-3 py-2">
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-primary hover:underline"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
