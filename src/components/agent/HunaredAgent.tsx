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
  Briefcase,
  ShoppingBag,
  GraduationCap,
  FileText,
  Building2,
  Users,
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
  { icon: GraduationCap, label: "Learning", text: "Find courses to improve my skills" },
  { icon: Building2, label: "Companies", text: "Show companies in Saudi Arabia" },
  { icon: Users, label: "Talent", text: "Show candidates available for hire" },
];

function contextualSuggestions(path: string): string[] {
  if (path.startsWith("/jobs/")) {
    return [
      "Am I qualified for this job?",
      "Find similar jobs",
      "Improve my CV for this role",
      "Help me prepare for an interview",
    ];
  }
  if (path.startsWith("/jobs")) {
    return [
      "HSE Officer jobs in Dammam",
      "Permanent jobs in Jubail",
      "Jobs matching my profile",
    ];
  }
  if (path.startsWith("/market")) {
    return ["Apartment for rent in Dammam", "Used laptops for sale", "Electrical services"];
  }
  if (path.includes("/cv")) {
    return [
      "Improve my professional summary",
      "Make my CV ATS-friendly",
      "Help me write a cover letter",
    ];
  }
  if (path.startsWith("/companies")) {
    return ["Show company jobs", "Find oil and gas companies"];
  }
  if (path.startsWith("/learning") || path.startsWith("/program") || path.startsWith("/education")) {
    return ["Will this help my career?", "Find related jobs"];
  }
  return [
    "Instrument technician jobs in Jubail",
    "Open CV Builder",
    "Apartment for rent in Dammam",
    "What can you do?",
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
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(variant === "page");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "I'm **Hunared AI** — your guide for jobs, CV, marketplace, companies, and learning.\n\nTell me what you need in plain language, or pick a shortcut below.",
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
    const apply = (enabled: boolean) => {
      setAiEnabled(enabled);
      try {
        localStorage.setItem("hunared_ai_enabled", enabled ? "1" : "0");
      } catch {
        /* ignore */
      }
    };
    try {
      if (localStorage.getItem("hunared_ai_enabled") === "0") setAiEnabled(false);
    } catch {
      /* ignore */
    }
    // Prefer unified settings API; fall back to legacy ai-settings
    void (async () => {
      try {
        const res = await fetch("/api/profile/settings");
        if (res.ok) {
          const j = await res.json();
          if (typeof j.ai_enabled === "boolean") {
            apply(j.ai_enabled);
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
          if (typeof j.ai_enabled === "boolean") apply(j.ai_enabled);
        }
      } catch {
        /* ignore */
      }
    })();

    // Live updates when Settings page toggles agent (same tab via custom event + storage)
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

        // Only auto-navigate on explicit high-confidence short commands
        if (action.autoNavigate && action.href && action.intent !== "search_jobs" && action.intent !== "search_market") {
          setTimeout(() => router.push(action.href!), 900);
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
    [aiEnabled, ctx, loading, pathname, router]
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

  const panel = (
    <div
      className={cn(
        "flex flex-col overflow-hidden border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl",
        variant === "float"
          ? "fixed bottom-[4.5rem] right-4 z-50 w-[min(100vw-1.5rem,26rem)] h-[min(78vh,36rem)] rounded-2xl"
          : "w-full h-[min(82vh,42rem)] rounded-2xl",
        className
      )}
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-2 px-3.5 py-3 border-b border-border/60 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
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
              Jobs · CV · Marketplace · Career
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => router.push("/dashboard/settings/ai")}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Privacy & AI"
            aria-label="Privacy and AI settings"
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
          <Button size="sm" className="mt-1" onClick={() => router.push("/dashboard/settings/ai")}>
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
              "Find permanent jobs in Jubail",
              "Apartment for rent under 2000 in Dammam",
              "Show my saved items",
              "Career roadmap for Instrument Technician",
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

  // Settings → AI off: hide floating agent on homepage and all public pages
  if (!aiEnabled) return null;

  return (
    <>
      {open && panel}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg shadow-primary/20 flex items-center justify-center transition-all",
          open
            ? "bg-muted text-foreground border border-border"
            : "bg-primary text-primary-foreground hover:scale-105"
        )}
        aria-label={open ? "Close Hunared AI" : "Open Hunared AI"}
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>
    </>
  );
}
