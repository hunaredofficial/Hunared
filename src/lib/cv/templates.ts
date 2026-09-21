import type { CvTemplateMeta } from "./types";

export const CV_TEMPLATES: CvTemplateMeta[] = [
  {
    id: "classic",
    name: "Classic",
    desc: "Traditional single-column, ATS-friendly",
    accent: "#1e3a5f",
  },
  {
    id: "modern",
    name: "Modern",
    desc: "Clean sidebar layout with accent bar",
    accent: "#2563eb",
  },
  {
    id: "professional",
    name: "Professional",
    desc: "Corporate two-tone header — ideal for Gulf jobs",
    accent: "#0f172a",
  },
  {
    id: "minimal",
    name: "Minimal",
    desc: "Whitespace-focused, elegant typography",
    accent: "#334155",
  },
  {
    id: "executive",
    name: "Executive",
    desc: "Bold header band for senior roles",
    accent: "#1e40af",
  },
  {
    id: "tech",
    name: "Tech",
    desc: "Skills-first layout for engineers & IT",
    accent: "#0ea5e9",
  },
];
