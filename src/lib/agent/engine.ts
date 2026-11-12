/**
 * Hunared Agent engine — deep intent understanding + action mapping.
 * Rule-based (works offline of LLM). Optional OPENAI polish in /api/agent.
 * Never claims irreversible success without verified navigation/API result.
 */

import { matchKnowledge } from "@/lib/agent/knowledge";

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
  | "messages"
  | "history"
  | "settings"
  | "finder"
  | "team"
  | "bulk_post"
  | "lost_found"
  | "offers"
  | "execute_create"
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
    .replace(/\b(browse|show|find|search|open|list|view)\s+(all\s+)?(jobs?|roles?|vacancies|openings|listings?|marketplace|companies|candidates|talent)\b/gi, " ")
    .replace(/\b(all\s+jobs?|jobs?\s+for\s+me)\b/gi, " ")
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
      { label: "Browse all jobs", text: "Browse all jobs" },
      { label: "Permanent roles", text: "Permanent jobs" },
      { label: "Temporary work", text: "Temporary jobs" },
      { label: "Engineering jobs", text: "Engineering jobs" },
      { label: "HSE & safety jobs", text: "HSE and safety jobs" },
      { label: "Admin & office", text: "Administrative and office jobs" },
      { label: "Jobs in Saudi Arabia", text: "Jobs in Saudi Arabia" },
      { label: "Post a job", text: "Post a job" },
    ],
  },
  {
    title: "Marketplace",
    commands: [
      { label: "Apartment rent", text: "Browse property and rentals" },
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
      { label: "Create profile", text: "Create my seeker profile" },
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
      { label: "Programs", text: "Open Programs" },
      { label: "Finder", text: "Open Finder Center" },
      { label: "Contact support", text: "Contact Hunared support" },
      { label: "What can you do?", text: "What can you do on Hunared?" },
    ],
  },
  {
    title: "Guide",
    commands: [
      { label: "How Hunared works", text: "How does Hunared work?" },
      { label: "How to message", text: "How do I message a seller?" },
      { label: "CV Builder help", text: "How do I create a CV?" },
      { label: "Post a job", text: "How do I post a job?" },
      { label: "Privacy & AI", text: "How do I hide the AI agent?" },
      { label: "Is it free?", text: "Is Hunared free?" },
    ],
  },
  {
    title: "Go to",
    commands: [
      { label: "Messages", text: "Open my messages" },
      { label: "CV Builder", text: "Open CV Builder" },
      { label: "History", text: "Open account settings" },
      { label: "Settings", text: "Open settings" },
      { label: "Finder Center", text: "Open Finder Center" },
      { label: "Programs", text: "Open Programs" },
    ],
  },
];

