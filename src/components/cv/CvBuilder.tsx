"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Printer,
  Download,
  Wand2,
  RotateCcw,
  FileText,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CV_TEMPLATES } from "@/lib/cv/templates";
import {
  DEFAULT_CV,
  EMPTY_EDUCATION,
  EMPTY_EXPERIENCE,
  type CvData,
  type CvTemplateId,
} from "@/lib/cv/types";
import { parseCvCommand, sampleCv } from "@/lib/cv/ai-fill";
import { CvPreview } from "./CvPreview";
import { VoiceSearchButton } from "@/components/shared/VoiceSearchButton";
import { toast } from "sonner";

const STORAGE_KEY = "hunared_cv_builder_v1";

type ProfileSeed = {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  profession?: string | null;
  country?: string | null;
  city?: string | null;
};

const AI_EXAMPLES = [
  "My name is Sara Khan, Instrument Technician in Khobar. Skills: calibration, PLC, HART. Worked at Gulf Petro as Instrument Tech from 2019 to present. NEBOSH certified. Use professional template.",
  "Create a modern CV for Ahmed, Software Engineer in Dubai. Skills React, TypeScript, Node.js. Experience at TechCorp as Frontend Developer 2021–present.",
  "Executive CV: Fatima Al-Sayed, Project Manager, Riyadh. PMP certified. 10 years oil & gas project controls.",
];

