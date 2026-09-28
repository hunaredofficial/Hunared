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
  User,
  Trash2,
  Paperclip,
  FileText,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { buildReplySuggestions } from "@/lib/messages/reply-suggestions";

/**
 * Cloudinary message attachments:
 * - /raw/upload/ often returns 401 on unsigned presets
 * - /image/upload/fl_attachment/ often returns invalid response
 * Use public /image/upload/ delivery (same as working Hunared CV images).
 */
function fixAttachmentUrl(url: string): string {
  if (!url) return url;
  let u = url.startsWith("http://") ? url.replace("http://", "https://") : url;
  u = u.replace(/\/(?:raw|video)\/upload\//g, "/image/upload/");
  u = u.replace(/\/fl_attachment\//g, "/");
  u = u.replace(/\/upload\/fl_attachment\//g, "/upload/");
  return u;
}


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
  message_type?: string;
  metadata?: {
    fileUrl?: string;
    storagePath?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
  } | null;
  sender?: {
    id: string;
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
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
  const [contextQuick, setContextQuick] = useState<string[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
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
        try {
          const raw = sessionStorage.getItem(`hunared_msg_suggestions_${activeId}`);
          if (raw) {
            const arr = JSON.parse(raw) as string[];
            if (Array.isArray(arr) && arr.length) setContextQuick(arr);
          } else {
            setContextQuick(null);
          }
        } catch {
          setContextQuick(null);
        }
      })
      .finally(() => setLoadingChat(false));
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (draftFromUrl) setText(draftFromUrl);
  }, [draftFromUrl]);

  async function send(payload?: {
    body?: string;
    messageType?: string;
    metadata?: Record<string, unknown>;
  }) {
    if (!activeId || sending) return;
    const bodyText = payload?.body ?? text;
    if (!bodyText.trim() && !payload?.metadata) return;
    const optimistic: Msg = {
      id: `tmp-${Date.now()}`,
      sender_id: currentUserId,
      body: bodyText || String((payload?.metadata as { fileName?: string })?.fileName || ""),
      created_at: new Date().toISOString(),
      message_type: payload?.messageType || "text",
      metadata: (payload?.metadata as Msg["metadata"]) || null,
      sender: { id: currentUserId, full_name: "You", username: null, avatar_url: null },
    };
    setText("");
    setMessages((prev) => [...prev, optimistic]);
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${activeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: bodyText,
          messageType: payload?.messageType,
          metadata: payload?.metadata,
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        toast.error(j.error || "Send failed");
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        return;
      }
      // Light refresh — replace temp id only
      if (j.messageId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? { ...m, id: j.messageId } : m))
        );
      }
      // Refresh list in background (do not block chat)
      void loadList();
    } catch {
      toast.error("Send failed");
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  }

  async function onPickFile(file: File | null) {
    if (!file || !activeId) return;
    const max = 12 * 1024 * 1024;
    if (file.size > max) {
      toast.error("File too large (max 12MB)");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("conversationId", activeId);
      const res = await fetch("/api/messages/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) {
        toast.error(j.error || "Upload failed");
        return;
      }
      const isImage = (file.type || "").startsWith("image/");
      await send({
        body: isImage ? "" : `📎 ${file.name}`,
        messageType: isImage ? "image" : "file",
        metadata: {
          fileUrl: j.url,
          storagePath: j.storagePath,
          fileName: j.fileName || file.name,
          fileType: j.fileType || file.type || "application/octet-stream",
          fileSize: j.fileSize || file.size,
        },
      });
      toast.success("Attachment sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function archive(on: boolean) {
    if (!activeId) return;
    await fetch(`/api/messages/${activeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archive: on }),
    });
    toast.success(on ? "Archived" : "Removed from archive");
    if (on) router.push("/dashboard/messages");
    void loadList();
  }

  async function blockUser() {
    const blockedId =
      other?.id ||
      messages.find((m) => m.sender_id !== currentUserId)?.sender_id ||
      null;
    if (!blockedId) {
      toast.error("Cannot identify user to block. Re-open the conversation and try again.");
      return;
    }
    if (!confirm("Block this user? They will not be able to message you.")) return;
    try {
      const res = await fetch("/api/messages/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedId }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("User blocked");
        void deleteChat();
      } else {
        toast.error(j.error || "Could not block user");
      }
    } catch {
      toast.error("Could not block user");
    }
  }

  async function reportUser() {
    const reportedUserId =
      other?.id ||
      messages.find((m) => m.sender_id !== currentUserId)?.sender_id ||
      null;
    if (!reportedUserId) {
      toast.error("Cannot identify user to report. Re-open the conversation and try again.");
      return;
    }
    const reason = prompt(
      "Reason:\nspam · scam · harassment · fake job · fake listing · abuse · other",
      "spam"
    );
    if (!reason) return;
    const details = prompt("Optional details:") || "";
    try {
      const res = await fetch("/api/messages/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeId,
          reportedUserId,
          reason,
          details,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) toast.success("Report submitted. Thank you.");
      else toast.error(j.error || "Could not submit report");
    } catch {
      toast.error("Could not submit report");
    }
  }

  async function deleteChat() {
    if (!activeId) return;
    if (!confirm("Remove this conversation from your inbox? The other person will keep their copy.")) return;
    const res = await fetch(`/api/messages/${activeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleteForMe: true }),
    });
    if (!res.ok) {
      toast.error("Could not delete conversation");
      return;
    }
    toast.success("Conversation removed");
    router.push("/dashboard/messages");
    void loadList();
  }

  async function deleteMsg(messageId: string) {
    if (!activeId || !confirm("Delete this message?")) return;
    const res = await fetch(`/api/messages/${activeId}?messageId=${encodeURIComponent(messageId)}`, {
      method: "DELETE",
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(j.error || "Could not delete");
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    toast.success("Message deleted");
  }

  // Smart chips: reply to last inbound message, else context openers
  const lastInbound = [...messages].reverse().find((m) => m.sender_id !== currentUserId);
  const replyChips = lastInbound
    ? buildReplySuggestions({
        lastMessage: lastInbound.body,
        contextType: conv?.context_type,
        contextTitle: conv?.context_title,
      })
    : [];
  const quick =
    replyChips.length > 0
      ? replyChips
      : contextQuick?.length
        ? contextQuick
        : QUICK[conv?.context_type || ""] || QUICK.default;

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
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden text-muted-foreground">
                  {c.other?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.other.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className={cn("text-xs truncate", c.unread && "font-semibold")}>
                      {c.other?.full_name ||
                        (c.other?.username ? `@${c.other.username}` : null) ||
                        c.context_subtitle ||
                        c.context_title ||
                        "Participant"}
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
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden text-muted-foreground">
              {other?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={other.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">
                {other?.full_name || other?.username || "Conversation"}
              </p>
              {other?.username && other?.full_name ? (
                <p className="text-[11px] text-muted-foreground truncate">@{other.username}</p>
              ) : null}
              {conv?.context_title && (
                <p className="text-[11px] text-muted-foreground truncate">
                  {conv.context_title}
                  {conv.context_subtitle ? ` · ${conv.context_subtitle}` : ""}
                </p>
              )}
            </div>
            <button type="button" className="p-1.5 rounded-lg hover:bg-muted" title={filter === "archived" ? "Unarchive" : "Archive"} onClick={() => void archive(filter !== "archived")}>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </button>
            <button type="button" className="p-1.5 rounded-lg hover:bg-muted" title="Delete conversation" onClick={() => void deleteChat()}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
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
              const displayName =
                m.sender?.full_name ||
                (m.sender?.username ? `@${m.sender.username}` : null) ||
                (mine ? "You" : other?.full_name || other?.username || "User");
              return (
                <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed group relative",
                      mine
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    )}
                  >
                    <p
                      className={cn(
                        "text-[10px] font-semibold mb-0.5",
                        mine ? "text-primary-foreground/80" : "text-foreground/80"
                      )}
                    >
                      {displayName}
                    </p>
                    {m.metadata?.fileUrl && (
                      <div className="mb-1.5">
                        {m.message_type === "image" ||
                        (m.metadata.fileType || "").startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <a href={fixAttachmentUrl(m.metadata.fileUrl)} target="_blank" rel="noopener noreferrer">
                            <img
                              src={fixAttachmentUrl(m.metadata.fileUrl)}
                              alt={m.metadata.fileName || "Image"}
                              className="max-h-48 rounded-lg border border-white/10"
                            />
                          </a>
                        ) : (
                          <a
                            href={
                              m.metadata.storagePath
                                ? `/api/messages/file?path=${encodeURIComponent(m.metadata.storagePath)}`
                                : fixAttachmentUrl(m.metadata.fileUrl || "")
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[12px] underline"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            {m.metadata.fileName || "Download file"}
                          </a>
                        )}
                      </div>
                    )}
                    {m.body ? (
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    ) : null}
                    <div className="flex items-center gap-2 mt-1">
                      <p
                        className={cn(
                          "text-[9px]",
                          mine ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}
                      >
                        {new Date(m.created_at).toLocaleString()}
                      </p>
                      {mine && (
                        <button
                          type="button"
                          className={cn(
                            "text-[9px] underline opacity-70 hover:opacity-100 transition-opacity",
                            mine ? "text-primary-foreground/90" : "text-muted-foreground"
                          )}
                          onClick={() => void deleteMsg(m.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
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
              className="flex gap-1.5 items-center"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,application/pdf"
                onChange={(e) => void onPickFile(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                className="p-2 rounded-xl text-muted-foreground hover:bg-muted shrink-0"
                title="Attach image, CV or file"
                disabled={uploading || sending}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a message…"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                maxLength={4000}
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-xl shrink-0"
                disabled={sending || uploading || !text.trim()}
              >
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
