import type { CvTemplateMeta } from "./types";

/** Professional templates across job fields */
export const CV_TEMPLATES: CvTemplateMeta[] = [
  { id: "ats", name: "ATS Professional", desc: "Maximum ATS compatibility — clean single column", accent: "#1e293b", category: "ATS" },
  { id: "classic", name: "Classic", desc: "Traditional single-column, highly readable", accent: "#1e3a5f", category: "Professional" },
  { id: "professional", name: "Corporate", desc: "Enterprise header — Gulf & corporate roles", accent: "#1d4ed8", category: "Professional" },
  { id: "modern", name: "Modern", desc: "Contemporary spacing with accent bar", accent: "#2563eb", category: "Modern" },
  { id: "minimal", name: "Minimal", desc: "Sparse typography, maximum clarity", accent: "#334155", category: "Modern" },
  { id: "executive", name: "Executive", desc: "Senior leadership & management", accent: "#0f172a", category: "Executive" },
  { id: "tech", name: "Technology / IT", desc: "Software, IT & digital roles", accent: "#0e7490", category: "Technical" },
  { id: "engineering", name: "Engineering", desc: "Industrial, oil & gas, instrumentation", accent: "#b45309", category: "Technical" },
  { id: "hse", name: "HSE / Safety", desc: "Health, safety & environment", accent: "#15803d", category: "Technical" },
  { id: "graduate", name: "Graduate / Entry", desc: "Early career and first roles", accent: "#4f46e5", category: "Career stage" },
];

export const TEMPLATE_FIELD_HINTS: Record<string, string> = {
  ats: "Use standard headings. Prefer keywords from the job ad.",
  engineering: "Highlight tools, standards, shutdowns, permits, field instruments.",
  hse: "Emphasize certifications (NEBOSH, IOSH), incident rates, audits.",
  tech: "List stack, systems, measurable delivery outcomes.",
  executive: "Lead with scope, P&L, team size, strategic results.",
  graduate: "Focus on projects, internships, training, transferable skills.",
};
