/**
 * Hunared CV AI Engine — local intelligence (no fabricated experience).
 * Optional OpenAI enhancement is handled in API routes.
 */

import type { CvData } from "./types";
import { getCompletionPercent } from "./completion";

const GULF_HINTS = ["saudi", "uae", "qatar", "kuwait", "oman", "bahrain", "gulf", "ksa", "dubai", "riyadh", "jubail", "dammam"];

function blob(data: CvData): string {
  return [
    data.fullName,
    data.title,
    data.summary,
    data.skills,
    data.certifications,
    data.achievements,
    data.languages,
    ...data.experience.flatMap((e) => [e.title, e.company, e.bullets, e.location]),
    ...data.education.flatMap((e) => [e.school, e.degree, e.field]),
    ...data.projects.flatMap((p) => [p.name, p.description]),
  ]
    .join(" ")
    .toLowerCase();
}

function extractKeywords(text: string): string[] {
  const stop = new Set(
    "the a an and or for with from this that your our their is are was were be been to of in on at by as we you it will can may should must have has had not".split(
      " "
    )
  );
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([w]) => w);
}

/** Profession-aware command chips */
export function getPersonalizedCommands(data: CvData, profession?: string | null): string[] {
  const role = (profession || data.title || "professional").trim();
  const b = blob(data);
  const cmds: string[] = [
    `Improve my ${role} CV`,
    "Make my professional summary stronger",
    "Improve work experience bullets",
    "Make this CV ATS friendly",
    "Analyze my CV and list what is missing",
  ];

  if (/instrument|calibration|loop/i.test(role + b)) {
    cmds.push(
      "Strengthen calibration and loop-check experience wording",
      "Optimize for oil & gas Instrument Technician jobs",
      "Add relevant instrumentation skills (only if I have them)"
    );
  } else if (/hse|safety|nebosh|osha/i.test(role + b)) {
    cmds.push(
      "Strengthen HSE / permit-to-work experience wording",
      "Optimize for Safety Officer roles in the Gulf",
      "Improve toolbox talk and risk assessment language"
    );
  } else if (/electric/i.test(role + b)) {
    cmds.push(
      "Strengthen electrical maintenance and troubleshooting wording",
      "Optimize for Electrical Technician Gulf jobs"
    );
  } else if (/mechanic/i.test(role + b)) {
    cmds.push("Strengthen mechanical maintenance wording", "Optimize for Mechanical Technician roles");
  } else if (/weld|scaffold|rigger|hvac|plumb/i.test(role + b)) {
    cmds.push(`Optimize my ${role} CV for site / industrial jobs`, "Highlight safety and certifications clearly");
  } else if (/develop|software|engineer|it\b/i.test(role + b)) {
    cmds.push("Make experience more achievement-focused", "Optimize technical skills section");
  }

  if (GULF_HINTS.some((h) => b.includes(h) || role.toLowerCase().includes(h))) {
    cmds.push("Make it suitable for Saudi / Gulf jobs");
  } else {
    cmds.push("Make it suitable for international employers");
  }

  if (!data.summary.trim()) cmds.unshift("Write a professional summary from my experience");
  if (data.experience.every((e) => !e.bullets.trim())) cmds.push("Help me write experience bullets from job titles");

  cmds.push("Make my CV more professional", "Create a one-page focused version suggestion");
  // unique preserve order
  const seen = new Set<string>();
  return cmds.filter((c) => (seen.has(c) ? false : (seen.add(c), true))).slice(0, 10);
}

export type AtsReport = {
  summary: string;
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  issues: string[];
};

export function buildAtsReport(data: CvData, jobDescription?: string): AtsReport {
  const issues: string[] = [];
  const text = blob(data);

  if (!data.fullName.trim()) issues.push("Add your full name at the top.");
  if (!data.email.trim() && !data.phone.trim()) issues.push("Add email or phone so recruiters can contact you.");
  if (!data.summary.trim()) issues.push("Add a professional summary (3–5 lines).");
  if (!data.experience.length) issues.push("Add at least one work experience entry.");
  if (data.experience.some((e) => !e.bullets.trim())) issues.push("Some jobs have no bullet points — add real responsibilities.");
  if (!data.skills.trim()) issues.push("Add a skills section with tools and competencies you actually have.");
  if (data.sectionOrder.length < 3) issues.push("Use clear standard section headings (Experience, Education, Skills).");
  if (/\|/.test(data.summary) || data.summary.length > 900) issues.push("Keep the summary concise and avoid complex table-like layouts for ATS.");

  let matched: string[] = [];
  let missing: string[] = [];
  let score = 55;

  if (data.fullName) score += 5;
  if (data.email || data.phone) score += 5;
  if (data.summary.trim().length > 40) score += 8;
  if (data.experience.length) score += 10;
  if (data.skills.trim()) score += 7;
  if (data.education.length) score += 5;
  if (data.certifications.trim()) score += 5;

  if (jobDescription?.trim()) {
    const kws = extractKeywords(jobDescription);
    matched = kws.filter((k) => text.includes(k));
    missing = kws.filter((k) => !text.includes(k)).slice(0, 15);
    const ratio = kws.length ? matched.length / kws.length : 0;
    score = Math.round(score * 0.6 + ratio * 40);
    if (missing.length > 8) {
      issues.push(
        "Several job keywords are absent — only add ones that match your real experience."
      );
    }
  }

  score = Math.max(20, Math.min(96, score));
  const summary =
    score >= 80
      ? "Strong ATS structure. Review keyword gaps only where they match real experience."
      : score >= 60
        ? "Decent ATS baseline. Improve missing contact/summary/bullets and relevant keywords."
        : "Needs improvement for ATS — complete core sections before keyword optimization.";

  return { summary, score, matchedKeywords: matched, missingKeywords: missing, issues };
}

