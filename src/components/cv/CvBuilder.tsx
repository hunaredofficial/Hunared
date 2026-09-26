"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Printer,
  Download,
  Wand2,
  FileText,
  Loader2,
  Check,
  ArrowLeft,
  ClipboardPaste,
  User,
  LayoutTemplate,
  BarChart3,
  GripVertical,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CV_TEMPLATES } from "@/lib/cv/templates";
import {
  DEFAULT_CV,
  EMPTY_EDUCATION,
  EMPTY_EXPERIENCE,
  EMPTY_PROJECT,
  type CvData,
  type CvDocument,
  type CvSectionKey,
  type CvTemplateId,
  type ProfileSeed,
} from "@/lib/cv/types";
import {
  parseCvCommand,
  importCvFromText,
  analyzeCv,
  sampleCv,
  improveText,
  tailorSuggestions,
} from "@/lib/cv/ai-fill";
import { textToDocumentHtml, ensureDocumentHtml } from "@/lib/cv/text-to-html";
import { getCompletionItems, getCompletionPercent } from "@/lib/cv/completion";
import {
  loadLibrary,
  saveLibrary,
  createDocument,
  duplicateDocument,
  updateDocument,
  deleteDocument,
} from "@/lib/cv/storage";
import { CvPreview } from "./CvPreview";
import { CvLibrary } from "./CvLibrary";
import { CvSamples } from "./CvSamples";
import { CvDocumentEditor } from "./CvDocumentEditor";
import { CvOwnDocumentEditor } from "./CvOwnDocumentEditor";
import { VoiceSearchButton } from "@/components/shared/VoiceSearchButton";
import { toast } from "sonner";

const AI_SUGGESTIONS = [
  "Create a professional CV for an Instrument Technician in Saudi Arabia",
  "Write a full professional CV for HSE Officer with NEBOSH in Jubail",
  "Make my CV more professional and ATS friendly",
  "Rewrite my professional summary stronger",
  "Improve my work experience bullets with measurable language",
  "Target this CV for an HSE position",
  "Create a graduate CV for Electrical Engineering in Riyadh",
  "Make this suitable for an international company",
  "Analyze my CV and tell me what is missing",
];

type View = "library" | "start" | "editor" | "samples";

