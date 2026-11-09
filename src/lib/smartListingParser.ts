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
  mobiles_accessories: [
    "iphone", "samsung galaxy", "smartphone", "mobile phone", "phone case", "power bank", "powerbank",
    "airpods", "earbuds", "android phone", "huawei", "xiaomi", "oppo", "vivo", "realme", "oneplus",
    "mobile cover", "screen protector", "charger cable", "wireless charger",
  ],
  electronics: [
    "laptop", "macbook", "desktop", "monitor", "gaming pc", "playstation", "xbox", "nintendo",
    "television", "smart tv", "led tv", "camera", "dslr", "drone", "projector", "printer",
    "router", "graphics card", "gpu", "ssd", "hard drive", "keyboard", "mouse", "tablet", "ipad",
  ],
  vehicles: [
    "toyota", "honda", "nissan", "bmw", "mercedes", "hyundai", "kia", "ford", "chevrolet", "lexus",
    "car for sale", "suv", "pickup", "motorcycle", "scooter", "sedan", "hatchback", "4x4",
    "camry", "corolla", "land cruiser", "prado", "hilux", "accord", "civic", "altima", "patrol",
    "motorbike", "bike for sale", "van for sale", "bus for sale", "truck for sale",
  ],
  home_furniture: [
    "sofa", "sofa set", "mattress", "wardrobe", "dining table", "office chair", "refrigerator",
    "fridge", "washing machine", "air conditioner", "ac unit", "split ac", "furniture set",
    "bed frame", "bunk bed", "coffee table", "tv stand", "bookshelf", "curtain", "carpet",
  ],
  personel_workwear: [
    "safety boots", "workwear", "uniform", "ppe", "helmet", "safety shoes", "coverall",
    "safety gloves", "high visibility", "hi vis", "steel toe", "respirator",
  ],
  tools_equipment: [
    "drill", "generator", "compressor", "welder", "power tool", "scaffolding", "forklift",
    "angle grinder", "circular saw", "welding machine", "tool kit", "toolbox", "crane",
  ],
  industrial_materials: [
    "steel", "cement", "cables", "pipes", "valves", "building materials", "copper wire",
    "rebar", "plywood", "insulation", "gypsum", "tiles bulk", "paint drums",
  ],
  pets_animals: [
    "persian cat", "puppy", "dog for", "parrot", "aquarium", "pet food", "kitten", "pet cage",
    "bird for sale", "fish tank",
  ],
  sports_outdoors: [
    "football boots", "gym equipment", "treadmill", "camping tent", "bicycle", "dumbbell",
    "exercise bike", "yoga mat", "fishing rod", "hiking",
  ],
  kids_baby: [
    "stroller", "baby crib", "car seat", "toys for kids", "nursery", "baby clothes", "pram",
    "diaper", "high chair",
  ],
  food_agriculture: [
    "fresh dates", "vegetables", "wholesale rice", "fertilizer", "farm produce", "olive oil bulk",
  ],
  health_medical: [
    "wheelchair", "blood pressure monitor", "medical equipment", "first aid", "hospital bed",
    "oximeter", "nebulizer",
  ],
  accommodation: [
    "apartment for rent", "room for rent", "bed space", "bedspace", "bed-space", "bed spaces",
    "villa for rent", "shared room", "sharedroom", "staff accommodation", "staff housing",
    "bachelor room", "master room", "partition", "studio for rent", "flat for rent",
    "worker accommodation", "family accommodation", "student accommodation", "shared housing",
    "room available", "rooms available", "sharing accommodation",
  ],
  property: [
    "house for sale", "villa for sale", "apartment for sale", "flat for sale", "land for sale",
    "plot for sale", "commercial building", "shop for sale", "office for sale", "warehouse for sale",
    "townhouse for sale", "duplex for sale", "penthouse for sale", "building for sale",
    "residential plot", "commercial plot", "real estate", "property for sale",
    "house", "villa", "apartment", "flat", "townhouse", "duplex", "penthouse", "bungalow",
    "plot", "land", "farm house", "farmhouse",
  ],
  for_rent: [
    "for rent", "forrent", "rental", "per day", "per month", "daily rate", "monthly rent",
    "available for rent", "rent only", "leasing", "lease",
  ],
  for_sale: [
    "for sale", "forsale", "selling", "brand new", "brandnew", "used for sale", "asking price",
  ],
  services: [
    "service", "repair", "installation", "maintenance", "plumber", "electrician", "cleaning service",
    "ac repair", "pest control", "moving service", "driver available", "tutoring service",
  ],
  wanted: ["wanted", "looking for", "need to buy", "seeking", "required urgently"],
  free_items: ["free ", "giveaway", "free of charge", "pickup free", "free to collect"],
  lost_found: ["lost ", "found ", "missing ", "lost my", "found near"],
  events: ["workshop", "seminar", "conference", "meetup", "job fair", "open day"],
  business_commercial: [
    "business for sale", "franchise", "partnership", "investment opportunity", "company for sale",
  ],
  offers_deals: ["% off", "discount", "clearance", "buy 1 get", "flash sale", "special offer"],
  announcements: ["announcement", "notice", "public notice"],
  donations: ["donation", "donate", "charity"],
  community: ["looking for partner", "carpool", "volunteer"],
  education_training: [
    "course", "training", "nebosh", "certification", "tutoring", "diploma", "online class",
  ],
  wholesale: ["wholesale", "bulk order", "distributor", "importer"],
  services_extra: [],
};

