/**
 * Smart Job Parser — deterministic, client-side extraction for Hunared job posts.
 * No paid AI. Matches against existing JOB_CATEGORIES, COUNTRIES, cities, currencies.
 */

import { JOB_CATEGORIES, DURATIONS, SALARY_TYPES } from "@/lib/constants";
import { COUNTRIES } from "@/lib/countries";
import { CURRENCIES, currencyForCountry } from "@/lib/currencies";
import { getCitiesForCountry } from "@/lib/cities";

export type Confidence = "high" | "medium" | "low";

export type ParsedField<T> = {
  value: T;
  confidence: Confidence;
  label: string;
};

export type SmartJobParseResult = {
  category?: ParsedField<string>;
  /** Multiple matched categories for multi-select forms. */
  categories?: ParsedField<string[]>;
  country?: ParsedField<string>;
  city?: ParsedField<string>;
  currency?: ParsedField<string>;
  salaryRate?: ParsedField<string>;
  salaryType?: ParsedField<string>;
  duration?: ParsedField<string>;
  employmentType?: ParsedField<"permanent" | "temporary" | "task_force">;
  jobTitle?: ParsedField<string>;
  jobDescription?: ParsedField<string>;
  companyEmail?: ParsedField<string>;
  companyPhone?: ParsedField<string>;
  companyName?: ParsedField<string>;
  companyAddress?: ParsedField<string>;
  mapLocation?: ParsedField<string>;
  positions?: ParsedField<string>;
  keywords: string[];
};

const CONF_SCORE: Record<Confidence, number> = {
  high: 95,
  medium: 75,
  low: 50,
};

export function confidencePercent(c: Confidence): number {
  return CONF_SCORE[c];
}

// ── Category keyword map (maps to existing JOB_CATEGORIES only) ───────────
const CATEGORY_KEYWORDS: { category: string; terms: string[]; weight: number }[] =
  [
    { category: "Mechanical", terms: ["mechanical", "mech ", "qa/qc mechanical", "rotating equipment"], weight: 3 },
    { category: "Inspection", terms: ["qa/qc", "qa qc", "quality control", "quality assurance", "inspector", "inspection"], weight: 3 },
    { category: "Electrical", terms: ["electrical", "electrician", "power systems"], weight: 3 },
    { category: "Instrumentation", terms: ["instrument", "instrumentation", "i&c", "loop check"], weight: 3 },
    { category: "Welding", terms: ["welder", "welding", "tig", "mig", "smaw", "fcaw"], weight: 3 },
    { category: "Environmental Health & Safety", terms: ["hse", "safety officer", "health & safety", "health and safety", "nebosh", "osha", "safety engineer"], weight: 3 },
    { category: "Civil", terms: ["civil engineer", "civil works", "structural engineer"], weight: 3 },
    { category: "Piping", terms: ["piping", "pipefitter", "pipe fitter"], weight: 3 },
    { category: "Scaffolding", terms: ["scaffolder", "scaffolding", "scaffold"], weight: 3 },
    { category: "HVAC", terms: ["hvac", "air conditioning", "refrigeration"], weight: 3 },
    { category: "Oil & Gas", terms: ["oil & gas", "oil and gas", "aramco", "offshore oil", "upstream", "downstream"], weight: 2 },
    { category: "Accounting", terms: ["accountant", "accounting", "bookkeeper", "auditor"], weight: 3 },
    { category: "Finance", terms: ["finance", "financial analyst", "cfo"], weight: 2 },
    { category: "Information Technology", terms: ["software", "developer", "programmer", "it support", "system admin", "devops", "fullstack"], weight: 3 },
    { category: "Human Resources", terms: ["human resources", "hr officer", "recruiter", "talent acquisition"], weight: 3 },
    { category: "Logistics", terms: ["logistics", "supply chain", "warehouse manager"], weight: 2 },
    { category: "Driving", terms: ["driver", "heavy driver", "truck driver", "chauffeur"], weight: 3 },
    { category: "Construction", terms: ["construction", "site engineer", "building works"], weight: 2 },
    { category: "Fabrication", terms: ["fabrication", "fabricator", "steel fab"], weight: 2 },
    { category: "Painting", terms: ["painter", "painting", "coating applicator"], weight: 2 },
    { category: "Coating", terms: ["coating", "sandblast", "abrasive blast"], weight: 2 },
    { category: "Plumbing", terms: ["plumber", "plumbing"], weight: 3 },
    { category: "Technician", terms: ["technician", "tech "], weight: 1 },
    { category: "Engineering", terms: ["engineer", "engineering"], weight: 1 },
    { category: "Foreman", terms: ["foreman", "supervisor"], weight: 2 },
    { category: "Healthcare", terms: ["nurse", "doctor", "medical", "pharmacist"], weight: 2 },
    { category: "Hospitality", terms: ["chef", "cook", "hotel", "waiter", "barista"], weight: 2 },
    { category: "Education", terms: ["teacher", "tutor", "instructor", "lecturer"], weight: 2 },
    { category: "Marketing", terms: ["marketing", "seo", "content writer", "social media"], weight: 2 },
    { category: "Security", terms: ["security guard", "security officer", "cctv"], weight: 3 },
    { category: "Warehouse", terms: ["warehouse", "storekeeper", "inventory clerk"], weight: 2 },
    { category: "Maintenance", terms: ["maintenance", "millwright"], weight: 2 },
    { category: "Process", terms: ["process engineer", "process operator"], weight: 2 },
    { category: "Procurement", terms: ["procurement", "purchasing", "buyer"], weight: 2 },
    { category: "QA/QC", terms: ["qa/qc", "quality control"], weight: 2 },
  ].filter((r) => (JOB_CATEGORIES as readonly string[]).includes(r.category) || r.category === "QA/QC");

