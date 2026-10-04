/**
 * Magic Post — parse unstructured pasted text into job or marketplace fields.
 * Builds on existing smartJobParser / smartListingParser.
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

/** Parse raw paste into job form fields. */
export function parseMagicJobRaw(raw: string): MagicJobFields {
  const text = raw.trim();
  const { title: lineTitle, body } = firstLineAsTitle(text);
  const parsed: SmartJobParseResult = parseJobText(lineTitle, body || text);

  const jobTitle =
    String(val(parsed.jobTitle) || lineTitle || "").trim() || "Untitled job";
  let jobDescription = String(val(parsed.jobDescription) || body || text).trim();
  // Avoid description === title only
  if (jobDescription === jobTitle && body) jobDescription = body;
  if (!jobDescription) jobDescription = text;

  const categories =
    (val(parsed.categories) as string[] | undefined) ||
    (val(parsed.category) ? [String(val(parsed.category))] : []);

  const duration = String(val(parsed.duration) || "").trim();
  let employmentType = String(val(parsed.employmentType) || "").trim();
  if (!employmentType) {
    employmentType = duration && duration !== "Permanent" ? "temporary" : "permanent";
  }
  if (!duration && employmentType === "permanent") {
    // leave duration empty for form defaults
  }

  return {
    jobTitle,
    jobDescription,
    companyName: String(val(parsed.companyName) || "").trim(),
    companyPhone: String(val(parsed.companyPhone) || "").trim(),
    companyEmail: String(val(parsed.companyEmail) || "").trim(),
    companyAddress: String(val(parsed.companyAddress) || "").trim(),
    country: String(val(parsed.country) || "").trim(),
    city: String(val(parsed.city) || "").trim(),
    location: String(val(parsed.workLocation) || val(parsed.city) || "").trim(),
    workLocation: String(val(parsed.workLocation) || "").trim(),
    employmentType,
    duration: duration || (employmentType === "permanent" ? "Permanent" : ""),
    category: categories[0] || String(val(parsed.category) || "").trim(),
    categories,
    positions: String(val(parsed.positions) || "").trim(),
    salaryRate: String(val(parsed.salaryRate) || "").trim(),
    salaryType: String(val(parsed.salaryType) || "").trim(),
    currency: String(val(parsed.currency) || "").trim(),
    mapLocation: String(val(parsed.mapLocation) || "").trim(),
  };
}

/** Parse raw paste into marketplace listing fields. */
export function parseMagicListingRaw(raw: string): MagicListingFields {
  const text = raw.trim();
  const { title: lineTitle, body } = firstLineAsTitle(text);
  const parsed: SmartListingParseResult = parseListingText(
    lineTitle || text.slice(0, 120),
    body || text
  );

  const title =
    lineTitle ||
    text.split("\n").map((l) => l.trim()).find(Boolean)?.slice(0, 180) ||
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
    category: String(val(parsed.category) || "").trim(),
    subcategory: String(val(parsed.subcategory) || "").trim(),
    condition: String(val(parsed.condition) || "").trim(),
    price: String(val(parsed.price) || "").trim(),
    currency: String(val(parsed.currency) || "").trim(),
    country: String(val(parsed.country) || "").trim(),
    city: String(val(parsed.city) || "").trim(),
    location: String(val(parsed.city) || "").trim(),
    contact_phone: String(val(parsed.contactPhone) || "").trim(),
    rentalPeriod: String(val(parsed.rentalPeriod) || "").trim(),
  };
}
