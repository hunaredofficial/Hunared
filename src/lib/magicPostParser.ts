/**
 * Magic Post — parse unstructured pasted text into job or marketplace fields.
 * Supports multi-post paste: split → smart-parse each block → publish via bulk API.
 * Team / admin only (enforced at page + API).
 */

import {
  parseJobText,
  type SmartJobParseResult,
} from "@/lib/smartJobParser";
import {
  parseListingText,
  buildDescription,
  type SmartListingParseResult,
} from "@/lib/smartListingParser";

export type MagicJobFields = {
  jobTitle: string;
  jobDescription: string;
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
  country: string;
  city: string;
  location: string;
  workLocation: string;
  employmentType: string;
  duration: string;
  category: string;
  categories: string[];
  positions: string;
  salaryRate: string;
  salaryType: string;
  currency: string;
  mapLocation: string;
};

export type MagicListingFields = {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  condition: string;
  price: string;
  currency: string;
  country: string;
  city: string;
  location: string;
  contact_phone: string;
  rentalPeriod: string;
};

const MAX_BLOCKS = 100;
const MIN_BLOCK_CHARS = 12;

function firstLineAsTitle(raw: string): { title: string; body: string } {
  const lines = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return { title: "", body: "" };
  const title = lines[0].slice(0, 180);
  const body = lines.slice(1).join("\n").trim() || raw.trim();
  return { title, body };
}

function val<T>(f?: { value: T } | null): T | undefined {
  return f?.value;
}

/**
 * Split a large paste into individual job/listing blocks.
 * Tries explicit separators first, then blank-line groups, then numbered/heading cues.
 */
