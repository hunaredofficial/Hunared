"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Heading2,
  AlignLeft,
  AlignCenter,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cvToDocumentHtml, documentHtmlToCv } from "@/lib/cv/document-model";
import type { CvData } from "@/lib/cv/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  data: CvData;
  onChange: (next: CvData) => void;
  className?: string;
};

export function CvDocumentEditor({ data, onChange, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const skipSync = useRef(false);
  const history = useRef<string[]>([]);
  const histIdx = useRef(-1);

  // Seed document from structured data when template/name changes significantly
  useEffect(() => {
    if (!ref.current || skipSync.current) return;
    const html = cvToDocumentHtml(data);
    if (ref.current.innerHTML.trim().length < 20) {
      ref.current.innerHTML = html;
      pushHistory(html);
      setReady(true);
    }
  }, [data.template, data.fullName]);

  // Initial mount
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = cvToDocumentHtml(data);
    pushHistory(ref.current.innerHTML);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pushHistory(html: string) {
    history.current = history.current.slice(0, histIdx.current + 1);
    history.current.push(html);
    if (history.current.length > 40) history.current.shift();
    histIdx.current = history.current.length - 1;
  }

  const syncToData = useCallback(() => {
    if (!ref.current) return;
    skipSync.current = true;
    const next = documentHtmlToCv(ref.current.innerHTML, data);
    onChange(next);
    setTimeout(() => {
      skipSync.current = false;
    }, 100);
  }, [data, onChange]);

  function exec(cmd: string, value?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, value);
    if (ref.current) pushHistory(ref.current.innerHTML);
    syncToData();
  }

  function undo() {
    if (histIdx.current <= 0 || !ref.current) return;
    histIdx.current -= 1;
    ref.current.innerHTML = history.current[histIdx.current];
    syncToData();
  }

  function redo() {
    if (histIdx.current >= history.current.length - 1 || !ref.current) return;
    histIdx.current += 1;
    ref.current.innerHTML = history.current[histIdx.current];
    syncToData();
  }

  async function aiImproveSelection() {
    const sel = window.getSelection();
    const text = sel?.toString()?.trim();
    if (!text) {
      toast.message("Select text in the document first, then click AI Improve.");
      return;
    }
    try {
      const res = await fetch("/api/cv/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, action: "professional" }),
      });
      let improved = text;
      if (res.ok) {
        const j = await res.json();
        improved = j.text || text;
      }
      // Replace selection
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(improved));
        if (ref.current) pushHistory(ref.current.innerHTML);
        syncToData();
        toast.success("Selection improved — review the wording.");
      }
    } catch {
      toast.error("AI improve failed.");
    }
  }

  function reloadFromStructured() {
    if (!ref.current) return;
    ref.current.innerHTML = cvToDocumentHtml(data);
    pushHistory(ref.current.innerHTML);
    toast.message("Document refreshed from form fields.");
  }

  return (
    <div className={cn("flex flex-col h-full min-h-[28rem]", className)}>
      {/* Toolbar — Google Docs style */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-xl border border-border bg-card px-2 py-1.5 shadow-sm">
        <ToolBtn icon={Undo2} label="Undo" onClick={undo} />
        <ToolBtn icon={Redo2} label="Redo" onClick={redo} />
        <Sep />
        <ToolBtn icon={Bold} label="Bold" onClick={() => exec("bold")} />
        <ToolBtn icon={Italic} label="Italic" onClick={() => exec("italic")} />
        <ToolBtn icon={Underline} label="Underline" onClick={() => exec("underline")} />
        <Sep />
        <ToolBtn icon={Heading2} label="Heading" onClick={() => exec("formatBlock", "h2")} />
        <ToolBtn icon={List} label="Bullets" onClick={() => exec("insertUnorderedList")} />
        <ToolBtn icon={ListOrdered} label="Numbers" onClick={() => exec("insertOrderedList")} />
        <Sep />
        <ToolBtn icon={AlignLeft} label="Left" onClick={() => exec("justifyLeft")} />
        <ToolBtn icon={AlignCenter} label="Center" onClick={() => exec("justifyCenter")} />
        <Sep />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 gap-1 text-xs"
          onClick={() => void aiImproveSelection()}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Improve selection
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 text-xs ml-auto"
          onClick={reloadFromStructured}
        >
          Sync from fields
        </Button>
      </div>

      {/* Paper canvas */}
      <div className="flex-1 overflow-auto rounded-b-xl border border-t-0 border-border bg-muted/30 p-3 sm:p-6">
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label="CV document editor"
          aria-multiline
          onInput={() => {
            if (ref.current) {
              // debounce-ish via rAF
              requestAnimationFrame(() => {
                if (ref.current) pushHistory(ref.current.innerHTML);
                syncToData();
              });
            }
          }}
          onBlur={syncToData}
          className={cn(
            "mx-auto min-h-[32rem] max-w-[48rem] bg-white text-neutral-900 shadow-lg",
            "rounded-sm px-10 py-12 sm:px-14 sm:py-14",
            "outline-none focus:ring-2 focus:ring-primary/30",
            "prose prose-sm prose-neutral max-w-none",
            "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-1 [&_h1]:text-neutral-900",
            "[&_h2]:text-sm [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:border-b [&_h2]:border-neutral-200 [&_h2]:pb-1 [&_h2]:text-neutral-800",
            "[&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-0.5",
            "[&_p]:text-[13px] [&_p]:leading-relaxed [&_p]:my-1",
            "[&_ul]:my-1 [&_ul]:pl-5 [&_li]:text-[13px] [&_li]:my-0.5",
            "[&_.cv-contact]:text-xs [&_.cv-contact]:text-neutral-600",
            "[&_.cv-meta]:text-xs [&_.cv-meta]:text-neutral-500",
            "[&_hr]:my-3 [&_hr]:border-neutral-200",
            !ready && "opacity-50"
          )}
        />
        <p className="mx-auto max-w-[48rem] mt-3 text-[11px] text-muted-foreground text-center">
          Edit this document like Word / Google Docs. Select text → AI Improve.
          Print uses the live preview / Print button for PDF export.
        </p>
      </div>
    </div>
  );
}

function ToolBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-border" aria-hidden />;
}