/** Real-estate nouns — used to prefer Property / Accommodation over generic For Sale / For Rent */
const REAL_ESTATE_TERMS = [
  "house", "houses", "villa", "villas", "apartment", "apartments", "flat", "flats",
  "townhouse", "townhouses", "duplex", "duplexes", "penthouse", "penthouses", "bungalow",
  "studio", "studios", "building", "buildings", "plot", "plots", "land", "warehouse",
  "warehouses", "showroom", "showrooms", "farmhouse", "farm house", "compound",
  "residential", "commercial building", "office space", "shop for", "real estate", "property",
];

const ROOM_RENT_TERMS = [
  "bed space", "bedspace", "bed-space", "bed spaces", "shared room", "master room",
  "bachelor room", "partition", "staff accommodation", "staff housing", "worker accommodation",
  "room for rent", "rooms for rent", "sharing",
];

const VEHICLE_TERMS = [
  "car", "cars", "suv", "sedan", "hatchback", "pickup", "truck", "van", "bus", "motorcycle",
  "motorbike", "scooter", "bike", "toyota", "honda", "nissan", "bmw", "mercedes", "hyundai",
  "kia", "ford", "camry", "corolla", "land cruiser", "prado", "hilux",
];

function hasAnyPhrase(text: string, phrases: string[]): boolean {
  return phrases.some((p) => textMatchesPhrase(text, p));
}