export function splitMagicBlocks(raw: string): string[] {
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  // 1) Explicit visual separators
  let parts = text
    .split(/\n\s*(?:-{3,}|={3,}|\*{3,}|#{3,}|_{3,}|~{3,}|⚡|━━━━━━━━+|────+)\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length >= MIN_BLOCK_CHARS);

  // 2) Double (or more) blank lines
  if (parts.length <= 1) {
    parts = text
      .split(/\n(?:[ \t]*\n){2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length >= MIN_BLOCK_CHARS);
  }

  // 3) Numbered list starts: "1." "2)" "#3" at line start after newline
  if (parts.length <= 1) {
    const numbered = text.split(/(?=\n\s*\d{1,3}\s*[\.\)\-\:]]\s+)/);
    const cleaned = numbered
      .map((p) => p.trim())
      .filter((p) => p.length >= MIN_BLOCK_CHARS);
    if (cleaned.length > 1) parts = cleaned;
  }

  // 4) Repeated hiring headers (common in WhatsApp / flyer dumps)
  if (parts.length <= 1) {
    const headerSplit = text.split(
      /(?=\n(?:\s*(?:URGENT|HIRING|WANTED|REQUIRED|JOB\s*TITLE|POSITION|WE\s+ARE\s+HIRING|VACANCY)\b))/i
    );
    const cleaned = headerSplit
      .map((p) => p.trim())
      .filter((p) => p.length >= MIN_BLOCK_CHARS);
    if (cleaned.length > 1) parts = cleaned;
  }

  // 5) Still one block — treat whole paste as a single post
  if (parts.length === 0) {
    parts = [text];
  }

  return parts.slice(0, MAX_BLOCKS);
}

/** Parse raw paste into job form fields (single block). */
export function parseMagicJobRaw(raw: string): MagicJobFields {
  const text = raw.trim();
  const { title: lineTitle, body } = firstLineAsTitle(text);
  const parsed: SmartJobParseResult = parseJobText(lineTitle, body || text);

  const jobTitle =
    String(val(parsed.jobTitle) || lineTitle || "").trim() || "Untitled job";
  let jobDescription = String(val(parsed.jobDescription) || body || text).trim();
  if (jobDescription === jobTitle && body) jobDescription = body;
  if (!jobDescription) jobDescription = text;

  const categories =
    (val(parsed.categories) as string[] | undefined) ||
    (val(parsed.category) ? [String(val(parsed.category))] : []);

  const duration = String(val(parsed.duration) || "").trim();
  let employmentType = String(val(parsed.employmentType) || "").trim();
  if (!employmentType) {
    employmentType =
      duration && duration !== "Permanent" ? "temporary" : "permanent";
  }

  const city = String(val(parsed.city) || "").trim();
  const country = String(val(parsed.country) || "SA").trim() || "SA";

  return {
    jobTitle,
    jobDescription,
    companyName: String(val(parsed.companyName) || "").trim(),
    companyPhone: String(val(parsed.companyPhone) || "").trim(),
    companyEmail: String(val(parsed.companyEmail) || "").trim(),
    companyAddress: String(val(parsed.companyAddress) || "").trim(),
    country,
    city,
    location: String(
      val(parsed.workLocation) || city || "Remote"
    ).trim(),
    workLocation: String(val(parsed.workLocation) || "").trim(),
    employmentType,
    duration: duration || (employmentType === "permanent" ? "Permanent" : "UnSpecified"),
    category: categories[0] || String(val(parsed.category) || "").trim(),
    categories,
    positions: String(val(parsed.positions) || "").trim(),
    salaryRate: String(val(parsed.salaryRate) || "").trim(),
    salaryType: String(val(parsed.salaryType) || "").trim(),
    currency: String(val(parsed.currency) || "SAR").trim() || "SAR",
    mapLocation: String(val(parsed.mapLocation) || "").trim(),
  };
}

/** Parse raw paste into marketplace listing fields (single block). */
export function parseMagicListingRaw(raw: string): MagicListingFields {
  const text = raw.trim();
  const { title: lineTitle, body } = firstLineAsTitle(text);
  const parsed: SmartListingParseResult = parseListingText(
    lineTitle || text.slice(0, 120),
    body || text
  );

  const title =
    lineTitle ||
    text
      .split("\n")
      .map((l) => l.trim())
      .find(Boolean)
      ?.slice(0, 180) ||
    "Untitled listing";

  let description = body || text;
  try {
    if (body && body.length < 40) {
      description = buildDescription(
        title,
        val(parsed.category),
        val(parsed.subcategory),
        {
          city: val(parsed.city),
          condition: val(parsed.condition),
          price: val(parsed.price),
          currency: val(parsed.currency),
          rentalPeriod: val(parsed.rentalPeriod),
        }
      );
    }
  } catch {
    description = body || text;
  }
  if (val(parsed.suggestedDescription)) {
    description = String(val(parsed.suggestedDescription));
  }
  if (!description?.trim()) description = body || text;

  return {
    title,
    description: String(description).trim(),
    category: String(val(parsed.category) || "for_sale").trim() || "for_sale",
    subcategory: String(val(parsed.subcategory) || "").trim(),
    condition: String(val(parsed.condition) || "").trim(),
    price: String(val(parsed.price) || "").trim(),
    currency: String(val(parsed.currency) || "SAR").trim() || "SAR",
    country: String(val(parsed.country) || "SA").trim() || "SA",
    city: String(val(parsed.city) || "").trim(),
    location: String(val(parsed.city) || "").trim(),
    contact_phone: String(val(parsed.contactPhone) || "").trim(),
    rentalPeriod: String(val(parsed.rentalPeriod) || "").trim(),
  };
}

/** Split + parse many jobs from one paste (max 100). */
export function parseMagicJobsBatch(raw: string): MagicJobFields[] {
  return splitMagicBlocks(raw).map(parseMagicJobRaw);
}

/** Split + parse many listings from one paste (max 100). */
export function parseMagicListingsBatch(raw: string): MagicListingFields[] {
  return splitMagicBlocks(raw).map(parseMagicListingRaw);
}
