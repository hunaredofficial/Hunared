/**
 * Hunared Agent — intent + action engine.
 * Rule-based first (works without LLM). Optional LLM via /api/agent when OPENAI_API_KEY is set.
 * Never claims success without a verified navigation/action result.
 */

export type AgentIntent =
  | "search_jobs"
  | "search_market"
  | "search_companies"
  | "search_candidates"
  | "search_learning"
  | "search_universal"
  | "navigate"
  | "help"
  | "profile"
  | "saved"
  | "post"
  | "cv"
  | "unknown";

export type AgentAction = {
  intent: AgentIntent;
  href?: string;
  label: string;
  message: string;
  needsConfirm?: boolean;
  entities?: Record<string, string>;
};

const COUNTRY_ALIASES: Record<string, string> = {
  "saudi arabia": "SA",
  saudi: "SA",
  ksa: "SA",
  uae: "AE",
  "united arab emirates": "AE",
  dubai: "AE",
  qatar: "QA",
  kuwait: "KW",
  oman: "OM",
  bahrain: "BH",
  pakistan: "PK",
  india: "IN",
  egypt: "EG",
};

const CITY_HINTS = [
  "riyadh", "jeddah", "dammam", "khobar", "dhahran", "jubail", "yanbu",
  "makkah", "madinah", "neom", "dubai", "abu dhabi", "doha", "manama",
];

function detectCountry(text: string): string | undefined {
  const t = text.toLowerCase();
  for (const [name, code] of Object.entries(COUNTRY_ALIASES)) {
    if (t.includes(name)) return code;
  }
  return undefined;
}

function detectCity(text: string): string | undefined {
  const t = text.toLowerCase();
  for (const c of CITY_HINTS) {
    if (t.includes(c)) return c.replace(/\b\w/g, (x) => x.toUpperCase());
  }
  return undefined;
}

function extractSalaryMin(text: string): string | undefined {
  const m = text.match(/(?:above|over|more than|>|min(?:imum)?)\s*([\d,]+)\s*(?:sar|usd|aed)?/i)
    || text.match(/([\d,]+)\s*\+\s*(?:sar|usd|aed)?/i);
  return m ? m[1].replace(/,/g, "") : undefined;
}

