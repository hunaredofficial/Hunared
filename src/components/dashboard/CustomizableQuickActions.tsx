"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Bookmark,
  Briefcase,
  Building2,
  Check,
  FileText,
  FolderOpen,
  History,
  Layers,
  Megaphone,
  MessageSquare,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Tag,
  User,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database";
import {
  getDefaultsForRole,
  getPoolForRole,
  MAX_QUICK_ACTIONS,
  resolveActions,
  storageKey,
  type QuickActionDef,
  type QuickActionId,
} from "@/lib/dashboardQuickActions";
import { toast } from "sonner";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  Briefcase,
  Plus,
  ShoppingBag,
  Tag,
  Layers,
  Users,
  User,
  Building2,
  FileText,
  BookOpen,
  FolderOpen,
  Bookmark,
  MessageSquare,
  Bell,
  Megaphone,
  Settings,
  History,
  ShieldCheck,
};

function ActionIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Tag;
  return <Icon className={className} />;
}

function ActionCardView({ action }: { action: QuickActionDef }) {
  return (
    <Link
      href={action.href}
      className="group relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-md hover:border-primary/35 hover:bg-primary/[0.03] transition-all duration-200"
    >
      <div
        className={cn(
          "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-black/5 dark:ring-white/10",
          action.iconBg
        )}
      >
        <ActionIcon name={action.icon} className={cn("h-5 w-5", action.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {action.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
          {action.desc}
        </p>
      </div>
      <span className="h-8 w-8 rounded-full border border-border/80 flex items-center justify-center shrink-0 group-hover:border-primary/40 group-hover:bg-primary/10 transition-colors">
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </span>
    </Link>
  );
}

export function CustomizableQuickActions({
  userId,
  role,
}: {
  userId: string;
  role: UserRole;
}) {
  const defaults = useMemo(() => getDefaultsForRole(role), [role]);
  const pool = useMemo(() => getPoolForRole(role), [role]);
  const [selectedIds, setSelectedIds] = useState<QuickActionId[]>(defaults);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<QuickActionId[]>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(userId, role));
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const allowed = new Set(pool.map((p) => p.id));
          const cleaned = parsed.filter((id) => allowed.has(id)).slice(0, MAX_QUICK_ACTIONS);
          if (cleaned.length) {
            setSelectedIds(cleaned);
            setDraft(cleaned);
            setReady(true);
            return;
          }
        }
      }
    } catch {
      /* ignore */
    }
    setSelectedIds(defaults);
    setDraft(defaults);
    setReady(true);
  }, [userId, role, defaults, pool]);

  const save = useCallback(
    (ids: QuickActionId[]) => {
      const next = ids.slice(0, MAX_QUICK_ACTIONS);
      setSelectedIds(next);
      try {
        localStorage.setItem(storageKey(userId, role), JSON.stringify(next));
      } catch {
        /* ignore */
      }
      toast.success("Quick Actions saved");
    },
    [userId, role]
  );

  const visible = resolveActions(selectedIds);
  const draftActions = resolveActions(draft);
  const draftSet = new Set(draft);
  const available = pool.filter((p) => !draftSet.has(p.id));

  function addAction(id: QuickActionId) {
    if (draft.length >= MAX_QUICK_ACTIONS) {
      toast.error(`You can pin up to ${MAX_QUICK_ACTIONS} actions`);
      return;
    }
    setDraft((d) => [...d, id]);
  }

  function removeAction(id: QuickActionId) {
    setDraft((d) => d.filter((x) => x !== id));
  }

  function move(id: QuickActionId, dir: -1 | 1) {
    setDraft((d) => {
      const i = d.indexOf(id);
      if (i < 0) return d;
      const j = i + dir;
      if (j < 0 || j >= d.length) return d;
      const next = [...d];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  if (!ready) {
    return (
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[76px] rounded-2xl border border-border bg-card/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </h2>
        {!editing ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => {
              setDraft(selectedIds);
              setEditing(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
            Customize
          </Button>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                setDraft(defaults);
                toast.message("Reset to role defaults");
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Defaults
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setDraft(selectedIds);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                if (draft.length === 0) {
                  toast.error("Keep at least one action");
                  return;
                }
                save(draft);
                setEditing(false);
              }}
            >
              <Check className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        )}
      </div>

      {!editing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {visible.map((a) => (
            <ActionCardView key={a.id} action={a} />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Your pins ({draft.length}/{MAX_QUICK_ACTIONS})</p>
              <p className="text-xs text-muted-foreground">Drag order with ↑ ↓ or remove</p>
            </div>
            {draftActions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No actions selected — add from the list below.
              </p>
            ) : (
              <ul className="space-y-2">
                {draftActions.map((a, idx) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 rounded-xl border border-border/80 bg-background/60 px-3 py-2.5"
                  >
                    <div
                      className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                        a.iconBg
                      )}
                    >
                      <ActionIcon name={a.icon} className={cn("h-4 w-4", a.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{a.desc}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={idx === 0}
                        onClick={() => move(a.id, -1)}
                        aria-label="Move up"
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={idx === draftActions.length - 1}
                        onClick={() => move(a.id, 1)}
                        aria-label="Move down"
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeAction(a.id)}
                        aria-label="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3">
            <p className="text-sm font-medium">Add more</p>
            <p className="text-xs text-muted-foreground">
              Actions available for your account type ({role}).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {available.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-full py-2">
                  All available actions are already pinned.
                </p>
              ) : (
                available.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => addAction(a.id)}
                    className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/50 px-3 py-2.5 text-left hover:border-primary/40 hover:bg-primary/[0.04] transition-colors"
                  >
                    <div
                      className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                        a.iconBg
                      )}
                    >
                      <ActionIcon name={a.icon} className={cn("h-4 w-4", a.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{a.desc}</p>
                    </div>
                    <Plus className="h-4 w-4 text-primary shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
