import type { CvData } from "./types";

export type CompletionItem = {
  key: string;
  label: string;
  done: boolean;
  weight: number;
};

export function getCompletionItems(data: CvData): CompletionItem[] {
  const hasExp = data.experience.some(
    (e) => e.title.trim() || e.company.trim() || e.bullets.trim()
  );
  const hasEdu = data.education.some(
    (e) => e.school.trim() || e.degree.trim()
  );
  return [
    { key: "name", label: "Full name", done: !!data.fullName.trim(), weight: 12 },
    { key: "title", label: "Professional title", done: !!data.title.trim(), weight: 10 },
    { key: "contact", label: "Email or phone", done: !!(data.email.trim() || data.phone.trim()), weight: 10 },
    { key: "location", label: "Location", done: !!data.location.trim(), weight: 6 },
    { key: "summary", label: "Professional summary", done: data.summary.trim().length >= 40, weight: 14 },
    { key: "experience", label: "Work experience", done: hasExp, weight: 18 },
    { key: "education", label: "Education", done: hasEdu, weight: 12 },
    { key: "skills", label: "Skills", done: data.skills.trim().length >= 3, weight: 12 },
    { key: "certifications", label: "Certifications (optional)", done: !!data.certifications.trim(), weight: 6 },
  ];
}

export function getCompletionPercent(data: CvData): number {
  const items = getCompletionItems(data);
  const total = items.reduce((s, i) => s + i.weight, 0);
  const earned = items.filter((i) => i.done).reduce((s, i) => s + i.weight, 0);
  return Math.round((earned / total) * 100);
}