export function CvBuilder({ profile }: { profile?: ProfileSeed }) {
  const [data, setData] = useState<CvData>(DEFAULT_CV);
  const [aiCmd, setAiCmd] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load localStorage + seed from profile
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CvData;
        setData({ ...DEFAULT_CV(), ...parsed });
        return;
      }
    } catch {
      /* ignore */
    }
    if (profile) {
      const loc = [profile.city, profile.country].filter(Boolean).join(", ") || profile.location || "";
      setData({
        ...DEFAULT_CV(),
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        location: loc,
        title: profile.profession || "",
      });
    }
  }, [profile]);

  // Autosave
  useEffect(() => {
    if (!mounted) return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setSavedFlash(true);
        window.setTimeout(() => setSavedFlash(false), 1200);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [data, mounted]);

  const set = useCallback(<K extends keyof CvData>(key: K, value: CvData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  }, []);

  const runAi = async () => {
    const cmd = aiCmd.trim();
    if (!cmd) {
      toast.error("Type or speak a CV description first.");
      return;
    }
    setAiLoading(true);
    try {
      // Local free parser first
      let next = parseCvCommand(cmd, data);

      // Optional server polish
      try {
        const res = await fetch("/api/cv/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: cmd, current: data }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.cv) next = { ...next, ...json.cv, experience: json.cv.experience || next.experience, education: json.cv.education || next.education };
        }
      } catch {
        /* local only */
      }

      setData(next);
      toast.success("CV updated from your command.");
    } finally {
      setAiLoading(false);
    }
  };

  const printCv = () => {
    const root = document.getElementById("cv-print-root");
    if (!root) {
      toast.error("Preview not ready.");
      return;
    }
    const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=1100");
    if (!win) {
      toast.error("Allow pop-ups to download/print your CV.");
      return;
    }
    win.document.write(`<!DOCTYPE html><html><head><title>${data.fullName || "CV"} — Hunared</title>
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: #fff; }
        @page { margin: 12mm; size: A4; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
      </head><body>${root.outerHTML}
      <script>window.onload=function(){setTimeout(function(){window.print()},200)}</script>
      </body></html>`);
    win.document.close();
  };

  const inputCls =
    "w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
  const labelCls = "text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Free CV Builder
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            6 professional templates · AI command fill · Print / PDF · Autosaved on this device
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {savedFlash && (
            <span className="text-xs text-emerald-500 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => setData(sampleCv())}>
            Load example
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Reset CV to empty?")) setData(DEFAULT_CV());
            }}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
          <Button type="button" size="sm" onClick={printCv} className="gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            Print / PDF
          </Button>
        </div>
      </div>

      {/* AI Command */}
      <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wand2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">AI Command — auto-design your CV</p>
            <p className="text-[11px] text-muted-foreground">
              Describe yourself in plain language (or paste a bio). Free on-device AI; optional cloud polish if configured.
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-start">
          <div className="relative flex-1">
            <textarea
              value={aiCmd}
              onChange={(e) => setAiCmd(e.target.value)}
              rows={3}
              placeholder='e.g. "My name is Ahmed, Instrument Technician in Dammam. Skills: calibration, PLC, SCADA. Worked at Gulf Petro 2019–present. NEBOSH. Use professional template."'
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y min-h-[72px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <VoiceSearchButton
              onResult={(t) => {
                setAiCmd((prev) => (prev ? `${prev} ${t}` : t));
              }}
            />
            <Button
              type="button"
              onClick={runAi}
              disabled={aiLoading}
              className="h-10 gap-1.5"
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Apply
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {AI_EXAMPLES.map((ex) => (
            <button
              key={ex.slice(0, 24)}
              type="button"
              onClick={() => setAiCmd(ex)}
              className="text-[11px] rounded-full border border-border bg-background px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors max-w-full truncate"
              title={ex}
            >
              {ex.slice(0, 56)}…
            </button>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div>
        <p className={labelCls}>Choose template</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {CV_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => set("template", tpl.id as CvTemplateId)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                data.template === tpl.id
                  ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                  : "border-border hover:border-primary/40 bg-card"
              )}
            >
              <div
                className="h-2 w-full rounded-full mb-2"
                style={{ background: tpl.accent }}
              />
              <p className="text-xs font-semibold">{tpl.name}</p>
              <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                {tpl.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Editor */}
        <div className="space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <p className="text-sm font-semibold">Your details</p>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Full name</label>
              <input className={inputCls} value={data.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Your full name" />
            </div>
            <div>
              <label className={labelCls}>Professional title</label>
              <input className={inputCls} value={data.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Instrument Technician" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls} value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={data.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+966 …" />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input className={inputCls} value={data.location} onChange={(e) => set("location", e.target.value)} placeholder="City, Country" />
            </div>
            <div>
              <label className={labelCls}>Website / LinkedIn</label>
              <input className={inputCls} value={data.website} onChange={(e) => set("website", e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Professional summary</label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px]"
              value={data.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="2–4 sentences about your experience and goals"
            />
          </div>

          <div>
            <label className={labelCls}>Skills (comma-separated)</label>
            <input className={inputCls} value={data.skills} onChange={(e) => set("skills", e.target.value)} placeholder="Calibration, PLC, HSE, Excel…" />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Languages</label>
              <input className={inputCls} value={data.languages} onChange={(e) => set("languages", e.target.value)} placeholder="Arabic, English" />
            </div>
            <div>
              <label className={labelCls}>Certifications</label>
              <input className={inputCls} value={data.certifications} onChange={(e) => set("certifications", e.target.value)} placeholder="NEBOSH · BOSIET" />
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Experience</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set("experience", [...data.experience, EMPTY_EXPERIENCE()])}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
            {data.experience.map((exp, idx) => (
              <div key={exp.id} className="rounded-xl border border-border p-3 space-y-2 relative">
                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    set(
                      "experience",
                      data.experience.length > 1
                        ? data.experience.filter((e) => e.id !== exp.id)
                        : [EMPTY_EXPERIENCE()]
                    )
                  }
                  aria-label="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <div className="grid sm:grid-cols-2 gap-2 pr-6">
                  <input className={inputCls} placeholder="Job title" value={exp.title}
                    onChange={(e) => {
                      const next = [...data.experience];
                      next[idx] = { ...exp, title: e.target.value };
                      set("experience", next);
                    }}
                  />
                  <input className={inputCls} placeholder="Company" value={exp.company}
                    onChange={(e) => {
                      const next = [...data.experience];
                      next[idx] = { ...exp, company: e.target.value };
                      set("experience", next);
                    }}
                  />
                  <input className={inputCls} placeholder="Location" value={exp.location}
                    onChange={(e) => {
                      const next = [...data.experience];
                      next[idx] = { ...exp, location: e.target.value };
                      set("experience", next);
                    }}
                  />
                  <div className="flex gap-2 items-center">
                    <input className={inputCls} placeholder="Start" value={exp.start}
                      onChange={(e) => {
                        const next = [...data.experience];
                        next[idx] = { ...exp, start: e.target.value };
                        set("experience", next);
                      }}
                    />
                    <input className={inputCls} placeholder="End" value={exp.end} disabled={exp.current}
                      onChange={(e) => {
                        const next = [...data.experience];
                        next[idx] = { ...exp, end: e.target.value };
                        set("experience", next);
                      }}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => {
                      const next = [...data.experience];
                      next[idx] = { ...exp, current: e.target.checked, end: e.target.checked ? "" : exp.end };
                      set("experience", next);
                    }}
                  />
                  Current role
                </label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[64px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Achievements (one per line)"
                  value={exp.bullets}
                  onChange={(e) => {
                    const next = [...data.experience];
                    next[idx] = { ...exp, bullets: e.target.value };
                    set("experience", next);
                  }}
                />
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Education</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set("education", [...data.education, EMPTY_EDUCATION()])}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
            {data.education.map((ed, idx) => (
              <div key={ed.id} className="rounded-xl border border-border p-3 space-y-2 relative">
                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    set(
                      "education",
                      data.education.length > 1
                        ? data.education.filter((e) => e.id !== ed.id)
                        : [EMPTY_EDUCATION()]
                    )
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <div className="grid sm:grid-cols-2 gap-2 pr-6">
                  <input className={inputCls} placeholder="School / University" value={ed.school}
                    onChange={(e) => {
                      const next = [...data.education];
                      next[idx] = { ...ed, school: e.target.value };
                      set("education", next);
                    }}
                  />
                  <input className={inputCls} placeholder="Degree" value={ed.degree}
                    onChange={(e) => {
                      const next = [...data.education];
                      next[idx] = { ...ed, degree: e.target.value };
                      set("education", next);
                    }}
                  />
                  <input className={inputCls} placeholder="Field of study" value={ed.field}
                    onChange={(e) => {
                      const next = [...data.education];
                      next[idx] = { ...ed, field: e.target.value };
                      set("education", next);
                    }}
                  />
                  <div className="flex gap-2">
                    <input className={inputCls} placeholder="Start" value={ed.start}
                      onChange={(e) => {
                        const next = [...data.education];
                        next[idx] = { ...ed, start: e.target.value };
                        set("education", next);
                      }}
                    />
                    <input className={inputCls} placeholder="End" value={ed.end}
                      onChange={(e) => {
                        const next = [...data.education];
                        next[idx] = { ...ed, end: e.target.value };
                        set("education", next);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-20 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Live preview</p>
            <Button type="button" size="sm" variant="secondary" onClick={printCv} className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          </div>
          <div className="rounded-xl border border-border overflow-auto max-h-[80vh] bg-muted/30 p-2 sm:p-3">
            <CvPreview data={data} className="min-h-[600px] w-full max-w-[210mm] mx-auto" />
          </div>
          <p className="text-[11px] text-muted-foreground text-center">
            Tip: Print / PDF uses your browser’s print dialog — choose “Save as PDF”.
          </p>
        </div>
      </div>
    </div>
  );
}
