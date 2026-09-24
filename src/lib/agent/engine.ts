/**
 * Hunared Agent engine — deep intent understanding + action mapping.
 * Rule-based (works offline of LLM). Optional OPENAI polish in /api/agent.
 * Never claims irreversible success without verified navigation/API result.
 */

export type AgentIntent =
  | "search_jobs"
  | "search_market"
  | "search_companies"
  | "search_candidates"
  | "search_learning"
  | "search_universal"
  | "search_finder"
  | "navigate"
  | "help"
  | "profile"
  | "saved"
  | "post_job"
  | "post_listing"
  | "cv"
  | "program"
  | "contact"
  | "about"
  | "register"
  | "sign_in"
  | "dashboard"
  | "notifications"
  | "subscriptions"
  | "clarify"
  | "unknown";

export type AgentAction = {
  intent: AgentIntent;
  href?: string;
  label: string;
  message: string;
  /** High confidence → UI may auto-navigate after short delay */
  autoNavigate?: boolean;
  needsConfirm?: boolean;
  entities?: Record<string, string>;
  /** Secondary buttons */
  secondary?: { label: string; href: string }[];
};

export type ConversationContext = {
  lastIntent?: AgentIntent;
  lastEntities?: Record<string, string>;
  lastHref?: string;
};

const COUNTRY_ALIASES: Record<string, string> = {
  "saudi arabia": "SA",
  saudi: "SA",
  ksa: "SA",
  "kingdom of saudi": "SA",
  uae: "AE",
  "united arab emirates": "AE",
  emirates: "AE",
  dubai: "AE",
  qatar: "QA",
  kuwait: "KW",
  oman: "OM",
  bahrain: "BH",
  pakistan: "PK",
  india: "IN",
  egypt: "EG",
  jordan: "JO",
  philippines: "PH",
  indonesia: "ID",
  bangladesh: "BD",
  "sri lanka": "LK",
  nepal: "NP",
  uk: "GB",
  "united kingdom": "GB",
  usa: "US",
  "united states": "US",
};

const CITY_HINTS = [
  "riyadh", "jeddah", "dammam", "khobar", "al khobar", "dhahran", "jubail",
  "yanbu", "makkah", "mecca", "madinah", "medina", "neom", "taif", "abha",
  "tabuk", "hail", "jazan", "buraidah", "hofuf", "dubai", "abu dhabi",
  "sharjah", "ajman", "doha", "manama", "muscat", "kuwait city", "karachi",
  "lahore", "islamabad", "cairo", "alexandria", "mumbai", "delhi", "bangalore",
];

/** Common profession / skill expansions */
const PROFESSION_MAP: [RegExp, string][] = [
  [/\binst(?:rument)?\s*tech(?:nician)?s?\b/i, "Instrument Technician"],
  [/\bhse\s*officers?\b/i, "HSE Officer"],
  [/\bsafety\s*officers?\b/i, "Safety Officer"],
  [/\bmech(?:anical)?\s*eng(?:ineer)?s?\b/i, "Mechanical Engineer"],
  [/\bcivil\s*eng(?:ineer)?s?\b/i, "Civil Engineer"],
  [/\belec(?:trical)?\s*eng(?:ineer)?s?\b/i, "Electrical Engineer"],
  [/\bsoft(?:ware)?\s*eng(?:ineer)?s?\b/i, "Software Engineer"],
  [/\bproj(?:ect)?\s*man(?:ager)?s?\b/i, "Project Manager"],
  [/\bac\s*tech(?:nician)?s?\b/i, "AC Technician"],
  [/\bwelders?\b/i, "Welder"],
  [/\bdrivers?\b/i, "Driver"],
  [/\bnurses?\b/i, "Nurse"],
  [/\baccountants?\b/i, "Accountant"],
  [/\boffice\s*assistants?\b/i, "Office Assistant"],
  [/\bpiping\s*(?:designers?|engineers?)\b/i, "Piping Engineer"],
  [/\bqa\s*\/?\s*qc\b/i, "QA/QC"],
  [/\briggers?\b/i, "Rigger"],
  [/\bscaffold(?:ing)?\b/i, "Scaffolder"],
  [/\bstore\s*keepers?\b/i, "Store Keeper"],
  [/\bhr\s*(?:officers?|managers?)\b/i, "HR Officer"],
];

