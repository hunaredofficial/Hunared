import {
  DEFAULT_CV,
  EMPTY_EDUCATION,
  EMPTY_EXPERIENCE,
  type CvData,
  type CvExperience,
  type CvEducation,
  type CvTemplateId,
} from "./types";

const TEMPLATES: CvTemplateId[] = [
  "classic",
  "modern",
  "professional",
  "minimal",
  "executive",
  "tech",
  "ats",
  "engineering",
  "hse",
  "graduate",
];

function pickTemplate(text: string): CvTemplateId | null {
  const t = text.toLowerCase();
  if (/\bats\b/.test(t)) return "ats";
  if (/\bhse\b|safety|nebosh\b/.test(t)) return "hse";
  if (/\binstrument|engineer|calibration|plc\b/.test(t)) return "engineering";
  if (/\bsoftware|developer|react|typescript|frontend|backend\b/.test(t)) return "tech";
  if (/\bexecutive|director|vp\b|chief\b/.test(t)) return "executive";
  if (/\bgraduate|entry.?level|fresh\b/.test(t)) return "graduate";
  if (/\bminimal\b/.test(t)) return "minimal";
  if (/\bmodern\b/.test(t)) return "modern";
  if (/\bclassic\b/.test(t)) return "classic";
  if (/\bprofessional\b/.test(t)) return "professional";
  return null;
}

/** Rule-based natural language → CV fields. Never invents employers/degrees. */
export function parseCvCommand(text: string, base?: Partial<CvData>): CvData {
  const cv: CvData = {
    ...DEFAULT_CV(),
    ...base,
    experience:
      base?.experience?.length ? [...base.experience] : [EMPTY_EXPERIENCE()],
    education:
      base?.education?.length ? [...base.education] : [EMPTY_EDUCATION()],
    projects: base?.projects?.length ? [...base.projects] : [],
    sectionOrder: base?.sectionOrder?.length
      ? [...base.sectionOrder]
      : DEFAULT_CV().sectionOrder,
  };

  const lower = text.toLowerCase();
  const tpl = pickTemplate(text);
  if (tpl) cv.template = tpl;

  // Name patterns
  const nameM =
    text.match(
      /(?:my name is|i am|i'm)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z.-]+){0,3})/i
    ) ||
    text.match(
      /^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z.-]+){1,2})\s*[,.]/
    );
  if (nameM) cv.fullName = nameM[1].trim();

  // Title / role
  const titleM = text.match(
    /(?:as an?|role[:\s]+|title[:\s]+|for an?)\s+([A-Za-z][A-Za-z\s/&-]{2,40}?)(?:\s+in\s+|\s+applying|\s+for\s+jobs|[.,])/i
  );
  if (titleM) cv.title = titleM[1].trim();
  else {
    const roles = [
      "Instrument Technician",
      "HSE Engineer",
      "Software Engineer",
      "Project Manager",
      "Electrician",
      "Mechanical Engineer",
      "Safety Officer",
    ];
    for (const r of roles) {
      if (lower.includes(r.toLowerCase()) && !cv.title) {
        cv.title = r;
        break;
      }
    }
  }

  // Location
  const locM = text.match(
    /\bin\s+([A-Z][a-zA-Z]+(?:[\s-][A-Z][a-zA-Z]+)*)(?:\s*[,.]|\s+skills|\s+worked|$)/
  );
  if (locM && locM[1].length < 40) cv.location = locM[1].trim();

  // Skills
  const skillsM = text.match(
    /skills?[:\s]+([^.]+?)(?:\.|worked|experience|certified|$)/i
  );
  if (skillsM) {
    cv.skills = skillsM[1]
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");
  }

  // Certifications
  const certBits: string[] = [];
  if (/\bnebosh\b/i.test(text)) certBits.push("NEBOSH");
  if (/\biosh\b/i.test(text)) certBits.push("IOSH");
  if (/\bpmp\b/i.test(text)) certBits.push("PMP");
  if (/\bcompTIA\b/i.test(text)) certBits.push("CompTIA");
  if (certBits.length) {
    cv.certifications = [cv.certifications, ...certBits]
      .filter(Boolean)
      .join(", ");
  }

  // Experience: "Worked at X as Y from A to B/present"
  const expM = text.match(
    /worked\s+at\s+([^,.]+?)\s+as\s+([^,.]+?)(?:\s+from\s+(\d{4})\s*(?:to|-|–)\s*(\d{4}|present))?/i
  );
  if (expM) {
    const exp: CvExperience = {
      ...EMPTY_EXPERIENCE(),
      company: expM[1].trim(),
      title: expM[2].trim(),
      start: expM[3] || "",
      end: expM[4]?.toLowerCase() === "present" ? "" : expM[4] || "",
      current: /present/i.test(expM[4] || ""),
    };
    cv.experience = [exp];
    if (!cv.title) cv.title = exp.title;
  }

  // Email / phone if present
  const emailM = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (emailM) cv.email = emailM[0];
  const phoneM = text.match(
    /(?:\+\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/
  );
  if (phoneM && phoneM[0].replace(/\D/g, "").length >= 8) {
    cv.phone = phoneM[0].trim();
  }

  // Professional summary if asked to create/improve
  if (
    /create|professional|summary|cv for/i.test(text) &&
    (cv.fullName || cv.title)
  ) {
    const who = cv.fullName || "Professional";
    const role = cv.title || "specialist";
    const where = cv.location ? ` based in ${cv.location}` : "";
    const sk = cv.skills ? ` Skilled in ${cv.skills}.` : "";
    if (!cv.summary || /make my cv|create/i.test(text)) {
      cv.summary = `${who} is an experienced ${role}${where}.${sk} Seeking opportunities to contribute technical expertise and deliver reliable results.`.trim();
    }
  }

  // Improve summary only (keep facts)
  if (/make.*(professional|stronger)|rewrite.*summary|improve.*summary/i.test(text) && cv.summary) {
    cv.summary = cv.summary
      .replace(/\bi am\b/gi, "Experienced professional")
      .replace(/\s+/g, " ")
      .trim();
    if (!/seeking|looking/i.test(cv.summary)) {
      cv.summary += " Focused on delivering measurable results in professional environments.";
    }
  }

  // ATS mode
  if (/\bats\b/i.test(text)) {
    cv.template = "ats";
  }

  return cv;
}

