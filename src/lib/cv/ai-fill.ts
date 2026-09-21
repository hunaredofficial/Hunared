/**
 * Free AI CV fill — rule-based parser that turns natural language into CV sections.
 * Works without an API key. Optional OpenAI polish via /api/cv/ai.
 */
import {
  DEFAULT_CV,
  EMPTY_EDUCATION,
  EMPTY_EXPERIENCE,
  type CvData,
  type CvExperience,
  type CvEducation,
  type CvTemplateId,
} from "./types";

const TEMPLATE_HINTS: [RegExp, CvTemplateId][] = [
  [/\b(classic|traditional|ats)\b/i, "classic"],
  [/\b(modern|sidebar)\b/i, "modern"],
  [/\b(professional|corporate|gulf)\b/i, "professional"],
  [/\b(minimal|simple|clean)\b/i, "minimal"],
  [/\b(executive|senior|manager)\b/i, "executive"],
  [/\b(tech|engineer|developer|it)\b/i, "tech"],
];

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function lines(block: string): string[] {
  return block
    .split(/\n|;|\u2022|\|/)
    .map((s) => s.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean);
}

/**
 * Parse a free-text CV description / bullet paste into structured CvData.
 * Merges onto `base` when provided (keeps existing fields user already filled).
 */
export function parseCvCommand(text: string, base?: Partial<CvData>): CvData {
  const cv: CvData = { ...DEFAULT_CV(), ...base, experience: base?.experience?.length ? [...base.experience] : [EMPTY_EXPERIENCE()], education: base?.education?.length ? [...base.education] : [EMPTY_EDUCATION()] };
  const raw = text.trim();
  if (!raw) return cv;
  const t = raw;

  // Template selection
  for (const [re, id] of TEMPLATE_HINTS) {
    if (re.test(t)) {
      cv.template = id;
      break;
    }
  }

  // Name
  const nameM =
    t.match(/(?:my name is|i am|i'm|name[:\s]+)\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,3})/) ||
    t.match(/^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3})\s*[-–|,]/m);
  if (nameM) cv.fullName = nameM[1].trim();

  // Title / profession
  const titleM =
    t.match(
      /(?:title|profession|role|position|job)[:\s]+([^\n.|]{3,60})/i
    ) ||
    t.match(
      /\b((?:Senior |Junior |Lead )?(?:Instrument|Mechanical|Electrical|Civil|Software|HSE|Safety|Project)\s+(?:Technician|Engineer|Officer|Manager)|(?:Accountant|Nurse|Driver|Welder|Developer))\b/i
    );
  if (titleM) cv.title = titleM[1].trim();

  // Contact
  const emailM = t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailM) cv.email = emailM[0];
  const phoneM = t.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/);
  if (phoneM && phoneM[0].replace(/\D/g, "").length >= 8) cv.phone = phoneM[0].trim();

  // Location
  const locM = t.match(
    /(?:based in|located in|live in|from|location[:\s]+)\s*([A-Za-z\s,]{3,40})/i
  );
  if (locM) cv.location = locM[1].replace(/\.$/, "").trim();
  else {
    const cities = ["Riyadh", "Jeddah", "Dammam", "Khobar", "Jubail", "Dubai", "Abu Dhabi", "Doha", "Manama", "Muscat"];
    for (const c of cities) {
      if (new RegExp(`\\b${c}\\b`, "i").test(t)) {
        cv.location = c;
        break;
      }
    }
  }

  // Summary
  const sumM = t.match(
    /(?:summary|about me|profile|objective)[:\s]+([\s\S]{20,400}?)(?=\n\s*(?:experience|education|skills|work|certification)|$)/i
  );
  if (sumM) cv.summary = sumM[1].replace(/\s+/g, " ").trim();
  else if (cv.title && !cv.summary) {
    cv.summary = `Results-oriented ${cv.title} with hands-on experience delivering quality work in demanding environments. Seeking opportunities to contribute technical expertise and grow with a leading organization.`;
  }

  // Skills
  const skillsM = t.match(
    /(?:skills?|expertise|competencies)[:\s]+([\s\S]{5,300}?)(?=\n\s*(?:experience|education|languages|certification|work)|$)/i
  );
  if (skillsM) {
    cv.skills = lines(skillsM[1]).join(", ");
  } else if (/\b(plc|scada|autocad|solidworks|javascript|python|react|hse|osha|sap)\b/i.test(t)) {
    const found = t.match(
      /\b(PLC|SCADA|AutoCAD|SolidWorks|JavaScript|TypeScript|Python|React|Node\.?js|HSE|OSHA|NEBOSH|SAP|Excel|PMP|AWS|Docker|SQL|MATLAB|LabVIEW|Instrumentation|Calibration|Loop Checking)\b/gi
    );
    if (found) cv.skills = [...new Set(found)].join(", ");
  }

  // Languages
  const langM = t.match(/(?:languages?)[:\s]+([^\n]{5,120})/i);
  if (langM) cv.languages = langM[1].trim();
  else if (/\b(english|arabic|urdu|hindi|tagalog)\b/i.test(t)) {
    const langs = t.match(/\b(English|Arabic|Urdu|Hindi|Tagalog|French|Malayalam|Bengali)\b/gi);
    if (langs) cv.languages = [...new Set(langs)].join(", ");
  }

  // Certifications
  const certM = t.match(
    /(?:certifications?|certificates?|licenses?)[:\s]+([\s\S]{5,200}?)(?=\n\s*(?:experience|education|skills)|$)/i
  );
  if (certM) cv.certifications = lines(certM[1]).join(" · ");
  else {
    const certs = t.match(
      /\b(NEBOSH|IOSH|OSHA|PMP|CCNA|AWS\s*\w+|CompTIA\s*\w+|First Aid|BOSIET|HUET|OPITO)\b/gi
    );
    if (certs) cv.certifications = [...new Set(certs)].join(" · ");
  }

  // Experience blocks: "Worked at X as Y from A to B"
  const expBlocks = [
    ...t.matchAll(
      /(?:worked (?:at|for)|experience at|at)\s+([A-Za-z0-9 &.,'-]{2,50})\s+(?:as|—|-)?\s*([A-Za-z0-9 /&-]{2,50})?\s*(?:from|since)?\s*(\d{4}|\w+\s+\d{4})?\s*(?:to|-|–)?\s*(present|current|\d{4}|\w+\s+\d{4})?/gi
    ),
  ];
  if (expBlocks.length) {
    const experiences: CvExperience[] = expBlocks.slice(0, 5).map((m) => {
      const company = (m[1] || "").trim();
      const title = (m[2] || cv.title || "").trim();
      const start = (m[3] || "").trim();
      const endRaw = (m[4] || "").trim();
      const current = /present|current/i.test(endRaw);
      return {
        id: uid("exp"),
        title,
        company,
        location: cv.location || "",
        start,
        end: current ? "" : endRaw,
        current,
        bullets: "",
      };
    });
    if (experiences.length) cv.experience = experiences;
  }

  // Simple "Experience:" section lines
  const expSection = t.match(
    /(?:experience|work history|employment)[:\s]*\n([\s\S]{10,800}?)(?=\n\s*(?:education|skills|certification|languages)|$)/i
  );
  if (expSection && cv.experience.length <= 1 && !cv.experience[0]?.company) {
    const chunks = expSection[1].split(/\n(?=[A-Z])/).filter((c) => c.trim().length > 8);
    if (chunks.length) {
      cv.experience = chunks.slice(0, 4).map((chunk) => {
        const first = chunk.split("\n")[0] || "";
        const parts = first.split(/[-–|@]/).map((s) => s.trim());
        return {
          id: uid("exp"),
          title: parts[0] || cv.title || "",
          company: parts[1] || "",
          location: "",
          start: "",
          end: "",
          current: /present|current/i.test(chunk),
          bullets: lines(chunk).slice(1).join("\n"),
        };
      });
    }
  }

  // Education
  const eduM = t.match(
    /(?:educated at|graduated from|studied at|degree from|education[:\s]+)\s*([^\n.]{5,80})/i
  );
  if (eduM) {
    cv.education = [
      {
        id: uid("edu"),
        school: eduM[1].trim(),
        degree: /\b(bachelor|master|b\.?sc|m\.?sc|diploma|phd|b\.?eng)\b/i.test(t)
          ? (t.match(/\b(Bachelor(?:'s)?|Master(?:'s)?|B\.?Sc|M\.?Sc|Diploma|PhD|B\.?Eng)[^.\n]{0,40}/i)?.[0] || "")
          : "",
        field: "",
        start: "",
        end: "",
        details: "",
      },
    ];
  }

  // If still empty name but profile-like first line
  if (!cv.fullName) {
    const firstLine = t.split("\n")[0]?.trim() || "";
    if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/.test(firstLine)) {
      cv.fullName = firstLine;
    }
  }

  return cv;
}

