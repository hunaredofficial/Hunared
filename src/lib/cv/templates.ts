import type { CvTemplateMeta } from "./types";

export const CV_TEMPLATES: CvTemplateMeta[] = [
  { id: "ats", name: "ATS Professional", desc: "Maximum ATS compatibility", accent: "#1e293b", category: "ATS" },
  { id: "classic", name: "Classic", desc: "Traditional single-column", accent: "#1e3a5f", category: "Professional" },
  { id: "professional", name: "Corporate", desc: "Enterprise & Gulf corporate", accent: "#1d4ed8", category: "Professional" },
  { id: "modern", name: "Modern Professional", desc: "Clean contemporary layout", accent: "#2563eb", category: "Modern" },
  { id: "minimal", name: "Minimal Professional", desc: "Sparse, high-clarity", accent: "#334155", category: "Modern" },
  { id: "executive", name: "Executive", desc: "Leadership & management", accent: "#0f172a", category: "Executive" },
  { id: "tech", name: "IT / Technology", desc: "IT support & infrastructure", accent: "#0e7490", category: "Technology" },
  { id: "software", name: "Software / Dev", desc: "Developers & digital roles", accent: "#0369a1", category: "Technology" },
  { id: "engineering", name: "Engineering", desc: "Industrial & engineering", accent: "#b45309", category: "Technical" },
  { id: "hse", name: "HSE / Safety", desc: "Health, safety & environment", accent: "#15803d", category: "Technical" },
  { id: "oilgas", name: "Oil & Gas", desc: "Upstream / downstream roles", accent: "#9a3412", category: "Technical" },
  { id: "construction", name: "Construction", desc: "Site & construction trades", accent: "#a16207", category: "Technical" },
  { id: "healthcare", name: "Healthcare", desc: "Clinical & care roles", accent: "#0f766e", category: "Professional" },
  { id: "finance", name: "Finance / Accounting", desc: "Finance & audit", accent: "#1e40af", category: "Business" },
  { id: "sales", name: "Sales / Marketing", desc: "Commercial roles", accent: "#7c3aed", category: "Business" },
  { id: "graduate", name: "Entry-Level", desc: "Graduate & junior", accent: "#4f46e5", category: "Career stage" },
  { id: "academic", name: "Academic", desc: "Education & research", accent: "#5b21b6", category: "Professional" },
  { id: "hospitality", name: "Hospitality", desc: "Hotels & service", accent: "#be185d", category: "Service" },
  { id: "logistics", name: "Logistics", desc: "Supply chain & warehouse", accent: "#0f766e", category: "Operations" },
  { id: "trades", name: "Skilled Trades", desc: "Technical trades", accent: "#b45309", category: "Trades" },
];
