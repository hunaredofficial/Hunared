"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  loadNotificationPrefs,
  isTypeEnabled,
  type NotificationPrefs,
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

/**
 * Header notifications bell — unread badge, respects Settings prefs.
 * Signed-in only. Hidden when showHeaderBell is false.
 */
export function NotificationsHeaderIcon({ className }: { className?: string }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [items, setItems] = useState<NotifRow[]>([]);
  const [open, setOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(64);
  const rootRef = useRef<HTMLDivElement>(null);

  const updatePanelPos = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Keep panel under the bell, always flush to the right side of the viewport
    setPanelTop(Math.round(r.bottom + 14));
  }, []);

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
    updatePanelPos();
    const onResize = () => updatePanelPos();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open]);

  if (!isLoaded || !isSignedIn) return null;
  if (prefs && !prefs.showHeaderBell) return null;

  const visible = items.filter((n) =>
    prefs ? isTypeEnabled(prefs, n.type) : !n.is_read
  );
  const count = prefs?.silenceAll ? 0 : visible.length;
  const preview = visible.slice(0, 6);

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
          setOpen((o) => {
            const next = !o;
            if (next) {
              updatePanelPos();
              requestAnimationFrame(() => updatePanelPos());
              load();
            }
            return next;
          });
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
            "fixed z-[100] right-3 sm:right-4 w-[min(calc(100vw-1.5rem),20rem)]",
            "rounded-xl border border-border bg-card shadow-xl overflow-hidden",
            "origin-top-right"
          )}
          style={{ top: panelTop }}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-sm font-semibold">Notifications</span>
          </div>
          {prefs?.silenceAll && (
            <p className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
              All alerts are silenced. Turn off Silence in Settings to see badges.
            </p>
          )}
          <ul className="max-h-72 overflow-y-auto">
            {preview.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-muted-foreground">
                No new notifications
              </li>
            ) : (
              preview.map((n) => (
                <li key={n.id} className="border-b border-border/60 last:border-0">
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-xs font-medium text-foreground line-clamp-1">
                      {n.title}
                    </p>
                    {n.body ? (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                        {n.body}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))
            )}
          </ul>
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
