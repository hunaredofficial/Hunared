"use client";

import { cn } from "@/lib/utils";
import type { CvData, CvSectionKey } from "@/lib/cv/types";
import { CV_TEMPLATES } from "@/lib/cv/templates";

const SECTION_LABELS: Record<CvSectionKey, string> = {
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  languages: "Languages",
  projects: "Projects",
  achievements: "Achievements",
  custom: "Additional",
};

function hasContent(data: CvData, key: CvSectionKey): boolean {
  switch (key) {
    case "summary":
      return !!data.summary.trim();
    case "experience":
      return data.experience.some((e) => e.title.trim() || e.company.trim());
    case "education":
      return data.education.some((e) => e.school.trim() || e.degree.trim());
    case "skills":
      return !!data.skills.trim();
    case "certifications":
      return !!data.certifications.trim();
    case "languages":
      return !!data.languages.trim();
    case "projects":
      return data.projects.some((p) => p.name.trim());
    case "achievements":
      return !!data.achievements.trim();
    case "custom":
      return !!(data.customSectionTitle.trim() || data.customSectionBody.trim());
    default:
      return false;
  }
}

export function CvPreview({
  data,
  className,
}: {
  data: CvData;
  className?: string;
}) {
  const meta = CV_TEMPLATES.find((t) => t.id === data.template) || CV_TEMPLATES[0];
  const accent = meta.accent;
  const order = data.sectionOrder?.length
    ? data.sectionOrder
    : (Object.keys(SECTION_LABELS) as CvSectionKey[]);

  const isAts = data.template === "ats" || data.template === "classic";
  const isSidebar =
    data.template === "modern" || data.template === "tech" || data.template === "hse";

  const contact = [data.email, data.phone, data.location, data.website]
    .filter(Boolean)
    .join(" · ");

  const renderSection = (key: CvSectionKey) => {
    if (!hasContent(data, key)) return null;
    const title = key === "custom" && data.customSectionTitle.trim()
      ? data.customSectionTitle
      : SECTION_LABELS[key];

    return (
      <section key={key} className="mb-3.5 break-inside-avoid">
        <h2
          className="text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5 pb-0.5"
          style={{
            color: accent,
            borderBottom: `1.5px solid ${accent}33`,
          }}
        >
          {title}
        </h2>
        {key === "summary" && (
          <p className="text-[11.5px] leading-relaxed text-neutral-800 whitespace-pre-wrap">
            {data.summary}
          </p>
        )}
        {key === "skills" && (
          <p className="text-[11.5px] leading-relaxed text-neutral-800">
            {data.skills}
          </p>
        )}
        {key === "languages" && (
          <p className="text-[11.5px] leading-relaxed text-neutral-800">
            {data.languages}
          </p>
        )}
        {key === "certifications" && (
          <p className="text-[11.5px] leading-relaxed text-neutral-800 whitespace-pre-wrap">
            {data.certifications}
          </p>
        )}
        {key === "achievements" && (
          <p className="text-[11.5px] leading-relaxed text-neutral-800 whitespace-pre-wrap">
            {data.achievements}
          </p>
        )}
        {key === "custom" && (
          <p className="text-[11.5px] leading-relaxed text-neutral-800 whitespace-pre-wrap">
            {data.customSectionBody}
          </p>
        )}
        {key === "experience" &&
          data.experience
            .filter((e) => e.title.trim() || e.company.trim())
            .map((e) => (
              <div key={e.id} className="mb-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <p className="text-[12px] font-semibold text-neutral-900">
                    {e.title}
                    {e.company ? (
                      <span className="font-normal text-neutral-700">
                        {" "}
                        · {e.company}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-[10px] text-neutral-500 tabular-nums">
                    {[e.start, e.current ? "Present" : e.end]
                      .filter(Boolean)
                      .join(" – ")}
                  </p>
                </div>
                {e.location && (
                  <p className="text-[10px] text-neutral-500">{e.location}</p>
                )}
                {e.bullets && (
                  <ul className="mt-1 space-y-0.5 list-disc pl-3.5">
                    {e.bullets
                      .split(/\n/)
                      .map((b) => b.trim())
                      .filter(Boolean)
                      .map((b, i) => (
                        <li
                          key={i}
                          className="text-[11px] leading-snug text-neutral-800"
                        >
                          {b}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
        {key === "education" &&
          data.education
            .filter((e) => e.school.trim() || e.degree.trim())
            .map((e) => (
              <div key={e.id} className="mb-2">
                <div className="flex flex-wrap justify-between gap-x-2">
                  <p className="text-[12px] font-semibold text-neutral-900">
                    {[e.degree, e.field].filter(Boolean).join(", ") || e.school}
                  </p>
                  <p className="text-[10px] text-neutral-500 tabular-nums">
                    {[e.start, e.end].filter(Boolean).join(" – ")}
                  </p>
                </div>
                {e.school && (
                  <p className="text-[11px] text-neutral-700">{e.school}</p>
                )}
                {e.details && (
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    {e.details}
                  </p>
                )}
              </div>
            ))}
        {key === "projects" &&
          data.projects
            .filter((p) => p.name.trim())
            .map((p) => (
              <div key={p.id} className="mb-2">
                <p className="text-[12px] font-semibold text-neutral-900">
                  {p.name}
                  {p.role ? (
                    <span className="font-normal text-neutral-700">
                      {" "}
                      · {p.role}
                    </span>
                  ) : null}
                </p>
                {p.description && (
                  <p className="text-[11px] text-neutral-700 mt-0.5 whitespace-pre-wrap">
                    {p.description}
                  </p>
                )}
              </div>
            ))}
      </section>
    );
  };

  return (
    <div
      className={cn(
        "bg-white text-neutral-900 shadow-lg rounded-sm overflow-hidden",
        "print:shadow-none print:rounded-none",
        className
      )}
      id="cv-print-root"
    >
      {/* Header */}
      <header
        className={cn(
          "px-7 pt-6 pb-4",
          !isAts && "text-white"
        )}
        style={
          isAts
            ? { borderBottom: `2px solid ${accent}` }
            : { background: accent }
        }
      >
        <h1
          className={cn(
            "text-xl font-bold tracking-tight",
            isAts ? "text-neutral-900" : "text-white"
          )}
        >
          {data.fullName || "Your Name"}
        </h1>
        {data.title && (
          <p
            className={cn(
              "text-sm mt-0.5",
              isAts ? "text-neutral-600" : "text-white/90"
            )}
          >
            {data.title}
          </p>
        )}
        {contact && (
          <p
            className={cn(
              "text-[10.5px] mt-2 leading-relaxed",
              isAts ? "text-neutral-500" : "text-white/80"
            )}
          >
            {contact}
          </p>
        )}
      </header>

      <div
        className={cn(
          "px-7 py-5",
          isSidebar && "grid grid-cols-[1fr] gap-0"
        )}
      >
        {order.map((key) => renderSection(key))}
        {!order.some((k) => hasContent(data, k)) && (
          <p className="text-sm text-neutral-400 text-center py-12">
            Start editing — your CV preview appears here.
          </p>
        )}
      </div>
    </div>
  );
}