export function CvBuilder({ profile }: { profile?: ProfileSeed }) {
  const [view, setView] = useState<View>("library");
  const [docs, setDocs] = useState<CvDocument[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [data, setData] = useState<CvData>(DEFAULT_CV);
  const [aiCmd, setAiCmd] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [editorTab, setEditorTab] = useState<"document" | "edit" | "design" | "ai">("document");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [tailorTips, setTailorTips] = useState<string[]>([])

  useEffect(() => {
    setMounted(true);
    setDocs(loadLibrary());
  }, []);

  const activeDoc = useMemo(
    () => docs.find((d) => d.id === activeId) || null,
    [docs, activeId]
  );

  // Autosave active document
  useEffect(() => {
    if (!mounted || !activeId) return;
    const t = setTimeout(() => {
      setDocs((prev) => {
        const next = updateDocument(prev, activeId, { data, template: data.template });
        saveLibrary(next);
        return next;
      });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    }, 600);
    return () => clearTimeout(t);
      {filePicker}
  }, [data, activeId, mounted]);

  const patch = useCallback((partial: Partial<CvData>) => {
    setData((d) => ({ ...d, ...partial }));
  }, []);

  const seedFromProfile = useCallback((): Partial<CvData> => {
    if (!profile) return {};
    const loc =
      [profile.city, profile.country].filter(Boolean).join(", ") ||
      profile.location ||
      "";
    return {
      fullName: profile.fullName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      location: loc,
      title: profile.profession || "",
      skills: profile.skills || "",
      languages: profile.languages || "",
    };
  }, [profile]);

  function openDoc(id: string) {
    const doc = docs.find((d) => d.id === id);
    if (!doc) return;
    setActiveId(id);
    setData(doc.data);
    setView("editor");
    setEditorTab("edit");
  }

  function startBlank() {
    const doc = createDocument("Untitled CV", DEFAULT_CV());
    const next = [doc, ...docs];
    setDocs(next);
    saveLibrary(next);
    setActiveId(doc.id);
    setData(doc.data);
    setView("editor");
  }

  function startFromProfile() {
    const seed = seedFromProfile();
    const doc = createDocument(
      seed.fullName ? `${seed.fullName} CV` : "My CV",
      { ...DEFAULT_CV(), ...seed },
      seed.title || undefined
    );
    const next = [doc, ...docs];
    setDocs(next);
    saveLibrary(next);
    setActiveId(doc.id);
    setData(doc.data);
    setView("editor");
    toast.success("Started from your Hunared profile — review and edit freely.");
  }

  function startFromSample() {
    const s = sampleCv();
    const doc = createDocument("Sample Instrument CV", s, s.title);
    const next = [doc, ...docs];
    setDocs(next);
    saveLibrary(next);
    setActiveId(doc.id);
    setData(s);
    setView("editor");
  }


  async function handleFileUpload(file: File | null) {
    if (!file) return;
    const name = file.name.toLowerCase();
    const isText =
      name.endsWith(".txt") ||
      name.endsWith(".md") ||
      name.endsWith(".rtf") ||
      file.type.startsWith("text/");
    try {
      let text = "";
      if (isText) {
        text = await file.text();
      } else if (name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx")) {
        // Browser cannot reliably parse binary Office/PDF without extra libs.
        // Read as text best-effort (works for some text-based PDFs) and prompt user.
        const buf = await file.arrayBuffer();
        const decoded = new TextDecoder("utf-8", { fatal: false }).decode(buf);
        // Extract readable sequences
        const readable = decoded
          .replace(/\u0000/g, " ")
          .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u024F]/g, " ")
          .replace(/\s{2,}/g, " ");
        text = readable.slice(0, 50000);
        if (text.trim().length < 80) {
          toast.message(
            "Could not fully read this file in-browser. Paste the CV text below, or export as .txt and upload again."
          );
          setShowImport(true);
          setEditorTab("ai");
          return;
        }
        toast.message("Extracted text from file — review fields carefully (binary formats vary).");
      } else {
        toast.error("Supported: .txt, .md, .pdf, .doc, .docx (best with .txt export).");
        return;
      }

      setAiLoading(true);
      // Primary: keep the uploaded file as the editable document (own format/content)
      const docHtml = textToDocumentHtml(text);
      let structured = { ...DEFAULT_CV(), ...data };
      try {
        const res = await fetch("/api/cv/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, current: data }),
        });
        if (res.ok) {
          const json = (await res.json()) as { cv?: typeof data };
          if (json.cv) structured = { ...DEFAULT_CV(), ...json.cv };
        } else {
          const { importCvFromText } = await import("@/lib/cv/ai-fill");
          structured = importCvFromText(text, data);
        }
      } catch {
        try {
          const { importCvFromText } = await import("@/lib/cv/ai-fill");
          structured = importCvFromText(text, data);
        } catch {
          /* keep base */
        }
      }
      // Ensure we have an active document in the library
      let id = activeId;
      if (!id || view !== "editor") {
        const doc = createDocument(
          file.name.replace(/\.[^.]+$/, "") || "Uploaded CV",
          {
            ...structured,
            documentHtml: docHtml,
            sourceFileName: file.name,
            editMode: "own",
          }
        );
        const next = [doc, ...docs];
        setDocs(next);
        saveLibrary(next);
        id = doc.id;
        setActiveId(id);
        setData(doc.data);
        setView("editor");
      } else {
        setData({
          ...structured,
          documentHtml: docHtml,
          sourceFileName: file.name,
          editMode: "own",
        });
      }
      toast.success(
        "Your CV is open for editing — content from your file. Edit freely, then Print → PDF."
      );
      setEditorTab("document");
    } catch {
      toast.error("Could not read file.");
    } finally {
      setAiLoading(false);
    }
  }

  function applyImport() {
    if (!importText.trim()) {
      toast.error("Paste your CV text first.");
      return;
    }
    const imported = importCvFromText(importText, data);
    const docHtml = textToDocumentHtml(importText);
    setData({
      ...imported,
      documentHtml: docHtml,
      sourceFileName: data.sourceFileName || "pasted-cv.txt",
      editMode: "own",
    });
    setShowImport(false);
    setImportText("");
    setEditorTab("document");
    toast.success("Your CV text is open as an editable document — edit freely.");
  }

  async function runAi() {
    const cmd = aiCmd.trim();
    if (!cmd) {
      toast.error("Type an instruction for the AI assistant.");
      return;
    }
    if (/analyze|what is missing|completeness/i.test(cmd)) {
      setShowAnalysis(true);
      setEditorTab("ai");
      toast.message("Analysis ready — see suggestions below.");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/cv/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: cmd,
          current: data,
          sourceText: importText.trim() || undefined,
        }),
      });
      if (res.ok) {
        const json = (await res.json()) as { cv?: CvData };
        if (json.cv) {
          setData({ ...DEFAULT_CV(), ...json.cv });
          toast.success("AI applied — review every field before exporting.");
          setAiCmd("");
          return;
        }
      }
      // Fallback local
      const local = parseCvCommand(cmd, data);
      setData(local);
      toast.success("Applied locally. Review facts carefully.");
      setAiCmd("");
    } catch {
      const local = parseCvCommand(cmd, data);
      setData(local);
      toast.message("Used offline assistant.");
    } finally {
      setAiLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleDownloadPdf() {
    // Print-to-PDF is the reliable client path without extra deps
    toast.message("Use your browser Print → Save as PDF for best quality.");
    setTimeout(() => window.print(), 300);
  }

  const completion = getCompletionPercent(data);
  const completionItems = getCompletionItems(data);
  const analysis = useMemo(() => analyzeCv(data), [data]);

  if (!mounted) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
        Loading CV Builder…
      </div>
    );
  }

  // Always-mounted file picker (available from Create + editor)
  const filePicker = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".txt,.md,.rtf,.pdf,.doc,.docx,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      className="sr-only"
      aria-hidden
      tabIndex={-1}
      onChange={(e) => {
        const f = e.target.files?.[0] || null;
        void handleFileUpload(f);
        e.target.value = "";
      }}
    />
  );

  if (view === "library") {
    return (
      <>
      {filePicker}
      <CvLibrary
        docs={docs}
        onCreate={() => setView("start")}
        onSamples={() => setView("samples")}
        onOpen={openDoc}
        onDuplicate={(id) => {
          const src = docs.find((d) => d.id === id);
          if (!src) return;
          const copy = duplicateDocument(src);
          const next = [copy, ...docs];
          setDocs(next);
          saveLibrary(next);
          toast.success("CV duplicated.");
        }}
        onDelete={(id) => {
          const next = deleteDocument(docs, id);
          setDocs(next);
          saveLibrary(next);
          if (activeId === id) {
            setActiveId(null);
            setData(DEFAULT_CV());
          }
          toast.success("CV deleted.");
        }}
        onRename={(id, name) => {
          const next = updateDocument(docs, id, { name });
          setDocs(next);
          saveLibrary(next);
        }}
      />
      </>
    );
  }

  if (view === "samples") {
    return (
      <CvSamples
        onBack={() => setView("library")}
        onUse={(name, sampleData, targetRole) => {
          const doc = createDocument(name, sampleData, targetRole);
          const next = [doc, ...docs];
          setDocs(next);
          saveLibrary(next);
          setActiveId(doc.id);
          setData(sampleData);
          setEditorTab("document");
          setView("editor");
          toast.success("Sample copied — edit in the document canvas; replace placeholders.");
        }}
      />
    );
  }

  if (view === "start") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {filePicker}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 -ml-2"
          onClick={() => setView("library")}
        >
          <ArrowLeft className="h-4 w-4" />
          My CVs
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create a new CV</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose how you want to start. You can always change template and
            content later.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: FileText,
              title: "Blank CV",
              desc: "Start empty and build section by section.",
              action: startBlank,
            },
            {
              icon: User,
              title: "From Hunared profile",
              desc: "Pre-fill name, contact, title and skills from your profile.",
              action: startFromProfile,
            },
            {
              icon: ClipboardPaste,
              title: "Paste existing CV text",
              desc: "Paste resume text — we structure it into sections.",
              action: () => {
                startBlank();
                setShowImport(true);
                setEditorTab("ai");
              },
            },
            {
              icon: Upload,
              title: "Upload CV file",
              desc: "Upload .txt, PDF or Word from your device — then edit it.",
              action: () => {
                // Open native file picker immediately (must stay in user gesture)
                fileInputRef.current?.click();
              },
            },
            {
              icon: Sparkles,
              title: "Try sample CV",
              desc: "Explore with a filled Instrument Technician example.",
              action: startFromSample,
            },
          ].map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={item.action}
              className="text-left rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <item.icon className="h-5 w-5 text-primary mb-2" />
              <p className="font-semibold text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── EDITOR ─────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2 justify-between print:hidden">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={() => setView("library")}
          >
            <ArrowLeft className="h-4 w-4" />
            My CVs
          </Button>
          <input
            className="bg-transparent font-semibold text-sm sm:text-base border-b border-transparent hover:border-border focus:border-primary outline-none min-w-0 max-w-[14rem] sm:max-w-xs"
            value={activeDoc?.name || "Untitled CV"}
            onChange={(e) => {
              if (!activeId) return;
              const next = updateDocument(docs, activeId, {
                name: e.target.value,
              });
              setDocs(next);
              saveLibrary(next);
            }}
            aria-label="CV name"
          />
          {savedFlash && (
            <span className="text-xs text-emerald-500 inline-flex items-center gap-1">
              <Check className="h-3 w-3" /> Saved
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "text-xs font-medium tabular-nums px-2 py-1 rounded-full",
              completion >= 80
                ? "bg-emerald-500/15 text-emerald-500"
                : "bg-muted text-muted-foreground"
            )}
          >
            {completion}% complete
          </span>
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <Button size="sm" className="h-8 gap-1" onClick={handleDownloadPdf}>
            <Download className="h-3.5 w-3.5" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 items-start">
        {/* Left: editor panels */}
        <div className="space-y-3 print:hidden">
          <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
            {(
              [
                ["document", "Document", FileText],
                ["edit", "Fields", FileText],
                ["design", "Design", LayoutTemplate],
                ["ai", "AI Assist", Sparkles],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setEditorTab(id)}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  editorTab === id
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {editorTab === "document" && (
            <div className="space-y-3">
              {data.editMode === "own" || (data.documentHtml && data.documentHtml.length > 20) ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    <strong>Your uploaded CV</strong>
                    {data.sourceFileName ? ` (${data.sourceFileName})` : ""}.
                    Edit this document directly — content stays as your file, not a Hunared template.
                    Select text → AI Improve. Print → Save as PDF when done.
                  </p>
                  <CvOwnDocumentEditor
                    html={data.documentHtml || ""}
                    sourceFileName={data.sourceFileName}
                    onChangeHtml={(html) =>
                      setData((d) => ({
                        ...d,
                        documentHtml: html,
                        editMode: "own",
                      }))
                    }
                  />
                </>
              ) : (
                <>
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Document view is empty. Upload your CV from your device to edit
                      <strong> your file&apos;s content</strong> directly.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload CV from device
                    </Button>
                  </div>
                  <CvDocumentEditor data={data} onChange={setData} />
                </>
              )}
            </div>
          )}

          {editorTab === "design" && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-sm font-semibold">Template</p>
              <div className="grid grid-cols-2 gap-2">
                {CV_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => patch({ template: t.id })}
                    className={cn(
                      "text-left rounded-lg border p-2.5 transition-all",
                      data.template === t.id
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <span
                      className="block h-1.5 w-8 rounded-full mb-1.5"
                      style={{ background: t.accent }}
                    />
                    <p className="text-xs font-semibold">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                      {t.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {editorTab === "ai" && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Wand2 className="h-4 w-4 text-primary" />
                AI CV Assistant
              </p>
              <p className="text-xs text-muted-foreground">
                Describe your role, location, skills, and experience in plain
                language — or upload your CV. AI structures a professional CV and
                improves wording. It will not invent employers, degrees, or
                certifications you did not provide.
              </p>
              <div className="relative">
                <textarea
                  value={aiCmd}
                  onChange={(e) => setAiCmd(e.target.value)}
                  rows={3}
                  placeholder="e.g. Make my summary more professional and ATS friendly"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-y min-h-[72px]"
                />
                <div className="absolute right-2 bottom-2">
                  <VoiceSearchButton
                    size="sm"
                    onResult={(t) => setAiCmd((c) => (c ? `${c} ${t}` : t))}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AI_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setAiCmd(s)}
                    className="text-[10px] rounded-full border border-border px-2 py-0.5 text-muted-foreground hover:text-foreground hover:border-primary/40"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <Button
                className="w-full gap-1.5"
                disabled={aiLoading}
                onClick={runAi}
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Run AI
              </Button>

              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["professional", "Make professional"],
                    ["ats", "ATS-friendly"],
                    ["shorten", "Shorten summary"],
                    ["bullets", "Stronger bullets"],
                  ] as const
                ).map(([action, label]) => (
                  <Button
                    key={action}
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 text-[10px]"
                    disabled={aiLoading}
                    onClick={async () => {
                      setAiLoading(true);
                      try {
                        if (action === "bullets") {
                          const experience = await Promise.all(
                            data.experience.map(async (e) => {
                              if (!e.bullets.trim()) return e;
                              const res = await fetch("/api/cv/improve", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ text: e.bullets, action: "bullets" }),
                              });
                              if (res.ok) {
                                const j = await res.json();
                                return { ...e, bullets: j.text || e.bullets };
                              }
                              return { ...e, bullets: improveText(e.bullets, "bullets") };
                            })
                          );
                          setData((d) => ({ ...d, experience }));
                        } else {
                          const res = await fetch("/api/cv/improve", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ text: data.summary, action }),
                          });
                          let next = data.summary;
                          if (res.ok) {
                            const j = await res.json();
                            next = j.text || next;
                          } else {
                            next = improveText(data.summary, action);
                          }
                          setData((d) => ({ ...d, summary: next }));
                        }
                        toast.success("AI improvement applied — review the text.");
                      } finally {
                        setAiLoading(false);
                      }
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              <div className="space-y-2 rounded-lg border border-border p-3">
                <p className="text-xs font-semibold">Tailor to a job description</p>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  rows={3}
                  placeholder="Paste the job description here…"
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full h-8 text-xs"
                  onClick={() => {
                    if (!jobDesc.trim()) {
                      toast.error("Paste a job description first.");
                      return;
                    }
                    const tips = tailorSuggestions(data, jobDesc);
                    setTailorTips(tips);
                    setShowAnalysis(true);
                    toast.message("Job match suggestions ready.");
                  }}
                >
                  Analyze vs job
                </Button>
                {tailorTips.length > 0 && (
                  <ul className="space-y-1.5">
                    {tailorTips.map((tip, i) => (
                      <li key={i} className="text-[11px] text-muted-foreground leading-snug">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                onClick={() => setShowAnalysis((v) => !v)}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                {showAnalysis ? "Hide" : "Show"} CV analysis
              </Button>

              {showAnalysis && (
                <div className="space-y-2 pt-1">
                  {analysis.length === 0 ? (
                    <p className="text-xs text-emerald-500">
                      No major issues found. Review facts before applying.
                    </p>
                  ) : (
                    analysis.map((a, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-xs",
                          a.severity === "critical"
                            ? "border-destructive/40 bg-destructive/5"
                            : a.severity === "warn"
                              ? "border-amber-500/30 bg-amber-500/5"
                              : "border-border bg-muted/30"
                        )}
                      >
                        <p className="font-medium">
                          {a.area}: {a.message}
                        </p>
                        <p className="text-muted-foreground mt-0.5">{a.action}</p>
                      </div>
                    ))
                  )}
                  <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs space-y-1">
                    <p className="font-medium">Completion checklist</p>
                    {completionItems.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center gap-2 text-muted-foreground"
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            item.done ? "bg-emerald-500" : "bg-muted-foreground/40"
                          )}
                        />
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                <label className="w-full">
                  <span className="sr-only">Upload CV file</span>
                  <input
                    type="file"
                    accept=".txt,.md,.rtf,.pdf,.doc,.docx,text/plain"
                    className="hidden"
                    id="cv-file-upload-ai"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      void handleFileUpload(f);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5"
                    disabled={aiLoading}
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload CV file (txt / pdf / word)
                  </Button>
                </label>
                <p className="text-[10px] text-muted-foreground">
                  We extract text and map sections. We do not invent jobs or degrees.
                  For complex PDF/Word layouts, paste text or export .txt for best results.
                  Your content stays private in this browser.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                onClick={() => setShowImport((v) => !v)}
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
                Paste / import CV text
              </Button>
              {showImport && (
                <div className="space-y-2">
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    rows={6}
                    placeholder="Paste the full text of your existing CV here…"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  <Button size="sm" onClick={applyImport}>
                    Structure into fields
                  </Button>
                </div>
              )}
            </div>
          )}

          {editorTab === "edit" && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-5 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {/* Personal */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Personal
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  <Field
                    label="Full name"
                    value={data.fullName}
                    onChange={(v) => patch({ fullName: v })}
                    placeholder="Your full name"
                  />
                  <Field
                    label="Professional title"
                    value={data.title}
                    onChange={(v) => patch({ title: v })}
                    placeholder="e.g. Instrument Technician"
                  />
                  <Field
                    label="Email"
                    value={data.email}
                    onChange={(v) => patch({ email: v })}
                    placeholder="you@email.com"
                  />
                  <Field
                    label="Phone"
                    value={data.phone}
                    onChange={(v) => patch({ phone: v })}
                    placeholder="+966 …"
                  />
                  <Field
                    label="Location"
                    value={data.location}
                    onChange={(v) => patch({ location: v })}
                    placeholder="City, Country"
                  />
                  <Field
                    label="Website / LinkedIn"
                    value={data.website}
                    onChange={(v) => patch({ website: v })}
                    placeholder="Optional"
                  />
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Professional summary
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Briefly describe your background, strongest skills, and career
                  focus.
                </p>
                <textarea
                  value={data.summary}
                  onChange={(e) => patch({ summary: e.target.value })}
                  rows={4}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  placeholder="2–4 sentences…"
                />
              </section>

              {/* Experience */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Work experience
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() =>
                      patch({ experience: [...data.experience, EMPTY_EXPERIENCE()] })
                    }
                  >
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                {data.experience.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="rounded-lg border border-border/80 p-3 space-y-2 relative"
                  >
                    <button
                      type="button"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        patch({
                          experience: data.experience.filter((_, i) => i !== idx),
                        })
                      }
                      aria-label="Remove experience"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <Field
                        label="Job title"
                        value={exp.title}
                        onChange={(v) => {
                          const experience = [...data.experience];
                          experience[idx] = { ...exp, title: v };
                          patch({ experience });
                        }}
                      />
                      <Field
                        label="Company"
                        value={exp.company}
                        onChange={(v) => {
                          const experience = [...data.experience];
                          experience[idx] = { ...exp, company: v };
                          patch({ experience });
                        }}
                      />
                      <Field
                        label="Location"
                        value={exp.location}
                        onChange={(v) => {
                          const experience = [...data.experience];
                          experience[idx] = { ...exp, location: v };
                          patch({ experience });
                        }}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Field
                          label="Start"
                          value={exp.start}
                          onChange={(v) => {
                            const experience = [...data.experience];
                            experience[idx] = { ...exp, start: v };
                            patch({ experience });
                          }}
                          placeholder="2020"
                        />
                        <Field
                          label="End"
                          value={exp.current ? "Present" : exp.end}
                          onChange={(v) => {
                            const experience = [...data.experience];
                            experience[idx] = {
                              ...exp,
                              end: v,
                              current: false,
                            };
                            patch({ experience });
                          }}
                          placeholder="2024"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => {
                          const experience = [...data.experience];
                          experience[idx] = {
                            ...exp,
                            current: e.target.checked,
                            end: e.target.checked ? "" : exp.end,
                          };
                          patch({ experience });
                        }}
                      />
                      Current role
                    </label>
                    <div>
                      <label className="text-[11px] text-muted-foreground">
                        Achievements (one per line)
                      </label>
                      <textarea
                        value={exp.bullets}
                        onChange={(e) => {
                          const experience = [...data.experience];
                          experience[idx] = { ...exp, bullets: e.target.value };
                          patch({ experience });
                        }}
                        rows={3}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm mt-1"
                        placeholder="Led calibration of 200+ field instruments…"
                      />
                    </div>
                  </div>
                ))}
              </section>

              {/* Education */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Education
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() =>
                      patch({ education: [...data.education, EMPTY_EDUCATION()] })
                    }
                  >
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                {data.education.map((edu, idx) => (
                  <div
                    key={edu.id}
                    className="rounded-lg border border-border/80 p-3 space-y-2 relative"
                  >
                    <button
                      type="button"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        patch({
                          education: data.education.filter((_, i) => i !== idx),
                        })
                      }
                      aria-label="Remove education"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <Field
                        label="School"
                        value={edu.school}
                        onChange={(v) => {
                          const education = [...data.education];
                          education[idx] = { ...edu, school: v };
                          patch({ education });
                        }}
                      />
                      <Field
                        label="Degree"
                        value={edu.degree}
                        onChange={(v) => {
                          const education = [...data.education];
                          education[idx] = { ...edu, degree: v };
                          patch({ education });
                        }}
                      />
                      <Field
                        label="Field"
                        value={edu.field}
                        onChange={(v) => {
                          const education = [...data.education];
                          education[idx] = { ...edu, field: v };
                          patch({ education });
                        }}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Field
                          label="Start"
                          value={edu.start}
                          onChange={(v) => {
                            const education = [...data.education];
                            education[idx] = { ...edu, start: v };
                            patch({ education });
                          }}
                        />
                        <Field
                          label="End"
                          value={edu.end}
                          onChange={(v) => {
                            const education = [...data.education];
                            education[idx] = { ...edu, end: v };
                            patch({ education });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Skills
                </h3>
                <textarea
                  value={data.skills}
                  onChange={(e) => patch({ skills: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Comma-separated skills"
                />
              </section>

              <section className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Certifications
                  </h3>
                  <textarea
                    value={data.certifications}
                    onChange={(e) => patch({ certifications: e.target.value })}
                    rows={2}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Languages
                  </h3>
                  <textarea
                    value={data.languages}
                    onChange={(e) => patch({ languages: e.target.value })}
                    rows={2}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Achievements
                </h3>
                <textarea
                  value={data.achievements}
                  onChange={(e) => patch({ achievements: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Optional awards or key results"
                />
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Projects
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() =>
                      patch({ projects: [...data.projects, EMPTY_PROJECT()] })
                    }
                  >
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                {data.projects.map((p, idx) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-border/80 p-3 space-y-2 relative"
                  >
                    <button
                      type="button"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        patch({
                          projects: data.projects.filter((_, i) => i !== idx),
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <Field
                      label="Project name"
                      value={p.name}
                      onChange={(v) => {
                        const projects = [...data.projects];
                        projects[idx] = { ...p, name: v };
                        patch({ projects });
                      }}
                    />
                    <textarea
                      value={p.description}
                      onChange={(e) => {
                        const projects = [...data.projects];
                        projects[idx] = { ...p, description: e.target.value };
                        patch({ projects });
                      }}
                      rows={2}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Description"
                    />
                  </div>
                ))}
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Custom section
                </h3>
                <Field
                  label="Section title"
                  value={data.customSectionTitle}
                  onChange={(v) => patch({ customSectionTitle: v })}
                  placeholder="e.g. Professional memberships"
                />
                <textarea
                  value={data.customSectionBody}
                  onChange={(e) => patch({ customSectionBody: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </section>
            </div>
          )}
        </div>

        {/* Right: live preview */}
        <div className="lg:sticky lg:top-20">
          <p className="text-xs font-medium text-muted-foreground mb-2 print:hidden">
            Live preview
          </p>
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto print:max-h-none print:overflow-visible">
            <CvPreview data={data} className="min-h-[600px]" />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #cv-print-root,
          #cv-print-root * {
            visibility: visible;
          }
          #cv-print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-0.5 w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm"
      />
    </label>
  );
}
