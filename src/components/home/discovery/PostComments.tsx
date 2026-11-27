"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Comment = {
  id: string;
  body: string;
  author_name?: string;
  created_at: string;
};

export function PostComments({ postId }: { postId: string }) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    fetch(`/api/community/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((d) => {
        if (alive) setItems(d.items ?? []);
      })
      .catch(() => null)
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open, postId]);

  async function send() {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not comment");
        return;
      }
      setText("");
      setItems((prev) => [
        ...prev,
        {
          id: data.comment?.id ?? String(Date.now()),
          body,
          author_name: "You",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-muted-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        <MessageCircle className="h-3.5 w-3.5 mr-1" />
        {open ? "Hide" : "Comment"}
        {items.length > 0 ? ` (${items.length})` : ""}
      </Button>

      {open ? (
        <div className="mt-2 space-y-2 rounded-xl border border-border/50 bg-muted/20 p-3">
          {loading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-xs text-muted-foreground">No comments yet — be first.</p>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((c) => (
                <li key={c.id} className="text-sm">
                  <span className="font-semibold text-foreground text-xs">
                    {c.author_name ?? "Member"}
                  </span>
                  <p className="text-muted-foreground text-xs mt-0.5 whitespace-pre-wrap">
                    {c.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment…"
              className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <Button size="sm" className="h-8 px-2" disabled={sending} onClick={send}>
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