// Fix QA/QC → Inspection if QA/QC not in list
const CATEGORY_ALIASES: Record<string, string> = {
  "QA/QC": "Inspection",
  "Health & Safety": "Environmental Health & Safety",
  Safety: "Environmental Health & Safety",
  "Mechanical Engineering": "Mechanical",
  "Electrical Engineering": "Electrical",
};

function resolveCategory(name: string): string | null {
  const alias = CATEGORY_ALIASES[name] ?? name;
  if ((JOB_CATEGORIES as readonly string[]).includes(alias)) return alias;
  // partial
  const found = JOB_CATEGORIES.find(
    (c) => c.toLowerCase() === alias.toLowerCase()
  );
  return found ?? null;
}

// ── Country aliases ───────────────────────────────────────────────────────
const COUNTRY_ALIASES: { code: string; names: string[] }[] = [
  { code: "SA", names: ["saudi arabia", "ksa", "kingdom of saudi arabia", "saudi"] },
  { code: "AE", names: ["united arab emirates", "uae", "u.a.e", "emirates"] },
  { code: "QA", names: ["qatar"] },
  { code: "KW", names: ["kuwait"] },
  { code: "BH", names: ["bahrain"] },
  { code: "OM", names: ["oman"] },
  { code: "PK", names: ["pakistan"] },
  { code: "IN", names: ["india"] },
  { code: "US", names: ["united states", "usa", "u.s.a", "u.s.", "america"] },
  { code: "GB", names: ["united kingdom", "uk", "u.k.", "britain", "england"] },
  { code: "CA", names: ["canada"] },
  { code: "AU", names: ["australia"] },
  { code: "EG", names: ["egypt"] },
  { code: "JO", names: ["jordan"] },
  { code: "PH", names: ["philippines"] },
  { code: "BD", names: ["bangladesh"] },
  { code: "NP", names: ["nepal"] },
  { code: "LK", names: ["sri lanka"] },
  { code: "TR", names: ["turkey", "türkiye"] },
  { code: "DE", names: ["germany"] },
  { code: "FR", names: ["france"] },
  { code: "SG", names: ["singapore"] },
  { code: "MY", names: ["malaysia"] },
  { code: "ID", names: ["indonesia"] },
];