const MARKET_CATEGORY_RULES: [RegExp, string, string][] = [
  [/\b(apartment|flat|villa|room|studio|for\s*rent|rental|accommodation)\b/i, "for_rent", "For Rent"],
  [/\b(for\s*sale|sell|selling|used|second\s*hand)\b/i, "for_sale", "For Sale"],
  [/\b(electrical|plumbing|cleaning|maintenance|repair)\s*services?\b/i, "services", "Services"],
  [/\b(services?)\b/i, "services", "Services"],
  [/\b(laptop|phone|mobile|iphone|samsung|electronics?|tv|camera)\b/i, "electronics", "Electronics"],
  [/\b(car|vehicle|truck|motorbike|suv)\b/i, "vehicles", "Vehicles"],
  [/\b(furniture|sofa|bed|table|chair)\b/i, "home_furniture", "Home & Furniture"],
  [/\b(property|real\s*estate|land|plot)\b/i, "property", "Property"],
  [/\b(lost|found)\b/i, "lost_found", "Lost & Found"],
  [/\b(wanted|looking\s*to\s*buy)\b/i, "wanted", "Wanted"],
  [/\b(free\s*items?|giveaway)\b/i, "free_items", "Free Items"],
  [/\b(events?|ticket)\b/i, "events", "Events"],
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
    if (t.includes(c)) {
      return c
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
        .replace("Al Khobar", "Khobar")
        .replace("Mecca", "Makkah")
        .replace("Medina", "Madinah");
    }
  }
  return undefined;
}

function expandProfession(text: string): string {
  let out = text;
  for (const [re, name] of PROFESSION_MAP) {
    if (re.test(out)) out = out.replace(re, name);
  }
  return out;
}

function extractSalaryMin(text: string): string | undefined {
  const m =
    text.match(
      /(?:above|over|more than|min(?:imum)?|at least|>)\s*([\d,]+)\s*(?:sar|usd|aed|riyal)?/i
    ) || text.match(/([\d,]+)\s*\+\s*(?:sar|usd|aed)?/i);
  return m ? m[1].replace(/,/g, "") : undefined;
}

function extractPriceMax(text: string): string | undefined {
  const m = text.match(
    /(?:under|below|less than|max(?:imum)?|upto|up to|<)\s*([\d,]+)\s*(?:sar|usd|aed|riyal)?/i
  );
  return m ? m[1].replace(/,/g, "") : undefined;
}

