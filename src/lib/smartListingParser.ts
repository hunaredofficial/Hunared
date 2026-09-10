/**
 * Smart marketplace listing parser.
 * Detects category, subcategory, condition, price, currency, location, phone
 * from free-text title + description. Suggests a description when empty.
 * Rule-based (no external API) for speed and privacy.
 */

import {
  LISTING_CATEGORIES,
  LISTING_SUBCATEGORIES,
  LISTING_CONDITION_OPTIONS,
  RENTAL_PERIOD_OPTIONS,
} from "@/lib/constants";
import { COUNTRIES } from "@/lib/countries";

export type Confidence = "high" | "medium" | "low";

export type SmartListingSuggestion<T = string> = {
  value: T;
  confidence: Confidence;
  label?: string;
};

export type SmartListingParseResult = {
  category?: SmartListingSuggestion;
  subcategory?: SmartListingSuggestion;
  condition?: SmartListingSuggestion;
  rentalPeriod?: SmartListingSuggestion;
  price?: SmartListingSuggestion;
  currency?: SmartListingSuggestion;
  country?: SmartListingSuggestion;
  city?: SmartListingSuggestion;
  contactPhone?: SmartListingSuggestion;
  suggestedDescription?: SmartListingSuggestion;
};

export function confidencePercent(c: Confidence): number {
  if (c === "high") return 92;
  if (c === "medium") return 72;
  return 55;
}

export function hasListingSuggestions(r: SmartListingParseResult | null): boolean {
  if (!r) return false;
  return Object.keys(r).length > 0;
}

// ── Country / city helpers ──────────────────────────────────────────────────
const COUNTRY_ALIASES: { code: string; names: string[] }[] = [
  { code: "SA", names: ["saudi arabia", "ksa", "kingdom of saudi arabia", "saudi"] },
  { code: "AE", names: ["united arab emirates", "uae", "u.a.e", "emirates"] },
  { code: "QA", names: ["qatar"] },
  { code: "KW", names: ["kuwait"] },
  { code: "BH", names: ["bahrain"] },
  { code: "OM", names: ["oman"] },
  { code: "PK", names: ["pakistan"] },
  { code: "IN", names: ["india"] },
  { code: "EG", names: ["egypt"] },
  { code: "JO", names: ["jordan"] },
  { code: "PH", names: ["philippines"] },
  { code: "BD", names: ["bangladesh"] },
  { code: "NP", names: ["nepal"] },
  { code: "LK", names: ["sri lanka"] },
  { code: "US", names: ["united states", "usa", "u.s.a", "america"] },
  { code: "GB", names: ["united kingdom", "uk", "britain", "england"] },
];

const CITY_HINTS = [
  "riyadh", "jeddah", "dammam", "khobar", "dhahran", "jubail", "yanbu", "makkah", "madinah", "taif", "abha", "tabuk", "neom",
  "dubai", "abu dhabi", "sharjah", "ajman", "al ain",
  "doha", "lusail", "al rayyan",
  "kuwait city", "hawalli", "salmiya",
  "manama", "muharraq",
  "muscat", "salalah", "sohar",
  "karachi", "lahore", "islamabad", "rawalpindi", "faisalabad",
  "mumbai", "delhi", "bangalore", "hyderabad", "chennai",
  "cairo", "alexandria", "amman",
];

// Strong category signals from title/description
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  mobiles_accessories: ["iphone", "samsung galaxy", "smartphone", "mobile phone", "phone case", "power bank", "airpods"],
  electronics: ["laptop", "macbook", "desktop", "monitor", "gaming pc", "playstation", "xbox", "tv ", "television", "camera", "drone"],
  vehicles: ["toyota", "honda", "nissan", "bmw", "mercedes", "car for sale", "suv", "pickup", "motorcycle", "scooter"],
  home_furniture: ["sofa", "mattress", "wardrobe", "dining table", "office chair", "refrigerator", "washing machine", "air conditioner"],
  personel_workwear: ["safety boots", "workwear", "uniform", "ppe", "helmet", "safety shoes", "coverall"],
  tools_equipment: ["drill", "generator", "compressor", "welder", "power tool", "scaffolding", "forklift"],
  industrial_materials: ["steel", "cement", "cables", "pipes", "valves", "building materials", "copper wire"],
  pets_animals: ["persian cat", "puppy", "dog for", "parrot", "aquarium", "pet food"],
  sports_outdoors: ["football boots", "gym equipment", "treadmill", "camping tent", "bicycle"],
  kids_baby: ["stroller", "baby crib", "car seat", "toys for kids", "nursery"],
  food_agriculture: ["fresh dates", "vegetables", "wholesale rice", "fertilizer", "farm produce"],
  health_medical: ["wheelchair", "blood pressure monitor", "medical equipment", "first aid"],
  accommodation: ["apartment for rent", "room for rent", "bed space", "villa for rent", "shared room", "staff accommodation"],
  property: ["villa for sale", "land for sale", "plot for sale", "commercial building", "shop for sale"],
  for_rent: ["for rent", "rental", "per day", "per month", "daily rate", "monthly rent"],
  for_sale: ["for sale", "selling", "brand new", "used for sale"],
  services: ["service", "repair", "installation", "maintenance", "plumber", "electrician", "cleaning service"],
  wanted: ["wanted", "looking for", "need to buy", "seeking"],
  free_items: ["free ", "giveaway", "free of charge", "pickup free"],
  lost_found: ["lost ", "found ", "missing ", "lost my"],
  events: ["workshop", "seminar", "conference", "meetup", "job fair"],
  business_commercial: ["business for sale", "franchise", "partnership", "investment opportunity"],
  offers_deals: ["% off", "discount", "clearance", "buy 1 get", "flash sale"],
  announcements: ["announcement", "notice", "public notice"],
  donations: ["donation", "donate", "charity"],
  community: ["looking for partner", "carpool", "volunteer"],
  education_training: ["course", "training", "nebosh", "certification", "tutoring", "diploma"],
  wholesale: ["wholesale", "bulk order", "distributor", "importer"],
  services_extra: [], // placeholder
};

