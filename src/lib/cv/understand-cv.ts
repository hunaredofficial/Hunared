/**
 * Deep CV understanding: parse uploaded/pasted resume text into
 * structured CvData + full editable document HTML preserving ALL content.
 * Does not invent employers, dates, or credentials.
 */

import {
  DEFAULT_CV,
  EMPTY_EDUCATION,
  EMPTY_EXPERIENCE,
  type CvData,
  type CvEducation,
  type CvExperience,
  type CvTemplateId,
} from "./types";

export type UnderstoodCv = {
  data: CvData;
  documentHtml: string;
  sectionsFound: string[];
  experienceCount: number;
};

const SECTION_ALIASES: { key: string; patterns: RegExp }[] = [
  {
    key: "objective",
    patterns: /^(career\s*objective|objective|professional\s*summary|summary|profile|about\s*me)\s*:?$/i,
  },
  {
    key: "education",
    patterns: /^(educational?\s*qualifications?|education|academic|qualifications?)\s*:?$/i,
  },
  {
    key: "professional_qual",
    patterns: /^(professional\s*qualifications?|certifications?|certificates?|licenses?|training|courses?)\s*:?$/i,
  },
  {
    key: "experience",
    patterns:
      /^(work\s*summary|work\s*experience|employment(\s*history)?|experience|professional\s*experience|career\s*history|projects?)\s*:?$/i,
  },
  {
    key: "duties",
    patterns:
      /^(duties\s*(&|and)?\s*responsibilities|responsibilities|key\s*responsibilities|job\s*duties|key\s*duties)\s*:?$/i,
  },
  {
    key: "skills",
    patterns: /^(skills|technical\s*skills|core\s*competenc|key\s*skills|competencies)\s*:?$/i,
  },
  {
    key: "languages",
    patterns: /^(languages?|language\s*skills)\s*:?$/i,
  },
  {
    key: "personal",
    patterns: /^(personal\s*(information|details)|biodata)\s*:?$/i,
  },
];

function normLine(l: string) {
  return l.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
}

function isSectionHeader(line: string): string | null {
  const t = normLine(line).replace(/:+$/, "").trim();
  if (!t || t.length > 60) return null;
  // ALL CAPS short line
  if (t === t.toUpperCase() && /[A-Z]/.test(t) && t.length >= 3) {
    for (const s of SECTION_ALIASES) {
      if (s.patterns.test(t)) return s.key;
    }
    return "custom:" + t;
  }
  // Title Case ending with colon
  if (/:$/.test(line.trim())) {
    for (const s of SECTION_ALIASES) {
      if (s.patterns.test(t)) return s.key;
    }
    return "custom:" + t;
  }
  for (const s of SECTION_ALIASES) {
    if (s.patterns.test(t)) return s.key;
  }
  return null;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function pickTemplate(text: string): CvTemplateId {
  const t = text.toLowerCase();
  if (/\bhse\b|nebosh|fire\s*alarm|safety\s*officer|osha\b/.test(t)) return "hse";
  if (/\binstrument|electrical|mechanical|technician|foreman|supervisor/.test(t))
    return "engineering";
  if (/\bsoftware|developer|react|python\b/.test(t)) return "tech";
  return "professional";
}

/** Split raw text into ordered section bodies */
function splitSections(text: string): { header: string | null; key: string; body: string[] }[] {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\f/g, "\n")
    .split("\n")
    .map(normLine);

  const sections: { header: string | null; key: string; body: string[] }[] = [];
  let current = { header: null as string | null, key: "header", body: [] as string[] };

  for (const line of lines) {
    if (!line) {
      if (current.body.length && current.body[current.body.length - 1] !== "") {
        current.body.push("");
      }
      continue;
    }
    const sk = isSectionHeader(line);
    if (sk) {
      if (current.body.length || current.key !== "header") {
        sections.push(current);
      }
      current = {
        header: line.replace(/:+$/, "").trim(),
        key: sk,
        body: [],
      };
      continue;
    }
    current.body.push(line);
  }
  if (current.body.length || current.key !== "header") sections.push(current);
  return sections;
}

