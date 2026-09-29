import type { CvTemplateId } from "./types";

export type CvTemplateMeta = {
  id: CvTemplateId;
  name: string;
  desc: string;
  accent: string;
  category: string;
  photo?: boolean;
  ats?: boolean;
};

export const CV_TEMPLATES: CvTemplateMeta[] = [
  { id: "ats", name: "Classic ATS", desc: "Single column, maximum ATS safety", accent: "#0f172a", category: "ATS / Classic", ats: true },
  { id: "classic", name: "Classic", desc: "Traditional corporate layout", accent: "#1e293b", category: "ATS / Classic", ats: true },
  { id: "professional", name: "Professional", desc: "Clean professional hierarchy", accent: "#1d4ed8", category: "ATS / Classic", ats: true },
  { id: "modern", name: "Modern", desc: "Contemporary spacing & type", accent: "#4f46e5", category: "Modern Professional" },
  { id: "minimal", name: "Minimal", desc: "Whitespace-forward minimal", accent: "#334155", category: "Modern Professional", ats: true },
  { id: "executive", name: "Executive", desc: "Senior leadership presence", accent: "#0f172a", category: "Executive" },
  { id: "tech", name: "Technical", desc: "Technical specialist layout", accent: "#0e7490", category: "Technical / Engineering" },
  { id: "software", name: "Software", desc: "Developers & IT roles", accent: "#6d28d9", category: "Technical / Engineering" },
  { id: "engineering", name: "Engineering", desc: "Engineering professionals", accent: "#0369a1", category: "Technical / Engineering" },
  { id: "hse", name: "HSE / Safety", desc: "Safety & HSE officers", accent: "#b45309", category: "Technical / Engineering" },
  { id: "oilgas", name: "Oil & Gas", desc: "Energy & industrial projects", accent: "#9a3412", category: "Technical / Engineering" },
  { id: "construction", name: "Construction", desc: "Site & construction roles", accent: "#a16207", category: "Technical / Engineering" },
  { id: "healthcare", name: "Healthcare", desc: "Clinical & care roles", accent: "#0f766e", category: "Service" },
  { id: "finance", name: "Finance", desc: "Accounting & finance", accent: "#1e3a8a", category: "Corporate" },
  { id: "sales", name: "Sales", desc: "Sales & business development", accent: "#c2410c", category: "Corporate" },
  { id: "graduate", name: "Graduate", desc: "Early career / fresh graduate", accent: "#2563eb", category: "ATS / Classic", ats: true },
  { id: "academic", name: "Academic", desc: "Research & academic", accent: "#3730a3", category: "ATS / Classic" },
  { id: "hospitality", name: "Hospitality", desc: "Hotels & service", accent: "#be185d", category: "Service", photo: true },
  { id: "logistics", name: "Logistics", desc: "Supply chain & warehouse", accent: "#0f766e", category: "Operations" },
  { id: "trades", name: "Skilled Trades", desc: "Technical trades", accent: "#b45309", category: "Trades" },
];

export const TEMPLATE_CATEGORIES = [
  "ATS / Classic",
  "Modern Professional",
  "Executive",
  "Technical / Engineering",
  "Corporate",
  "Service",
  "Operations",
  "Trades",
] as const;