function cleanQuery(text: string): string {
  let q = text
    .replace(/\b(find|show|search|looking for|need|want|get me|help me)\b/gi, " ")
    .replace(/\b(jobs?|job openings?|vacancies|roles?)\b/gi, " ")
    .replace(/\b(in|near|at|for|the|a|an|me|my)\b/gi, " ")
    .replace(/\b(saudi arabia|ksa|uae|qatar|kuwait|oman|bahrain)\b/gi, " ")
    .replace(/\b(riyadh|jeddah|dammam|khobar|dhahran|jubail|dubai|doha)\b/gi, " ")
    .replace(/\b(above|over|more than)\s*[\d,]+\s*(sar|usd|aed)?\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  // expand common abbreviations
  q = q
    .replace(/\binst(?:rument)?\s*tech\b/gi, "Instrument Technician")
    .replace(/\bhse\b/gi, "HSE")
    .replace(/\bit\b/gi, "IT");
  return q;
}

function buildJobsUrl(entities: Record<string, string>): string {
  const p = new URLSearchParams();
  if (entities.q) p.set("search", entities.q);
  if (entities.country) p.set("country", entities.country);
  if (entities.city) p.set("city", entities.city);
  if (entities.employmentType) p.set("employmentType", entities.employmentType);
  return `/jobs${p.toString() ? `?${p}` : ""}`;
}

function buildMarketUrl(entities: Record<string, string>): string {
  const p = new URLSearchParams();
  if (entities.q) p.set("search", entities.q);
  if (entities.category) p.set("category", entities.category);
  if (entities.country) p.set("country", entities.country);
  if (entities.city) p.set("city", entities.city);
  return `/market${p.toString() ? `?${p}` : ""}`;
}

function buildSearchUrl(entities: Record<string, string>, category?: string): string {
  const p = new URLSearchParams();
  if (entities.q) p.set("q", entities.q);
  if (entities.country) p.set("country", entities.country);
  if (entities.city) p.set("city", entities.city);
  if (category) p.set("category", category);
  return `/search${p.toString() ? `?${p}` : ""}`;
}

/** Parse natural language into a safe Hunared action (no privileged writes). */
export function parseUserMessage(
  message: string,
  pageContext?: { path?: string; title?: string }
): AgentAction {
  const raw = message.trim();
  const t = raw.toLowerCase();
  const country = detectCountry(t);
  const city = detectCity(t);
  const salaryMin = extractSalaryMin(t);
  const entities: Record<string, string> = {};
  if (country) entities.country = country;
  if (city) entities.city = city;
  if (salaryMin) entities.salaryMin = salaryMin;

  // Help
  if (
    /^(help|what can you do|what can i do|commands?)\b/.test(t) ||
    t.includes("what can i do on hunared")
  ) {
    return {
      intent: "help",
      label: "Help",
      message:
        "I can search jobs, marketplace, companies, talent, and learning; open your profile or saved items; and guide you to post a job or listing.\n\nTry:\n• Find instrument technician jobs in Saudi Arabia\n• Apartment for rent in Dammam\n• Used laptops\n• Electrical services near Khobar\n• Show my saved jobs\n• Create my profile",
    };
  }

  // Saved
  if (/\b(my saved|saved jobs|saved listings|show saved)\b/.test(t)) {
    return {
      intent: "saved",
      href: "/dashboard/saved",
      label: "Open Saved",
      message: "Opening your saved items.",
      entities,
    };
  }

  // Profile
  if (/\b(my profile|complete (my )?profile|update (my )?profile|edit profile)\b/.test(t)) {
    return {
      intent: "profile",
      href: "/dashboard/profile",
      label: "Open Profile",
      message: "Opening your profile so you can review or complete it.",
      entities,
    };
  }

  // CV
  if (/\b(cv|resume|create (my )?cv|build (my )?cv)\b/.test(t)) {
    return {
      intent: "cv",
      href: "/dashboard/profile",
      label: "Profile / CV",
      message:
        "CV tools are managed from your profile. I’ll take you there — upload or update your CV from the profile form.",
      entities,
    };
  }

  // Post
  if (/\b(post a job|create a job|hire)\b/.test(t)) {
    return {
      intent: "post",
      href: "/dashboard/jobs/new",
      label: "Post a Job",
      message: "Opening the job post form. You must be signed in as a company account.",
      entities,
    };
  }
  if (/\b(post (an? )?(ad|listing|item)|sell|create (a )?listing)\b/.test(t)) {
    return {
      intent: "post",
      href: "/dashboard/market/new",
      label: "Create Listing",
      message: "Opening the marketplace listing form. Sign in required.",
      entities,
    };
  }

  // Companies
  if (/\b(companies|company directory|employers)\b/.test(t) && !/\bjobs?\b/.test(t)) {
    entities.q = cleanQuery(raw);
    const p = new URLSearchParams();
    if (entities.q) p.set("search", entities.q);
    if (country) p.set("country", country);
    return {
      intent: "search_companies",
      href: `/companies${p.toString() ? `?${p}` : ""}`,
      label: "Search Companies",
      message: `Searching companies${city ? ` near ${city}` : ""}${country ? ` in ${country}` : ""}.`,
      entities,
    };
  }

  // Candidates / talent
  if (/\b(candidates|talent|professionals|hire someone)\b/.test(t)) {
    const p = new URLSearchParams();
    if (/\bavailable|for hire\b/.test(t)) p.set("available", "yes");
    if (country) p.set("country", country);
    if (city) p.set("city", city);
    return {
      intent: "search_candidates",
      href: `/candidates${p.toString() ? `?${p}` : ""}`,
      label: "Browse Talent",
      message: "Opening the talent directory.",
      entities,
    };
  }

  // Learning
  if (/\b(training|course|learning|article|hse safety|career tips)\b/.test(t)) {
    entities.q = cleanQuery(raw);
    const p = new URLSearchParams();
    if (/\bcareer\b/.test(t)) p.set("category", "career_tips");
    if (/\bhse|safety\b/.test(t)) p.set("category", "safety_hse");
    if (/\bengineer\b/.test(t)) p.set("category", "engineering");
    return {
      intent: "search_learning",
      href: `/education${p.toString() ? `?${p}` : ""}`,
      label: "Learning Hub",
      message: "Opening the Learning / Knowledge Hub.",
      entities,
    };
  }

  // Marketplace categories
  const marketCat =
    (/\b(apartment|villa|room|accommodation|for rent|rent)\b/.test(t) && "for_rent") ||
    (/\b(for sale|sell|used|laptop|phone|furniture|car|vehicle)\b/.test(t) && "for_sale") ||
    (/\b(service|plumbing|electrical|cleaning)\b/.test(t) && "services") ||
    (/\b(property|real estate)\b/.test(t) && "property") ||
    (/\b(vehicle|car|truck)\b/.test(t) && "vehicles") ||
    (/\b(electronic|laptop|phone|mobile)\b/.test(t) && "electronics") ||
    (/\b(lost|found)\b/.test(t) && "lost_found") ||
    undefined;

  if (marketCat || /\b(marketplace|listing|buy|sell)\b/.test(t)) {
    entities.q = cleanQuery(raw);
    if (marketCat) entities.category = marketCat;
    const href = buildMarketUrl(entities);
    return {
      intent: "search_market",
      href,
      label: "Search Marketplace",
      message: `Searching marketplace${entities.q ? ` for “${entities.q}”` : ""}${city ? ` in ${city}` : ""}.`,
      entities,
    };
  }

  // Jobs (default professional search)
  if (
    /\b(jobs?|vacanc|opening|role|technician|engineer|officer|nurse|driver|welder|accountant|manager)\b/.test(
      t
    ) ||
    /\b(temporary|permanent)\b/.test(t)
  ) {
    entities.q = cleanQuery(raw);
    if (/\btemporary\b/.test(t)) entities.employmentType = "temporary";
    if (/\bpermanent\b/.test(t)) entities.employmentType = "permanent";
    const href = buildJobsUrl(entities);
    let msg = `Searching jobs${entities.q ? ` for “${entities.q}”` : ""}`;
    if (city) msg += ` in ${city}`;
    else if (country) msg += ` in selected country`;
    if (salaryMin) msg += `. Note: salary filter “above ${salaryMin}” is applied in the jobs board filters when available.`;
    msg += ".";
    return {
      intent: "search_jobs",
      href,
      label: "Search Jobs",
      message: msg,
      entities,
    };
  }

  // Universal search fallback
  if (raw.length > 1) {
    entities.q = cleanQuery(raw) || raw;
    return {
      intent: "search_universal",
      href: buildSearchUrl(entities),
      label: "Universal Search",
      message: `Searching Hunared for “${entities.q}”.`,
      entities,
    };
  }

  return {
    intent: "unknown",
    label: "Clarify",
    message:
      pageContext?.path?.startsWith("/jobs/")
        ? "You’re on a job page. Try: “Is this relevant for instrument technicians?” or “Find similar jobs.”"
        : "What are you looking for? Example: “Instrument technician jobs in Khobar” or “Apartment for rent in Dammam”.",
  };
}

export const SUGGESTIONS_BY_PATH: { match: RegExp; items: string[] }[] = [
  {
    match: /^\/$/,
    items: [
      "Find instrument technician jobs in Saudi Arabia",
      "Apartment for rent in Dammam",
      "Electrical services near me",
      "Show companies hiring",
    ],
  },
  {
    match: /^\/jobs/,
    items: [
      "Temporary jobs in Riyadh",
      "HSE Officer jobs",
      "Jobs near Khobar",
      "Show my saved jobs",
    ],
  },
  {
    match: /^\/market/,
    items: [
      "Used laptops",
      "Villa for rent",
      "Furniture for sale",
      "Lost & Found",
    ],
  },
  {
    match: /^\/candidates/,
    items: ["Available for hire", "Talent in Saudi Arabia", "Find engineers"],
  },
  {
    match: /^\/companies/,
    items: ["Oil & Gas companies", "Companies in Dammam", "Create company profile"],
  },
  {
    match: /^\/education/,
    items: ["HSE safety articles", "Career tips", "Engineering guides"],
  },
];

export function suggestionsForPath(path: string): string[] {
  for (const s of SUGGESTIONS_BY_PATH) {
    if (s.match.test(path)) return s.items;
  }
  return [
    "Find jobs for me",
    "Search marketplace",
    "Open my profile",
    "What can you do?",
  ];
}
