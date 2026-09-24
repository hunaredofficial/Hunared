import {
  DEFAULT_CV,
  EMPTY_EDUCATION,
  EMPTY_EXPERIENCE,
  type CvData,
  type CvExperience,
  type CvTemplateId,
} from "./types";

const TEMPLATES: CvTemplateId[] = [
  "classic", "modern", "professional", "minimal", "executive",
  "tech", "ats", "engineering", "hse", "graduate",
];

function pickTemplate(text: string): CvTemplateId | null {
  const t = text.toLowerCase();
  if (/\bats\b/.test(t)) return "ats";
  if (/\bhse\b|safety|nebosh\b|iosh\b/.test(t)) return "hse";
  if (/\binstrument|mechanical engineer|electrical engineer|calibration|plc\b|oil\s*&\s*gas|petro/.test(t)) return "engineering";
  if (/\bsoftware|developer|react|typescript|frontend|backend|devops|full.?stack\b/.test(t)) return "tech";
  if (/\bexecutive|director|vp\b|chief\b|general manager\b/.test(t)) return "executive";
  if (/\bgraduate|entry.?level|fresh\b|junior\b/.test(t)) return "graduate";
  if (/\bminimal\b/.test(t)) return "minimal";
  if (/\bmodern\b/.test(t)) return "modern";
  if (/\bclassic\b/.test(t)) return "classic";
  if (/\bcorporate|professional\b/.test(t)) return "professional";
  return null;
}

