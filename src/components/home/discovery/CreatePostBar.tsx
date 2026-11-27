"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Briefcase,
  Calendar,
  FileText,
  HelpCircle,
  ImageIcon,
  Loader2,
  MessageCircle,
  PenSquare,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SHORTCUTS = [
  { href: "/dashboard/jobs/new", label: "Job", icon: Briefcase },
  { href: "/dashboard/business/new", label: "Listing", icon: ShoppingBag },
  { href: "/dashboard/articles/new", label: "Article", icon: FileText },
  { href: "/post", label: "Full post", icon: PenSquare },
];

const POST_TYPES = [
  { id: "update", label: "Update", icon: PenSquare },
  { id: "question", label: "Question", icon: HelpCircle },
  { id: "discussion", label: "Discussion", icon: MessageCircle },
  { id: "event", label: "Event", icon: Calendar },
] as const;

export function CreatePostBar() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [postType, setPostType] =
    useState<(typeof POST_TYPES)[number]["id"]>("update");
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
        body: JSON.stringify({
          body,
          title: title.trim() || undefined,
          post_type: postType,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not post");
        return;
      }
      toast.success("Posted to the community feed");
      setText("");
      setTitle("");
      setPostType("update");
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
          Share an update, question, or discussion…
        </button>
        <Button size="sm" className="hidden sm:inline-flex h-9 rounded-full px-4" asChild>
          <Link href="/post">Post</Link>
        </Button>
      </div>

      {open ? (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {POST_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPostType(t.id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                  postType === t.id
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <t.icon className="h-3 w-3" />
                {t.label}
              </button>
            ))}
          </div>
          {(postType === "event" || postType === "discussion") && (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={postType === "event" ? "Event title" : "Topic title (optional)"}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder={
              postType === "question"
                ? "What would you like to ask the community?"
                : postType === "event"
                  ? "Event details, date, location…"
                  : "Share with the Hunared community…"
            }
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
