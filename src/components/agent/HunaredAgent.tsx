"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  X,
  Send,
  Loader2,
  Sparkles,
  ExternalLink,
  Minimize2,
  Command,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceSearchButton } from "@/components/shared/VoiceSearchButton";
import {
  suggestionsForPath,
  COMMAND_PACKS,
  type AgentAction,
  type ConversationContext,
} from "@/lib/agent/engine";

type Msg = {
  id: string;
  role: "user" | "agent";
  text: string;
  action?: AgentAction;
};

export function HunaredAgent() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [context, setContext] = useState<ConversationContext>({});
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "welcome",
      role: "agent",
      text: "I’m Hunared Agent. Search jobs, marketplace, companies, talent — or say what you need. Tap the mic to speak, or open Commands for quick actions.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestions = useMemo(
    () => suggestionsForPath(pathname || "/"),
    [pathname]
  );

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [msgs, open]);

  const navigateTo = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
    },
    [router]
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setInput("");
      setShowCommands(false);
      setMsgs((m) => [
        ...m,
        { id: `u-${Date.now()}`, role: "user", text: trimmed },
      ]);
      setLoading(true);
      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            path: pathname,
            context,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setMsgs((m) => [
            ...m,
            {
              id: `e-${Date.now()}`,
              role: "agent",
              text:
                (data as { error?: string }).error ||
                "Something went wrong. Please try again.",
            },
          ]);
          return;
        }
        const action = (data as { action: AgentAction }).action;
        const nextCtx = (data as { context?: ConversationContext }).context;
        if (nextCtx) setContext(nextCtx);

        setMsgs((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: "agent",
            text: action.message,
            action,
          },
        ]);

        // Auto-navigate high-confidence search/navigate intents after brief pause
        if (action.autoNavigate && action.href) {
          window.setTimeout(() => {
            navigateTo(action.href!);
          }, 900);
        }
      } catch {
        setMsgs((m) => [
          ...m,
          {
            id: `e-${Date.now()}`,
            role: "agent",
            text: "Network error. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, pathname, context, navigateTo]
  );

  function onVoice(transcript: string) {
    setInput(transcript);
    // Auto-send voice for snappy UX
    void send(transcript);
  }

  if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open Hunared Agent"
        className={cn(
          "fixed z-[90] bottom-5 right-5 sm:bottom-6 sm:right-6",
          "h-14 w-14 rounded-full shadow-lg brand-glow",
          "bg-primary text-primary-foreground",
          "flex items-center justify-center",
          "hover:scale-105 active:scale-95 transition-transform",
          open && "ring-2 ring-primary/50"
        )}
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {open && (
        <div
          className={cn(
            "fixed z-[90] bottom-24 right-3 left-3 sm:left-auto sm:right-6",
            "sm:w-[420px] h-[min(78vh,640px)]",
            "flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          )}
        >
          {/* Header */}
          <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 via-secondary/30 to-transparent">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  Hunared Agent
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Understand · Search · Navigate · Guide
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowCommands((v) => !v)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors",
                  showCommands
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title="Command library"
              >
                <Command className="h-3.5 w-3.5" />
                Commands
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Minimize"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Command library */}
          {showCommands ? (
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
              {COMMAND_PACKS.map((pack) => (
                <div key={pack.title}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 px-0.5">
                    {pack.title}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {pack.commands.map((c) => (
                      <button
                        key={c.text}
                        type="button"
                        onClick={() => send(c.text)}
                        className="text-[12px] rounded-full border border-border bg-background px-2.5 py-1.5 text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {msgs.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex",
                      m.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted/80 text-foreground rounded-bl-md border border-border/40"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      {m.action?.href && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => navigateTo(m.action!.href!)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 text-primary px-2.5 py-1 text-xs font-semibold hover:bg-primary/25 transition-colors"
                          >
                            {m.action.label}
                            <ExternalLink className="h-3 w-3" />
                          </button>
                          {m.action.secondary?.map((s) => (
                            <button
                              key={s.href}
                              type="button"
                              onClick={() => navigateTo(s.href)}
                              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                            >
                              {s.label}
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          ))}
                        </div>
                      )}
                      {m.action?.autoNavigate && m.action.href && (
                        <p className="mt-1.5 text-[10px] text-muted-foreground">
                          Opening automatically…
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    Understanding your request…
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Smart suggestions */}
              <div className="px-3 pb-2 flex flex-wrap gap-1.5 border-t border-border/50 pt-2 max-h-[72px] overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    disabled={loading}
                    className="text-[11px] rounded-full border border-border bg-background px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Input + voice */}
          <form
            className="flex items-center gap-1.5 px-3 py-3 border-t border-border bg-secondary/20"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <VoiceSearchButton onResult={onVoice} size="md" />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask or command Hunared…"
              className="flex-1 h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              disabled={loading}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
