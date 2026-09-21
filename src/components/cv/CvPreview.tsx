"use client";

import { cn } from "@/lib/utils";
import type { CvData, CvTemplateId } from "@/lib/cv/types";
import { CV_TEMPLATES } from "@/lib/cv/templates";

function SectionTitle({
  children,
  accent,
  variant,
}: {
  children: React.ReactNode;
  accent: string;
  variant: CvTemplateId;
}) {
  if (variant === "minimal") {
    return (
      <h2 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2 mt-4">
        {children}
      </h2>
    );
  }
  return (
    <h2
      className="text-[12px] font-bold tracking-wide uppercase mb-2 mt-3 pb-1 border-b-2"
      style={{ borderColor: accent, color: accent }}
    >
      {children}
    </h2>
  );
}

function SkillPills({ skills, accent }: { skills: string; accent: string }) {
  const list = skills
    .split(/[,|•·]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((s) => (
        <span
          key={s}
          className="text-[10px] px-2 py-0.5 rounded-full border"
          style={{ borderColor: accent + "55", color: accent }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

export function CvPreview({ data, className }: { data: CvData; className?: string }) {
  const meta = CV_TEMPLATES.find((t) => t.id === data.template) || CV_TEMPLATES[2];
  const accent = meta.accent;
  const t = data.template;

  const contactLine = [data.email, data.phone, data.location, data.website]
    .filter(Boolean)
    .join("  ·  ");

  const exp = data.experience.filter((e) => e.title || e.company);
  const edu = data.education.filter((e) => e.school || e.degree);

  // ── Modern sidebar ──────────────────────────────────────────────
  if (t === "modern") {
    return (
      <div
        className={cn("bg-white text-slate-900 shadow-lg overflow-hidden flex text-[11px] leading-relaxed", className)}
        id="cv-print-root"
      >
        <aside className="w-[32%] text-white p-5 space-y-4" style={{ background: accent }}>
          <div>
            <p className="text-lg font-bold leading-tight">{data.fullName || "Your Name"}</p>
            <p className="text-[11px] opacity-90 mt-1">{data.title || "Professional Title"}</p>
          </div>
          <div className="space-y-1 text-[10px] opacity-95">
            {data.email && <p>{data.email}</p>}
            {data.phone && <p>{data.phone}</p>}
            {data.location && <p>{data.location}</p>}
            {data.website && <p>{data.website}</p>}
          </div>
          {data.skills && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5 opacity-80">Skills</p>
              <div className="flex flex-col gap-1">
                {data.skills.split(/[,|]/).map((s) => s.trim()).filter(Boolean).map((s) => (
                  <span key={s} className="text-[10px] bg-white/15 rounded px-1.5 py-0.5">{s}</span>
                ))}
              </div>
            </div>
          )}
          {data.languages && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">Languages</p>
              <p className="text-[10px]">{data.languages}</p>
            </div>
          )}
          {data.certifications && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">Certifications</p>
              <p className="text-[10px]">{data.certifications}</p>
            </div>
          )}
        </aside>
        <main className="flex-1 p-5 space-y-1">
          {data.summary && (
            <>
              <SectionTitle accent={accent} variant={t}>Profile</SectionTitle>
              <p className="text-slate-700">{data.summary}</p>
            </>
          )}
          {exp.length > 0 && (
            <>
              <SectionTitle accent={accent} variant={t}>Experience</SectionTitle>
              {exp.map((e) => (
                <div key={e.id} className="mb-2.5">
                  <div className="flex justify-between gap-2">
                    <p className="font-semibold text-slate-900">{e.title}</p>
                    <p className="text-[10px] text-slate-500 whitespace-nowrap">
                      {e.start}
                      {e.start && (e.end || e.current) ? " – " : ""}
                      {e.current ? "Present" : e.end}
                    </p>
                  </div>
                  <p className="text-slate-600">{[e.company, e.location].filter(Boolean).join(" · ")}</p>
                  {e.bullets && (
                    <ul className="mt-1 list-disc pl-4 text-slate-700 space-y-0.5">
                      {e.bullets.split("\n").filter(Boolean).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </>
          )}
          {edu.length > 0 && (
            <>
              <SectionTitle accent={accent} variant={t}>Education</SectionTitle>
              {edu.map((e) => (
                <div key={e.id} className="mb-2">
                  <p className="font-semibold">{e.degree}{e.field ? ` in ${e.field}` : ""}</p>
                  <p className="text-slate-600">{e.school}</p>
                  <p className="text-[10px] text-slate-500">
                    {[e.start, e.end].filter(Boolean).join(" – ")}
                  </p>
                </div>
              ))}
            </>
          )}
        </main>
      </div>
    );
  }

  // ── Executive bold header ───────────────────────────────────────
  if (t === "executive") {
    return (
      <div className={cn("bg-white text-slate-900 shadow-lg overflow-hidden text-[11px] leading-relaxed", className)} id="cv-print-root">
        <header className="text-white px-6 py-5" style={{ background: accent }}>
          <p className="text-2xl font-bold tracking-tight">{data.fullName || "Your Name"}</p>
          <p className="text-sm opacity-90 mt-0.5">{data.title || "Professional Title"}</p>
          <p className="text-[10px] mt-2 opacity-85">{contactLine}</p>
        </header>
        <div className="px-6 py-4">
          {data.summary && (
            <>
              <SectionTitle accent={accent} variant={t}>Executive summary</SectionTitle>
              <p className="text-slate-700">{data.summary}</p>
            </>
          )}
          {exp.length > 0 && (
            <>
              <SectionTitle accent={accent} variant={t}>Professional experience</SectionTitle>
              {exp.map((e) => (
                <div key={e.id} className="mb-2.5">
                  <div className="flex justify-between">
                    <p className="font-bold">{e.title} — {e.company}</p>
                    <p className="text-[10px] text-slate-500">
                      {e.start}{e.start && (e.end || e.current) ? " – " : ""}{e.current ? "Present" : e.end}
                    </p>
                  </div>
                  {e.location && <p className="text-slate-500">{e.location}</p>}
                  {e.bullets && (
                    <ul className="mt-1 list-disc pl-4 space-y-0.5">
                      {e.bullets.split("\n").filter(Boolean).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </>
          )}
          {edu.length > 0 && (
            <>
              <SectionTitle accent={accent} variant={t}>Education</SectionTitle>
              {edu.map((e) => (
                <p key={e.id} className="mb-1">
                  <span className="font-semibold">{e.degree}{e.field ? `, ${e.field}` : ""}</span>
                  {" — "}
                  {e.school}
                  {(e.start || e.end) && (
                    <span className="text-slate-500"> ({[e.start, e.end].filter(Boolean).join("–")})</span>
                  )}
                </p>
              ))}
            </>
          )}
          {data.skills && (
            <>
              <SectionTitle accent={accent} variant={t}>Core competencies</SectionTitle>
              <SkillPills skills={data.skills} accent={accent} />
            </>
          )}
          {(data.languages || data.certifications) && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              {data.languages && (
                <div>
                  <SectionTitle accent={accent} variant={t}>Languages</SectionTitle>
                  <p>{data.languages}</p>
                </div>
              )}
              {data.certifications && (
                <div>
                  <SectionTitle accent={accent} variant={t}>Certifications</SectionTitle>
                  <p>{data.certifications}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Tech skills-first ───────────────────────────────────────────
  if (t === "tech") {
    return (
      <div className={cn("bg-white text-slate-900 shadow-lg overflow-hidden text-[11px] leading-relaxed", className)} id="cv-print-root">
        <header className="px-6 pt-5 pb-3 border-b-4" style={{ borderColor: accent }}>
          <p className="text-xl font-bold" style={{ color: accent }}>{data.fullName || "Your Name"}</p>
          <p className="text-sm text-slate-600">{data.title || "Professional Title"}</p>
          <p className="text-[10px] text-slate-500 mt-1">{contactLine}</p>
        </header>
        <div className="px-6 py-4 grid grid-cols-1 gap-1">
          {data.skills && (
            <>
              <SectionTitle accent={accent} variant={t}>Technical skills</SectionTitle>
              <SkillPills skills={data.skills} accent={accent} />
            </>
          )}
          {data.summary && (
            <>
              <SectionTitle accent={accent} variant={t}>Summary</SectionTitle>
              <p className="text-slate-700">{data.summary}</p>
            </>
          )}
          {exp.length > 0 && (
            <>
              <SectionTitle accent={accent} variant={t}>Experience</SectionTitle>
              {exp.map((e) => (
                <div key={e.id} className="mb-2">
                  <p className="font-semibold">{e.title} <span className="text-slate-500 font-normal">@ {e.company}</span></p>
                  <p className="text-[10px] text-slate-500">
                    {[e.location, [e.start, e.current ? "Present" : e.end].filter(Boolean).join(" – ")].filter(Boolean).join(" · ")}
                  </p>
                  {e.bullets && (
                    <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                      {e.bullets.split("\n").filter(Boolean).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </>
          )}
          {edu.length > 0 && (
            <>
              <SectionTitle accent={accent} variant={t}>Education</SectionTitle>
              {edu.map((e) => (
                <p key={e.id}>
                  <span className="font-semibold">{e.school}</span>
                  {e.degree && ` — ${e.degree}`}
                  {e.field && ` (${e.field})`}
                </p>
              ))}
            </>
          )}
          {(data.certifications || data.languages) && (
            <div className="grid grid-cols-2 gap-2 mt-1">
              {data.certifications && (
                <div>
                  <SectionTitle accent={accent} variant={t}>Certifications</SectionTitle>
                  <p>{data.certifications}</p>
                </div>
              )}
              {data.languages && (
                <div>
                  <SectionTitle accent={accent} variant={t}>Languages</SectionTitle>
                  <p>{data.languages}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Classic / Professional / Minimal (single column variants) ───
  const isPro = t === "professional";
  const isMin = t === "minimal";

  return (
    <div
      className={cn(
        "bg-white text-slate-900 shadow-lg overflow-hidden text-[11px] leading-relaxed",
        className
      )}
      id="cv-print-root"
    >
      <header
        className={cn("px-6", isPro ? "py-5 text-white" : "pt-6 pb-3")}
        style={isPro ? { background: accent } : undefined}
      >
        <p
          className={cn(
            "font-bold tracking-tight",
            isMin ? "text-2xl font-light" : "text-xl",
            isPro ? "text-white" : ""
          )}
          style={!isPro ? { color: accent } : undefined}
        >
          {data.fullName || "Your Name"}
        </p>
        <p className={cn("mt-0.5", isPro ? "text-white/90 text-sm" : "text-slate-600 text-sm")}>
          {data.title || "Professional Title"}
        </p>
        <p className={cn("text-[10px] mt-1.5", isPro ? "text-white/80" : "text-slate-500")}>
          {contactLine || "email · phone · location"}
        </p>
      </header>
      <div className="px-6 py-4">
        {data.summary && (
          <>
            <SectionTitle accent={accent} variant={t}>
              {isMin ? "About" : "Professional summary"}
            </SectionTitle>
            <p className="text-slate-700">{data.summary}</p>
          </>
        )}
        {exp.length > 0 && (
          <>
            <SectionTitle accent={accent} variant={t}>Experience</SectionTitle>
            {exp.map((e) => (
              <div key={e.id} className="mb-2.5">
                <div className="flex justify-between gap-2">
                  <p className="font-semibold">
                    {e.title}
                    {e.company ? ` — ${e.company}` : ""}
                  </p>
                  <p className="text-[10px] text-slate-500 whitespace-nowrap">
                    {e.start}
                    {e.start && (e.end || e.current) ? " – " : ""}
                    {e.current ? "Present" : e.end}
                  </p>
                </div>
                {e.location && <p className="text-slate-500">{e.location}</p>}
                {e.bullets && (
                  <ul className="mt-1 list-disc pl-4 space-y-0.5 text-slate-700">
                    {e.bullets.split("\n").filter(Boolean).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}
        {edu.length > 0 && (
          <>
            <SectionTitle accent={accent} variant={t}>Education</SectionTitle>
            {edu.map((e) => (
              <div key={e.id} className="mb-1.5">
                <p className="font-semibold">
                  {e.degree}
                  {e.field ? ` in ${e.field}` : ""}
                </p>
                <p className="text-slate-600">{e.school}</p>
                {(e.start || e.end) && (
                  <p className="text-[10px] text-slate-500">
                    {[e.start, e.end].filter(Boolean).join(" – ")}
                  </p>
                )}
              </div>
            ))}
          </>
        )}
        {data.skills && (
          <>
            <SectionTitle accent={accent} variant={t}>Skills</SectionTitle>
            {isMin ? (
              <p className="text-slate-700">{data.skills}</p>
            ) : (
              <SkillPills skills={data.skills} accent={accent} />
            )}
          </>
        )}
        {(data.languages || data.certifications) && (
          <div className="grid grid-cols-2 gap-3">
            {data.languages && (
              <div>
                <SectionTitle accent={accent} variant={t}>Languages</SectionTitle>
                <p>{data.languages}</p>
              </div>
            )}
            {data.certifications && (
              <div>
                <SectionTitle accent={accent} variant={t}>Certifications</SectionTitle>
                <p>{data.certifications}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
