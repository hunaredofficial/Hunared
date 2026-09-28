"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  Ban,
  Flag,
  Loader2,
  MessageSquare,
  Search,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Conv = {
  id: string;
  context_type: string;
  context_title: string | null;
  context_subtitle: string | null;
  context_href: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread?: boolean;
  other?: {
    id: string;
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
    profession?: string | null;
    company_name?: string | null;
  } | null;
};

type Msg = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "job", label: "Jobs" },
  { id: "marketplace", label: "Marketplace" },
  { id: "talent", label: "Talent" },
  { id: "company", label: "Companies" },
  { id: "archived", label: "Archived" },
];

const QUICK: Record<string, string[]> = {
  job: [
    "Is this position still open?",
    "Could you share more about the role?",
    "Is accommodation provided?",
  ],
  marketplace: [
    "Is this still available?",
    "Is the price negotiable?",
    "Where is the item located?",
  ],
  service: ["Are you available?", "What is your price?", "Can you provide a quotation?"],
  default: ["Hello!", "Thank you.", "I'll get back to you soon."],
};

export function MessagesInbox({ currentUserId }: { currentUserId: string }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeId = (params?.id as string) || "";
  const draftFromUrl = searchParams?.get("draft") || "";

  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [list, setList] = useState<Conv[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [conv, setConv] = useState<Conv | null>(null);
  const [other, setOther] = useState<Conv["other"]>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [text, setText] = useState(draftFromUrl);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch(
        `/api/messages/conversations?filter=${encodeURIComponent(filter)}&q=${encodeURIComponent(q)}`
      );
      const j = await res.json();
      setList(j.conversations || []);
    } finally {
      setLoadingList(false);
    }
  }, [filter, q]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      setConv(null);
      setOther(null);
      return;
    }
    setLoadingChat(true);
    void fetch(`/api/messages/${activeId}`)
      .then((r) => r.json())
      .then((j) => {
        setMessages(j.messages || []);
        setConv(j.conversation);
        setOther(j.other);
      })
      .finally(() => setLoadingChat(false));
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (draftFromUrl) setText(draftFromUrl);
  }, [draftFromUrl]);

  async function send() {
    if (!activeId || !text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${activeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const j = await res.json();
      if (!res.ok) {
        toast.error(j.error || "Send failed");
        return;
      }
      setText("");
      // reload messages
      const r2 = await fetch(`/api/messages/${activeId}`);
      const j2 = await r2.json();
      setMessages(j2.messages || []);
      void loadList();
    } finally {
      setSending(false);
    }
  }

  async function archive() {
    if (!activeId) return;
    await fetch(`/api/messages/${activeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archive: true }),
    });
    toast.success("Archived");
    router.push("/dashboard/messages");
    void loadList();
  }

  async function blockUser() {
    if (!other?.id) return;
    if (!confirm("Block this user? They will not be able to message you.")) return;
    const res = await fetch("/api/messages/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedId: other.id }),
    });
    if (res.ok) toast.success("User blocked");
    else toast.error("Could not block");
  }

  async function reportUser() {
    if (!other?.id) return;
    const reason = prompt("Reason (spam, scam, harassment, fake job, other):", "spam");
    if (!reason) return;
    const res = await fetch("/api/messages/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: activeId,
        reportedUserId: other.id,
        reason,
      }),
    });
    if (res.ok) toast.success("Report submitted");
    else toast.error("Could not report");
  }

  const quick =
    QUICK[conv?.context_type || ""] || QUICK.default;

  const listPane = (
    <div className="flex flex-col h-full border-r border-border bg-card/40">
      <div className="p-3 border-b border-border space-y-2">
        <h1 className="text-sm font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Messages
        </h1>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search messages…"
            className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full border transition-colors",
                filter === f.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loadingList ? (
          <div className="p-6 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : list.length === 0 ? (
          <div className="p-6 text-center space-y-3">
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs text-muted-foreground">
              Conversations appear when you message about a job, listing, or profile.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/jobs">Explore Jobs</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/market">Marketplace</Link>
              </Button>
            </div>
          </div>
        ) : (
          list.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => router.push(`/dashboard/messages/${c.id}`)}
              className={cn(
                "w-full text-left px-3 py-2.5 border-b border-border/50 hover:bg-muted/40 transition-colors",
                activeId === c.id && "bg-primary/10"
              )}
            >
              <div className="flex items-start gap-2">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden">
                  {c.other?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.other.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (c.other?.full_name || c.other?.username || "?")[0]?.toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className={cn("text-xs truncate", c.unread && "font-semibold")}>
                      {c.other?.full_name || c.other?.username || "User"}
                    </p>
                    {c.unread && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  {c.context_title && (
                    <p className="text-[10px] text-primary/80 truncate">{c.context_title}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground truncate">
                    {c.last_message_preview || "No messages"}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  const chatPane = (
    <div className="flex flex-col h-full bg-background">
      {!activeId ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <MessageSquare className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm font-medium text-foreground">Select a conversation</p>
          <p className="text-xs mt-1 max-w-xs">
            Or open a job, listing, or profile and click Message.
          </p>
        </div>
      ) : loadingChat ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <header className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
            <button
              type="button"
              className="md:hidden p-1.5 rounded-lg hover:bg-muted"
              onClick={() => router.push("/dashboard/messages")}
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">
                {other?.full_name || other?.username || "Conversation"}
              </p>
              {conv?.context_title && (
                <p className="text-[11px] text-muted-foreground truncate">
                  {conv.context_title}
                  {conv.context_subtitle ? ` · ${conv.context_subtitle}` : ""}
                </p>
              )}
            </div>
            <button type="button" className="p-1.5 rounded-lg hover:bg-muted" title="Archive" onClick={() => void archive()}>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </button>
            <button type="button" className="p-1.5 rounded-lg hover:bg-muted" title="Block" onClick={() => void blockUser()}>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </button>
            <button type="button" className="p-1.5 rounded-lg hover:bg-muted" title="Report" onClick={() => void reportUser()}>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </button>
          </header>

          {conv?.context_title && (
            <div className="mx-3 mt-2 rounded-lg border border-border bg-muted/30 px-3 py-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {conv.context_type}
                </p>
                <p className="text-xs font-medium truncate">{conv.context_title}</p>
                {conv.context_subtitle && (
                  <p className="text-[11px] text-muted-foreground truncate">{conv.context_subtitle}</p>
                )}
              </div>
              {conv.context_href && (
                <Button size="sm" variant="outline" className="h-7 text-[11px] shrink-0" asChild>
                  <Link href={conv.context_href}>View</Link>
                </Button>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.map((m) => {
              const mine = m.sender_id === currentUserId;
              return (
                <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
                      mine
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p
                      className={cn(
                        "text-[9px] mt-1",
                        mine ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {new Date(m.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border p-2 space-y-1.5">
            <div className="flex flex-wrap gap-1 px-0.5">
              {quick.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setText(s)}
                  className="text-[10px] rounded-full border border-border px-2 py-0.5 text-muted-foreground hover:text-foreground hover:border-primary/40"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              className="flex gap-1.5"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a message…"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                maxLength={4000}
              />
              <Button type="submit" size="icon" className="rounded-xl shrink-0" disabled={sending || !text.trim()}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[480px] rounded-xl border border-border overflow-hidden grid md:grid-cols-[minmax(260px,320px)_1fr]">
      <div className={cn("min-h-0", activeId ? "hidden md:flex md:flex-col" : "flex flex-col")}>
        {listPane}
      </div>
      <div className={cn("min-h-0", !activeId ? "hidden md:flex md:flex-col" : "flex flex-col")}>
        {chatPane}
      </div>
    </div>
  );
}