function parseHeaderBlock(lines: string[], cv: CvData) {
  const joined = lines.join("\n");
  const emailM = joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailM) cv.email = emailM[0];
  const phoneM = joined.match(
    /(?:Mobile\s*No\.?|Phone|Tel|Cell)\s*[:.]?\s*([+\d][\d\s\-().]{7,})/i
  ) || joined.match(/(?:\+?\d{1,3}[\s-]?)?\d{2,3}[\s-]?\d{3}[\s-]?\d{3,4}/);
  if (phoneM) {
    const p = (phoneM[1] || phoneM[0]).trim();
    if (p.replace(/\D/g, "").length >= 8) cv.phone = p;
  }
  const iqamaM = joined.match(/Iqama\s*[:.]?\s*(\d{5,15})/i);
  const locationBits: string[] = [];
  for (const line of lines) {
    if (/Iqama|Mobile|Email|Phone|Tel/i.test(line) && /:/.test(line)) continue;
    if (/@/.test(line)) continue;
    if (/saudi|arabia|jubail|riyadh|dammam|jeddah|dubai|uae|kuwait|qatar/i.test(line)) {
      locationBits.push(line.replace(/^(Al-?)/, "Al-"));
    }
  }
  if (locationBits.length) cv.location = [...new Set(locationBits)].join(", ");

  // Name: first strong line
  for (const line of lines) {
    if (
      line.length > 2 &&
      line.length < 50 &&
      /^[A-Z][A-Za-z]+(\s+[A-Z][A-Za-z.-]+){0,4}$/.test(line) &&
      !/Technician|Engineer|Manager|Officer|Supervisor/i.test(line)
    ) {
      cv.fullName = line;
      break;
    }
  }
  // Title: line with job-like words near top
  for (const line of lines) {
    if (
      /Technician|Engineer|Officer|Supervisor|Manager|Specialist|Operator|Electrician|Welder|Nurse|Developer/i.test(
        line
      ) &&
      line.length < 70 &&
      !/@/.test(line)
    ) {
      cv.title = line.replace(/\s{2,}.*/, "").trim();
      break;
    }
  }
  // Store iqama in custom if present
  if (iqamaM) {
    cv.customSectionTitle = cv.customSectionTitle || "Additional details";
    cv.customSectionBody = [cv.customSectionBody, `Iqama: ${iqamaM[1]}`]
      .filter(Boolean)
      .join("\n");
  }
}

function parseEducation(body: string[]): CvEducation[] {
  const items: CvEducation[] = [];
  for (const line of body) {
    if (!line || isSectionHeader(line)) continue;
    if (/^[\u2022\-\*•]/.test(line) || line.length > 2) {
      const clean = line.replace(/^[\u2022\-\*•]\s*/, "").trim();
      if (!clean) continue;
      // DAE / Bachelor / Diploma patterns
      const degreeM = clean.match(
        /^(DAE|B\.?Sc\.?|B\.?E\.?|B\.?Tech|M\.?Sc\.?|Diploma|Certificate|NEBOSH|IOSH|Bachelor|Master)\b(.*)$/i
      );
      if (degreeM) {
        items.push({
          ...EMPTY_EDUCATION(),
          degree: degreeM[1].trim(),
          field: degreeM[2].trim().replace(/^[\s\-–—:]+/, ""),
          school: "",
          end: "",
        });
      } else {
        items.push({
          ...EMPTY_EDUCATION(),
          degree: clean,
          field: "",
          school: "",
          end: "",
        });
      }
    }
  }
  return items.length ? items : [EMPTY_EDUCATION()];
}

/** Parse Work Summary blocks: Project / Company / Position triplets */
function parseWorkSummary(body: string[]): CvExperience[] {
  const experiences: CvExperience[] = [];
  let cur: { project?: string; company?: string; position?: string } = {};

  const flush = () => {
    if (cur.project || cur.company || cur.position) {
      const title = cur.position || "Technician";
      const company = cur.company || cur.project || "";
      const loc = cur.project && cur.company ? cur.project : "";
      experiences.push({
        ...EMPTY_EXPERIENCE(),
        title,
        company,
        location: loc,
        start: "",
        end: "",
        current: false,
        bullets: cur.project && cur.company ? `Project: ${cur.project}` : "",
      });
      cur = {};
    }
  };

  for (const raw of body) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const proj = line.match(/^Project\s*[:.]?\s*(.+)$/i);
    const comp = line.match(/^Company\s*[:.]?\s*(.+)$/i);
    const pos = line.match(/^Position\s*[:.]?\s*(.+)$/i);
    // Also: "Project    United Plant" with multiple spaces
    const proj2 = !proj && line.match(/^Project\s{2,}(.+)$/i);
    const comp2 = !comp && line.match(/^Company\s{2,}(.+)$/i);
    const pos2 = !pos && line.match(/^Position\s{2,}(.+)$/i);

    if (proj || proj2) {
      if (cur.project || cur.company) flush();
      cur.project = (proj?.[1] || proj2?.[1] || "").trim();
    } else if (comp || comp2) {
      cur.company = (comp?.[1] || comp2?.[1] || "").trim();
    } else if (pos || pos2) {
      cur.position = (pos?.[1] || pos2?.[1] || "").trim();
      flush();
    } else if (/^[A-Z0-9]/.test(line) && !/duties|here's|simplified/i.test(line)) {
      // Sometimes project name alone on line after blank
      if (!cur.project && line.length < 80) cur.project = line;
    }
  }
  flush();
  return experiences;
}