// ── Currency patterns ─────────────────────────────────────────────────────
const CURRENCY_PATTERNS: { code: string; patterns: RegExp[] }[] = [
  { code: "SAR", patterns: [/\bSAR\b/i, /\bSaudi\s*Riyals?\b/i, /ر\.?\s*س/] },
  { code: "AED", patterns: [/\bAED\b/i, /\bDirhams?\b/i, /\bUAE\s*Dirham\b/i] },
  { code: "QAR", patterns: [/\bQAR\b/i, /\bQatari\s*Riyals?\b/i] },
  { code: "KWD", patterns: [/\bKWD\b/i, /\bKuwaiti\s*Dinars?\b/i] },
  { code: "BHD", patterns: [/\bBHD\b/i, /\bBahraini\s*Dinars?\b/i] },
  { code: "OMR", patterns: [/\bOMR\b/i, /\bOmani\s*Rials?\b/i] },
  { code: "PKR", patterns: [/\bPKR\b/i, /\bPakistani\s*Rupees?\b/i] },
  { code: "INR", patterns: [/\bINR\b/i, /\bIndian\s*Rupees?\b/i, /₹/] },
  { code: "USD", patterns: [/\bUSD\b/i, /\bUS\s*Dollars?\b/i, /\$\s*\d/] },
  { code: "GBP", patterns: [/\bGBP\b/i, /\bBritish\s*Pounds?\b/i, /£\s*\d/] },
  { code: "EUR", patterns: [/\bEUR\b/i, /\bEuros?\b/i, /€\s*\d/] },
];

function normalizeText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function parseKNumber(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim().toLowerCase();
  const m = cleaned.match(/^(\d+(?:\.\d+)?)(k)?$/i);
  if (!m) return null;
  let n = parseFloat(m[1]);
  if (isNaN(n)) return null;
  if (m[2]) n *= 1000;
  return n;
}

function detectCategory(text: string): ParsedField<string> | undefined {
  const lower = text.toLowerCase();
  const scores = new Map<string, number>();

  for (const row of CATEGORY_KEYWORDS) {
    const cat = resolveCategory(row.category);
    if (!cat) continue;
    for (const term of row.terms) {
      if (lower.includes(term.toLowerCase())) {
        scores.set(cat, (scores.get(cat) ?? 0) + row.weight);
      }
    }
  }

  // Exact category name in text
  for (const cat of JOB_CATEGORIES) {
    if (lower.includes(cat.toLowerCase())) {
      scores.set(cat, (scores.get(cat) ?? 0) + 4);
    }
  }

  if (scores.size === 0) return undefined;
  const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const [best, score] = sorted[0];
  const confidence: Confidence =
    score >= 5 ? "high" : score >= 3 ? "medium" : "low";
  return { value: best, confidence, label: best };
}

function detectCountry(text: string): ParsedField<string> | undefined {
  const lower = text.toLowerCase();

  for (const alias of COUNTRY_ALIASES) {
    for (const name of alias.names) {
      const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (re.test(lower)) {
        const conf: Confidence =
          name.length > 4 || name.includes(" ") ? "high" : "medium";
        const cname = COUNTRIES.find((c) => c.code === alias.code)?.name ?? alias.code;
        return { value: alias.code, confidence: conf, label: cname };
      }
    }
  }

  // Full official names from COUNTRIES
  for (const c of COUNTRIES) {
    if (c.name.length < 4) continue;
    if (lower.includes(c.name.toLowerCase())) {
      return { value: c.code, confidence: "high", label: c.name };
    }
  }

  // Phone country codes
  if (/\+966\b/.test(text)) {
    return {
      value: "SA",
      confidence: "medium",
      label: COUNTRIES.find((c) => c.code === "SA")?.name ?? "Saudi Arabia",
    };
  }
  if (/\+971\b/.test(text)) {
    return {
      value: "AE",
      confidence: "medium",
      label: COUNTRIES.find((c) => c.code === "AE")?.name ?? "UAE",
    };
  }
  if (/\+974\b/.test(text)) {
    return {
      value: "QA",
      confidence: "medium",
      label: COUNTRIES.find((c) => c.code === "QA")?.name ?? "Qatar",
    };
  }

  return undefined;
}