function cleanQuery(text: string): string {
  let q = expandProfession(text);
  q = q
    .replace(
      /\b(find|show|search|looking for|look for|need|want|get me|help me|please|can you|i want|i need|i'm looking for|im looking for)\b/gi,
      " "
    )
    .replace(/\b(jobs?|job openings?|vacancies|roles?|positions?)\b/gi, " ")
    .replace(/\b(in|near|at|for|the|a|an|me|my|with|and|or)\b/gi, " ")
    .replace(
      /\b(saudi arabia|ksa|uae|qatar|kuwait|oman|bahrain|pakistan|india|egypt)\b/gi,
      " "
    )
    .replace(
      /\b(riyadh|jeddah|dammam|khobar|al khobar|dhahran|jubail|dubai|doha|abu dhabi)\b/gi,
      " "
    )
    .replace(
      /\b(above|over|more than|under|below|less than|min|max|upto|up to)\s*[\d,]+\s*(sar|usd|aed|riyal)?\b/gi,
      " "
    )
    .replace(/\b(temporary|permanent|full[- ]?time|part[- ]?time)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return q;
}

function qs(params: Record<string, string | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && v.trim()) p.set(k, v.trim());
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

function mergeEntities(
  base: Record<string, string> | undefined,
  next: Record<string, string>
): Record<string, string> {
  return { ...(base || {}), ...next };
}

function isFollowUp(t: string): boolean {
  return (
    /^(only |also |and |then |now |filter |show )?(cheaper|cheapest|higher salary|highest|temporary|permanent|remote|near me|in [a-z]|save|first \d)/i.test(
      t
    ) ||
    /^(change (it|that|this) to|make it|filter by|sort by)\b/i.test(t) ||
    /^(those|these|same|again)\b/i.test(t)
  );
}

/** Full command catalog for UI chips */
export const COMMAND_PACKS: {
  title: string;
  commands: { label: string; text: string }[];
}[] = [
  {
    title: "Jobs",
    commands: [
      { label: "Instrument Tech jobs", text: "Find instrument technician jobs in Saudi Arabia" },
      { label: "HSE Officer", text: "HSE Officer jobs in Dammam" },
      { label: "Temporary work", text: "Temporary jobs in Riyadh" },
      { label: "Permanent roles", text: "Permanent jobs in Saudi Arabia" },
      { label: "Jobs near me", text: "Find jobs near Khobar" },
      { label: "Software Engineer", text: "Software Engineer jobs" },
      { label: "Driver jobs", text: "Driver jobs in Jeddah" },
      { label: "Post a job", text: "Post a job" },
    ],
  },
  {
    title: "Marketplace",
    commands: [
      { label: "Apartment rent", text: "Apartment for rent in Dammam under 1500 SAR" },
      { label: "Used laptops", text: "Search used laptops for sale" },
      { label: "Cars for sale", text: "Cars for sale in Riyadh" },
      { label: "Furniture", text: "Furniture for sale" },
      { label: "Electrical services", text: "Electrical services near Khobar" },
      { label: "Lost & Found", text: "Open Lost and Found" },
      { label: "Free items", text: "Free items marketplace" },
      { label: "Sell something", text: "Create a marketplace listing" },
    ],
  },
  {
    title: "People & companies",
    commands: [
      { label: "Browse talent", text: "Show candidates available for hire" },
      { label: "Companies", text: "Show companies in Saudi Arabia" },
      { label: "Oil & Gas firms", text: "Find oil and gas companies" },
      { label: "Create profile", text: "Create my job seeker profile" },
      { label: "Company profile", text: "Create company profile" },
    ],
  },
  {
    title: "My account",
    commands: [
      { label: "My profile", text: "Open my profile" },
      { label: "Saved items", text: "Show my saved jobs and listings" },
      { label: "Dashboard", text: "Open my dashboard" },
      { label: "Notifications", text: "Open notifications" },
      { label: "Update CV", text: "Help me update my CV" },
      { label: "Sign in", text: "Sign in" },
    ],
  },
  {
    title: "Learn & more",
    commands: [
      { label: "Career tips", text: "Show career tips articles" },
      { label: "HSE safety", text: "HSE safety learning articles" },
      { label: "Programs", text: "Open Hunared programs" },
      { label: "Finder", text: "Open Finder Center lost and found" },
      { label: "Contact support", text: "Contact Hunared support" },
      { label: "What can you do?", text: "What can you do on Hunared?" },
    ],
  },
];

export const SUGGESTIONS_BY_PATH: { match: RegExp; items: string[] }[] = [
  {
    match: /^\/$/,
    items: [
      "Find instrument technician jobs in Saudi Arabia",
      "Apartment for rent in Dammam",
      "Electrical services near Khobar",
      "Show candidates available for hire",
      "What can you do?",
    ],
  },
  {
    match: /^\/jobs/,
    items: [
      "Temporary jobs in Riyadh",
      "HSE Officer jobs",
      "Mechanical Engineer jobs in Jubail",
      "Show my saved jobs",
      "Post a job",
    ],
  },
  {
    match: /^\/market/,
    items: [
      "Used laptops for sale",
      "Villa for rent under 3000",
      "Cars for sale in Jeddah",
      "Create a listing",
      "Lost and Found",
    ],
  },
  {
    match: /^\/candidates/,
    items: [
      "Available for hire",
      "Talent in Saudi Arabia",
      "Find engineers",
      "Open my profile",
    ],
  },
  {
    match: /^\/companies/,
    items: [
      "Companies in Dammam",
      "Oil and gas companies",
      "Create company profile",
    ],
  },
  {
    match: /^\/education/,
    items: ["Career tips", "HSE safety articles", "Engineering guides"],
  },
  {
    match: /^\/dashboard/,
    items: [
      "Open my profile",
      "Show my saved items",
      "Post a job",
      "Create a listing",
      "Open notifications",
    ],
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

/**
 * Parse natural language → Hunared action.
 * Supports follow-ups via ConversationContext (e.g. “only temporary”, “in Khobar”).
 */
export function parseUserMessage(
  message: string,
  pageContext?: { path?: string; title?: string },
  ctx?: ConversationContext
): AgentAction {
  const raw = message.trim();
  if (!raw) {
    return {
      intent: "clarify",
      label: "Clarify",
      message: "What would you like me to do? Try a job search, marketplace search, or “What can you do?”",
    };
  }

  let t = expandProfession(raw).toLowerCase();
  const country = detectCountry(t);
  const city = detectCity(t);
  const salaryMin = extractSalaryMin(t);
  const priceMax = extractPriceMax(t);

  let entities: Record<string, string> = {};
  if (country) entities.country = country;
  if (city) entities.city = city;
  if (salaryMin) entities.salaryMin = salaryMin;
  if (priceMax) entities.priceMax = priceMax;

  // ── Follow-up modifiers on previous search ──────────────────────────
  if (ctx?.lastIntent && isFollowUp(t)) {
    entities = mergeEntities(ctx.lastEntities, entities);

    if (/\btemporary\b/.test(t)) entities.employmentType = "temporary";
    if (/\bpermanent\b/.test(t)) entities.employmentType = "permanent";

    if (ctx.lastIntent === "search_jobs") {
      const q = entities.q || ctx.lastEntities?.q || "";
      if (q) entities.q = q;
      const href = `/jobs${qs({
        search: entities.q,
        country: entities.country,
        city: entities.city,
        employmentType: entities.employmentType,
      })}`;
      return {
        intent: "search_jobs",
        href,
        label: "Updated job search",
        message: `Updating your job search${entities.city ? ` in ${entities.city}` : ""}${
          entities.employmentType ? ` (${entities.employmentType})` : ""
        }.`,
        autoNavigate: true,
        entities,
      };
    }

    if (ctx.lastIntent === "search_market") {
      const href = `/market${qs({
        search: entities.q || ctx.lastEntities?.q,
        category: entities.category || ctx.lastEntities?.category,
        country: entities.country,
        city: entities.city,
      })}`;
      return {
        intent: "search_market",
        href,
        label: "Updated marketplace search",
        message: `Updating marketplace results${entities.city ? ` in ${entities.city}` : ""}.`,
        autoNavigate: true,
        entities: mergeEntities(ctx.lastEntities, entities),
      };
    }
  }

  // ── Help ────────────────────────────────────────────────────────────
  if (
    /^(help|hi|hello|hey)\b/.test(t) ||
    /\bwhat can (you|i) do\b/.test(t) ||
    /\bcommands?\b/.test(t) ||
    /\bhow (do|does|can) (you|this|agent)\b/.test(t)
  ) {
    return {
      intent: "help",
      label: "Capabilities",
      message:
        "I’m Hunared Agent — your guide across the whole platform.\n\nI can:\n• Search jobs (profession, city, country, temporary/permanent)\n• Search marketplace (rent, sale, services, vehicles, electronics…)\n• Find companies & talent\n• Open Learning, Programs, Finder\n• Take you to profile, saved items, dashboard, post job/listing\n\nSpeak or type naturally. Example: “Instrument technician jobs in Khobar” or “Apartment for rent under 2000 in Dammam”.",
      secondary: [
        { label: "Browse jobs", href: "/jobs" },
        { label: "Marketplace", href: "/market" },
      ],
    };
  }

  // ── Auth / account ──────────────────────────────────────────────────
  if (/\b(sign\s*in|log\s*in|login)\b/.test(t)) {
    return {
      intent: "sign_in",
      href: "/sign-in",
      label: "Sign in",
      message: "Opening sign in.",
      autoNavigate: true,
    };
  }
  if (/\b(register|sign\s*up|create (an? )?account|get started)\b/.test(t)) {
    return {
      intent: "register",
      href: "/register",
      label: "Register",
      message: "Opening registration so you can create your Hunared account.",
      autoNavigate: true,
    };
  }
  if (/\b(dashboard|my account overview)\b/.test(t)) {
    return {
      intent: "dashboard",
      href: "/dashboard",
      label: "Dashboard",
      message: "Opening your dashboard (sign in required).",
      autoNavigate: true,
    };
  }
  if (/\b(notification)\b/.test(t)) {
    return {
      intent: "notifications",
      href: "/dashboard/notifications",
      label: "Notifications",
      message: "Opening notifications.",
      autoNavigate: true,
    };
  }
  if (/\b(subscription)\b/.test(t)) {
    return {
      intent: "subscriptions",
      href: "/dashboard/subscriptions",
      label: "Subscriptions",
      message: "Opening subscriptions.",
      autoNavigate: true,
    };
  }
  if (/\b(my saved|saved jobs|saved listings|show saved|saved items)\b/.test(t)) {
    return {
      intent: "saved",
      href: "/dashboard/saved",
      label: "Saved items",
      message: "Opening your saved jobs and listings.",
      autoNavigate: true,
      entities,
    };
  }
  if (
    /\b(my profile|complete (my )?profile|update (my )?profile|edit profile|job seeker profile)\b/.test(
      t
    )
  ) {
    return {
      intent: "profile",
      href: "/dashboard/profile",
      label: "My profile",
      message: "Opening your profile to view or complete it.",
      autoNavigate: true,
      entities,
    };
  }
  if (/\b(cv|resume|curriculum)\b/.test(t)) {
    return {
      intent: "cv",
      href: "/dashboard/profile",
      label: "Profile / CV",
      message:
        "CV is managed on your profile. I’ll open it so you can upload or update your CV.",
      autoNavigate: true,
      entities,
    };
  }

  // ── Post flows ──────────────────────────────────────────────────────
  if (/\b(post a job|create a job|publish (a )?job|hire talent)\b/.test(t)) {
    return {
      intent: "post_job",
      href: "/dashboard/jobs/new",
      label: "Post a job",
      message:
        "Opening the job post form. Company account and sign-in are required.",
      autoNavigate: true,
      entities,
    };
  }
  if (
    /\b(post (an? )?(ad|listing|item)|create (a )?listing|sell (something|this|item)|list (an? )?item)\b/.test(
      t
    )
  ) {
    return {
      intent: "post_listing",
      href: "/dashboard/market/new",
      label: "Create listing",
      message: "Opening the marketplace listing form. Sign-in required.",
      autoNavigate: true,
      entities,
    };
  }

  // ── Static pages ────────────────────────────────────────────────────
  if (/\b(program|training pathway|credential)\b/.test(t) && !/\bjob\b/.test(t)) {
    return {
      intent: "program",
      href: "/program",
      label: "Programs",
      message: "Opening Hunared Programs & training pathways.",
      autoNavigate: true,
    };
  }
  if (/\b(contact|support|help desk)\b/.test(t) && !/\bjob\b/.test(t)) {
    return {
      intent: "contact",
      href: "/contact",
      label: "Contact",
      message: "Opening the contact page.",
      autoNavigate: true,
    };
  }
  if (/\b(about hunared|about us|who (are|is) hunared)\b/.test(t)) {
    return {
      intent: "about",
      href: "/about",
      label: "About",
      message: "Opening About Hunared.",
      autoNavigate: true,
    };
  }
  if (/\b(finder|lost and found community)\b/.test(t)) {
    return {
      intent: "search_finder",
      href: "/finder",
      label: "Finder Center",
      message: "Opening Finder Center (lost & found community).",
      autoNavigate: true,
    };
  }

  // ── Companies ───────────────────────────────────────────────────────
  if (
    /\b(companies|company directory|employers|organizations)\b/.test(t) &&
    !/\b(jobs?|hiring for)\b/.test(t)
  ) {
    entities.q = cleanQuery(raw);
    const href = `/companies${qs({
      search: entities.q,
      country: entities.country,
      city: entities.city,
    })}`;
    return {
      intent: "search_companies",
      href,
      label: "Search companies",
      message: `Searching companies${entities.q ? ` for “${entities.q}”` : ""}${
        city ? ` in ${city}` : country ? "" : ""
      }.`,
      autoNavigate: true,
      entities,
    };
  }

  // ── Talent / candidates ─────────────────────────────────────────────
  if (/\b(candidates|talent|professionals|people for hire|hire someone)\b/.test(t)) {
    const available = /\b(available|for hire|open to)\b/.test(t) ? "yes" : undefined;
    const href = `/candidates${qs({
      available,
      country: entities.country,
      city: entities.city,
      search: cleanQuery(raw) || undefined,
    })}`;
    return {
      intent: "search_candidates",
      href,
      label: "Browse talent",
      message: "Opening the talent directory with your filters.",
      autoNavigate: true,
      entities,
    };
  }

  // ── Learning ────────────────────────────────────────────────────────
  if (
    /\b(training|course|learning|articles?|career tips|knowledge hub)\b/.test(t) ||
    (/\b(hse|safety)\b/.test(t) && /\b(article|learn|guide|training)\b/.test(t))
  ) {
    let category: string | undefined;
    if (/\bcareer\b/.test(t)) category = "career_tips";
    if (/\bhse|safety\b/.test(t)) category = "safety_hse";
    if (/\bengineer\b/.test(t)) category = "engineering";
    const href = `/education${qs({ category })}`;
    return {
      intent: "search_learning",
      href,
      label: "Learning Hub",
      message: "Opening the Learning / Knowledge Hub.",
      autoNavigate: true,
      entities: { ...entities, category: category || "" },
    };
  }

  // ── Marketplace ─────────────────────────────────────────────────────
  let marketCat: string | undefined;
  let marketLabel: string | undefined;
  for (const [re, cat, label] of MARKET_CATEGORY_RULES) {
    if (re.test(t)) {
      marketCat = cat;
      marketLabel = label;
      break;
    }
  }

  if (
    marketCat ||
    /\b(marketplace|listing|buy|sell|shop)\b/.test(t)
  ) {
    entities.q = cleanQuery(raw);
    if (marketCat) entities.category = marketCat;
    const href = `/market${qs({
      search: entities.q,
      category: entities.category,
      country: entities.country,
      city: entities.city,
    })}`;
    let msg = `Searching marketplace`;
    if (marketLabel) msg += ` · ${marketLabel}`;
    if (entities.q) msg += ` for “${entities.q}”`;
    if (city) msg += ` in ${city}`;
    if (priceMax) msg += ` (under ${priceMax} — apply price filter on results if needed)`;
    msg += ".";
    return {
      intent: "search_market",
      href,
      label: "Search marketplace",
      message: msg,
      autoNavigate: true,
      entities,
    };
  }

  // ── Jobs ────────────────────────────────────────────────────────────
  const looksLikeJob =
    /\b(jobs?|vacanc|opening|role|position|technician|engineer|officer|nurse|driver|welder|accountant|manager|rigger|scaffold|hiring)\b/.test(
      t
    ) ||
    /\b(temporary|permanent|full[- ]?time)\b/.test(t) ||
    PROFESSION_MAP.some(([re]) => re.test(raw));

  if (looksLikeJob) {
    entities.q = cleanQuery(raw);
    if (/\btemporary\b/.test(t)) entities.employmentType = "temporary";
    if (/\bpermanent\b/.test(t)) entities.employmentType = "permanent";
    const href = `/jobs${qs({
      search: entities.q,
      country: entities.country,
      city: entities.city,
      employmentType: entities.employmentType,
    })}`;
    let msg = `Searching jobs`;
    if (entities.q) msg += ` for “${entities.q}”`;
    if (city) msg += ` in ${city}`;
    else if (country) msg += ` (selected country)`;
    if (entities.employmentType) msg += ` · ${entities.employmentType}`;
    if (salaryMin)
      msg += `. Use the jobs board salary filters for “above ${salaryMin}” if available.`;
    msg += ".";
    return {
      intent: "search_jobs",
      href,
      label: "Search jobs",
      message: msg,
      autoNavigate: true,
      entities,
      secondary: [
        { label: "All jobs", href: "/jobs" },
        { label: "Saved", href: "/dashboard/saved" },
      ],
    };
  }

  // ── Page-aware fallbacks ────────────────────────────────────────────
  if (pageContext?.path?.startsWith("/jobs/")) {
    return {
      intent: "clarify",
      label: "On this job",
      message:
        "You’re viewing a job. Try: “Find similar jobs”, “Jobs in the same city”, or “Show my saved jobs”.",
      secondary: [
        { label: "Similar search", href: "/jobs" },
        { label: "Saved", href: "/dashboard/saved" },
      ],
    };
  }

  // ── Universal search ────────────────────────────────────────────────
  if (raw.length > 1) {
    entities.q = cleanQuery(raw) || raw;
    const href = `/search${qs({
      q: entities.q,
      country: entities.country,
      city: entities.city,
    })}`;
    return {
      intent: "search_universal",
      href,
      label: "Universal search",
      message: `Searching all of Hunared for “${entities.q}”.`,
      autoNavigate: true,
      entities,
    };
  }

  return {
    intent: "unknown",
    label: "Clarify",
    message:
      "I didn’t catch a clear action. Try: “Instrument technician jobs in Khobar”, “Apartment for rent in Dammam”, or “What can you do?”",
  };
}
