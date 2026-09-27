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
  | "cover_letter"
  | "match_job"
  | "compare"
  | "applications"
  | "interview_prep"
  | "career_roadmap"
  | "ai_settings"
  | "platform_guide"
  | "how_to"
  | "support"
  | "pricing"
  | "safety"
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
      { label: "Finder", text: "Open Hunared Finder lost and found" },
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
      label: "What I can do",
      message:
        "I'm **Hunared AI** — your guide to the entire Hunared platform.\n\n**Discover**\n• Jobs by role, city, country, permanent/temporary\n• Talent (candidates), companies, marketplace listings\n• Learning articles, programs, certifications\n\n**Create & manage**\n• CV Builder · post a job or ad · profile · saved items\n\n**Learn the site**\n• Ask *How do I post a job?* · *How does Hunared work?* · *Is Hunared free?*\n\n**Support**\n• Contact page · Privacy & AI settings\n\nTry any natural request — no special commands needed.",
      secondary: [
        { label: "Jobs", href: "/jobs" },
        { label: "Marketplace", href: "/market" },
        { label: "How Hunared works", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
    };
  }

  // ── Auth / account ──────────────────────────────────────────────────
  if (/\b(sign\s*in|log\s*in|login)\b/.test(t)) {
    return {
      intent: "sign_in",
      href: "/sign-in",
      label: "Sign in",
      message: "Continue to **Sign in** to access your Hunared account.",
      autoNavigate: false,
    };
  }
  if (/\b(register|sign\s*up|create (an? )?account|get started)\b/.test(t)) {
    return {
      intent: "register",
      href: "/register",
      label: "Register",
      message: "Create your free Hunared account to save jobs, build a CV, and post listings.",
      autoNavigate: false,
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
      message: "Open **Contact** to reach the Hunared team. Include your account email if you already registered.",
      autoNavigate: false,
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
      label: "Hunared Finder",
      message: "Opening Hunared Finder (lost & found community).",
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
    const mbits: string[] = [];
    if (marketLabel) mbits.push(marketLabel);
    if (entities.q) mbits.push(`“${entities.q}”`);
    if (city) mbits.push(`in ${city}`);
    if (priceMax) mbits.push(`under ${priceMax}`);
    const mfocus = mbits.length ? mbits.join(" · ") : "listings";
    const msg = `I prepared a marketplace search for **${mfocus}**.\n\nOpen **View marketplace** for live listings. Adjust category, price, and location filters on the results page.`;
    return {
      intent: "search_market",
      href,
      label: "View marketplace",
      message: msg,
      autoNavigate: false,
      entities,
      secondary: [
        { label: "All marketplace", href: "/market" },
        { label: "Post listing", href: "/post" },
      ],
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
    const bits: string[] = [];
    if (entities.q) bits.push(`**${entities.q}**`);
    if (city) bits.push(`in **${city}**`);
    else if (country) bits.push(`country filter applied`);
    if (entities.employmentType) bits.push(entities.employmentType);
    const focus = bits.length ? bits.join(" · ") : "open roles";
    const msg = `I set up a job search for ${focus}.\n\nOpen **View jobs** to see live results on Hunared. You can refine with filters (location, employment type, category) on the jobs page.${
      salaryMin
        ? `\n\nYou mentioned a salary around **${salaryMin}** — apply salary filters on the results page if available.`
        : ""
    }`;
    return {
      intent: "search_jobs",
      href,
      label: "View jobs",
      message: msg,
      autoNavigate: false,
      entities,
      secondary: [
        { label: "All jobs", href: "/jobs" },
        { label: "Saved", href: "/dashboard/saved" },
        { label: "CV Builder", href: "/dashboard/cv" },
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
    label: "Try an example",
    message:
      "I want to help, but that request was unclear.\n\nTry something like:\n• *Instrument technician jobs in Jubail*\n• *Apartment for rent in Dammam*\n• *Show candidates available for hire*\n• *Open CV Builder*\n• *What can you do?*",
    secondary: [
      { label: "Jobs", href: "/jobs" },
      { label: "Marketplace", href: "/market" },
      { label: "Capabilities", href: "/agent" },
    ],
  };
}


/** Extra high-value intents layered on Agent Pro engine */

/** Platform guide, how-to, support — full site knowledge layer */
export function enhanceAction(action: AgentAction, q: string, role?: string): AgentAction {
  const lower = q.toLowerCase().trim();

  if (
    /how (does |do )?hunared work|what is hunared|about hunared|explain hunared|hunared platform|what can (i|we) do (on|with) hunared/i.test(
      lower
    )
  ) {
    return {
      intent: "platform_guide",
      href: "/about",
      label: "About Hunared",
      message:
        "**Hunared** is a global opportunity platform connecting people and businesses across:\n\n• **Jobs** — search and post roles (permanent & temporary)\n• **Talent** — professionals available for hire\n• **Companies** — employer directory\n• **Marketplace** — products, services, property, vehicles, accommodation\n• **Learning** — career articles, programs, skills\n• **CV Builder** — create and improve your CV\n• **Finder Center** — lost & found community\n\nBrowse without an account. Sign in to save items, post listings, build a CV, and manage your profile.\n\nTry: *Find HSE jobs in Jubail* or *How do I post an ad?*",
      secondary: [
        { label: "Browse jobs", href: "/jobs" },
        { label: "Marketplace", href: "/market" },
        { label: "Register", href: "/register" },
      ],
    };
  }

  if (/how (do i|to) (post|create|publish).*(job|vacancy)/i.test(lower)) {
    return {
      intent: "how_to",
      href: "/post",
      label: "Post a job",
      message:
        "**Post a job on Hunared**\n\n1. Sign in (or register)\n2. Open **Post an Ad** and choose **Job**\n3. Fill title, description, location, employment type, company contact\n4. Submit — it may go to review before going public\n\nClear requirements and city help candidates find you faster.",
      secondary: [
        { label: "Post an Ad", href: "/post" },
        { label: "My jobs", href: "/dashboard/jobs" },
      ],
    };
  }

  if (/how (do i|to) (post|create|sell|list).*(ad|listing|item|product|marketplace)/i.test(lower)) {
    return {
      intent: "how_to",
      href: "/post",
      label: "Post a listing",
      message:
        "**Post a marketplace listing**\n\n1. Sign in\n2. **Post an Ad** → category (For Sale, For Rent, Services, Vehicles, etc.)\n3. Add photos, price (optional), location, description\n4. Publish\n\nAccurate categories help buyers filter and find you.",
      secondary: [
        { label: "Post an Ad", href: "/post" },
        { label: "Marketplace", href: "/market" },
      ],
    };
  }

  if (/how (do i|to) (build|create|make|upload).*(cv|resume)/i.test(lower)) {
    return {
      intent: "how_to",
      href: "/dashboard/cv",
      label: "Open CV Builder",
      message:
        "**CV Builder on Hunared**\n\n1. Sign in\n2. Open **CV Builder** from the dashboard\n3. Create from scratch, use a sample, or **upload** an existing CV (PDF/DOCX)\n4. Edit like a document, use AI assist, then export/print\n\nYou can keep multiple CVs.",
      secondary: [
        { label: "CV Builder", href: "/dashboard/cv" },
        { label: "Register", href: "/register" },
      ],
    };
  }

  if (/how (do i|to) (apply|save).*(job)/i.test(lower)) {
    return {
      intent: "how_to",
      href: "/jobs",
      label: "Browse jobs",
      message:
        "**Jobs on Hunared**\n\n• Browse **/jobs** with filters (city, country, employment type)\n• Open a job for details and company contact\n• **Save** jobs when signed in\n• Apply using the contact method on the job\n\nKeep your profile and CV updated so employers can find you under Talent.",
      secondary: [
        { label: "Jobs", href: "/jobs" },
        { label: "My Saved", href: "/dashboard/saved" },
        { label: "Talent", href: "/candidates" },
      ],
    };
  }

  if (/how (do i|to) (register|sign up|create account)/i.test(lower)) {
    return {
      intent: "how_to",
      href: "/register",
      label: "Register",
      message:
        "**Create a Hunared account**\n\n1. Open **Register**\n2. Choose Personal, Job Seeker, or Company\n3. Complete required profile fields\n4. Verify email if prompted\n\nSeekers can list as available for hire. Companies can post jobs.",
      secondary: [
        { label: "Register", href: "/register" },
        { label: "Sign in", href: "/sign-in" },
      ],
    };
  }

  if (
    /how (do i|to) (use|navigate|search).*(site|hunared|platform)/i.test(lower) ||
    /how to use (this )?site/i.test(lower)
  ) {
    return {
      intent: "how_to",
      href: "/",
      label: "Go to home",
      message:
        "**How to use Hunared**\n\n1. **Header menus** — Jobs, Talent, Companies, Marketplace, Learning\n2. **Filters** on each page (city, category, employment type)\n3. **Post an Ad** — jobs or marketplace\n4. **Dashboard** (signed in) — profile, CV, saved, notifications\n5. **Hunared AI** (me) — ask in plain language anytime\n\nStart with Jobs or Marketplace, or tell me what you need.",
      secondary: [
        { label: "Home", href: "/" },
        { label: "Jobs", href: "/jobs" },
        { label: "Marketplace", href: "/market" },
      ],
    };
  }

  if (/is hunared free|pricing|cost|subscription|paid|premium plan/i.test(lower)) {
    return {
      intent: "pricing",
      href: "/contact",
      label: "Contact",
      message:
        "Browsing jobs, marketplace, companies, and learning is available on Hunared. Posting, CV Builder, and saved items need a free account.\n\nAny paid or promoted options are shown where they apply. For billing questions, use **Contact**.",
      secondary: [
        { label: "Register free", href: "/register" },
        { label: "Contact", href: "/contact" },
      ],
    };
  }

  if (
    /safe|scam|trust|verify|fraud|secure/i.test(lower) &&
    /hunared|site|platform|job|listing/i.test(lower)
  ) {
    return {
      intent: "safety",
      href: "/contact",
      label: "Report / Contact",
      message:
        "**Stay safe on Hunared**\n\n• Never pay upfront fees to “guarantee” a job\n• Verify company contacts when possible\n• Meet in public for local marketplace deals\n• Report suspicious activity via **Contact**\n\nUse good judgment for payments and personal data.",
      secondary: [
        { label: "Contact", href: "/contact" },
        { label: "About", href: "/about" },
      ],
    };
  }

  if (/support|help desk|customer service|report (a )?problem|bug|not working/i.test(lower)) {
    return {
      intent: "support",
      href: "/contact",
      label: "Contact support",
      message:
        "For account, listing, or technical issues, open **Contact** and describe what happened.\n\nAlso try: sign out/in, clear cache, or check **Privacy & AI** if the assistant is off.\n\nI'm here for product guidance; human support is via Contact.",
      secondary: [
        { label: "Contact", href: "/contact" },
        { label: "AI settings", href: "/ai-settings" },
      ],
    };
  }

  if (/cover\s*letter/i.test(lower)) {
    return {
      intent: "cover_letter",
      href: "/dashboard/cv",
      label: "Open CV Builder",
      message:
        "Prepare a cover letter in **CV Builder**. Open your CV, then use AI Assist: \"Write a cover letter for [job title] at [company].\" Review before sending.",
      secondary: [
        { label: "Browse jobs", href: "/jobs" },
        { label: "My CVs", href: "/dashboard/cv" },
      ],
    };
  }

  if (/am i qualified|match(ing)? (score|percent)|fit for this job|skills? (am i )?missing/i.test(lower)) {
    return {
      intent: "match_job",
      href: "/jobs",
      label: "Browse jobs",
      message:
        "Open a job page, then ask again — compare your profile and CV to the requirements. I never invent qualifications.",
      secondary: [
        { label: "Edit profile", href: "/dashboard/profile" },
        { label: "CV Builder", href: "/dashboard/cv" },
      ],
    };
  }

  if (/interview|prepare for interview/i.test(lower)) {
    return {
      intent: "interview_prep",
      href: "/education",
      label: "Learning",
      message:
        "Interview prep: review the job description, prepare STAR examples from your experience, and list questions for the employer. Share the job title for practice themes.",
      secondary: [
        { label: "Jobs", href: "/jobs" },
        { label: "CV Builder", href: "/dashboard/cv" },
      ],
    };
  }

  if (/career (plan|path|roadmap)|what should i learn|skills? (to |i should )?learn/i.test(lower)) {
    return {
      intent: "career_roadmap",
      href: "/education",
      label: "Explore learning",
      message:
        "Career roadmap: 1) Target role on profile 2) Skills from recent work 3) Gaps vs job ads 4) Learning/Program resources 5) Update CV. Tell me current and target role for a tailored outline.",
      secondary: [
        { label: "Learning", href: "/education" },
        { label: "Program", href: "/program" },
        { label: "Jobs", href: "/jobs" },
      ],
    };
  }

  if (/my applications|application status|track application/i.test(lower)) {
    return {
      intent: "applications",
      href: "/dashboard",
      label: "Dashboard",
      message:
        "Your activity is on the **Dashboard**. Review saved jobs and profile there. Tracking depends on what you saved or submitted on Hunared.",
      secondary: [
        { label: "Saved items", href: "/dashboard/saved" },
        { label: "Jobs", href: "/jobs" },
      ],
    };
  }

  if (/compare (these )?jobs|compare listings/i.test(lower)) {
    return {
      intent: "compare",
      href: "/jobs",
      label: "Open Jobs",
      message:
        "Open or save jobs to compare location, employment type, requirements, and company. I will not invent salaries or benefits.",
      secondary: [{ label: "Saved", href: "/dashboard/saved" }],
    };
  }

  if (/turn (on|off) (hunared )?ai|ai settings|disable ai|enable ai|privacy.?ai/i.test(lower)) {
    return {
      intent: "ai_settings",
      href: "/ai-settings",
      label: "Privacy & AI settings",
      message:
        "Control **Hunared AI** in Privacy & AI settings (works without login on this device). Turn AI ON or OFF anytime. When OFF, AI assistance stops; the rest of Hunared still works.",
      secondary: [{ label: "Open settings", href: "/ai-settings" }],
    };
  }

  if (role === "employer" && /find (me )?(candidates|talent|technicians)/i.test(lower)) {
    return {
      intent: "search_candidates",
      href: "/candidates?available=yes",
      label: "Browse talent",
      message:
        "Open **Talent** for hiring. Filter by skills and availability. Only public profiles are shown.",
      secondary: [
        { label: "Post a job", href: "/post" },
        { label: "My jobs", href: "/dashboard/jobs" },
      ],
    };
  }

  if (action.href === "/dashboard/settings/ai") {
    action = { ...action, href: "/ai-settings" };
  }

  return action;
}
