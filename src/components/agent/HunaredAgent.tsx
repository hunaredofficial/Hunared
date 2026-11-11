"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
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
  Briefcase,
  ShoppingBag,
  GraduationCap,
  FileText,
  Building2,
  Users,
  MessageSquare,
  Settings,
  MapPin,
  ArrowRight,
  Loader2,
  Mic,
  MicOff,
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

const QUICK_START = [
  { icon: Briefcase, label: "Find jobs", text: "Find instrument technician jobs in Saudi Arabia" },
  { icon: FileText, label: "CV Builder", text: "Open CV Builder" },
  { icon: ShoppingBag, label: "Marketplace", text: "Browse marketplace for sale" },
  { icon: Users, label: "Talent", text: "Show candidates available for hire" },
  { icon: Building2, label: "Companies", text: "Show companies hiring in Saudi Arabia" },
  { icon: MessageSquare, label: "Messages", text: "Open my messages" },
  { icon: GraduationCap, label: "Programs", text: "Open Hunared programs" },
  { icon: MapPin, label: "Finder", text: "Open Finder Center" },
  { icon: Settings, label: "Settings", text: "Open settings" },
];

function contextualSuggestions(path: string): string[] {
  if (path.startsWith("/jobs")) {
    return [
      "How do I search for jobs?",
      "Show permanent roles",
      "Open temporary jobs",
      "How do I post a job?",
    ];
  }
  if (path.startsWith("/market")) {
    return [
      "How does the marketplace work?",
      "Browse services",
      "How do I post a listing?",
      "Open Finder Center",
    ];
  }
  if (path.includes("/cv")) {
    return [
      "How do I upload my old CV?",
      "Make my CV ATS-friendly",
      "Open CV Builder",
      "Improve my professional summary",
    ];
  }
  if (path.startsWith("/companies")) {
    return [
      "How do I find companies?",
      "Show hiring companies",
      "How do I post a job?",
    ];
  }
  if (path.startsWith("/candidates")) {
    return [
      "How does Talent work?",
      "Who is available for hire?",
      "Create candidate profile",
    ];
  }
  if (path.startsWith("/learning") || path.startsWith("/education")) {
    return [
      "Open Training Courses",
      "Open Programs",
      "How does learning help my career?",
    ];
  }
  if (path.startsWith("/dashboard/messages")) {
    return [
      "How do I message a seller?",
      "How do messages work?",
      "What can you do?",
    ];
  }
  if (path.startsWith("/dashboard/settings") || path.startsWith("/ai-settings")) {
    return [
      "How do I hide the AI agent?",
      "Open account settings",
      "What can you do?",
    ];
  }
  if (path.startsWith("/finder")) {
    return [
      "How does Finder Center work?",
      "Report a lost item",
      "Report a found item",
    ];
  }
  return [
    "How does Hunared work?",
    "Find jobs",
    "Open CV Builder",
    "Open Finder Center",
    "How do I post a job?",
    "How do I change account type?",
    "Open Programs",
    "Is Hunared free?",
  ];
}

/** Light markdown: **bold** and newlines */
function renderText(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {i > 0 && <br />}
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={j} className="font-semibold text-foreground">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith("•") || part.startsWith("- ")) {
            return (
              <span key={j} className="text-muted-foreground">
                {part}
              </span>
            );
          }
          return <span key={j}>{part}</span>;
        })}
      </span>
    );
  });
}

type Props = {
  variant?: "float" | "page";
  className?: string;
};

