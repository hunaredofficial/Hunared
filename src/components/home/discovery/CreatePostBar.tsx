"use client";

import Link from "next/link";
import {
  Briefcase,
  FileText,
  HelpCircle,
  ImageIcon,
  PenSquare,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SHORTCUTS = [
  { href: "/post", label: "Update", icon: PenSquare },
  { href: "/dashboard/jobs/new", label: "Job", icon: Briefcase },
  { href: "/dashboard/business/new", label: "Listing", icon: ShoppingBag },
  { href: "/dashboard/articles/new", label: "Article", icon: FileText },
  { href: "/post", label: "Ask", icon: HelpCircle },
];

export function CreatePostBar() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-3 sm:p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <ImageIcon className="h-4 w-4 text-primary" />
        </div>
        <Link
          href="/post"
          className="flex-1 rounded-full border border-border/70 bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground transition"
        >
          Share an update, opportunity, or listing…
        </Link>
        <Button size="sm" className="hidden sm:inline-flex h-9 rounded-full px-4" asChild>
          <Link href="/post">Post</Link>
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {SHORTCUTS.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-border transition"
          >
            <s.icon className="h-3.5 w-3.5" />
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