function scoreCategory(text: string): { value: string; score: number } | null {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [cat, keys] of Object.entries(CATEGORY_KEYWORDS)) {
    if (cat === "services_extra") continue;
    let score = 0;
    for (const k of keys) {
      if (textMatchesPhrase(text, k)) {
        // Longer phrases are stronger signals
        score += Math.max(6, k.length + 4);
      }
    }
    const label = LISTING_CATEGORIES.find((c) => c.value === cat)?.label?.toLowerCase();
    if (label && textMatchesPhrase(text, label)) score += 10;
    if (score > 0) scores[cat] = (scores[cat] ?? 0) + score;
  }

  const isRent =
    /\bfor\s*rent\b|\brental\b|\bper\s*(day|month|week|hour)\b|\bmonthly\s+rent\b|\bleas(e|ing)\b/i.test(
      text
    ) || hasAnyPhrase(text, ["for rent", "forrent", "available for rent"]);
  const isSale =
    /\bfor\s*sale\b|\bselling\b|\basking\s+price\b/i.test(text) ||
    hasAnyPhrase(text, ["for sale", "forsale"]);
  const isRealEstate = hasAnyPhrase(text, REAL_ESTATE_TERMS);
  const isRoomRent = hasAnyPhrase(text, ROOM_RENT_TERMS);
  const isVehicle = hasAnyPhrase(text, VEHICLE_TERMS);

  // ── Domain priority overrides (fixes "house for sale" → Property, not For Sale) ──
  if (isRoomRent) {
    scores.accommodation = Math.max(scores.accommodation ?? 0, 28);
  } else if (isRealEstate && isRent) {
    // House/apartment for rent → accommodation (living) or for_rent; prefer accommodation for residential
    if (
      hasAnyPhrase(text, [
        "apartment",
        "flat",
        "villa",
        "house",
        "studio",
        "room",
        "townhouse",
        "duplex",
      ])
    ) {
      scores.accommodation = Math.max(scores.accommodation ?? 0, 26);
    } else {
      scores.for_rent = Math.max(scores.for_rent ?? 0, 24);
    }
  } else if (isRealEstate && (isSale || !isRent)) {
    // house / villa / plot / land (± for sale) → property
    scores.property = Math.max(scores.property ?? 0, 30);
    // demote generic for_sale so it cannot win
    if (scores.for_sale) scores.for_sale = Math.min(scores.for_sale, 8);
  }

  if (isVehicle && (isSale || !isRent)) {
    scores.vehicles = Math.max(scores.vehicles ?? 0, 22);
    if (scores.for_sale) scores.for_sale = Math.min(scores.for_sale, 8);
  }

  // Generic sale/rent only if no strong domain category
  const domainCats = new Set([
    "property",
    "accommodation",
    "vehicles",
    "electronics",
    "mobiles_accessories",
    "home_furniture",
    "tools_equipment",
    "pets_animals",
    "services",
    "industrial_materials",
  ]);
  const topDomain = Object.entries(scores)
    .filter(([c]) => domainCats.has(c))
    .sort((a, b) => b[1] - a[1])[0];

  if (isSale && (!topDomain || topDomain[1] < 10)) {
    scores.for_sale = Math.max(scores.for_sale ?? 0, 12);
  }
  if (isRent && (!topDomain || topDomain[1] < 10)) {
    scores.for_rent = Math.max(scores.for_rent ?? 0, 12);
  }

  if (/\bwanted\b|\blooking\s+for\b|\bneed\s+to\s+buy\b|\bseeking\b/i.test(text)) {
    scores.wanted = Math.max(scores.wanted ?? 0, 20);
  }
  if (/\bfree\b.*\b(item|giveaway|pickup|collect)\b|\bgiveaway\b/i.test(text)) {
    scores.free_items = Math.max(scores.free_items ?? 0, 18);
  }
  if (
    /\blost\b|\bfound\b|\bmissing\b/i.test(text) &&
    /phone|wallet|key|passport|id|bag|pet|document/i.test(text)
  ) {
    scores.lost_found = Math.max(scores.lost_found ?? 0, 18);
  }

  let best: { value: string; score: number } | null = null;
  for (const [value, score] of Object.entries(scores)) {
    if (score > 0 && (!best || score > best.score)) best = { value, score };
  }
  return best;
}

function normalizeWord(w: string): string {
  const x = w.toLowerCase().trim();
  if (x.endsWith("ies") && x.length > 4) return x.slice(0, -3) + "y";
  if (x.endsWith("sses")) return x.slice(0, -2);
  if (x.endsWith("s") && !x.endsWith("ss") && x.length > 3) return x.slice(0, -1);
  return x;
}

