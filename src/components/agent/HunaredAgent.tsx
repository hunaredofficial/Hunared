"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  Minimize2,
  Command,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Power,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { AgentAction, ConversationContext } from "@/lib/agent/engine";
import { toast } from "sonner";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  action?: AgentAction;
};

const COMMAND_PACKS = [
  {
    title: "Jobs & career",
    commands: [
      { label: "Instrument jobs SA", text: "Find Instrument Technician jobs in Saudi Arabia" },
      { label: "Jobs in Jubail", text: "Find jobs in Jubail" },
      { label: "Match my profile", text: "Find jobs matching my profile" },
      { label: "Career roadmap", text: "Help me build a career roadmap" },
      { label: "Interview prep", text: "Help me prepare for an interview" },
    ],
  },
  {
    title: "CV",
    commands: [
      { label: "Open CV Builder", text: "Open CV Builder" },
      { label: "Improve CV", text: "Help me improve my CV" },
      { label: "Cover letter", text: "Help me write a cover letter" },
    ],
  },
  {
    title: "Marketplace",
    commands: [
      { label: "For sale", text: "Browse marketplace for sale" },
      { label: "Accommodation", text: "Find accommodation" },
      { label: "Services", text: "Find services near me" },
    ],
  },
  {
    title: "Learning & account",
    commands: [
      { label: "Courses", text: "Find courses to improve my skills" },
      { label: "Saved items", text: "Show my saved items" },
      { label: "AI settings", text: "Open AI settings" },
    ],
  },
];

function contextualSuggestions(path: string): string[] {
  if (path.startsWith("/jobs/")) {
    return [
      "Am I qualified for this job?",
      "Find similar jobs",
      "Improve my CV for this job",
      "Explain the requirements",
    ];
  }
  if (path.startsWith("/jobs")) {
    return [
      "Find HSE Officer jobs in Saudi Arabia",
      "Jobs in Jubail",
      "Show permanent jobs",
    ];
  }
  if (path.startsWith("/market")) {
    return ["Find used laptops", "Find accommodation", "Find electrical services"];
  }
  if (path.includes("/cv")) {
    return [
      "Improve my professional summary",
      "Make my CV ATS-friendly",
      "Help me write a cover letter",
    ];
  }
  if (path.startsWith("/companies")) {
    return ["Show company jobs", "Find companies hiring technicians"];
  }
  if (path.startsWith("/learning") || path.startsWith("/program")) {
    return ["Will this help my career?", "Find related jobs"];
  }
  return [
    "Find Instrument Technician jobs in Saudi Arabia",
    "Open CV Builder",
    "Browse marketplace",
    "Find courses for my career",
  ];
}

type Props = {
  /** Floating launcher (default) or embedded full panel */
  variant?: "float" | "page";
  className?: string;
};

