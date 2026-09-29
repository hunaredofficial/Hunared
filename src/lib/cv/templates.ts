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
  { id: "ats", name: "Classic ATS", desc: "Single column, max ATS safety", accent: "#0f172a", category: "ATS / Classic", ats: true },
  { id: "classic", name: "Classic", desc: "Traditional corporate", accent: "#1e293b", category: "ATS / Classic", ats: true },
  { id: "professional", name: "Corporate Blue", desc: "Enterprise & Gulf corporate", accent: "#1d4ed8", category: "ATS / Classic", ats: true },
  { id: "modern", name: "Modern", desc: "Contemporary professional", accent: "#4f46e5", category: "Modern" },
  { id: "minimal", name: "Minimal", desc: "Clean whitespace focus", accent: "#334155", category: "Modern", ats: true },
  { id: "executive", name: "Executive", desc: "Senior leadership", accent: "#0f172a", category: "Executive" },
  { id: "tech", name: "Technical", desc: "Technical specialist", accent: "#0e7490", category: "Technical" },
  { id: "software", name: "Software / IT", desc: "Developers & IT", accent: "#6d28d9", category: "Technical" },
  { id: "engineering", name: "Engineering", desc: "Industrial engineering", accent: "#0369a1", category: "Technical" },
  { id: "hse", name: "HSE / Safety", desc: "Safety professionals", accent: "#15803d", category: "Technical" },
  { id: "oilgas", name: "Oil & Gas", desc: "Energy & industrial", accent: "#9a3412", category: "Technical" },
  { id: "construction", name: "Construction", desc: "Site & construction", accent: "#a16207", category: "Technical" },
  { id: "healthcare", name: "Healthcare", desc: "Clinical & care", accent: "#0f766e", category: "Service" },
  { id: "finance", name: "Finance", desc: "Accounting & finance", accent: "#1e3a8a", category: "Business" },
  { id: "sales", name: "Sales", desc: "Sales & commercial", accent: "#c2410c", category: "Business" },
  { id: "graduate", name: "Graduate", desc: "Early career", accent: "#2563eb", category: "Career", ats: true },
  { id: "academic", name: "Academic", desc: "Research & teaching", accent: "#3730a3", category: "Career" },
  { id: "hospitality", name: "Hospitality", desc: "Hotels & service", accent: "#be185d", category: "Service", photo: true },
  { id: "logistics", name: "Logistics", desc: "Supply chain", accent: "#0f766e", category: "Operations" },
  { id: "trades", name: "Skilled Trades", desc: "Technical trades", accent: "#b45309", category: "Trades" },
  { id: "photo_pro", name: "Portrait Professional", desc: "Header with profile image", accent: "#1d4ed8", category: "Portrait", photo: true },
  { id: "photo_exec", name: "Portrait Executive", desc: "Leadership with profile image", accent: "#0f172a", category: "Portrait", photo: true },
  { id: "photo_modern", name: "Portrait Modern", desc: "Modern layout with image", accent: "#4f46e5", category: "Portrait", photo: true },
  { id: "photo_gulf", name: "Portrait Gulf", desc: "Gulf professional with image", accent: "#0f766e", category: "Portrait", photo: true },
  { id: "photo_minimal", name: "Portrait Minimal", desc: "Minimal with profile image", accent: "#334155", category: "Portrait", photo: true },
];
