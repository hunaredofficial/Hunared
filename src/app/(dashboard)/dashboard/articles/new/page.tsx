"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ARTICLE_CATEGORIES } from "@/lib/constants";
import { Bold, Heading2, List, ListOrdered, Eye, EyeOff } from "lucide-react";

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ARTICLE_SUBCATEGORIES = [
    "Courses",
    "Learning Programs",
    "Training Programs",
    "Certifications",
    "Internships",
    "Scholarships",
    "Career Tips",
  ];

  function insertAtCursor(before: string, after = "", placeholder = "") {
    const el = textareaRef.current;
    if (!el) {
      setContent((prev) => prev + before + placeholder + after);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + before.length + selected.length + after.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function addHeading() {
    insertAtCursor("\n## ", "\n", "Main Heading");
  }

  function addBold() {
    insertAtCursor("**", "**", "bold text");
  }

  function addBullet() {
    insertAtCursor("\n* ", "", "Bullet point");
  }

  function addNumbered() {
    insertAtCursor("\n1. ", "", "Numbered point");
  }

  function renderPreview(text: string) {
    if (!text.trim()) {
      return (
        <p className="text-sm text-muted-foreground italic">
          Preview appears here as you type…
        </p>
      );
    }

    const lines = text.split("\n");
    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {lines.map((line, i) => {
          const t = line.trim();

          // ## Heading
          if (t.startsWith("## ")) {
            return (
              <h2 key={i} className="text-base font-bold text-foreground pt-3">
                {t.replace(/^##\s+/, "")}
              </h2>
            );
          }
          // # Heading
          if (t.startsWith("# ")) {
            return (
              <h1 key={i} className="text-lg font-bold text-foreground pt-3">
                {t.replace(/^#\s+/, "")}
              </h1>
            );
          }
          // Bullet
          if (t.startsWith("* ") || t.startsWith("- ")) {
            return (
              <div key={i} className="flex gap-2 pl-1">
                <span className="text-primary mt-0.5">•</span>
                <span>{formatInline(t.replace(/^[\*\-]\s+/, ""))}</span>
              </div>
            );
          }
          // Numbered
          if (/^\d+\.\s+/.test(t)) {
            return (
              <div key={i} className="flex gap-2 pl-1">
                <span className="text-muted-foreground font-medium min-w-[1.25rem]">
                  {t.match(/^\d+/)?.[0]}.
                </span>
                <span>{formatInline(t.replace(/^\d+\.\s+/, ""))}</span>
              </div>
            );
          }
          // Empty line
          if (!t) return <div key={i} className="h-2" />;

          return (
            <p key={i} className="text-foreground/90">
              {formatInline(line)}
            </p>
          );
        })}
      </div>
    );
  }

  function formatInline(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!recaptchaToken) {
      toast.error("Please complete the reCAPTCHA verification");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          subcategory: subcategory || undefined,
          recaptchaToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit article");
      toast.success("Article submitted for review!");
      router.push("/dashboard/articles");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Write an Article</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Use headings, bold text, and bullets. Preview updates as you type.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Article Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Title */}
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="e.g. Electrical Technician — Basic Interview Notes"
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">{title.length}/120</p>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Category <span className="text-destructive">*</span>
              </label>
              <Select
                value={category}
                onValueChange={(v: string | null) => {
                  if (v) setCategory(v);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent>
                  {ARTICLE_CATEGORIES.map((c) => (
  <SelectItem key={c.value} value={c.value}>
    {c.label}
  </SelectItem>
))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Subcategory (optional)
              </label>
              <Select
                value={subcategory}
                onValueChange={(v: string | null) => {
                  if (v) setSubcategory(v);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="e.g. Certifications, Scholarships…" />
                </SelectTrigger>
                <SelectContent>
                  {ARTICLE_SUBCATEGORIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced Content */}
            <div>
              <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                <label className="text-sm font-medium">
                  Content <span className="text-destructive">*</span>
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setShowPreview((v) => !v)}
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5 mr-1" /> Hide preview
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5 mr-1" /> Show preview
                    </>
                  )}
                </Button>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2 p-2 rounded-lg border border-border bg-muted/40">
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={addHeading}>
                  <Heading2 className="h-3.5 w-3.5 mr-1" /> Heading
                </Button>
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={addBold}>
                  <Bold className="h-3.5 w-3.5 mr-1" /> Bold
                </Button>
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={addBullet}>
                  <List className="h-3.5 w-3.5 mr-1" /> Bullet
                </Button>
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={addNumbered}>
                  <ListOrdered className="h-3.5 w-3.5 mr-1" /> Numbered
                </Button>
              </div>

              <div className={`grid gap-3 ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={22}
                  placeholder={`## 1. Electrical Fundamentals

What is voltage?
Voltage is the electrical potential difference that causes current to flow.

* Unit: Volt (V)
* Symbol: V

## 2. Ohm's Law

Formula: **V = I × R**

1. Identify the known values
2. Apply the formula
3. Solve for the unknown`}
                  className="w-full px-3 py-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono leading-relaxed min-h-[320px]"
                />

                {showPreview && (
                  <div className="rounded-md border border-border bg-card/60 p-4 min-h-[320px] overflow-y-auto">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                      Live preview
                    </p>
                    {renderPreview(content)}
                  </div>
                )}
              </div>

              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">{content.length} characters</p>
                <p className="text-xs text-muted-foreground">
                  Tips: <code className="text-primary">## Heading</code> ·{" "}
                  <code className="text-primary">**bold**</code> ·{" "}
                  <code className="text-primary">* bullet</code> ·{" "}
                  <code className="text-primary">1. numbered</code>
                </p>
              </div>
            </div>

            {/* reCAPTCHA */}
            <div>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""}
                onChange={(token) => setRecaptchaToken(token)}
                onExpired={() => setRecaptchaToken(null)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading || !recaptchaToken}
                className="min-w-[120px] cursor-pointer"
              >
                {loading ? "Submitting…" : "Submit for Review"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/articles")}
                disabled={loading}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}