export function HunaredAgent({ variant = "float", className }: Props) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(variant === "page");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "I'm Hunared AI — I help you find jobs, improve your CV, explore the marketplace, and navigate the platform. What do you need?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [ctx, setCtx] = useState<ConversationContext>({});
  const [aiEnabled, setAiEnabled] = useState(true);
  const [pendingConfirm, setPendingConfirm] = useState<AgentAction | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem("hunared_ai_enabled");
      if (v === "0") setAiEnabled(false);
    } catch {
      /* ignore */
    }
    void fetch("/api/profile/ai-settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && typeof j.ai_enabled === "boolean") {
          setAiEnabled(j.ai_enabled);
          try {
            localStorage.setItem("hunared_ai_enabled", j.ai_enabled ? "1" : "0");
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, loading]);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || loading) return;
      if (!aiEnabled) {
        setMsgs((m) => [
          ...m,
          { id: `u-${Date.now()}`, role: "user", text: q },
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            text: "Hunared AI is OFF for your account. Turn it ON in Dashboard → Settings → Privacy & AI. Jobs, Marketplace, and other features still work normally.",
            action: {
              intent: "ai_settings",
              href: "/dashboard/settings/ai",
              label: "Privacy & AI settings",
              message: "",
            },
          },
        ]);
        return;
      }

      setInput("");
      setShowCommands(false);
      setMsgs((m) => [...m, { id: `u-${Date.now()}`, role: "user", text: q }]);
      setLoading(true);
      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: q, context: ctx, path: pathname }),
        });
        const j = await res.json();
        if (j.disabled) {
          setAiEnabled(false);
          setMsgs((m) => [
            ...m,
            {
              id: `a-${Date.now()}`,
              role: "assistant",
              text: j.action?.message || "Hunared AI is OFF.",
              action: j.action,
            },
          ]);
          return;
        }
        const action = j.action as AgentAction;
        setCtx({
          lastIntent: action.intent,
          lastEntities: action.entities,
          lastHref: action.href,
        });
        setMsgs((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            text: action.message,
            action,
          },
        ]);
        if (action.needsConfirm && action.href) {
          setPendingConfirm(action);
        } else if (action.autoNavigate && action.href) {
          setTimeout(() => router.push(action.href!), 600);
        }
      } catch {
        setMsgs((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            text: "Something went wrong. Please try again, or use the main search and menus.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [aiEnabled, ctx, loading, pathname, router]
  );

  function runAction(action: AgentAction) {
    if (action.needsConfirm) {
      setPendingConfirm(action);
      return;
    }
    if (action.href) router.push(action.href);
  }

  const suggestions = contextualSuggestions(pathname);

  const panel = (
    <div
      className={cn(
        "flex flex-col bg-card border border-border shadow-2xl overflow-hidden",
        variant === "float"
          ? "fixed bottom-20 right-4 z-50 w-[min(100vw-2rem,24rem)] h-[min(70vh,34rem)] rounded-2xl"
          : "w-full h-[min(80vh,40rem)] rounded-2xl",
        className
      )}
    >
      <header className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight flex items-center gap-1.5">
              Hunared AI
              <span
                className={cn(
                  "text-[9px] font-bold uppercase tracking-wide px-1 py-0.5 rounded",
                  aiEnabled
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {aiEnabled ? "On" : "Off"}
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              Career · Marketplace · Learning assistant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => router.push("/dashboard/settings/ai")}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            title="AI settings"
            aria-label="AI settings"
          >
            <Power className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowCommands((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium",
              showCommands ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Command className="h-3.5 w-3.5" />
            Commands
          </button>
          {variant === "float" && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted"
              aria-label="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {!aiEnabled ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
          <p className="text-sm font-medium">Hunared AI is OFF</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            AI assistance and recommendations are disabled for your account. Everything else on
            Hunared still works.
          </p>
          <Button size="sm" onClick={() => router.push("/dashboard/settings/ai")}>
            Turn On Hunared AI
          </Button>
        </div>
      ) : showCommands ? (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {COMMAND_PACKS.map((pack) => (
            <div key={pack.title}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                {pack.title}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pack.commands.map((c) => (
                  <button
                    key={c.text}
                    type="button"
                    onClick={() => void send(c.text)}
                    className="text-[12px] rounded-full border border-border bg-background px-2.5 py-1.5 hover:border-primary/50 hover:bg-primary/5"
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
          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {msgs.map((m) => (
              <div
                key={m.id}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[90%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/60 text-foreground rounded-bl-md"
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.action?.href && m.role === "assistant" && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => runAction(m.action!)}
                      >
                        {m.action.label || "Open"}
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      {m.action.secondary?.map((s) => (
                        <Button
                          key={s.href}
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => router.push(s.href)}
                        >
                          {s.label}
                        </Button>
                      ))}
                    </div>
                  )}
                  {m.role === "assistant" && m.id !== "welcome" && (
                    <div className="mt-1.5 flex gap-1 opacity-60">
                      <button
                        type="button"
                        className="p-0.5 hover:opacity-100"
                        aria-label="Helpful"
                        onClick={() => toast.message("Thanks for the feedback")}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="p-0.5 hover:opacity-100"
                        aria-label="Not helpful"
                        onClick={() => toast.message("Thanks — we'll use this to improve")}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <p className="text-xs text-muted-foreground px-1">Thinking…</p>
            )}
            {msgs.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="text-[11px] rounded-full border border-border px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-primary/40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {pendingConfirm && (
            <div className="mx-3 mb-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs">
              <p className="font-medium text-foreground">Confirm action</p>
              <p className="text-muted-foreground mt-0.5">
                {pendingConfirm.label}: {pendingConfirm.href}
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    if (pendingConfirm.href) router.push(pendingConfirm.href);
                    setPendingConfirm(null);
                  }}
                >
                  Continue
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setPendingConfirm(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <form
            className="border-t border-border p-2 flex gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Hunared AI…"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              disabled={loading}
              aria-label="Message Hunared AI"
            />
            <Button type="submit" size="icon" className="rounded-xl shrink-0" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[9px] text-center text-muted-foreground pb-1.5 px-2">
            AI-generated assistance — verify important information before acting.
          </p>
        </>
      )}
    </div>
  );

  if (variant === "page") return panel;

  return (
    <>
      {open && panel}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-colors",
          open
            ? "bg-muted text-foreground border border-border"
            : "bg-primary text-primary-foreground"
        )}
        aria-label={open ? "Close Hunared AI" : "Open Hunared AI"}
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>
    </>
  );
}