function detectCity(
  text: string,
  countryCode?: string
): ParsedField<string> | undefined {
  // Prefer cities of detected country; else scan major lists
  const codes = countryCode
    ? [countryCode]
    : Object.keys(
        // limited scan for performance — use detected country primarily
        {} as Record<string, string[]>
      );

  const searchCodes = countryCode
    ? [countryCode]
    : ["SA", "AE", "QA", "KW", "BH", "OM", "PK", "IN", "EG", "GB", "US"];

  const lower = text.toLowerCase();
  let best: { city: string; conf: Confidence } | null = null;

  for (const code of searchCodes) {
    const cities = getCitiesForCountry(code);
    for (const city of cities) {
      const re = new RegExp(
        `\\b${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i"
      );
      if (re.test(text)) {
        const conf: Confidence =
          countryCode && code === countryCode ? "high" : "medium";
        // Prefer longer city names (more specific)
        if (!best || city.length > best.city.length) {
          best = { city, conf };
        }
      }
    }
  }

  // Also: "City, Country" pattern in title
  const comma = text.match(
    /([A-Za-z][A-Za-z\s]{2,30}?)\s*[,–—-]\s*(Saudi Arabia|UAE|United Arab Emirates|Qatar|Kuwait|Bahrain|Oman|Pakistan|India)/i
  );
  if (comma) {
    const candidate = comma[1].trim();
    const codes2 = countryCode ? [countryCode] : searchCodes;
    for (const code of codes2) {
      const cities = getCitiesForCountry(code);
      const match = cities.find(
        (c) => c.toLowerCase() === candidate.toLowerCase()
      );
      if (match) {
        return { value: match, confidence: "high", label: match };
      }
    }
  }

  if (!best) return undefined;
  return { value: best.city, confidence: best.conf, label: best.city };
}

function detectCurrency(
  text: string,
  countryCode?: string
): ParsedField<string> | undefined {
  for (const row of CURRENCY_PATTERNS) {
    if (!CURRENCIES.some((c) => c.code === row.code)) continue;
    for (const re of row.patterns) {
      if (re.test(text)) {
        return { value: row.code, confidence: "high", label: row.code };
      }
    }
  }
  if (countryCode) {
    const code = currencyForCountry(countryCode);
    if (code) {
      return {
        value: code,
        confidence: "medium",
        label: code,
      };
    }
  }
  return undefined;
}

function detectSalary(
  text: string
): { rate?: ParsedField<string>; type?: ParsedField<string> } {
  // Avoid mistaking "X years experience" for salary
  const cleaned = text.replace(
    /\b\d+\+?\s*(years?|yrs?)\s*(of\s+)?(experience|exp\.?)/gi,
    " "
  );

  // Rate type
  let salaryType: ParsedField<string> | undefined;
  if (/\b(per\s*hour|\/\s*hr|\/hr|hourly|an\s*hour)\b/i.test(cleaned)) {
    if ((SALARY_TYPES as readonly string[]).includes("Hourly")) {
      salaryType = { value: "Hourly", confidence: "high", label: "Hourly" };
    }
  } else if (
    /\b(per\s*month|\/\s*month|monthly|a\s*month|pcm)\b/i.test(cleaned)
  ) {
    if ((SALARY_TYPES as readonly string[]).includes("Monthly")) {
      salaryType = { value: "Monthly", confidence: "high", label: "Monthly" };
    }
  } else if (/\b(negotiable|competitive)\b/i.test(cleaned)) {
    if ((SALARY_TYPES as readonly string[]).includes("After Interview")) {
      salaryType = {
        value: "After Interview",
        confidence: "medium",
        label: "After Interview",
      };
    }
  }

  // Ranges: 8,000–10,000 or 8k-10k or 8000-10000
  const rangeRe =
    /(?:salary|rate|pay|package)?[:\s]*([A-Z]{3}\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?k)\s*[–—\-~to]+\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?k)/i;
  const range = cleaned.match(rangeRe);
  if (range) {
    const min = parseKNumber(range[2]);
    const max = parseKNumber(range[3]);
    if (min && max && min < 1_000_000 && max < 1_000_000 && min <= max) {
      // Sanity: reject tiny numbers that look like years (1-10) unless hourly
      if (max >= 50 || salaryType?.value === "Hourly") {
        return {
          rate: {
            value: `${min}-${max}`,
            confidence: "high",
            label: `${min.toLocaleString()}–${max.toLocaleString()}`,
          },
          type: salaryType,
        };
      }
    }
  }

  // Single amount near currency or salary keyword
  const singleRe =
    /(?:salary|rate|pay|package)?[:\s]*(?:SAR|AED|QAR|KWD|BHD|OMR|PKR|INR|USD|GBP|EUR|\$|£)?\s*(\d{1,3}(?:,\d{3})+|\d{3,}(?:\.\d+)?|\d+(?:\.\d+)?k)\s*(?:SAR|AED|QAR|KWD|BHD|OMR|PKR|INR|USD|GBP|EUR)?/i;
  const single = cleaned.match(singleRe);
  if (single) {
    const n = parseKNumber(single[1]);
    if (n && n >= 20 && n < 1_000_000) {
      return {
        rate: {
          value: String(n),
          confidence: "medium",
          label: n.toLocaleString(),
        },
        type: salaryType,
      };
    }
  }

  // $25/hour style
  const perHr = cleaned.match(
    /(?:\$|SAR|AED|USD)?\s*(\d{1,4}(?:\.\d+)?)\s*(?:\/\s*hr|\/hr|per\s*hour)/i
  );
  if (perHr) {
    const n = parseKNumber(perHr[1]);
    if (n) {
      return {
        rate: { value: String(n), confidence: "high", label: String(n) },
        type: (SALARY_TYPES as readonly string[]).includes("Hourly")
          ? { value: "Hourly", confidence: "high", label: "Hourly" }
          : salaryType,
      };
    }
  }

  return { type: salaryType };
}

function detectDuration(text: string): ParsedField<string> | undefined {
  const lower = text.toLowerCase();

  // Map phrases → existing DURATIONS
  const maps: { re: RegExp; value: string; conf: Confidence }[] = [
    { re: /\bpermanent\b/i, value: "Permanent", conf: "high" },
    { re: /\blong\s*term\b/i, value: "Long Term", conf: "high" },
    { re: /\bshutdown\b/i, value: "Shutdown", conf: "high" },
    { re: /\b1\s*year\b/i, value: "1 Year", conf: "high" },
    { re: /\b6\s*months?\b/i, value: "6 Months", conf: "high" },
    { re: /\b3\s*months?\b/i, value: "3 Months", conf: "high" },
    { re: /\b2\s*months?\b/i, value: "2 Month", conf: "high" },
    { re: /\b1\s*month\b/i, value: "1 Month", conf: "high" },
    // 2 year → closest available Long Term (no "2 Year" in list)
    { re: /\b2\s*years?\b/i, value: "Long Term", conf: "medium" },
    { re: /\b24\s*months?\b/i, value: "Long Term", conf: "medium" },
  ];

  for (const m of maps) {
    if (m.re.test(lower) && (DURATIONS as readonly string[]).includes(m.value)) {
      return { value: m.value, confidence: m.conf, label: m.value };
    }
  }
  return undefined;
}

function detectEmail(text: string): ParsedField<string> | undefined {
  const m = text.match(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
  );
  if (!m) return undefined;
  return { value: m[0], confidence: "high", label: m[0] };
}

function detectPhone(text: string): ParsedField<string> | undefined {
  // Prefer international format
  const intl = text.match(
    /(?:whatsapp[:\s]*)?(\+\d{1,3}[\s-]?\d{6,14})/i
  );
  if (intl) {
    const num = intl[1].replace(/[\s-]/g, "");
    if (num.length >= 10 && num.length <= 16) {
      return { value: num, confidence: "high", label: num };
    }
  }
  // Local with 0
  const local = text.match(
    /(?:tel|phone|mobile|call)[:\s]*([0-9][0-9\s-]{8,16}\d)/i
  );
  if (local) {
    const num = local[1].replace(/[\s-]/g, "");
    if (num.length >= 9) {
      return { value: num, confidence: "medium", label: num };
    }
  }
  return undefined;
}

function extractKeywords(text: string, category?: string): string[] {
  const stop = new Set(
    "the a an and or for with to of in on at is are be we are looking required experience years year".split(
      " "
    )
  );
  const words = text
    .replace(/[^a-zA-Z0-9+/&#\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !stop.has(w.toLowerCase()));

  const uniq: string[] = [];
  for (const w of words) {
    const key = w.length > 1 ? w[0].toUpperCase() + w.slice(1) : w;
    if (!uniq.includes(key) && uniq.length < 12) uniq.push(key);
  }
  if (category && !uniq.includes(category)) uniq.unshift(category);
  return uniq.slice(0, 10);
}

/** Detect multiple matching job categories (no duplicates). */
function detectCategories(text: string): ParsedField<string[]> | undefined {
  const scores = new Map<string, number>();
  const lower = text.toLowerCase();
  for (const row of CATEGORY_KEYWORDS) {
    let hit = 0;
    for (const term of row.terms) {
      if (lower.includes(term.toLowerCase())) hit += row.weight;
    }
    if (hit > 0) {
      const cat =
        row.category === "QA/QC" &&
        !(JOB_CATEGORIES as readonly string[]).includes("QA/QC")
          ? "Quality Control"
          : row.category;
      if ((JOB_CATEGORIES as readonly string[]).includes(cat)) {
        scores.set(cat, (scores.get(cat) ?? 0) + hit);
      }
    }
  }
  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) return undefined;
  const cats = ranked.slice(0, 6).map(([c]) => c);
  const conf: Confidence =
    ranked[0][1] >= 3 ? "high" : ranked[0][1] >= 2 ? "medium" : "low";
  return { value: cats, confidence: conf, label: cats.join(", ") };
}

/**
 * Infer employment type from duration string and free text.
 * Does not force Temporary when evidence is weak.
 */
export function inferEmploymentType(
  duration: string | null | undefined,
  text: string
): ParsedField<"permanent" | "temporary" | "task_force"> | undefined {
  const lower = `${duration ?? ""} ${text}`.toLowerCase();

  if (
    /\bpermanent\b/.test(lower) ||
    /\bfull[-\s]?time permanent\b/.test(lower) ||
    /\blong[-\s]?term permanent\b/.test(lower)
  ) {
    return { value: "permanent", confidence: "high", label: "Permanent" };
  }
  if (
    /\btask\s*force\b/.test(lower) ||
    /\bshutdown\b/.test(lower) ||
    /\bturnaround\b/.test(lower) ||
    /\boutage\b/.test(lower)
  ) {
    return { value: "task_force", confidence: "high", label: "Task Force" };
  }
  if (
    /\btemporary\b/.test(lower) ||
    /\bcontract\b/.test(lower) ||
    /\bfixed[-\s]?term\b/.test(lower)
  ) {
    return { value: "temporary", confidence: "high", label: "Temporary" };
  }

  const dur = (duration ?? "").toLowerCase();
  if (
    dur &&
    dur !== "not specified" &&
    dur !== "permanent" &&
    /(\d+\s*(day|days|week|weeks|month|months|year|years)|1 day|3 days|1 week|1 month)/i.test(
      dur
    )
  ) {
    return { value: "temporary", confidence: "medium", label: "Temporary" };
  }

  if (
    /\b(\d+)\s*(day|days|week|weeks|month|months)\s*(contract|project|position|assignment)?\b/.test(
      lower
    )
  ) {
    return { value: "temporary", confidence: "medium", label: "Temporary" };
  }

  return undefined;
}

/** Suggest a title when the title field is empty but description has a clear role. */
function suggestTitle(
  jobTitle: string,
  description: string,
  category?: string
): ParsedField<string> | undefined {
  if (jobTitle.trim().length >= 4) return undefined;
  const firstLine = description
    .split(/\n|\./)
    .map((s) => s.trim())
    .find((s) => s.length >= 8 && s.length <= 80);
  if (firstLine) {
    const roleLike =
      /\b(required|needed|looking for|hiring|position|vacancy)\b/i.test(
        firstLine
      );
    const cleaned = firstLine
      .replace(
        /\b(required|needed|looking for|we are|hiring|position|vacancy|in)\b/gi,
        ""
      )
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
    if (cleaned.length >= 6) {
      return {
        value: cleaned,
        confidence: roleLike ? "medium" : "low",
        label: cleaned,
      };
    }
  }
  if (category) {
    return {
      value: `${category} — Open Position`,
      confidence: "low",
      label: `${category} — Open Position`,
    };
  }
  return undefined;
}

/**
 * Parse job title + description into structured suggestions.
 */

/** Extract "Label: value" pairs from pasted job text (case-insensitive). */
function extractLabeledFields(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  const lines = raw.split(/\r?\n/);
  let currentKey: string | null = null;
  let buf: string[] = [];

  const flush = () => {
    if (currentKey && buf.length) {
      out[currentKey] = buf.join("\n").trim();
    }
    buf = [];
  };

  for (const line of lines) {
    const m = line.match(
      /^\s*([A-Za-z0-9][A-Za-z0-9 &/()+.-]{1,60})\s*:\s*(.*)$/
    );
    if (m) {
      flush();
      currentKey = m[1].trim().toLowerCase().replace(/\s+/g, " ");
      buf = [m[2].trim()];
    } else if (currentKey) {
      buf.push(line);
    }
  }
  flush();
  return out;
}

function labelGet(
  labels: Record<string, string>,
  ...keys: string[]
): string | undefined {
  for (const k of keys) {
    const v = labels[k.toLowerCase()];
    if (v && v.trim()) return v.trim();
  }
  return undefined;
}

export function parseJobText(
  jobTitle: string,
  description: string
): SmartJobParseResult {
  const combined = `${jobTitle}\n${description}`;
  const text = normalizeText(combined);
  if (text.length < 8) {
    return { keywords: [] };
  }

  const labels = extractLabeledFields(combined);

  // Prefer explicit labeled values when user pastes structured text
  const labeledTitle = labelGet(
    labels,
    "job title",
    "title",
    "position",
    "role"
  );
  const labeledDesc = labelGet(
    labels,
    "job description",
    "description",
    "details",
    "responsibilities"
  );
  const labeledCategory = labelGet(
    labels,
    "job categories",
    "job category",
    "categories",
    "category",
    "profession"
  );
  const labeledSub = labelGet(labels, "subcategory", "sub category", "sub-category");
  const labeledCountry = labelGet(labels, "country");
  const labeledCity = labelGet(labels, "city", "work location city");
  const labeledLocation = labelGet(labels, "work location", "location");
  const labeledPositions = labelGet(
    labels,
    "number of positions",
    "positions",
    "vacancies"
  );
  const labeledDuration = labelGet(labels, "duration", "contract duration");
  const labeledSalaryType = labelGet(labels, "salary type", "pay type");
  const labeledHourly = labelGet(
    labels,
    "salary / rate (hourly)",
    "hourly rate",
    "salary hourly"
  );
  const labeledMonthly = labelGet(
    labels,
    "salary / rate (monthly)",
    "monthly rate",
    "salary monthly",
    "salary / rate"
  );
  const labeledNegotiable = labelGet(labels, "negotiable");
  const labeledCompany = labelGet(labels, "company name", "company", "employer");
  const labeledPhone = labelGet(labels, "company phone", "phone", "mobile");
  const labeledEmail = labelGet(labels, "company email", "email");
  const labeledAddress = labelGet(labels, "company address", "address");
  const labeledMap = labelGet(
    labels,
    "map location link",
    "map location",
    "google maps",
    "map link",
    "location link"
  );

  let category = detectCategory(text);
  let categories = detectCategories(text);

  if (labeledCategory) {
    const parts = labeledCategory
      .split(/[,;/|]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const matched: string[] = [];
    for (const p of parts) {
      const found = JOB_CATEGORIES.find(
        (c) => c.toLowerCase() === p.toLowerCase()
      );
      if (found && !matched.includes(found)) matched.push(found);
    }
    // Also try subcategory as profession name → parent category via keyword map
    if (matched.length === 0 && labeledSub) {
      const fromSub = detectCategory(normalizeText(labeledSub));
      if (fromSub?.value) matched.push(fromSub.value);
    }
    if (matched.length) {
      categories = {
        value: matched,
        confidence: "high",
        label: matched.join(", "),
      };
      category = {
        value: matched[0],
        confidence: "high",
        label: matched[0],
      };
    }
  }

  // Profession/subcategory text → category
  if (labeledSub) {
    const fromSub = detectCategory(normalizeText(labeledSub + " " + labeledSub));
    if (fromSub?.value) {
      if (!categories) {
        categories = {
          value: [fromSub.value],
          confidence: fromSub.confidence,
          label: fromSub.value,
        };
      } else if (!categories.value.includes(fromSub.value)) {
        categories = {
          ...categories,
          value: [...categories.value, fromSub.value],
        };
      }
      if (!category) category = fromSub;
    }
  }

  let country = detectCountry(text);
  if (labeledCountry) {
    const found = COUNTRIES.find(
      (c) =>
        c.name.toLowerCase() === labeledCountry.toLowerCase() ||
        c.code.toLowerCase() === labeledCountry.toLowerCase()
    );
    if (found) {
      country = {
        value: found.code,
        confidence: "high",
        label: found.name,
      };
    }
  }

  let city = detectCity(text, country?.value);
  if (labeledCity) {
    city = { value: labeledCity, confidence: "high", label: labeledCity };
  } else if (labeledLocation && !city) {
    // "Riyadh, Saudi Arabia" style
    const parts = labeledLocation.split(",").map((s) => s.trim());
    if (parts[0]) {
      city = { value: parts[0], confidence: "medium", label: parts[0] };
    }
  }

  const currency = detectCurrency(text, country?.value);
  const salary = detectSalary(text);
  let duration = detectDuration(text);
  if (labeledDuration) {
    duration = {
      value: labeledDuration,
      confidence: "high",
      label: labeledDuration,
    };
  }

  let salaryType = salary.type;
  let salaryRate = salary.rate;
  if (labeledSalaryType) {
    const st = labeledSalaryType.toLowerCase();
    if (st.includes("hour"))
      salaryType = { value: "Hourly", confidence: "high", label: "Hourly" };
    else if (st.includes("month"))
      salaryType = { value: "Monthly", confidence: "high", label: "Monthly" };
    else if (st.includes("negot"))
      salaryType = {
        value: "Negotiable",
        confidence: "high",
        label: "Negotiable",
      };
  }
  if (labeledNegotiable && /^(yes|true|1|y)$/i.test(labeledNegotiable)) {
    salaryType = {
      value: "Negotiable",
      confidence: "high",
      label: "Negotiable",
    };
  }
  if (labeledHourly) {
    salaryRate = { value: labeledHourly, confidence: "high", label: labeledHourly };
    if (!salaryType)
      salaryType = { value: "Hourly", confidence: "high", label: "Hourly" };
  }
  if (labeledMonthly) {
    salaryRate = {
      value: labeledMonthly,
      confidence: "high",
      label: labeledMonthly,
    };
    if (!salaryType || salaryType.value === "Hourly")
      salaryType = { value: "Monthly", confidence: "high", label: "Monthly" };
  }

  const employmentType = inferEmploymentType(duration?.value, text);
  let companyEmail = detectEmail(text);
  if (labeledEmail) {
    companyEmail = {
      value: labeledEmail,
      confidence: "high",
      label: labeledEmail,
    };
  }
  let companyPhone = detectPhone(text);
  if (labeledPhone) {
    companyPhone = {
      value: labeledPhone,
      confidence: "high",
      label: labeledPhone,
    };
  }

  let suggestedTitle = suggestTitle(jobTitle, description, category?.value);
  if (labeledTitle) {
    suggestedTitle = {
      value: labeledTitle,
      confidence: "high",
      label: labeledTitle,
    };
  }

  const keywords = extractKeywords(text, category?.value);

  const result: SmartJobParseResult = {
    category,
    categories,
    country,
    city,
    currency,
    salaryRate,
    salaryType,
    duration,
    employmentType,
    jobTitle: suggestedTitle,
    companyEmail,
    companyPhone,
    keywords,
  };

  // Extra labeled fields attached for form apply (optional consumers)
  if (labeledCompany) {
    result.companyName = { value: labeledCompany, confidence: "high", label: labeledCompany };
  }
  if (labeledAddress) {
    result.companyAddress = { value: labeledAddress, confidence: "high", label: labeledAddress };
  }
  if (labeledMap) {
    result.mapLocation = { value: labeledMap, confidence: "high", label: labeledMap };
  }
  if (labeledPositions) {
    result.positions = { value: labeledPositions, confidence: "high", label: labeledPositions };
  }
  if (labeledDesc) {
    result.jobDescription = { value: labeledDesc, confidence: "high", label: labeledDesc };
  }

  return result;
}

export function hasSuggestions(r: SmartJobParseResult): boolean {
  return !!(
    r.category ||
    r.categories ||
    r.country ||
    r.city ||
    r.currency ||
    r.salaryRate ||
    r.salaryType ||
    r.duration ||
    r.employmentType ||
    r.jobTitle ||
    r.companyEmail ||
    r.companyPhone
  );
}
