"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Briefcase,
  FileText,
  HelpCircle,
  ImageIcon,
  Loader2,
  PenSquare,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SHORTCUTS = [
  { href: "/post", label: "Update", icon: PenSquare },
  { href: "/dashboard/jobs/new", label: "Job", icon: Briefcase },
  { href: "/dashboard/business/new", label: "Listing", icon: ShoppingBag },
  { href: "/dashboard/articles/new", label: "Article", icon: FileText },
  { href: "/post", label: "Ask", icon: HelpCircle },
];

export function CreatePostBar() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  async function publish() {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    const body = text.trim();
    if (body.length < 3) {
      toast.error("Write a short update first");
      return;
    }
    setPosting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, post_type: "update" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not post");
        return;
      }
      toast.success("Posted to the community feed");
      setText("");
      setOpen(false);
      router.refresh();
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-3 sm:p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <ImageIcon className="h-4 w-4 text-primary" />
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 rounded-full border border-border/70 bg-muted/40 px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground transition"
        >
          Share an update, opportunity, or listing…
        </button>
        <Button size="sm" className="hidden sm:inline-flex h-9 rounded-full px-4" asChild>
          <Link href="/post">Post</Link>
        </Button>
      </div>

      {open ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="What's on your mind? (community update)"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={publish} disabled={posting}>
              {posting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Publish
            </Button>
          </div>
        </div>
      ) : null}

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
