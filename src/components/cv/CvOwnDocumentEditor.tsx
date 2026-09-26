"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo2,
  Redo2,
  Sparkles,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ensureDocumentHtml } from "@/lib/cv/text-to-html";

type Props = {
  html: string;
  sourceFileName?: string;
  onChangeHtml: (html: string) => void;
  className?: string;
};

/**
 * Edit the user's OWN uploaded CV document.
 * Source of truth = document HTML from the file (not Hunared template fields).
 */
export function CvOwnDocumentEditor({
  html,
  sourceFileName,
  onChangeHtml,
  className,
}: Props) {
  const seed = useRef(ensureDocumentHtml(html || ""));
  const lastExternal = useRef(seed.current);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Your CV document — type here to edit…",
      }),
    ],
    content: seed.current,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none min-h-[32rem] px-12 py-12 sm:px-16 focus:outline-none",
          "prose-headings:text-black prose-p:text-neutral-900 prose-li:text-neutral-900",
          "prose-h1:text-[22px] prose-h1:font-bold prose-h1:mb-1 prose-h1:tracking-tight prose-h1:uppercase",
          "prose-h2:text-[12px] prose-h2:font-bold prose-h2:uppercase prose-h2:tracking-wide prose-h2:mt-5 prose-h2:mb-2 prose-h2:border-b prose-h2:border-black prose-h2:pb-1",
          "prose-p:my-1 prose-p:leading-relaxed prose-p:text-[12.5px]",
          "prose-ul:my-1 prose-li:my-0.5 prose-li:text-[12.5px] prose-strong:text-black"
        ),
      },
    },
    onUpdate({ editor: ed }) {
      const next = ed.getHTML();
      lastExternal.current = next;
      onChangeHtml(next === "<p></p>" ? "" : next);
    },
  });

  // Only apply external HTML when it truly changes (e.g. new upload), not on every keystroke echo
  useEffect(() => {
    if (!editor) return;
    const incoming = ensureDocumentHtml(html || "");
    if (incoming === lastExternal.current) return;
    // Avoid wiping user edits if parent re-renders with stale empty
    if (!html && editor.getText().trim().length > 0) return;
    lastExternal.current = incoming;
    editor.commands.setContent(incoming, false);
  }, [html, editor]);

  async function aiImproveSelection() {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, " ").trim();
    if (!text) {
      toast.message("Select text in your CV first, then click AI Improve.");
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
      editor.chain().focus().insertContentAt({ from, to }, improved).run();
      toast.success("Selection improved — review carefully.");
    } catch {
      toast.error("AI improve failed.");
    }
  }

  if (!editor) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        Loading document editor…
      </div>
    );
  }

  const btn =
    "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors";

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="rounded-t-xl border border-border bg-card px-3 py-2 flex flex-wrap items-center gap-1">
        <FileText className="h-4 w-4 text-primary shrink-0 mr-1" />
        <span className="text-xs text-muted-foreground mr-2 truncate max-w-[14rem]">
          {sourceFileName
            ? `Editing: ${sourceFileName}`
            : "Your uploaded CV document"}
        </span>
        <div className="h-4 w-px bg-border mx-1" />
        <button type="button" className={btn} title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn} title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-3.5 w-3.5" />
        </button>
        <div className="h-4 w-px bg-border mx-1" />
        <button
          type="button"
          className={cn(btn, editor.isActive("bold") && "bg-muted text-foreground")}
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={cn(btn, editor.isActive("italic") && "bg-muted text-foreground")}
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={cn(btn, editor.isActive("heading", { level: 1 }) && "bg-muted text-foreground")}
          title="Title"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={cn(btn, editor.isActive("heading", { level: 2 }) && "bg-muted text-foreground")}
          title="Heading"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={cn(btn, editor.isActive("bulletList") && "bg-muted text-foreground")}
          title="Bullets"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={cn(btn, editor.isActive("orderedList") && "bg-muted text-foreground")}
          title="Numbers"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 gap-1 text-xs ml-1"
          onClick={() => void aiImproveSelection()}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Improve selection
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs ml-auto"
          onClick={() => {
            window.print();
          }}
        >
          Print / PDF
        </Button>
      </div>

      <div className="rounded-b-xl border border-t-0 border-border bg-muted/40 p-3 sm:p-6 overflow-auto">
        <div className="mx-auto max-w-[48rem] bg-white text-neutral-900 shadow-lg rounded-sm border border-neutral-200">
          <EditorContent editor={editor} />
        </div>
        <p className="mx-auto max-w-[48rem] mt-3 text-[11px] text-muted-foreground text-center">
          This is <strong>your CV content</strong> in a classic editable document. Section order follows your file — edit any line, heading, or bullet.
          Edit text, headings, and bullets freely. Select text for AI Improve. Use Print → Save as PDF to export.
        </p>
      </div>
    </div>
  );
}