function scoreCategory(text: string): { value: string; score: number } | null {
  const lower = text.toLowerCase();
  let best: { value: string; score: number } | null = null;

  for (const [cat, keys] of Object.entries(CATEGORY_KEYWORDS)) {
    if (cat === "services_extra") continue;
    let score = 0;
    for (const k of keys) {
      if (lower.includes(k)) score += k.length + 2;
    }
    // also match official label
    const label = LISTING_CATEGORIES.find((c) => c.value === cat)?.label?.toLowerCase();
    if (label && lower.includes(label)) score += 8;
    if (score > 0 && (!best || score > best.score)) {
      best = { value: cat, score };
    }
  }

  // Prefer explicit for_sale / for_rent intent when both match product words
  if (/\bfor\s+rent\b|\brental\b|\bper\s+(day|month|week|hour)\b/i.test(text)) {
    if (!best || best.score < 12) best = { value: "for_rent", score: 14 };
    else if (best.value !== "accommodation" && best.value !== "property") {
      // keep product cat but if strong rent signal and generic sale, switch
      if (best.value === "for_sale" || best.score < 10) best = { value: "for_rent", score: 14 };
    }
  }
  if (/\bfor\s+sale\b|\bselling\b/i.test(text) && (!best || best.value === "other")) {
    best = { value: "for_sale", score: Math.max(best?.score ?? 0, 10) };
  }
  if (/\bwanted\b|\blooking\s+for\b|\bneed\s+to\s+buy\b/i.test(text)) {
    best = { value: "wanted", score: 16 };
  }
  if (/\bfree\b.*\b(item|giveaway|pickup)\b|\bgiveaway\b/i.test(text)) {
    best = { value: "free_items", score: 14 };
  }
  if (/\blost\b|\bfound\b|\bmissing\b/i.test(text) && /phone|wallet|key|passport|id|bag|pet/i.test(text)) {
    best = { value: "lost_found", score: 15 };
  }

  return best;
}

function scoreSubcategory(category: string, text: string): { value: string; score: number } | null {
  const subs = LISTING_SUBCATEGORIES[category] ?? [];
  if (!subs.length) return null;
  const lower = text.toLowerCase();
  let best: { value: string; score: number } | null = null;
  for (const sub of subs) {
    const tokens = sub.toLowerCase().split(/[&,/]| and /).map((s) => s.trim()).filter((s) => s.length > 2);
    let score = 0;
    // full phrase
    if (lower.includes(sub.toLowerCase())) score += sub.length + 5;
    for (const t of tokens) {
      if (lower.includes(t)) score += t.length;
    }
    // word overlap
    for (const w of sub.toLowerCase().split(/\s+/)) {
      if (w.length > 3 && lower.includes(w)) score += 2;
    }
    if (score > 0 && (!best || score > best.score)) best = { value: sub, score };
  }
  return best;
}

function detectCondition(text: string): string | null {
  const lower = text.toLowerCase();
  const order = [
    { v: "Like New", keys: ["like new", "almost new", "barely used"] },
    { v: "Open Box", keys: ["open box"] },
    { v: "Refurbished", keys: ["refurbished", "refurb"] },
    { v: "Wholesale Lot", keys: ["wholesale lot", "bulk lot"] },
    { v: "New", keys: ["brand new", "new sealed", "sealed box", "unused", "brand-new"] },
    { v: "Used", keys: ["used", "second hand", "pre-owned", "preowned"] },
  ];
  for (const o of order) {
    if (o.keys.some((k) => lower.includes(k))) {
      if ((LISTING_CONDITION_OPTIONS as readonly string[]).includes(o.v)) return o.v;
    }
  }
  return null;
}