/** Import plain-text resume into structured CV (best-effort, no invented facts). */
export function importCvFromText(text: string, base?: Partial<CvData>): CvData {
  const cv = parseCvCommand(text, base);
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines[0] && lines[0].length < 60 && !cv.fullName) {
    cv.fullName = lines[0];
  }

  // Collect skills-like lines
  const skillIdx = lines.findIndex((l) =>
    /^(skills|technical skills|competencies)\b/i.test(l)
  );
  if (skillIdx >= 0 && !cv.skills) {
    const chunk = lines.slice(skillIdx + 1, skillIdx + 6).join(" ");
    cv.skills = chunk
      .split(/[,•|;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 40)
      .slice(0, 20)
      .join(", ");
  }

  // Summary block
  const sumIdx = lines.findIndex((l) =>
    /^(summary|profile|objective|professional summary)\b/i.test(l)
  );
  if (sumIdx >= 0 && (!cv.summary || cv.summary.length < 40)) {
    cv.summary = lines.slice(sumIdx + 1, sumIdx + 5).join(" ").slice(0, 600);
  }

  return cv;
}

export type AnalysisIssue = {
  severity: "info" | "warn" | "critical";
  area: string;
  message: string;
  action: string;
};

export function analyzeCv(data: CvData): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];

  if (!data.fullName.trim()) {
    issues.push({
      severity: "critical",
      area: "Personal",
      message: "Full name is missing.",
      action: "Add your full name at the top of the CV.",
    });
  }
  if (!data.title.trim()) {
    issues.push({
      severity: "warn",
      area: "Personal",
      message: "Professional title is empty.",
      action: "Add a clear target role (e.g. Instrument Technician).",
    });
  }
  if (!data.email.trim() && !data.phone.trim()) {
    issues.push({
      severity: "critical",
      area: "Contact",
      message: "No contact method provided.",
      action: "Add an email and/or phone number.",
    });
  }
  if (data.summary.trim().length < 40) {
    issues.push({
      severity: "warn",
      area: "Summary",
      message: "Professional summary is short or missing.",
      action: "Write 2–4 sentences covering role, strengths, and focus.",
    });
  }
  const realExp = data.experience.filter(
    (e) => e.title.trim() || e.company.trim()
  );
  if (realExp.length === 0) {
    issues.push({
      severity: "critical",
      area: "Experience",
      message: "No work experience entries.",
      action: "Add at least one role with company and responsibilities.",
    });
  } else {
    realExp.forEach((e, i) => {
      if (!e.bullets.trim()) {
        issues.push({
          severity: "warn",
          area: "Experience",
          message: `Role ${i + 1} (${e.title || "Untitled"}) has no bullet points.`,
          action: "Add 2–5 achievement-focused bullets.",
        });
      }
    });
  }
  if (!data.skills.trim()) {
    issues.push({
      severity: "warn",
      area: "Skills",
      message: "Skills section is empty.",
      action: "List relevant technical and soft skills.",
    });
  }
  if (!data.education.some((e) => e.school.trim() || e.degree.trim())) {
    issues.push({
      severity: "info",
      area: "Education",
      message: "Education section is empty.",
      action: "Add degrees or relevant training if applicable.",
    });
  }
  if (data.template !== "ats" && data.template !== "classic") {
    issues.push({
      severity: "info",
      area: "ATS",
      message: "Current template is design-oriented.",
      action: "Use ATS Professional or Classic when applying through automated systems.",
    });
  }
  return issues;
}

export function sampleCv(): CvData {
  return {
    ...DEFAULT_CV(),
    fullName: "Sara Khan",
    title: "Instrument Technician",
    email: "sara.khan@example.com",
    phone: "+966 50 000 0000",
    location: "Al Khobar, Saudi Arabia",
    summary:
      "Instrument Technician with hands-on experience in calibration, loop checking, and field instrumentation in oil & gas environments. Skilled in HART communicators, PLC basics, and permit-to-work systems.",
    skills:
      "Calibration, HART, PLC basics, Loop checking, Permit to Work, Troubleshooting",
    languages: "English, Arabic, Urdu",
    certifications: "NEBOSH IGC, CompEx awareness",
    experience: [
      {
        ...EMPTY_EXPERIENCE(),
        title: "Instrument Technician",
        company: "Gulf Petro Services",
        location: "Jubail, Saudi Arabia",
        start: "2019",
        current: true,
        bullets:
          "Performed preventive and corrective calibration on field instruments\nSupported shutdown activities and loop checks\nMaintained accurate calibration records to site standards",
      },
    ],
    education: [
      {
        ...EMPTY_EDUCATION(),
        school: "Technical Institute",
        degree: "Diploma",
        field: "Instrumentation & Control",
        end: "2018",
      },
    ],
    template: "engineering",
  };
}