export const SUGGESTIONS_BY_PATH: { match: RegExp; items: string[] }[] = [
  {
    match: /^\/dashboard\/messages/,
    items: [
      "How do I message a seller?",
      "Open jobs to start a chat",
      "Show blocked users help",
    ],
  },
  {
    match: /^\/dashboard\/(settings|history)/,
    items: [
      "How do I hide the AI agent?",
      "How do I hide the AI agent?",
      "Open account settings",
    ],
  },
  {
    match: /^\/dashboard\/cv/,
    items: [
      "How do I upload my old CV?",
      "Make my CV ATS-friendly",
      "Open sample CV library tips",
    ],
  },
  {
    match: /^\/$/,
    items: [
      "Browse all jobs",
      "Browse marketplace",
      "Show candidates available for hire",
      "Browse companies",
      "What can you do?",
    ],
  },
  {
    match: /^\/jobs/,
    items: [
      "Temporary jobs in Riyadh",
      "HSE Officer jobs",
      "Search engineering jobs",
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
      "Oil and gas companies",
      "Companies hiring now",
      "Verified companies",
    ],
  },
  {
    match: /^\/(learning|education|articles)/,
    items: ["Career tips", "HSE safety articles", "Engineering guides"],
  },
  {
    match: /^\/program/,
    items: ["Open Programs", "Explore courses", "What can you do?"],
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

  // ── Broad job browse (no narrow profession) ─────────────────────────
  if (
    /^(browse|show|find|search|open|list|view)?\s*(all\s+)?jobs?\s*$/i.test(raw.trim()) ||
    /^(browse|show|find|search)\s+all\s+jobs?\b/i.test(raw.trim())
  ) {
    return {
      intent: "search_jobs",
      href: "/jobs",
      label: "Browse jobs",
      message:
        "Opening **all jobs** on Hunared. Use filters for country, city, employment type, category, and keywords — any profession, not a single role.",
      autoNavigate: true,
      entities: {},
      secondary: [
        { label: "Permanent", href: "/jobs?employmentType=permanent" },
        { label: "Temporary", href: "/jobs?employmentType=temporary" },
        { label: "Post a job", href: "/dashboard/jobs/new" },
      ],
    };
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
        "I'm **Hunared AI** — your guide across the whole platform.\n\n**Discover**\n• Jobs · Talent · Companies · Marketplace · Learning\n• Learning Hub (articles + resource library) · Finder Center · Programs & Training (hunared.org)\n\n**Create & manage**\n• CV Builder · Post job/ad · Messages · Saved · Settings · Premium Ads\n\n**Account types**\n• Personal · Seeker · Company · Team (assigned)\n• To switch type: register again with a new goal — data is kept\n\n**Ask me**\n• *Search jobs by profession*\n• *How do I message a seller?*\n• *Open CV Builder*\n• *How do I change account type?*\n• *Open Premium Ads*\n• *How does Hunared work?*\n\nPlain language is fine — no special commands.",
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
    /\b(my profile|complete (my )?profile|update (my )?profile|edit profile|seeker profile)\b/.test(
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
  if (/\b(cv builder|resume builder|build (a |my )?cv|create (a |my )?cv|open cv)\b/.test(t) ||
      (/\b(cv|resume|curriculum)\b/.test(t) && !/\bcv analysis\b/.test(t))) {
    return {
      intent: "cv",
      href: "/dashboard/cv",
      label: "CV Builder",
      message:
        "**Hunared CV Builder** — create, upload, AI-improve, and export professional CVs.\n\n• Multiple templates · sample library · upload PDF/DOCX\n• AI assistant for writing & ATS tips\n• Add finished CV to your Seeker profile when ready\n\nOpening CV Builder (sign in required).",
      autoNavigate: true,
      entities,
      secondary: [
        { label: "CV Builder", href: "/dashboard/cv" },
        { label: "My profile", href: "/dashboard/profile" },
        { label: "Jobs", href: "/jobs" },
      ],
    };
  }


  // ── Messages / History / Settings / Finder ───────────────────────────
  if (/\b(messages?|inbox|chat|start (a )?conversation|message (someone|user|seller|employer))\b/.test(t)) {
    return {
      intent: "messages",
      href: "/dashboard/messages",
      label: "Messages",
      message:
        "**Hunared Messages** — one inbox for jobs, talent, companies, and marketplace.\n\n• Open a job, listing, or profile → **Message**\n• Live chat, file share, online status\n• Block / report when needed\n\nOpening your inbox (sign in required).",
      autoNavigate: true,
      secondary: [
        { label: "Messages", href: "/dashboard/messages" },
        { label: "Jobs", href: "/jobs" },
        { label: "Marketplace", href: "/market" },
      ],
    };
  }
  if (/\b(activity history|browsing history|my history|view history|clear history)\b/.test(t)) {
    return {
      intent: "history",
      href: "/dashboard/history",
      label: "Activity history",
      message:
        "**Activity history** stores pages, jobs, and listings you open (when enabled).\n\n• View or filter history in Dashboard → History\n• Turn off anytime: Settings → Privacy → Save activity history\n• Clear all from the History page\n\nOpening History (sign in required).",
      autoNavigate: true,
      secondary: [
        { label: "History", href: "/dashboard/history" },
        { label: "Privacy settings", href: "/dashboard/settings" },
      ],
    };
  }
  if (/\b(account settings|site settings|privacy settings|theme settings|my settings)\b/.test(t) ||
      (/^\s*settings\s*$/.test(t) || /\bopen settings\b/.test(t))) {
    return {
      intent: "settings",
      href: "/dashboard/settings",
      label: "Settings",
      message:
        "**Account settings** — theme, country, timezone, AI agent on/off, notifications, privacy (online status & activity history).",
      autoNavigate: true,
      secondary: [
        { label: "Settings", href: "/dashboard/settings" },
        { label: "AI settings", href: "/ai-settings" },
        { label: "History", href: "/dashboard/history" },
      ],
    };
  }
  if (/\b(finder center|hunared finder|finder)\b/.test(t)) {
    return {
      intent: "finder",
      href: "/finder",
      label: "Finder Center",
      message:
        "**Finder Center** is Hunared's lost & found community board.\n\n• Report a **lost** or **found** item\n• Search by country and city\n• Help reconnect items with owners\n\nOpen **/finder** to search or post.",
      autoNavigate: true,
      secondary: [
        { label: "Finder Center", href: "/finder" },
        { label: "Jobs", href: "/jobs" },
        { label: "Marketplace", href: "/market" },
      ],
    };
  }
  if (/\b(bulk post|bulk jobs|team bulk|magic post)\b/.test(t)) {
    return {
      intent: "bulk_post",
      href: "/dashboard/bulk",
      label: "Bulk Post",
      message:
        "**Bulk Post** is available for **Team** accounts — post multiple jobs or marketplace listings at once with the same full forms and smart fill.",
      autoNavigate: true,
      secondary: [
        { label: "Bulk Post", href: "/dashboard/bulk" },
        { label: "Post a job", href: "/dashboard/jobs/new" },
      ],
    };
  }
  if (/\b(team role|team account|team profile)\b/.test(t)) {
    return {
      intent: "team",
      href: "/dashboard",
      label: "Team dashboard",
      message:
        "**Team** role can create candidate/company profiles without verification, bulk post jobs & listings, and manage team tools from the dashboard.\n\nTeam access is assigned by admins.",
      autoNavigate: false,
      secondary: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Bulk Post", href: "/dashboard/bulk" },
      ],
    };
  }
  if (/\b(lost\s*&\s*found|lost and found|lost found)\b/.test(t)) {
    return {
      intent: "lost_found",
      href: "/market?category=lost_found",
      label: "Lost & Found",
      message: "Opening **Lost & Found** in the marketplace.",
      autoNavigate: true,
    };
  }
  if (/\b(offers?|deals?|promotions?)\b/.test(t) && !/\b(job offer)\b/.test(t)) {
    return {
      intent: "offers",
      href: "/market?category=offers",
      label: "Offers & Deals",
      message: "Opening **Offers & Deals** in the marketplace.",
      autoNavigate: true,
    };
  }


/** Polish rough user words into a professional listing title */
function polishListingTitle(rawTitle: string, city?: string, price?: string, category?: string): string {
  let t = (rawTitle || "").replace(/\s+/g, " ").trim();
  if (!t) {
    if (category === "for_rent" || category === "accommodation") {
      t = city ? `Room for rent in ${city}` : "Room for rent";
    } else if (category === "services") {
      t = city ? `Professional services in ${city}` : "Professional services";
    } else if (category === "vehicles") {
      t = "Vehicle for sale";
    } else {
      t = city ? `Listing in ${city}` : "Marketplace listing";
    }
  }
  // Title case light
  t = t
    .replace(/\bfor\s*rent\b/gi, "for Rent")
    .replace(/\bfor\s*sale\b/gi, "for Sale")
    .replace(/\broom\b/gi, "Room")
    .replace(/\bapartment\b/gi, "Apartment")
    .replace(/\bflat\b/gi, "Flat")
    .replace(/\bvilla\b/gi, "Villa")
    .replace(/\bhouse\b/gi, "House")
    .replace(/\bbedspace\b/gi, "Bed Space");
  // Ensure city in title when known
  if (city && !new RegExp(city, "i").test(t)) {
    if (/for rent/i.test(t)) t = t.replace(/for rent/i, `for Rent in ${city}`);
    else if (/for sale/i.test(t)) t = t.replace(/for sale/i, `for Sale in ${city}`);
    else t = `${t} — ${city}`;
  }
  if (price && !/\d/.test(t) && (/rent/i.test(t) || category === "for_rent")) {
    t = `${t} – SAR ${price}/month`;
  }
  // Cap length
  if (t.length > 90) t = t.slice(0, 87) + "…";
  return t;
}

function polishJobTitle(rawTitle: string, city?: string): string {
  let t = (rawTitle || "").replace(/\s+/g, " ").trim();
  if (!t) t = "Job opening";
  // simple title case words
  t = t.replace(/\b([a-z])/g, (m) => m.toUpperCase());
  if (city && !new RegExp(city, "i").test(t)) t = `${t} — ${city}`;
  return t.slice(0, 90);
}

/** Draft a clear description from user message without inventing amenities */
function draftListingDescription(opts: {
  raw: string;
  title?: string;
  city?: string;
  price?: string;
  category?: string;
  rentalPeriod?: string;
}): string {
  const lines: string[] = [];
  const title = opts.title || "This listing";
  lines.push(`${title}.`);
  if (opts.city) lines.push(`Location: ${opts.city}.`);
  if (opts.price) {
    const period =
      opts.rentalPeriod === "month"
        ? " per month"
        : opts.rentalPeriod
          ? ` per ${opts.rentalPeriod}`
          : "";
    lines.push(`Price: SAR ${opts.price}${period}.`);
  }
  // Keep user wording as notes (cleaned)
  const cleaned = opts.raw
    .replace(/\b(create|post|publish|make|add)\s+(a\s+)?(post|ad|listing|item)?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length > 12) {
    lines.push("");
    lines.push("Details from the owner:");
    lines.push(cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
  }
  lines.push("");
  lines.push("Please contact for viewing and further information. Serious inquiries only.");
  return lines.join("\n");
}

function draftJobDescription(opts: {
  raw: string;
  title?: string;
  city?: string;
  salary?: string;
}): string {
  const role = opts.title || "This role";
  const lines = [
    `We are hiring for ${role}${opts.city ? ` in ${opts.city}` : ""}.`,
    "",
    "Key points from the hiring request:",
    opts.raw.replace(/\s+/g, " ").trim(),
    "",
  ];
  if (opts.salary) lines.push(`Salary indicated: SAR ${opts.salary}.`);
  lines.push(
    "Candidates should review the full requirements on this posting and apply with an updated CV."
  );
  lines.push("");
  lines.push(
    "(AI drafted from your words — edit duties, requirements, and benefits before publishing.)"
  );
  return lines.join("\n");
}

  // ── Post / create flows (deep parse when possible) ──────────────────
  const createJob =
    /\b(post a job|create a job|publish (a )?job|hire talent)\b/.test(t) ||
    /\b(create|post|publish)\b/.test(t) && /\b(job|vacancy|opening|position)\b/.test(t);
  if (createJob) {
    const titleMatch = raw.match(
      /(?:job|vacancy|position|role)\s*(?:for|as|:)?\s*([A-Za-z][A-Za-z0-9 /&-]{2,60})/i
    );
    if (titleMatch?.[1]) entities.title = titleMatch[1].trim();
    // salary from message
    const sal = raw.match(/\b(?:salary|pay|package)?\s*(?:sar|rs)?\s*(\d{3,7})\b/i);
    if (sal) entities.salary = sal[1];
    entities.title = polishJobTitle(entities.title || "", entities.city);
    entities.description = draftJobDescription({
      raw,
      title: entities.title,
      city: entities.city,
      salary: entities.salary,
    });
    return {
      intent: "post_job",
      href: "/dashboard/jobs/new",
      label: "Post a job",
      message: entities.title
        ? `I drafted a clearer **job title** and starter **description** from your words.\n\nTitle: **${entities.title}**${
            entities.city ? ` · ${entities.city}` : ""
          }.\n\nOpen the form, edit duties/requirements, then publish. Needs **Agent actions** ON and a Company/Team account.`
        : "Opening the job post form. Company or Team account required. With **Agent actions** ON I can pre-fill fields from your description.",
      autoNavigate: true,
      needsConfirm: false,
      entities,
    };
  }

  const createListing =
    /\b(post (an? )?(ad|listing|item)|create (a )?listing|sell (something|this|item)|list (an? )?item)\b/.test(t) ||
    /\b(create|post|publish|list)\b/.test(t) &&
      /\b(room|apartment|flat|villa|house|bedspace|for rent|rent|accommodation|car|phone|laptop|item|ad)\b/.test(t);

  if (createListing) {
    // Category hints
    if (/\b(room|apartment|flat|villa|house|bedspace|accommodation|for rent|rent)\b/.test(t)) {
      entities.category = /\b(bedspace|shared room)\b/.test(t) ? "accommodation" : "for_rent";
      if (/\broom\b/.test(t)) entities.subcategory = "room";
      if (/\bapartment|flat\b/.test(t)) entities.subcategory = "apartment";
      if (/\bvilla\b/.test(t)) entities.subcategory = "villa";
    } else if (/\b(car|vehicle|toyota|honda)\b/.test(t)) {
      entities.category = "vehicles";
    } else if (/\b(phone|iphone|samsung|laptop)\b/.test(t)) {
      entities.category = "for_sale";
    } else if (/\b(lost|found)\b/.test(t)) {
      entities.category = "lost_found";
    }

    // Title: prefer quoted or "room for rent" style phrase
    const quoted = raw.match(/["“]([^"”]{3,80})["”]/);
    if (quoted) entities.title = quoted[1].trim();
    else {
      const rentTitle = raw.match(
        /\b((?:room|apartment|flat|villa|house|bedspace)[^,.]{0,40}(?:for rent|rent)?)/i
      );
      if (rentTitle) entities.title = rentTitle[1].replace(/\s+/g, " ").trim();
    }

    // Price / rent
    const price =
      raw.match(
        /(?:rent|price|sar|rs|usd|\$)?\s*(?:is|=|:)?\s*(\d{2,7})\s*(?:\/|per)?\s*(month|mo|week|day)?/i
      ) || raw.match(/\b(\d{2,7})\s*(sar|rs|usd|\$)?\s*(?:per\s*)?(month|mo)?/i);
    if (price) {
      entities.price = price[1];
      if (price[2] && /month|mo/i.test(price[2])) entities.rentalPeriod = "month";
      if (price[3] && /month|mo/i.test(price[3])) entities.rentalPeriod = "month";
    }

    // Professional title + description from rough user words (no invented amenities)
    entities.title = polishListingTitle(
      entities.title || "",
      entities.city,
      entities.price,
      entities.category
    );
    entities.description = draftListingDescription({
      raw,
      title: entities.title,
      city: entities.city,
      price: entities.price,
      category: entities.category,
      rentalPeriod: entities.rentalPeriod,
    });

    const href = `/dashboard/market/new${qs({
      category: entities.category,
      subcategory: entities.subcategory,
      city: entities.city,
      country: entities.country,
    })}`;

    const bits = [
      entities.title && `title “${entities.title}”`,
      entities.city && `city ${entities.city}`,
      entities.price && `price ${entities.price}`,
      entities.category && `category ${entities.category}`,
    ].filter(Boolean);

    return {
      intent: "execute_create",
      href,
      label: "Open listing form",
      message: bits.length
        ? `I prepared a clearer **title** and **description** from your words (no invented facilities).\n\nPre-fill: ${bits.join(", ")}.\n\nReview the form, add photos if needed, then publish. **Agent actions** must be ON.`
        : "Opening the marketplace listing form. Sign-in required. Enable **Agent actions** so I can pre-fill fields from natural language.",
      autoNavigate: true,
      entities,
    };
  }

  // ── Static pages ────────────────────────────────────────────────────
  if (/\b(program|training pathway|credential)\b/.test(t) && !/\bjob\b/.test(t)) {
    return {
      intent: "program",
      href: "https://hunared.org/programs",
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
    else if (country) bits.push(`in your selected country`);
    if (entities.employmentType) bits.push(entities.employmentType);
    const focus = bits.length ? bits.join(" · ") : "roles across Hunared";
    const msg = `Here is a job search for ${focus}.\n\nOpen **View jobs** Use filters on the jobs page for location, employment type, category, and more.${
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
      "I want to help, but that was unclear.\n\nTry:\n• *Search jobs by profession*\n• *Browse marketplace listings*\n• *Open CV Builder*\n• *Open my messages*\n• *How do I post a job?*\n• *What can you do?*",
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
  // Full-site knowledge answers (Q&A / how-to / solutions)
  const kn = matchKnowledge(q);
  if (kn) {
    return {
      intent: "how_to",
      href: kn.href,
      label: kn.label || kn.title,
      message: kn.answer,
      secondary: kn.secondary,
      autoNavigate: false,
      entities: action.entities,
    };
  }

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
        "**Hunared** is a global opportunity platform connecting people and businesses across:\n\n• **Jobs** — permanent & temporary roles with filters\n• **Talent** — professionals available for hire\n• **Companies** — employer directory (hiring / verified)\n• **Marketplace** — products, services, property, vehicles, electronics, lost & found, offers\n• **Learning Hub** — articles, downloadable **resource library**, programs & courses\n• **Programs** — official programs & training on hunared.org\n• **CV Builder** — create, upload, AI-improve, export CVs\n• **Finder Center** — lost & found community board\n• **Messages** — chat about jobs, listings, and profiles\n• **Premium Ads** — promote jobs/listings from the dashboard\n\nBrowse without an account. Sign in to save, post, message, build a CV, and manage settings.\n\nTry: *How do I search for jobs?* · *How do I post an ad?* · *Open CV Builder*",
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
        "**Create a Hunared account**\n\n1. Open **Register**\n2. Choose Personal, Seeker, or Company\n3. Complete required profile fields\n4. Verify email if prompted\n\nSeekers can list as available for hire. Companies can post jobs.",
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


  if (/how (do i|to) (message|chat|contact).*(seller|employer|company|candidate|user|someone)/i.test(lower) ||
      /how (do i|to) (use )?messages/i.test(lower)) {
    return {
      intent: "how_to",
      href: "/dashboard/messages",
      label: "Messages",
      message:
        "**How messaging works**\n\n1. Open a **job**, **marketplace listing**, **company**, or **talent** profile\n2. Click **Message** (sign in required)\n3. Write in Hunared Messages — one unified inbox\n4. Share files when needed; use Block/Report for safety\n\nTeam/system posts are not messageable by design.",
      secondary: [
        { label: "Messages", href: "/dashboard/messages" },
        { label: "Jobs", href: "/jobs" },
        { label: "Marketplace", href: "/market" },
      ],
    };
  }

  if (/how (do i|to) (stop|disable|turn off).*(history|tracking|activity)/i.test(lower)) {
    return {
      intent: "how_to",
      href: "/dashboard/settings",
      label: "Privacy settings",
      message:
        "**Stop saving activity history**\n\n1. Open **Dashboard → Settings**\n2. Go to **Privacy**\n3. Turn off **Save activity history**\n4. Optional: open **History** and **Clear all**\n\nNew visits will not be recorded while this is off.",
      secondary: [
        { label: "Settings", href: "/dashboard/settings" },
        { label: "History", href: "/dashboard/history" },
      ],
    };
  }

  if (/how (do i|to) (hide|turn off|disable).*(agent|ai|assistant)/i.test(lower)) {
    return {
      intent: "how_to",
      href: "/dashboard/settings",
      label: "Settings",
      message:
        "**Hide Hunared AI**\n\n1. **Dashboard → Settings → AI & agent**\n2. Turn off the AI agent toggle\n3. The floating assistant hides on the homepage and site\n\nYou can turn it back on anytime in Settings.",
      secondary: [
        { label: "Settings", href: "/dashboard/settings" },
        { label: "AI settings", href: "/ai-settings" },
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
        { label: "Programs", href: "https://hunared.org/programs" },
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

  if (/change (my )?account type|switch (my )?(account|role|goal)|how (do i|to) (change|switch) (account|role)/i.test(lower)) {
    return {
      intent: "how_to",
      href: "/register",
      label: "Account types",
      message:
        "**Account type on Hunared**\n\nTypes: **Personal**, **Seeker (Candidate)**, **Company**.\n\nYou cannot change type from My Profile. To switch:\n1. Open **Sign up / Register**\n2. Choose your new goal (Personal / Job Seeker / Company)\n3. Complete the form\n\nYour existing data and listings are **kept** — only the account purpose is updated.\n\nTeam and Admin roles are assigned by Hunared, not via self-signup.",
      secondary: [
        { label: "Register", href: "/register" },
        { label: "My Profile", href: "/dashboard/profile" },
      ],
    };
  }

  if (/premium ads?|promote (my )?(job|listing|ad)|boost (my )?(ad|listing)/i.test(lower)) {
    return {
      intent: "how_to",
      href: "/dashboard/premium-ads",
      label: "Premium Ads",
      message:
        "**Premium Ads** let you promote a job, marketplace listing, or campaign from your dashboard.\n\n1. Sign in → **Dashboard → Premium Ads**\n2. Create an ad, choose size/placement, optional image\n3. Submit for admin review/payment contact\n4. Approved ads appear in premium slots\n\nYou can edit your campaign later from the same page.",
      secondary: [
        { label: "Premium Ads", href: "/dashboard/premium-ads" },
        { label: "Post an Ad", href: "/post" },
      ],
    };
  }

  if (/training courses?|hunared\.org\/courses|certification pathway/i.test(lower)) {
    return {
      intent: "program",
      href: "https://hunared.org/courses",
      label: "Training Courses",
      message:
        "**Training Courses** are on the official Hunared learning site.\n\nOpen **hunared.org/courses** for training and certification pathways. Programs overview: **hunared.org/programs**.",
      secondary: [
        { label: "Courses", href: "https://hunared.org/courses" },
        { label: "Programs", href: "https://hunared.org/programs" },
      ],
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