export function HunaredAgent({ variant = "float", className }: Props) {
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => {
    setPortalReady(true);
  }, []);
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const [agentActions, setAgentActions] = useState(false);
  const [open, setOpen] = useState(variant === "page");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "I'm **Hunared AI** — your signed-in guide to the whole platform.\n\nAsk about **jobs**, **marketplace**, **CV**, **companies**, **learning**, or **how to use Hunared**.\n\nWith **Agent actions** ON I can also open create/post forms pre-filled from your words.\n\nPick a shortcut or type anything.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [ctx, setCtx] = useState<ConversationContext>({});
  const [aiEnabled, setAiEnabled] = useState(true);
  const [listening, setListening] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    const apply = (enabled: boolean, actions?: boolean) => {
      setAiEnabled(enabled);
      if (typeof actions === "boolean") setAgentActions(actions);
      try {
        localStorage.setItem("hunared_ai_enabled", enabled ? "1" : "0");
        if (typeof actions === "boolean") {
          localStorage.setItem("hunared_ai_agent_actions", actions ? "1" : "0");
        }
      } catch {
        /* ignore */
      }
    };
    try {
      if (localStorage.getItem("hunared_ai_agent_actions") === "1") setAgentActions(true);
    } catch {
      /* ignore */
    }
    try {
      if (localStorage.getItem("hunared_ai_enabled") === "0") setAiEnabled(false);
    } catch {
      /* ignore */
    }
    void (async () => {
      try {
        const res = await fetch("/api/profile/settings");
        if (res.ok) {
          const j = await res.json();
          if (typeof j.ai_enabled === "boolean") {
            apply(j.ai_enabled, typeof j.ai_agent_actions === "boolean" ? j.ai_agent_actions : undefined);
            return;
          }
        }
      } catch {
        /* ignore */
      }
      try {
        const res = await fetch("/api/profile/ai-settings");
        if (res.ok) {
          const j = await res.json();
          if (typeof j.ai_enabled === "boolean") apply(j.ai_enabled, typeof j.ai_agent_actions === "boolean" ? j.ai_agent_actions : undefined);
        }
      } catch {
        /* ignore */
      }
    })();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "hunared_ai_enabled" && e.newValue != null) {
        setAiEnabled(e.newValue !== "0");
      }
    };
    const onCustom = () => {
      try {
        setAiEnabled(localStorage.getItem("hunared_ai_enabled") !== "0");
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("hunared-ai-settings-changed", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("hunared-ai-settings-changed", onCustom);
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, loading]);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || loading) return;

      if (!authLoaded) return;

      if (!isSignedIn) {
        setMsgs((m) => [
          ...m,
          { id: `u-${Date.now()}`, role: "user", text: q },
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            text: "**Sign in required** to use Hunared AI.\n\nCreate a free account or sign in to search, get guidance, and run agent actions.",
            action: {
              intent: "sign_in",
              href: `/sign-in?redirect_url=${encodeURIComponent(pathname || "/")}`,
              label: "Sign in",
              message: "",
              secondary: [{ label: "Register", href: "/register" }],
            },
          },
        ]);
        return;
      }

      if (!aiEnabled) {
        setMsgs((m) => [
          ...m,
          { id: `u-${Date.now()}`, role: "user", text: q },
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            text: "Hunared AI is **OFF** for your account.\n\nJobs, Marketplace, and other features still work. Turn AI on anytime in Privacy & AI settings.",
            action: {
              intent: "ai_settings",
              href: "/ai-settings",
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
          body: JSON.stringify({ message: q, context: ctx, path: pathname, agentActions }),
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

        // Prefill create forms when Agent actions enabled
        if (
          agentActions &&
          action.entities &&
          (action.intent === "execute_create" ||
            action.intent === "post_listing" ||
            action.intent === "post_job")
        ) {
          try {
            sessionStorage.setItem(
              "hunared_agent_prefill",
              JSON.stringify({
                ...action.entities,
                intent: action.intent,
                raw: q,
                at: Date.now(),
              })
            );
          } catch {
            /* ignore */
          }
        }

        // Auto-navigate high-confidence actions (not broad search dumps)
        if (
          action.autoNavigate &&
          action.href &&
          action.intent !== "search_jobs" &&
          action.intent !== "search_market"
        ) {
          setTimeout(() => router.push(action.href!), 700);
        } else if (
          agentActions &&
          action.href &&
          (action.intent === "execute_create" ||
            action.intent === "post_listing" ||
            action.intent === "post_job")
        ) {
          setTimeout(() => router.push(action.href!), 700);
        }
      } catch {
        setMsgs((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            text: "Something went wrong on my side. Please try again, or use the main search and menus.",
          },
        ]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [aiEnabled, agentActions, authLoaded, ctx, isSignedIn, loading, pathname, router]
  );

  function toggleVoice() {
    const w = window as unknown as {
      webkitSpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
      SpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      toast.message("Voice input is not supported in this browser");
      return;
    }
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript;
      if (transcript) {
        setInput(transcript);
        void send(transcript);
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }

  const suggestions = contextualSuggestions(pathname);

  // Always show the floating launcher. When AI is off, panel explains how to turn it on.
  const panel = (
    <div
      className={cn(
        "flex flex-col overflow-hidden border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl",
        variant === "float"
          ? "w-[min(100vw-1.5rem,20rem)] h-[min(68vh,30rem)] rounded-2xl shadow-2xl"
          : "w-full h-[min(82vh,42rem)] rounded-2xl",
        className
      )}
      style={
        variant === "float"
          ? {
              position: "fixed",
              right: 16,
              left: "auto",
              bottom: 76,
              zIndex: 9998,
              margin: 0,
              maxHeight: "min(70vh, 32rem)",
            }
          : undefined
      }
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-2 px-3.5 py-3 border-b border-border/60 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative h-9 w-9 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] via-[#c9a227] to-[#8b7355] shadow-md shadow-[#D4AF37]/25">
            <Sparkles className="h-4 w-4 text-[#0a0a0a] relative z-[1]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight flex items-center gap-1.5">
              Hunared AI
              <span
                className={cn(
                  "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                  aiEnabled
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {aiEnabled ? "Online" : "Off"}
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              Jobs · Talent · Market · CV · Guide
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                window.confirm(
                  "Turn OFF Hunared AI permanently? The floating agent will be hidden until you enable it again in Privacy & AI settings."
                )
              ) {
                setAiEnabled(false);
                try {
                  localStorage.setItem("hunared_ai_enabled", "0");
                  window.dispatchEvent(new Event("hunared-ai-settings-changed"));
                } catch {
                  /* ignore */
                }
                void fetch("/api/profile/ai-settings", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ai_enabled: false }),
                }).catch(() => {});
                toast.success("Hunared AI is OFF — agent hidden");
                setOpen(false);
              } else {
                router.push("/ai-settings");
              }
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Power off / Privacy & AI"
            aria-label="Power off Hunared AI"
          >
            <Power className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowCommands((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors",
              showCommands
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted/80"
            )}
          >
            <Command className="h-3.5 w-3.5" />
            Menu
          </button>
          {variant === "float" && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted/80"
              aria-label="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {!aiEnabled ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
            <Power className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold">Hunared AI is off</p>
          <p className="text-xs text-muted-foreground max-w-[16rem] leading-relaxed">
            AI assistance is disabled for your account. Everything else on Hunared still works.
          </p>
          <Button size="sm" className="mt-1" onClick={() => router.push("/ai-settings")}>
            Turn on in settings
          </Button>
        </div>
      ) : showCommands ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <p className="text-[11px] font-medium text-muted-foreground px-0.5">
            Shortcuts — tap to run
          </p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_START.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => void send(item.text)}
                className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-3 py-2.5 text-left hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <item.icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="space-y-2 pt-1">
            {[
              "How does Hunared work?",
              "How do I post a job?",
              "How do I post a marketplace ad?",
              "How does Hunared work?",
              "How do I post a job?",
              "How do I create a CV?",
              "Show candidates available for hire",
              "Is Hunared free?",
              "How do I stay safe on Hunared?",
              "Contact support",
              "What can you do?",
            ].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => void send(t)}
                className="w-full text-left text-[12px] rounded-lg border border-border/50 px-3 py-2 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
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
                    "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/50 border border-border/40 text-foreground rounded-bl-md"
                  )}
                >
                  <div className={cn(m.role === "assistant" && "text-[13px]")}>
                    {m.role === "assistant" ? renderText(m.text) : m.text}
                  </div>

                  {m.action?.href && m.role === "assistant" && (
                    <div className="mt-2.5 rounded-xl border border-border/60 bg-background/80 p-2.5 space-y-2">
                      <button
                        type="button"
                        onClick={() => router.push(m.action!.href!)}
                        className="w-full flex items-center justify-between gap-2 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold hover:opacity-95 transition-opacity"
                      >
                        <span>{m.action.label || "Open"}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      {m.action.secondary && m.action.secondary.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {m.action.secondary.map((s) => (
                            <button
                              key={s.href}
                              type="button"
                              onClick={() => router.push(s.href)}
                              className="text-[11px] rounded-md border border-border px-2 py-1 text-muted-foreground hover:text-foreground hover:border-primary/40"
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {m.role === "assistant" && m.id !== "welcome" && (
                    <div className="mt-1.5 flex gap-1 opacity-50 hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        className="p-0.5"
                        aria-label="Helpful"
                        onClick={() => toast.message("Thanks — glad that helped")}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="p-0.5"
                        aria-label="Not helpful"
                        onClick={() => toast.message("Thanks — we'll improve this")}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>
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

            {msgs.length <= 1 && !loading && (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {suggestions.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="text-left text-[11px] rounded-xl border border-border/60 px-2.5 py-2 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors leading-snug"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="border-t border-border/60 p-2.5 flex items-center gap-1.5 bg-background/40"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <button
              type="button"
              onClick={toggleVoice}
              className={cn(
                "p-2 rounded-xl shrink-0 transition-colors",
                listening
                  ? "bg-destructive/15 text-destructive"
                  : "text-muted-foreground hover:bg-muted"
              )}
              aria-label={listening ? "Stop listening" : "Voice input"}
              title="Voice input"
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Hunared AI anything…"
              className="flex-1 rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/70"
              disabled={loading}
              aria-label="Message Hunared AI"
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-xl shrink-0 h-10 w-10"
              disabled={loading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[9px] text-center text-muted-foreground/80 pb-2 px-3 leading-tight">
            AI guidance only — verify important details. You stay in control of applications and
            payments.
          </p>
        </>
      )}
    </div>
  );

  if (variant === "page") return panel;

  // Portal to document.body so fixed is always relative to the viewport
  // (not stuck under the footer or trapped by parent transforms).
  const fab = (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes hunared-agent-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-4px) scale(1.04); }
}
@keyframes hunared-agent-ring {
  0% { transform: scale(0.85); opacity: 0.55; }
  70% { transform: scale(1.35); opacity: 0; }
  100% { transform: scale(1.35); opacity: 0; }
}
@keyframes hunared-agent-glow {
  0%, 100% { filter: brightness(1); box-shadow: 0 0 10px rgba(212,175,55,0.35); }
  50% { filter: brightness(1.12); box-shadow: 0 0 18px rgba(212,175,55,0.55); }
}
`,
        }}
      />
      {open && panel}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group h-9 w-9 flex items-center justify-center",
          "rounded-full relative transition-transform duration-300",
          open
            ? "bg-card text-foreground border border-border shadow-lg scale-95"
            : "hover:scale-125 active:scale-95"
        )}
        style={{
          position: "fixed",
          right: 18,
          left: "auto",
          bottom: 20,
          zIndex: 9999,
          margin: 0,
        }}
        aria-label={open ? "Close Hunared AI" : "Open Hunared AI"}
      >
        {open ? (
          <X className="h-4 w-4 relative z-[2]" />
        ) : (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-2 rounded-full border border-[#D4AF37]/25 animate-[hunared-agent-ring_2.8s_ease-out_infinite]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-1 rounded-full border border-[#D4AF37]/40 animate-[hunared-agent-ring_2.8s_ease-out_infinite]"
              style={{ animationDelay: "0.9s" }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full bg-[#D4AF37]/20 animate-ping"
              style={{ animationDuration: "2.6s" }}
            />
            <span
              aria-hidden
              className="absolute inset-0 rounded-full shadow-md shadow-[#D4AF37]/50 animate-[hunared-agent-glow_3.2s_ease-in-out_infinite]"
              style={{
                background:
                  "conic-gradient(from 180deg at 50% 50%, #F5E6B8, #D4AF37, #8B7355, #F0D78C, #D4AF37)",
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-[1.5px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.65) 0%, transparent 42%), linear-gradient(160deg, #E8C96A 0%, #C9A227 55%, #7A6A3A 100%)",
              }}
            />
            <span className="relative z-[2] flex h-full w-full items-center justify-center animate-[hunared-agent-float_2.8s_ease-in-out_infinite]">
              <Sparkles className="h-3.5 w-3.5 text-[#0a0a0a] drop-shadow-sm" />
            </span>
          </>
        )}
      </button>
    </>
  );

  // Permanent OFF: remove agent visibility entirely
  if (!aiEnabled) return null;
  if (!portalReady) return null;
  return createPortal(fab, document.body);
}

