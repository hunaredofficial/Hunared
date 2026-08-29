"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } }; isFinal?: boolean } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/**
 * Reusable microphone button for search fields.
 * Uses browser-native Web Speech API when available.
 */
export function VoiceSearchButton({
  onResult,
  className,
  size = "md",
}: {
  /** Called with the final transcript */
  onResult: (transcript: string) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(!!getSpeechRecognition());
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      toast.error("Voice search is not supported in this browser.");
      return;
    }

    try {
      const rec = new Ctor();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = typeof navigator !== "undefined" ? navigator.language || "en-US" : "en-US";

      rec.onresult = (event) => {
        try {
          const transcript = event.results?.[0]?.[0]?.transcript?.trim();
          if (transcript) onResult(transcript);
        } catch {
          /* ignore */
        }
        setListening(false);
      };

      rec.onerror = (event) => {
        setListening(false);
        if (event.error === "not-allowed") {
          toast.error("Microphone permission denied.");
        } else if (event.error !== "aborted" && event.error !== "no-speech") {
          toast.error("Voice recognition failed. Please try typing instead.");
        }
      };

      rec.onend = () => setListening(false);

      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
      toast.error("Could not start voice search.");
    }
  }, [onResult]);

  if (!supported) {
    return (
      <button
        type="button"
        title="Voice search not supported in this browser"
        disabled
        className={cn(
          "inline-flex items-center justify-center rounded-md text-muted-foreground/40 cursor-not-allowed",
          size === "sm" ? "h-7 w-7" : "h-8 w-8",
          className
        )}
        aria-label="Voice search unavailable"
      >
        <MicOff className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>
    );
  }

  return (
    <button
      type="button"
      title={listening ? "Stop listening" : "Search by voice"}
      onClick={() => (listening ? stop() : start())}
      className={cn(
        "inline-flex items-center justify-center rounded-md transition-colors",
        size === "sm" ? "h-7 w-7" : "h-8 w-8",
        listening
          ? "bg-red-500/15 text-red-500 animate-pulse"
          : "text-muted-foreground hover:text-primary hover:bg-primary/10",
        className
      )}
      aria-label={listening ? "Stop voice search" : "Start voice search"}
      aria-pressed={listening}
    >
      {listening ? (
        <Loader2 className={cn("animate-spin", size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")} />
      ) : (
        <Mic className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      )}
    </button>
  );
}