/** Sample demo CV for "Use example" */
export function sampleCv(): CvData {
  return {
    fullName: "Ahmed Al-Rashid",
    title: "Instrument Technician",
    email: "ahmed.rashid@email.com",
    phone: "+966 50 123 4567",
    location: "Dammam, Saudi Arabia",
    website: "",
    summary:
      "Certified Instrument Technician with 7+ years in oil & gas, specializing in calibration, loop checking, and maintenance of field instrumentation. Strong HSE record and experience with DCS/PLC systems on major industrial projects.",
    skills:
      "Calibration, Loop Checking, PLC, SCADA, DCS, HART Communicators, Pressure/Flow/Level Transmitters, Preventive Maintenance, HSE Compliance",
    languages: "Arabic (Native), English (Fluent)",
    certifications: "NEBOSH IGC · OPITO BOSIET · Instrumentation Diploma",
    experience: [
      {
        id: "e1",
        title: "Instrument Technician",
        company: "Gulf Petro Services",
        location: "Jubail, KSA",
        start: "2020",
        end: "",
        current: true,
        bullets:
          "Perform calibration and maintenance of field instruments across process units\nExecute loop checks during shutdowns and commissioning\nSupport DCS/PLC troubleshooting with operations team",
      },
      {
        id: "e2",
        title: "Junior Instrument Technician",
        company: "Eastern Maintenance Co.",
        location: "Dammam, KSA",
        start: "2017",
        end: "2020",
        current: false,
        bullets:
          "Assisted senior technicians with transmitter installation and wiring\nMaintained calibration records and ISO documentation",
      },
    ],
    education: [
      {
        id: "ed1",
        school: "Technical College of Dammam",
        degree: "Diploma",
        field: "Industrial Instrumentation",
        start: "2014",
        end: "2017",
        details: "",
      },
    ],
    template: "professional",
  };
}
