"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MessageSquare, X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { MessagesInbox } from "@/components/messages/MessagesInbox";

const MIN_W = 360;
const MIN_H = 320;
const DEFAULT_W = 440;
const DEFAULT_H = 520;

/**
 * Floating Messages panel (same-screen overlay).
 * Resizable: left edge (width) + bottom edge (height).
 */
export function MessagesPanel() {
  const { isSignedIn, userId, isLoaded } = useAuth();
  const [open, setOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [width, setWidth] = useState(DEFAULT_W);
  const [height, setHeight] = useState(DEFAULT_H);
  const dragRef = useRef<{
    edge: "left" | "bottom" | "corner";
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  useEffect(() => {
    setPortalReady(true);
    try {
      const w = localStorage.getItem("hunared_messages_panel_w");
      const h = localStorage.getItem("hunared_messages_panel_h");
      if (w) {
        const n = parseInt(w, 10);
        if (!Number.isNaN(n) && n >= MIN_W) setWidth(n);
      }
      if (h) {
        const n = parseInt(h, 10);
        if (!Number.isNaN(n) && n >= MIN_H) setHeight(n);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onToggle = () => setOpen((o) => !o);
    const onSet = (e: Event) => {
      const d = (e as CustomEvent<{ open?: boolean }>).detail;
      if (typeof d?.open === "boolean") setOpen(d.open);
    };
    window.addEventListener("hunared-messages-toggle", onToggle);
    window.addEventListener("hunared-messages-set-open", onSet as EventListener);
    return () => {
      window.removeEventListener("hunared-messages-toggle", onToggle);
      window.removeEventListener("hunared-messages-set-open", onSet as EventListener);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("hunared-messages-open-state", { detail: { open } })
    );
  }, [open]);

  const maxW = useCallback(() => {
    if (typeof window === "undefined") return 720;
    return Math.max(MIN_W, Math.min(720, window.innerWidth - 24));
  }, []);
  const maxH = useCallback(() => {
    if (typeof window === "undefined") return 800;
    return Math.max(MIN_H, window.innerHeight - 72);
  }, []);

  function onResizeStart(edge: "left" | "bottom" | "corner") {
    return (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      dragRef.current = {
        edge,
        startX: clientX,
        startY: clientY,
        startW: width,
        startH: height,
      };
      const onMove = (ev: MouseEvent | TouchEvent) => {
        if (!dragRef.current) return;
        const x = "touches" in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX;
        const y = "touches" in ev ? ev.touches[0].clientY : (ev as MouseEvent).clientY;
        const d = dragRef.current;
        if (d.edge === "left" || d.edge === "corner") {
          // Dragging left edge leftward increases width
          const deltaX = d.startX - x;
          setWidth(Math.min(maxW(), Math.max(MIN_W, d.startW + deltaX)));
        }
        if (d.edge === "bottom" || d.edge === "corner") {
          const deltaY = y - d.startY;
          setHeight(Math.min(maxH(), Math.max(MIN_H, d.startH + deltaY)));
        }
      };
      const onUp = () => {
        setWidth((w) => {
          try {
            localStorage.setItem("hunared_messages_panel_w", String(w));
          } catch {
            /* ignore */
          }
          return w;
        });
        setHeight((h) => {
          try {
            localStorage.setItem("hunared_messages_panel_h", String(h));
          } catch {
            /* ignore */
          }
          return h;
        });
        dragRef.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onUp);
    };
  }

  if (!portalReady || !isLoaded || !isSignedIn || !userId || !open) return null;

  const panel = (
    <>
      <div
        className="fixed inset-0 z-[9996] bg-black/10 sm:bg-transparent"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="Messages"
        className={cn(
          "fixed z-[9997] flex flex-col overflow-hidden",
          "right-3 bottom-3 sm:right-4 sm:bottom-4",
          "rounded-xl border border-border bg-card shadow-2xl"
        )}
        style={{ width, height, maxWidth: "calc(100vw - 1.5rem)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 shrink-0 px-3 py-2 border-b border-border bg-card">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-semibold truncate">Messages</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80"
            aria-label="Close messages"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Inbox body */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <MessagesInbox currentUserId={userId} embedded />
        </div>

        {/* Left resize handle */}
        <div
          title="Drag to resize width"
          onMouseDown={onResizeStart("left")}
          onTouchStart={onResizeStart("left")}
          className="absolute left-0 top-0 bottom-3 w-2 cursor-ew-resize hover:bg-primary/20 active:bg-primary/30 touch-none"
        />
        {/* Bottom resize handle */}
        <div
          title="Drag to resize height"
          onMouseDown={onResizeStart("bottom")}
          onTouchStart={onResizeStart("bottom")}
          className="absolute left-2 right-0 bottom-0 h-3 cursor-ns-resize flex items-center justify-center border-t border-border/50 hover:bg-muted/40 active:bg-muted/60 touch-none"
        >
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>
        {/* Corner */}
        <div
          title="Drag to resize"
          onMouseDown={onResizeStart("corner")}
          onTouchStart={onResizeStart("corner")}
          className="absolute left-0 bottom-0 h-4 w-4 cursor-nesw-resize touch-none"
        />
      </div>
    </>
  );

  return createPortal(panel, document.body);
}