/** Lowercase letters+digits only — matches "bed space" ↔ "bedspace" ↔ "bed-space" */
function compactText(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Phrase match that tolerates spaces, hyphens, and missing spaces.
 * e.g. "bed space", "bedspace", "bed-space", "Bed  Space"
 */
function textMatchesPhrase(text: string, phrase: string): boolean {
  const p = (phrase || "").trim().toLowerCase();
  if (!p || p.length < 2) return false;
  const lower = text.toLowerCase();
  if (lower.includes(p)) return true;
  const hyphen = p.replace(/\s+/g, "-");
  if (hyphen !== p && lower.includes(hyphen)) return true;
  const spaced = p.replace(/-/g, " ");
  if (spaced !== p && lower.includes(spaced)) return true;
  const cPhrase = compactText(p);
  if (cPhrase.length >= 4 && compactText(text).includes(cPhrase)) return true;
  // flexible whitespace: "bed  space" / "bed\tspace"
  const flexible = p.replace(/\s+/g, "\\s+").replace(/-/g, "[-\\s]*");
  try {
    if (new RegExp(`\\b${flexible}\\b`, "i").test(text)) return true;
  } catch {
    /* ignore bad patterns */
  }
  return false;
}

/** Common marketplace spelling / spacing variants */
const PHRASE_ALIASES: Record<string, string[]> = {
  "bed space": ["bedspace", "bed-space", "bed spaces", "bedspaces", "bed space available"],
  "shared room": ["sharedroom", "shared-room"],
  "staff accommodation": ["staffaccommodation", "staff-accommodation", "staff housing", "staffhousing"],
  "room for rent": ["roomforrent", "room-for-rent"],
  "apartment for rent": ["apartmentforrent", "flat for rent", "flatforrent"],
  "for rent": ["forrent", "for-rent"],
  "for sale": ["forsale", "for-sale"],
  "house for sale": ["houseforsale", "house-for-sale", "houses for sale"],
  "villa for sale": ["villaforsale", "villa-for-sale"],
  "apartment for sale": ["apartmentforsale", "flat for sale", "flatforsale"],
  "house": ["houses", "home", "homes"],
  "villa": ["villas"],
  "apartment": ["apartments", "flat", "flats"],
  "air conditioner": ["airconditioner", "a/c", "ac unit", "split ac"],
  "washing machine": ["washingmachine", "washer"],
  "power bank": ["powerbank"],
  "safety boots": ["safetyboots", "safety shoes", "safetyshoes"],
  "work from home": ["workfromhome", "wfh"],
  "brand new": ["brandnew", "brand-new"],
  "second hand": ["secondhand", "second-hand", "pre owned", "preowned", "pre-owned"],
  "lost and found": ["lostandfound", "lost & found"],
};

function expandPhraseVariants(phrase: string): string[] {
  const base = phrase.toLowerCase().trim();
  const out = new Set<string>([base, base.replace(/\s+/g, ""), base.replace(/\s+/g, "-")]);
  for (const [canon, aliases] of Object.entries(PHRASE_ALIASES)) {
    const group = [canon, ...aliases];
    if (group.some((g) => compactText(g) === compactText(base) || textMatchesPhrase(g, base))) {
      group.forEach((g) => out.add(g));
    }
  }
  return [...out];
}

function textMatchesAnyPhrase(text: string, phrases: string[]): boolean {
  for (const p of phrases) {
    if (textMatchesPhrase(text, p)) return true;
    for (const v of expandPhraseVariants(p)) {
      if (textMatchesPhrase(text, v)) return true;
    }
  }
  return false;
}

/** Map title words → preferred subcategory labels per category */
const SUBCATEGORY_HINTS: Record<string, Record<string, string[]>> = {
  property: {
    Houses: ["house", "houses", "home", "homes", "bungalow"],
    Villas: ["villa", "villas"],
    Apartments: ["apartment", "apartments", "flat", "flats"],
    Studios: ["studio", "studios"],
    Townhouses: ["townhouse", "townhouses", "town house"],
    Duplexes: ["duplex", "duplexes"],
    Penthouses: ["penthouse", "penthouses"],
    "Residential Plots": ["residential plot", "plot", "plots", "land"],
    "Commercial Buildings": ["commercial building", "commercial"],
    "Shops & Retail Spaces": ["shop for sale", "retail", "shop"],
    Warehouses: ["warehouse", "warehouses"],
    "Office Buildings & Spaces": ["office for sale", "office building"],
  },
  accommodation: {
    Houses: ["house", "houses"],
    Apartments: ["apartment", "apartments", "flat", "flats"],
    Studios: ["studio", "studios"],
    Villas: ["villa", "villas"],
    Rooms: ["room for rent", "room", "rooms"],
    "Bed Spaces": ["bed space", "bedspace", "bed spaces", "bedspaces"],
    "Shared Rooms": ["shared room", "sharedroom"],
    "Master Rooms": ["master room"],
    "Staff Accommodation": ["staff accommodation", "staff housing"],
    "Worker Accommodation": ["worker accommodation", "labour camp", "labor camp"],
    "Bachelor Accommodation": ["bachelor", "bachelor room"],
    "Family Accommodation": ["family accommodation", "family room"],
  },
  for_rent: {
    Houses: ["house", "houses"],
    Apartments: ["apartment", "apartments", "flat"],
    Rooms: ["room"],
    "Bed Spaces": ["bed space", "bedspace"],
    Villas: ["villa", "villas"],
    Studios: ["studio"],
    Offices: ["office for rent", "office"],
    Warehouses: ["warehouse"],
  },
  vehicles: {
    Cars: ["car", "cars", "sedan", "hatchback"],
    "SUVs & 4x4": ["suv", "4x4", "4wd"],
    "Pickup Trucks": ["pickup", "hilux", "pickup truck"],
    Motorcycles: ["motorcycle", "motorbike"],
    Scooters: ["scooter"],
    Trucks: ["truck", "trucks"],
    Vans: ["van", "vans"],
  },
  electronics: {
    Laptops: ["laptop", "macbook", "notebook"],
    "Desktop Computers": ["desktop", "pc"],
    Televisions: ["tv", "television", "smart tv"],
    "Gaming PCs & Consoles": ["playstation", "xbox", "gaming pc", "ps5", "ps4"],
    Tablets: ["tablet", "ipad"],
  },
  mobiles_accessories: {
    // soft match via keywords only
  },
};

function scoreSubcategory(category: string, text: string): { value: string; score: number } | null {
  const subs = LISTING_SUBCATEGORIES[category] ?? [];
  if (!subs.length) return null;
  const lower = text.toLowerCase();
  const compact = compactText(text);
  const words = new Set(lower.split(/[^a-z0-9+]+/).filter(Boolean).map(normalizeWord));
  let best: { value: string; score: number } | null = null;

  // Explicit hint map (singular title words → plural subcategory labels)
  const hints = SUBCATEGORY_HINTS[category] ?? {};
  for (const [subLabel, phrases] of Object.entries(hints)) {
    if (!subs.includes(subLabel)) continue;
    let score = 0;
    for (const p of phrases) {
      if (textMatchesPhrase(text, p)) score += p.length + 12;
      if (words.has(normalizeWord(p))) score += 8;
    }
    if (score > 0 && (!best || score > best.score)) best = { value: subLabel, score };
  }

  for (const sub of subs) {
    const subLower = sub.toLowerCase();
    let score = 0;
    if (textMatchesPhrase(text, subLower)) score += subLower.length + 10;
    if (compactText(subLower).length >= 4 && compact.includes(compactText(subLower))) {
      score += subLower.length + 8;
    }
    // singularize last token: "Houses" ↔ "house"
    const tokens = subLower.split(/[&,/]| and /).map((s) => s.trim()).filter((s) => s.length > 2);
    for (const t of tokens) {
      if (textMatchesPhrase(text, t)) score += t.length + 3;
      const nt = normalizeWord(t);
      if (words.has(nt)) score += nt.length + 4;
      if (compactText(t).length >= 4 && compact.includes(compactText(t))) score += t.length + 2;
    }
    for (const w of subLower.split(/\s+/)) {
      if (w.length <= 2) continue;
      const nw = normalizeWord(w);
      if (words.has(nw) || lower.includes(w) || compact.includes(compactText(w))) score += 3;
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

export function buildDescription(
  title: string,
  category: string | undefined,
  subcategory: string | undefined,
  extras?: {
    city?: string;
    condition?: string;
    price?: string;
    currency?: string;
    rentalPeriod?: string;
  }
): string {
  const t = title.trim() || "This listing";
  const catLabel =
    LISTING_CATEGORIES.find((c) => c.value === category)?.label ?? category ?? "Marketplace";
  const sub = subcategory?.trim();
  const city = extras?.city?.trim();
  const condition = extras?.condition?.trim();
  const price = extras?.price?.trim();
  const currency = extras?.currency?.trim();
  const rentalPeriod = extras?.rentalPeriod?.trim();

  const locationLine = city
    ? `<p><strong>Location:</strong> ${escapeHtml(city)}</p>`
    : "";
  const conditionLine = condition
    ? `<p><strong>Condition:</strong> ${escapeHtml(condition)}</p>`
    : "";
  const priceLine =
    price
      ? `<p><strong>Price:</strong> ${escapeHtml(price)}${currency ? ` ${escapeHtml(currency)}` : ""}</p>`
      : "";
  const periodLine = rentalPeriod
    ? `<p><strong>Rental period:</strong> ${escapeHtml(rentalPeriod)}</p>`
    : "";

  if (category === "services") {
    return [
      `<p><strong>${escapeHtml(t)}</strong></p>`,
      `<p>Professional <em>${escapeHtml(sub || catLabel)}</em> service.</p>`,
      locationLine,
      priceLine,
      `<p>What you can expect:</p>`,
      `<ul>`,
      `<li>Clear scope and honest communication</li>`,
      `<li>Reliable scheduling and quality workmanship</li>`,
      `<li>Quote available on request — share your requirements</li>`,
      `</ul>`,
      `<p>Contact the provider through this listing for availability, pricing, and next steps.</p>`,
    ]
      .filter(Boolean)
      .join("");
  }

  if (category === "for_rent" || category === "accommodation") {
    return [
      `<p><strong>${escapeHtml(t)}</strong></p>`,
      `<p>${escapeHtml(sub || "Rental")} available for rent${city ? ` in <strong>${escapeHtml(city)}</strong>` : ""}.</p>`,
      periodLine,
      priceLine,
      locationLine,
      `<p>Details:</p>`,
      `<ul>`,
      `<li>Suitable for serious enquiries only</li>`,
      `<li>Viewing by appointment — contact to arrange</li>`,
      `<li>Terms, deposit, and move-in date to be confirmed with the owner</li>`,
      `<li>More photos and full specifications on request</li>`,
      `</ul>`,
      `<p>Message via the contact options on this listing to check availability.</p>`,
    ]
      .filter(Boolean)
      .join("");
  }

  if (category === "property") {
    return [
      `<p><strong>${escapeHtml(t)}</strong></p>`,
      `<p>${escapeHtml(sub || "Property")} listing${city ? ` in <strong>${escapeHtml(city)}</strong>` : ""}.</p>`,
      priceLine,
      locationLine,
      `<ul>`,
      `<li>Contact for full specifications, documents, and viewing</li>`,
      `<li>Serious buyers / investors only</li>`,
      `</ul>`,
    ]
      .filter(Boolean)
      .join("");
  }

  if (category === "wanted") {
    return [
      `<p><strong>${escapeHtml(t)}</strong></p>`,
      `<p>Looking for: <em>${escapeHtml(sub || catLabel)}</em>${city ? ` in ${escapeHtml(city)}` : ""}.</p>`,
      priceLine,
      `<p>Please contact if you have a matching item. Include condition, price, and photos in your reply.</p>`,
    ]
      .filter(Boolean)
      .join("");
  }

  if (category === "lost_found") {
    return [
      `<p><strong>${escapeHtml(t)}</strong></p>`,
      locationLine,
      `<p>Please contact if you have information. When you reply, include:</p>`,
      `<ul>`,
      `<li>Where and when you saw it</li>`,
      `<li>Any identifying details</li>`,
      `<li>How we can reach you</li>`,
      `</ul>`,
      `<p>Thank you for helping the community.</p>`,
    ]
      .filter(Boolean)
      .join("");
  }

  if (category === "free_items" || category === "donations") {
    return [
      `<p><strong>${escapeHtml(t)}</strong></p>`,
      `<p>${escapeHtml(sub || catLabel)} — free for collection / donation${city ? ` (${escapeHtml(city)})` : ""}.</p>`,
      conditionLine,
      `<ul>`,
      `<li>Pickup only unless otherwise agreed</li>`,
      `<li>First serious contact preferred</li>`,
      `</ul>`,
      `<p>Contact to arrange collection time and location.</p>`,
    ]
      .filter(Boolean)
      .join("");
  }

  if (category === "education_training") {
    return [
      `<p><strong>${escapeHtml(t)}</strong></p>`,
      `<p>${escapeHtml(sub || "Training / course")} opportunity.</p>`,
      locationLine,
      priceLine,
      `<ul>`,
      `<li>Contact for schedule, fees, and registration details</li>`,
      `<li>Ask about prerequisites and certification outcomes</li>`,
      `</ul>`,
    ]
      .filter(Boolean)
      .join("");
  }

  // Default product / general listing
  return [
    `<p><strong>${escapeHtml(t)}</strong></p>`,
    `<p>${escapeHtml(sub ? `${sub} · ` : "")}${escapeHtml(catLabel)}${city ? ` — ${escapeHtml(city)}` : ""}.</p>`,
    conditionLine,
    priceLine,
    locationLine,
    `<p>Highlights:</p>`,
    `<ul>`,
    `<li>Please read the title carefully and ask for full specifications</li>`,
    condition ? `<li>Condition stated as ${escapeHtml(condition)}</li>` : `<li>Condition details available on request</li>`,
    `<li>Inspection welcome where applicable</li>`,
    `<li>Serious buyers only</li>`,
    `</ul>`,
    `<p>Contact the seller for confirmation, more photos, and handover details.</p>`,
  ]
    .filter(Boolean)
    .join("");
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
    let subHit = scoreSubcategory(catForSub, text);
    // Related categories share room/property words
    if (!subHit || subHit.score < 5) {
      const related: Record<string, string[]> = {
        for_rent: ["accommodation", "property", "vehicles", "tools_equipment"],
        accommodation: ["for_rent", "property"],
        property: ["for_rent", "accommodation", "for_sale"],
        for_sale: ["electronics", "mobiles_accessories", "vehicles", "home_furniture", "property"],
        electronics: ["mobiles_accessories", "for_sale"],
        mobiles_accessories: ["electronics", "for_sale"],
        vehicles: ["for_sale", "for_rent"],
        home_furniture: ["for_sale"],
      };
      for (const alt of related[catForSub] ?? []) {
        const altHit = scoreSubcategory(alt, text);
        if (altHit && (!subHit || altHit.score > subHit.score)) subHit = altHit;
      }
    }
    if (subHit && subHit.score >= 3) {
      result.subcategory = {
        value: subHit.value,
        confidence: confFromScore(subHit.score, 10, 4),
      };
    }
  }

  // If no category yet, try matching any subcategory across all cats
  if (!result.category) {
    let best: { cat: string; sub: string; score: number } | null = null;
    for (const [cat, subs] of Object.entries(LISTING_SUBCATEGORIES)) {
      for (const sub of subs) {
        if (textMatchesPhrase(text, sub)) {
          const score = sub.length + 6;
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
        confidence: confFromScore(best.score, 10, 4),
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
      value: buildDescription(title, cat, sub, {
        city: result.city?.value,
        condition: result.condition?.value,
        price: result.price?.value,
        currency: result.currency?.value,
        rentalPeriod: result.rentalPeriod?.value,
      }),
      confidence: cat ? "high" : "medium",
    };
  }

  return result;
}