function detectRentalPeriod(text: string): string | null {
  const patterns: { v: string; re: RegExp }[] = [
    { v: "Hourly", re: /\b(per\s*hour|hourly|\/\s*hr)\b/i },
    { v: "Daily", re: /\b(per\s*day|daily|\/\s*day)\b/i },
    { v: "Weekly", re: /\b(per\s*week|weekly|\/\s*week)\b/i },
    { v: "Monthly", re: /\b(per\s*month|monthly|\/\s*month)\b/i },
    { v: "Yearly", re: /\b(per\s*year|yearly|annually|\/\s*year)\b/i },
  ];
  for (const p of patterns) {
    if (p.re.test(text) && (RENTAL_PERIOD_OPTIONS as readonly string[]).includes(p.v as never)) {
      return p.v;
    }
  }
  return null;
}

function detectPrice(text: string): string | null {
  // 2,500 or 2500 or 2500.00
  const m =
    text.match(/(?:price|cost|rate|asking)?\s*[:\-]?\s*(?:SAR|AED|USD|QAR|KWD|OMR|BHD|PKR|INR|\$|£)?\s*([\d]{1,3}(?:[,\s]\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i) ||
    text.match(/\b([\d]{1,3}(?:,\d{3})+(?:\.\d{1,2})?)\b/);
  if (!m) {
    if (/\bfree\b/i.test(text)) return "Free";
    return null;
  }
  const raw = m[1].replace(/[,\s]/g, "");
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  // ignore years like 2020-2026 if alone
  if (n >= 1900 && n <= 2100 && !/price|sar|aed|usd|cost|rate/i.test(text)) return null;
  return String(Math.round(n));
}

function detectCurrency(text: string): string | null {
  const patterns: { code: string; re: RegExp }[] = [
    { code: "SAR", re: /\bSAR\b|Saudi\s*Riyals?|ر\.?\s*س/i },
    { code: "AED", re: /\bAED\b|Dirhams?/i },
    { code: "QAR", re: /\bQAR\b/i },
    { code: "KWD", re: /\bKWD\b/i },
    { code: "BHD", re: /\bBHD\b/i },
    { code: "OMR", re: /\bOMR\b/i },
    { code: "PKR", re: /\bPKR\b|Rupees?/i },
    { code: "INR", re: /\bINR\b|₹/i },
    { code: "USD", re: /\bUSD\b|US\s*Dollars?|\$\s*\d/i },
    { code: "GBP", re: /\bGBP\b|£\s*\d/i },
  ];
  for (const p of patterns) {
    if (p.re.test(text)) return p.code;
  }
  return null;
}

function detectCountry(text: string): string | null {
  const lower = text.toLowerCase();
  for (const c of COUNTRY_ALIASES) {
    if (c.names.some((n) => lower.includes(n))) return c.code;
  }
  // country list names
  for (const c of COUNTRIES) {
    if (c.name.length > 3 && lower.includes(c.name.toLowerCase())) return c.code;
  }
  return null;
}

function detectCity(text: string): string | null {
  const lower = text.toLowerCase();
  for (const city of CITY_HINTS) {
    if (lower.includes(city)) {
      // Title-case
      return city
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
  }
  return null;
}

function detectPhone(text: string): string | null {
  const m = text.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}(?:[\s-]?\d{2,4})?/);
  if (!m) return null;
  const digits = m[0].replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return m[0].trim();
}

function confFromScore(score: number, high = 12, mid = 6): Confidence {
  if (score >= high) return "high";
  if (score >= mid) return "medium";
  return "low";
}

function buildDescription(
  title: string,
  category: string | undefined,
  subcategory: string | undefined
): string {
  const t = title.trim() || "This item";
  const catLabel =
    LISTING_CATEGORIES.find((c) => c.value === category)?.label ?? category ?? "listing";
  const sub = subcategory?.trim();

  if (category === "services") {
    return [
      `<p><strong>${escapeHtml(t)}</strong></p>`,
      `<p>Professional ${escapeHtml(sub || catLabel)} available.</p>`,
      `<ul>`,
      `<li>Experienced and reliable service</li>`,
      `<li>Quality workmanship</li>`,
      `<li>Contact for details, availability, and quotation</li>`,
      `</ul>`,
      `<p>Message via the listing contact options to discuss your requirements.</p>`,
    ].join("");
  }

  if (category === "for_rent" || category === "accommodation") {
    return [
      `<p><strong>${escapeHtml(t)}</strong></p>`,
      `<p>${escapeHtml(sub || catLabel)} available for rent.</p>`,
      `<ul>`,
      `<li>Please check availability and viewing times</li>`,
      `<li>Terms and deposit as agreed with the owner</li>`,
      `<li>Contact for more photos and details</li>`,
      `</ul>`,
    ].join("");
  }

  if (category === "wanted") {
    return [
      `<p><strong>${escapeHtml(t)}</strong></p>`,
      `<p>Looking to buy: ${escapeHtml(sub || catLabel)}.</p>`,
      `<p>Please contact with details, price, and condition if you have a match.</p>`,
    ].join("");
  }

  if (category === "lost_found") {
    return [
      `<p><strong>${escapeHtml(t)}</strong></p>`,
      `<p>Please contact if you have information. Provide location, date, and any identifying details when you reply.</p>`,
    ].join("");
  }

  if (category === "free_items" || category === "donations") {
    return [
      `<p><strong>${escapeHtml(t)}</strong></p>`,
      `<p>${escapeHtml(sub || catLabel)} — free for pickup / donation.</p>`,
      `<p>Contact to arrange collection. Serious enquiries only.</p>`,
    ].join("");
  }

  // Default product-style description
  return [
    `<p><strong>${escapeHtml(t)}</strong></p>`,
    `<p>${escapeHtml(sub ? `${sub} · ` : "")}${escapeHtml(catLabel)}.</p>`,
    `<ul>`,
    `<li>Please read the title and contact for full specifications</li>`,
    `<li>Inspection welcome where applicable</li>`,
    `<li>Serious buyers only</li>`,
    `</ul>`,
    `<p>Contact the seller for price confirmation, location, and more photos.</p>`,
  ].join("");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Parse title + description and return structured suggestions.
 */
export function parseListingText(
  title: string,
  description: string
): SmartListingParseResult {
  const text = `${title}\n${description}`.trim();
  if (text.length < 3) return {};

  const result: SmartListingParseResult = {};

  const catHit = scoreCategory(text);
  if (catHit && catHit.score >= 4) {
    const label = LISTING_CATEGORIES.find((c) => c.value === catHit.value)?.label;
    result.category = {
      value: catHit.value,
      confidence: confFromScore(catHit.score),
      label: label ?? catHit.value,
    };
  }

  const catForSub = result.category?.value ?? "";
  if (catForSub) {
    const subHit = scoreSubcategory(catForSub, text);
    if (subHit && subHit.score >= 4) {
      result.subcategory = {
        value: subHit.value,
        confidence: confFromScore(subHit.score, 14, 7),
      };
    }
  }

  // If no category yet, try matching any subcategory across all cats
  if (!result.category) {
    let best: { cat: string; sub: string; score: number } | null = null;
    for (const [cat, subs] of Object.entries(LISTING_SUBCATEGORIES)) {
      for (const sub of subs) {
        const lower = text.toLowerCase();
        if (lower.includes(sub.toLowerCase())) {
          const score = sub.length + 5;
          if (!best || score > best.score) best = { cat, sub, score };
        }
      }
    }
    if (best) {
      const label = LISTING_CATEGORIES.find((c) => c.value === best!.cat)?.label;
      result.category = {
        value: best.cat,
        confidence: confFromScore(best.score),
        label: label ?? best.cat,
      };
      result.subcategory = {
        value: best.sub,
        confidence: confFromScore(best.score, 14, 7),
      };
    }
  }

  const condition = detectCondition(text);
  if (condition) {
    result.condition = { value: condition, confidence: "high" };
  }

  const rental = detectRentalPeriod(text);
  if (rental) {
    result.rentalPeriod = { value: rental, confidence: "high" };
  }

  const price = detectPrice(text);
  if (price) {
    result.price = { value: price, confidence: price === "Free" ? "high" : "medium" };
  }

  const currency = detectCurrency(text);
  if (currency) {
    result.currency = { value: currency, confidence: "high" };
  }

  const country = detectCountry(text);
  if (country) {
    const name = COUNTRIES.find((c) => c.code === country)?.name;
    result.country = { value: country, confidence: "high", label: name ?? country };
  }

  const city = detectCity(text);
  if (city) {
    result.city = { value: city, confidence: "medium" };
  }

  const phone = detectPhone(text);
  if (phone) {
    result.contactPhone = { value: phone, confidence: "medium" };
  }

  // Description suggestion only when description is empty / very short
  const plainDesc = description.replace(/<[^>]+>/g, "").trim();
  if (plainDesc.length < 20 && title.trim().length >= 3) {
    const cat = result.category?.value;
    const sub = result.subcategory?.value;
    result.suggestedDescription = {
      value: buildDescription(title, cat, sub),
      confidence: cat ? "medium" : "low",
    };
  }

  return result;
}