function roleFromText(text: string): string | null {
  const patterns = [
    /(?:for an?|as an?|role of|position of|cv for an?|resume for an?)\s+([A-Za-z][A-Za-z0-9\s/&-]{2,50}?)(?:\s+in\s+|\s+applying|\s+for\s+jobs|[.,!\n]|$)/i,
    /\b(Instrument Technician|HSE Engineer|HSE Officer|Safety Officer|Software Engineer|Mechanical Engineer|Electrical Engineer|Project Manager|Accountant|Nurse|Teacher|Welder|Electrician|Pipe Fitter|Scaffolding Supervisor|QA\/QC Inspector|Document Controller|HR Manager|Business Analyst)\b/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

/** Build a full professional summary from known facts only — no invented employers. */
function buildSummary(cv: CvData, intent: string): string {
  const role = cv.title || "professional";
  const where = cv.location ? ` based in ${cv.location}` : "";
  const skills = cv.skills
    ? ` Core strengths include ${cv.skills.split(",").slice(0, 6).map((s) => s.trim()).filter(Boolean).join(", ")}.`
    : "";
  const certs = cv.certifications
    ? ` Credentials: ${cv.certifications}.`
    : "";
  const yearsHint = /(?:\d+)\+?\s*years?/i.exec(intent);
  const years = yearsHint ? ` with ${yearsHint[0]} of relevant experience` : "";

  return (
    `Results-oriented ${role}${years}${where}.` +
    skills +
    certs +
    ` Committed to safe, high-quality delivery and continuous professional development. Open to opportunities that match proven capabilities.`
  ).replace(/\s+/g, " ").trim();
}

/**
 * Local intelligent CV assistant.
 * Creates / improves structure from natural language.
 * NEVER invents employers, degrees, or certifications not present in text.
 */
export function parseCvCommand(text: string, base?: Partial<CvData>): CvData {
  const cv: CvData = {
    ...DEFAULT_CV(),
    ...base,
    experience: base?.experience?.length ? [...base.experience] : [EMPTY_EXPERIENCE()],
    education: base?.education?.length ? [...base.education] : [EMPTY_EDUCATION()],
    projects: base?.projects?.length ? [...base.projects] : [],
    sectionOrder: base?.sectionOrder?.length
      ? [...base.sectionOrder]
      : DEFAULT_CV().sectionOrder,
  };

  const lower = text.toLowerCase();
  const tpl = pickTemplate(text);
  if (tpl) cv.template = tpl;

  // Name
  const nameM =
    text.match(/(?:my name is|i am|i'm)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z.-]+){0,3})/i) ||
    text.match(/^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z.-]+){1,2})\s*[,.]/);
  if (nameM) cv.fullName = nameM[1].trim();

  // Role
  const role = roleFromText(text);
  if (role) cv.title = role;

  // Location
  const locM = text.match(
    /\bin\s+([A-Z][a-zA-Z]+(?:[\s-][A-Z]?[a-zA-Z]+){0,3})(?:\s*[,.]|\s+skills|\s+worked|\s+with|\s+for|$)/
  );
  if (locM && locM[1].length < 45 && !/^(the|a|an)\b/i.test(locM[1])) {
    cv.location = locM[1].trim();
  }
  // Common Gulf cities
  for (const city of ["Riyadh", "Jeddah", "Dammam", "Khobar", "Al Khobar", "Jubail", "Yanbu", "Dubai", "Abu Dhabi", "Doha", "Kuwait", "Manama"]) {
    if (new RegExp(`\\b${city}\\b`, "i").test(text) && !cv.location) {
      cv.location = city;
    }
  }

  // Skills list
  const skillsM = text.match(/skills?[:\s]+([^.]+?)(?:\.|worked|experience|certified|education|$)/i);
  if (skillsM) {
    cv.skills = skillsM[1]
      .split(/[,;|/]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 40)
      .join(", ");
  }

  // Certifications mentioned explicitly
  const certBits: string[] = [];
  const certMap: [RegExp, string][] = [
    [/\bnebosh\s*igc\b/i, "NEBOSH IGC"],
    [/\bnebosh\b/i, "NEBOSH"],
    [/\biosh\b/i, "IOSH"],
    [/\bpmp\b/i, "PMP"],
    [/\bcompTIA\s*a\+/i, "CompTIA A+"],
    [/\baws\s*certified\b/i, "AWS Certified"],
    [/\bcompex\b/i, "CompEx"],
    [/\bfirst aid\b/i, "First Aid"],
  ];
  for (const [re, label] of certMap) {
    if (re.test(text)) certBits.push(label);
  }
  if (certBits.length) {
    const existing = cv.certifications
      ? cv.certifications.split(",").map((s) => s.trim())
      : [];
    cv.certifications = [...new Set([...existing, ...certBits])].join(", ");
  }

  // Experience facts only when stated
  const expM = text.match(
    /worked\s+(?:at|for)\s+([^,.]+?)\s+as\s+([^,.]+?)(?:\s+from\s+(\d{4})\s*(?:to|-|–)\s*(\d{4}|present))?/i
  );
  if (expM) {
    const exp: CvExperience = {
      ...EMPTY_EXPERIENCE(),
      company: expM[1].trim(),
      title: expM[2].trim(),
      start: expM[3] || "",
      end: expM[4]?.toLowerCase() === "present" ? "" : expM[4] || "",
      current: /present/i.test(expM[4] || ""),
      bullets: [
        `Delivered responsibilities as ${expM[2].trim()} at ${expM[1].trim()}`,
        "Followed site procedures, permits, and quality standards",
        "Collaborated with supervisors and cross-functional teams",
      ].join("\n"),
    };
    cv.experience = [exp];
    if (!cv.title) cv.title = exp.title;
  }

  // Contact
  const emailM = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (emailM) cv.email = emailM[0];
  const phoneM = text.match(/(?:\+\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/);
  if (phoneM && phoneM[0].replace(/\D/g, "").length >= 8) cv.phone = phoneM[0].trim();

  // Full professional CV request
  const wantsFull =
    /create|generate|build|write|make.*(cv|resume)|professional cv|full cv/i.test(text);

  if (wantsFull || /summary|improve|professional|rewrite|ats/i.test(text)) {
    if (!cv.summary || wantsFull || /rewrite|improve|make.*professional/i.test(text)) {
      cv.summary = buildSummary(cv, text);
    }
  }

  // ATS preference
  if (/\bats\b/i.test(text)) cv.template = "ats";

  // Target Saudi / international wording only in summary (no false claims)
  if (/saudi/i.test(text) && cv.summary && !/saudi/i.test(cv.summary)) {
    cv.summary += " Familiar with professional expectations in the Saudi / GCC market.";
  }
  if (/international/i.test(text) && cv.summary && !/international/i.test(cv.summary)) {
    cv.summary += " Comfortable working in multicultural and international environments.";
  }

  return cv;
}

/** Import plain-text or extracted resume text into structured fields. */
export function importCvFromText(text: string, base?: Partial<CvData>): CvData {
  const cv = parseCvCommand(text, base);
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (lines[0] && lines[0].length < 60 && !cv.fullName) {
    // Prefer name-like first line
    if (/^[A-Z][a-zA-Z]+(\s+[A-Z][a-zA-Z.-]+){0,3}$/.test(lines[0])) {
      cv.fullName = lines[0];
    }
  }

  const skillIdx = lines.findIndex((l) => /^(skills|technical skills|competencies)\b/i.test(l));
  if (skillIdx >= 0 && !cv.skills) {
    const chunk = lines.slice(skillIdx + 1, skillIdx + 8).join(" ");
    cv.skills = chunk
      .split(/[,•|;·]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 45)
      .slice(0, 24)
      .join(", ");
  }

  const sumIdx = lines.findIndex((l) =>
    /^(summary|profile|objective|professional summary|about me)\b/i.test(l)
  );
  if (sumIdx >= 0 && (!cv.summary || cv.summary.length < 40)) {
    cv.summary = lines.slice(sumIdx + 1, sumIdx + 6).join(" ").slice(0, 700);
  }

  // Experience section heuristic: lines with year ranges
  const expLines = lines.filter((l) =>
    /\b(19|20)\d{2}\b.*\b(19|20)\d{2}|present|current\b/i.test(l)
  );
  if (expLines.length && !cv.experience.some((e) => e.company.trim())) {
    // leave parseCvCommand experience; do not invent companies from ambiguous lines
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
    issues.push({ severity: "critical", area: "Personal", message: "Full name is missing.", action: "Add your full name." });
  }
  if (!data.title.trim()) {
    issues.push({ severity: "warn", area: "Personal", message: "Professional title is empty.", action: "Add a clear target role." });
  }
  if (!data.email.trim() && !data.phone.trim()) {
    issues.push({ severity: "critical", area: "Contact", message: "No contact method.", action: "Add email and/or phone." });
  }
  if (data.summary.trim().length < 40) {
    issues.push({ severity: "warn", area: "Summary", message: "Summary is short or missing.", action: "Write 2–4 professional sentences." });
  }
  const realExp = data.experience.filter((e) => e.title.trim() || e.company.trim());
  if (!realExp.length) {
    issues.push({ severity: "critical", area: "Experience", message: "No work experience.", action: "Add at least one role with facts you actually held." });
  } else {
    realExp.forEach((e, i) => {
      if (!e.bullets.trim()) {
        issues.push({
          severity: "warn",
          area: "Experience",
          message: `Role ${i + 1} has no bullet points.`,
          action: "Add 2–5 real achievements or duties.",
        });
      }
    });
  }
  if (!data.skills.trim()) {
    issues.push({ severity: "warn", area: "Skills", message: "Skills empty.", action: "List skills you genuinely have." });
  }
  if (data.template !== "ats" && data.template !== "classic") {
    issues.push({
      severity: "info",
      area: "ATS",
      message: "Design template selected.",
      action: "Use ATS Professional when applying via automated systems.",
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
    skills: "Calibration, HART, PLC basics, Loop checking, Permit to Work, Troubleshooting",
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


/** Local text improvements — never adds new employers or degrees. */
export type ImproveAction =
  | "professional"
  | "ats"
  | "shorten"
  | "expand"
  | "grammar"
  | "bullets";

export function improveText(text: string, action: ImproveAction): string {
  let s = text.trim();
  if (!s) return s;
  if (action === "shorten") {
    const sentences = s.split(/(?<=[.!?])\s+/);
    return sentences.slice(0, Math.max(1, Math.ceil(sentences.length * 0.6))).join(" ");
  }
  if (action === "expand" && s.length < 400) {
    return s + " Focused on quality, safety, and measurable results in professional environments.";
  }
  if (action === "grammar" || action === "professional" || action === "ats") {
    s = s
      .replace(/\bi am\b/gi, "Experienced professional")
      .replace(/\bi've\b/gi, "Have")
      .replace(/\bcan't\b/gi, "cannot")
      .replace(/\bdon't\b/gi, "do not")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (action === "bullets") {
    const lines = s.split(/\n|•|-/).map((l) => l.trim()).filter(Boolean);
    return lines
      .map((l) => {
        const x = l.replace(/^[•\-\d.\s]+/, "");
        if (/^(managed|led|developed|implemented|improved|delivered|performed|supported|coordinated)/i.test(x)) return x;
        return x.charAt(0).toUpperCase() + x.slice(1);
      })
      .join("\n");
  }
  if (action === "ats") {
    s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  }
  return s;
}

export function extractJobKeywords(jobText: string): string[] {
  const stop = new Set("the a an and or for with from this that your our their into onto using use based able will can must should".split(" "));
  const words = jobText.toLowerCase().match(/[a-z][a-z+#.]{2,}/g) || [];
  const freq = new Map<string, number>();
  for (const w of words) {
    if (stop.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([w]) => w);
}

export function tailorSuggestions(cv: CvData, jobText: string): string[] {
  const keywords = extractJobKeywords(jobText);
  const blob = JSON.stringify(cv).toLowerCase();
  const missing = keywords.filter((k) => !blob.includes(k)).slice(0, 12);
  const tips: string[] = [];
  if (missing.length) {
    tips.push(
      "Keywords in the job ad not clearly present in your CV: " +
        missing.join(", ") +
        ". Only add skills/experience you truly have."
    );
  }
  if (!cv.summary || cv.summary.length < 40) {
    tips.push("Add a professional summary aligned to the target role title.");
  }
  if (!cv.skills.trim()) {
    tips.push("Add a skills section using real skills that match the job.");
  }
  const weakBullets = cv.experience.filter((e) => e.title && !e.bullets.trim());
  if (weakBullets.length) {
    tips.push("Some roles lack bullet points — add real duties/achievements.");
  }
  if (!tips.length) {
    tips.push("Your CV already covers many job keywords. Strengthen bullets with measurable outcomes you actually delivered.");
  }
  return tips;
}
