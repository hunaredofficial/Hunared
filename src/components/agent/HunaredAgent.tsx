"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  X,
  Send,
  Loader2,
  Sparkles,
  ExternalLink,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { suggestionsForPath, type AgentAction } from "@/lib/agent/engine";

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
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "welcome",
      role: "agent",
      text: "I’m Hunared Agent. Tell me what you need — jobs, marketplace, companies, or help navigating the platform.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const suggestions = suggestionsForPath(pathname || "/");

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setInput("");
      const userMsg: Msg = {
        id: `u-${Date.now()}`,
        role: "user",
        text: trimmed,
      };
      setMsgs((m) => [...m, userMsg]);
      setLoading(true);
      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, path: pathname }),
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
        setMsgs((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: "agent",
            text: action.message,
            action,
          },
        ]);
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
    [loading, pathname]
  );

  function runAction(action: AgentAction) {
    if (!action.href) return;
    // Verified navigation only — never claim done without this
    router.push(action.href);
    setOpen(false);
  }

  // Hide on pure auth screens if desired — keep available most places
  if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
    return null;
  }

  return (
    <>
      {/* Launcher */}
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
          open && "ring-2 ring-primary/40"
        )}
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          className={cn(
            "fixed z-[90] bottom-24 right-4 sm:right-6",
            "w-[min(100vw-1.5rem,400px)] h-[min(70vh,560px)]",
            "flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          )}
        >
          <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-secondary/40">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  Hunared Agent
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Search · Guide · Navigate
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </header>

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
                    "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/80 text-foreground rounded-bl-md"
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.action?.href && (
                    <button
                      type="button"
                      onClick={() => runAction(m.action!)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      {m.action.label}
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          <div className="px-3 pb-2 flex flex-wrap gap-1.5 border-t border-border/60 pt-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="text-[11px] rounded-full border border-border bg-background px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-2 px-3 py-3 border-t border-border"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Hunared Agent…"
              className="flex-1 h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
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