export type TailorReport = {
  suggestions: string[];
  strongMatches: string[];
  gaps: string[];
};

export function buildTailorReport(data: CvData, jobDescription: string): TailorReport {
  const kws = extractKeywords(jobDescription);
  const text = blob(data);
  const strongMatches = kws.filter((k) => text.includes(k)).slice(0, 15);
  const gaps = kws.filter((k) => !text.includes(k)).slice(0, 12);
  const suggestions: string[] = [];

  if (strongMatches.length) {
    suggestions.push(`Emphasize existing strengths already on your CV: ${strongMatches.slice(0, 8).join(", ")}.`);
  }
  if (gaps.length) {
    suggestions.push(
      `Job mentions terms not clearly on your CV: ${gaps.slice(0, 8).join(", ")}. Only add what you truly did.`
    );
  }
  if (data.summary.trim()) {
    suggestions.push("Rewrite the summary to mirror the job’s top requirements using only your real background.");
  } else {
    suggestions.push("Write a summary targeted at this role using your real experience.");
  }
  suggestions.push("Reorder or expand experience bullets that match the job’s main duties.");
  suggestions.push("Put the most relevant skills first in the skills section.");
  if (!data.certifications.trim() && /certif|nebosh|osha|iso|license/i.test(jobDescription)) {
    suggestions.push("Job emphasizes certifications — add any real certificates you hold.");
  }
  suggestions.push("Save a new CV version for this job so your general CV stays unchanged.");

  return { suggestions, strongMatches, gaps };
}

export type ReadinessReport = {
  percent: number;
  content: string;
  ats: string;
  professionalism: string;
  missing: string[];
  nextActions: string[];
};

export function buildReadinessReport(data: CvData): ReadinessReport {
  const percent = getCompletionPercent(data);
  const missing: string[] = [];
  const nextActions: string[] = [];

  if (!data.fullName.trim()) missing.push("Full name");
  if (!data.title.trim()) missing.push("Professional title");
  if (!data.email.trim()) missing.push("Email");
  if (!data.phone.trim()) missing.push("Phone");
  if (!data.summary.trim()) {
    missing.push("Professional summary");
    nextActions.push("Write a professional summary from my experience");
  }
  if (!data.experience.length || data.experience.every((e) => !e.title.trim())) {
    missing.push("Work experience");
    nextActions.push("Help structure my work experience");
  } else if (data.experience.some((e) => !e.bullets.trim())) {
    missing.push("Experience bullet points");
    nextActions.push("Improve work experience bullets");
  }
  if (!data.skills.trim()) {
    missing.push("Skills");
    nextActions.push("Improve my skills section");
  }
  if (!data.education.length) missing.push("Education (if applicable)");
  if (!data.certifications.trim()) nextActions.push("Add certifications I actually hold");

  nextActions.push("Make this CV ATS friendly", "Analyze my CV and list what is missing");
  if (data.title) nextActions.push(`Optimize for ${data.title} jobs`);

  const content =
    percent >= 85 ? "Strong" : percent >= 60 ? "Good — add missing sections" : "Incomplete";
  const ats =
    data.fullName && (data.email || data.phone) && data.experience.length
      ? "Acceptable structure"
      : "Needs core fields";
  const professionalism =
    data.summary.trim().length > 60 && data.experience.some((e) => e.bullets.includes("•") || e.bullets.length > 40)
      ? "Professional baseline"
      : "Can be stronger";

  return {
    percent,
    content,
    ats,
    professionalism,
    missing,
    nextActions: [...new Set(nextActions)].slice(0, 6),
  };
}

/** Local command router used as fallback when API is offline */
export function applyLocalCommand(command: string, data: CvData): CvData {
  const cmd = command.toLowerCase();
  const next = { ...data, experience: data.experience.map((e) => ({ ...e })) };

  if (/ats|applicant tracking/i.test(cmd)) {
    // Light ATS tidy — no content invention
    next.summary = next.summary.replace(/\s+/g, " ").trim();
    next.skills = next.skills
      .split(/[,;•|/]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");
  }

  if (/shorter|one page|concise/i.test(cmd) && next.summary.length > 280) {
    next.summary = next.summary.slice(0, 280).replace(/\s+\S*$/, "") + "…";
  }

  if (/gulf|saudi|uae|qatar/i.test(cmd) && next.summary && !/gulf|saudi|uae|middle east/i.test(next.summary)) {
    next.summary = next.summary.trim() + " Seeking opportunities in the Gulf region.";
  }

  return next;
}