function parseBulletList(body: string[]): string[] {
  const out: string[] = [];
  for (const line of body) {
    if (!line) continue;
    // Skip meta filler from some CVs
    if (/here'?s a simplified version/i.test(line)) continue;
    if (/duties\s*&\s*responsibilities of/i.test(line)) continue;
    if (/this version is concise/i.test(line)) continue;
    if (/suitable for a cv/i.test(line)) continue;
    const clean = line.replace(/^[\u2022\-\*•]\s*/, "").trim();
    if (clean.length > 8) out.push(clean);
  }
  return out;
}

function parseSkills(body: string[]): string {
  const parts: string[] = [];
  for (const line of body) {
    if (!line) continue;
    line.split(/[,;|•]/).forEach((p) => {
      const t = p.trim();
      if (t.length > 1) parts.push(t);
    });
  }
  return parts.join(", ");
}

/**
 * Main entry: deeply understand CV text → structured data + full document HTML.
 */
export function understandCv(text: string, base?: Partial<CvData>): UnderstoodCv {
  const cv: CvData = { ...DEFAULT_CV(), ...base };
  const sections = splitSections(text);
  const sectionsFound: string[] = [];
  let dutiesBullets: string[] = [];
  let certLines: string[] = [];

  for (const sec of sections) {
    sectionsFound.push(sec.key);
    if (sec.key === "header") {
      parseHeaderBlock(sec.body, cv);
      continue;
    }
    if (sec.key === "objective") {
      cv.summary = sec.body.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
      continue;
    }
    if (sec.key === "education") {
      cv.education = parseEducation(sec.body);
      continue;
    }
    if (sec.key === "professional_qual") {
      certLines = sec.body.filter(Boolean).map((l) => l.replace(/^[\u2022\-\*•]\s*/, ""));
      cv.certifications = certLines.join("\n");
      continue;
    }
    if (sec.key === "experience") {
      const jobs = parseWorkSummary(sec.body);
      if (jobs.length) cv.experience = jobs;
      continue;
    }
    if (sec.key === "duties") {
      dutiesBullets = parseBulletList(sec.body);
      continue;
    }
    if (sec.key === "skills") {
      cv.skills = parseSkills(sec.body);
      continue;
    }
    if (sec.key === "languages") {
      cv.languages = sec.body.filter(Boolean).join(", ");
      continue;
    }
    if (sec.key.startsWith("custom:")) {
      const title = sec.key.slice(7);
      cv.customSectionTitle = title;
      cv.customSectionBody = sec.body.filter(Boolean).join("\n");
    }
  }

  // Attach duties to most recent experience or as achievements
  if (dutiesBullets.length) {
    if (cv.experience.length && cv.experience[0].title) {
      // Put full duties on first role as representative, keep others with project note
      cv.experience = cv.experience.map((ex, idx) =>
        idx === 0
          ? { ...ex, bullets: dutiesBullets.join("\n") }
          : ex
      );
    }
    cv.achievements = dutiesBullets.slice(0, 8).join("\n");
  }

  // Skills fallback from duties keywords
  if (!cv.skills && dutiesBullets.length) {
    const keywords = [
      "Fire Alarm",
      "Installation",
      "Testing",
      "Maintenance",
      "Troubleshooting",
      "PTW",
      "PPE",
      "Control Panels",
      "Smoke Detectors",
      "Commissioning",
    ];
    const found = keywords.filter((k) =>
      dutiesBullets.some((b) => b.toLowerCase().includes(k.toLowerCase()))
    );
    if (found.length) cv.skills = found.join(", ");
  }

  cv.template = pickTemplate(text);

  // Guarantee name/title from whole text if header parse missed
  if (!cv.fullName) {
    const m = text.match(/^([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z.-]+){1,3})\s*$/m);
    if (m) cv.fullName = m[1];
  }
  if (!cv.title) {
    const m = text.match(
      /\b(Fire Alarm Technician|Instrumentation Technician|HSE Officer|Electrical Technician|[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\s+(?:Technician|Engineer|Officer|Supervisor|Manager))\b/
    );
    if (m) cv.title = m[1];
  }

  const documentHtml = buildFullDocumentHtml(cv, sections, dutiesBullets, certLines);

  return {
    data: cv,
    documentHtml,
    sectionsFound: [...new Set(sectionsFound)],
    experienceCount: cv.experience.filter((e) => e.company || e.title).length,
  };
}

/** Rebuild a complete professional document from understood sections — ALL content. */
function buildFullDocumentHtml(
  cv: CvData,
  sections: { header: string | null; key: string; body: string[] }[],
  duties: string[],
  certs: string[]
): string {
  const parts: string[] = [];

  if (cv.fullName) parts.push(`<h1>${esc(cv.fullName)}</h1>`);
  if (cv.title) parts.push(`<p><strong>${esc(cv.title)}</strong></p>`);

  const contactBits = [
    cv.location,
    cv.phone ? `Mobile: ${cv.phone}` : "",
    cv.email ? `Email: ${cv.email}` : "",
    cv.customSectionBody?.includes("Iqama")
      ? cv.customSectionBody.split("\n").find((l) => /Iqama/i.test(l))
      : "",
  ].filter(Boolean);
  if (contactBits.length) {
    parts.push(`<p>${contactBits.map(esc).join(" · ")}</p>`);
  }
  parts.push("<hr />");

  // Prefer original section order from upload
  const emitted = new Set<string>();

  for (const sec of sections) {
    if (sec.key === "header") continue;
    const title =
      sec.header ||
      (sec.key === "objective"
        ? "CAREER OBJECTIVE"
        : sec.key === "education"
          ? "EDUCATIONAL QUALIFICATION"
          : sec.key === "professional_qual"
            ? "PROFESSIONAL QUALIFICATION"
            : sec.key === "experience"
              ? "WORK SUMMARY"
              : sec.key === "duties"
                ? "DUTIES & RESPONSIBILITIES"
                : sec.key === "skills"
                  ? "SKILLS"
                  : sec.key.startsWith("custom:")
                    ? sec.key.slice(7)
                    : sec.key.toUpperCase());

    if (emitted.has(sec.key) && sec.key !== "custom") continue;
    emitted.add(sec.key);

    parts.push(`<h2>${esc(title.toUpperCase())}</h2>`);

    if (sec.key === "objective" && cv.summary) {
      parts.push(`<p>${esc(cv.summary)}</p>`);
      continue;
    }

    if (sec.key === "education") {
      parts.push("<ul>");
      for (const ed of cv.education) {
        const line = [ed.degree, ed.field, ed.school].filter(Boolean).join(" — ");
        if (line) parts.push(`<li>${esc(line)}</li>`);
      }
      // Also keep any body lines not captured
      for (const line of sec.body) {
        if (!line) continue;
        const c = line.replace(/^[\u2022\-\*•]\s*/, "");
        if (c && !cv.education.some((e) => c.includes(e.degree) || c.includes(e.field))) {
          parts.push(`<li>${esc(c)}</li>`);
        }
      }
      parts.push("</ul>");
      continue;
    }

    if (sec.key === "professional_qual") {
      parts.push("<ul>");
      const list = certs.length ? certs : sec.body.filter(Boolean);
      for (const c of list) {
        parts.push(`<li>${esc(c.replace(/^[\u2022\-\*•]\s*/, ""))}</li>`);
      }
      parts.push("</ul>");
      continue;
    }

    if (sec.key === "experience") {
      for (const ex of cv.experience) {
        if (!ex.company && !ex.title) continue;
        const head = [ex.title, ex.company].filter(Boolean).join(" — ");
        parts.push(`<p><strong>${esc(head)}</strong></p>`);
        if (ex.location || (ex.bullets && ex.bullets.startsWith("Project:"))) {
          const proj =
            ex.location ||
            (ex.bullets.startsWith("Project:") ? ex.bullets.replace(/^Project:\s*/, "") : "");
          if (proj && !duties.length) parts.push(`<p>${esc("Project: " + proj)}</p>`);
          else if (proj) parts.push(`<p>${esc("Project: " + proj)}</p>`);
        }
      }
      // Raw body fallback if parser got nothing
      if (!cv.experience.some((e) => e.company)) {
        for (const line of sec.body) {
          if (line) parts.push(`<p>${esc(line)}</p>`);
        }
      }
      continue;
    }

    if (sec.key === "duties") {
      const bullets = duties.length ? duties : parseBulletList(sec.body);
      parts.push("<ul>");
      for (const b of bullets) parts.push(`<li>${esc(b)}</li>`);
      parts.push("</ul>");
      continue;
    }

    // Generic section: dump all body lines
    const listItems = sec.body.filter((l) => /^[\u2022\-\*•]/.test(l));
    if (listItems.length >= sec.body.filter(Boolean).length * 0.5) {
      parts.push("<ul>");
      for (const line of sec.body) {
        if (!line) continue;
        parts.push(`<li>${esc(line.replace(/^[\u2022\-\*•]\s*/, ""))}</li>`);
      }
      parts.push("</ul>");
    } else {
      for (const line of sec.body) {
        if (line) parts.push(`<p>${esc(line)}</p>`);
      }
    }
  }

  // If duties existed but section key missed, append
  if (duties.length && !emitted.has("duties")) {
    parts.push("<h2>DUTIES &amp; RESPONSIBILITIES</h2>");
    parts.push("<ul>");
    for (const b of duties) parts.push(`<li>${esc(b)}</li>`);
    parts.push("</ul>");
  }

  return parts.join("\n") || "<p></p>";
}
