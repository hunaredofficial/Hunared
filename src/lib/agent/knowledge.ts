/**
 * Hunared platform knowledge base for the AI agent.
 * Comprehensive Q&A, how-tos, and solutions across the whole site.
 */

export type KnowledgeEntry = {
  id: string;
  keywords: RegExp;
  title: string;
  answer: string;
  href?: string;
  label?: string;
  secondary?: { label: string; href: string }[];
};

export const HUNARED_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: "what-is-hunared",
    keywords:
      /\b(what is hunared|about hunared|who (are|is) hunared|hunared platform|explain hunared)\b/i,
    title: "What is Hunared?",
    answer:
      "**Hunared** is a global opportunity platform that connects people and businesses.\n\n**Core areas**\n• **Jobs** — permanent & temporary roles with smart filters\n• **Talent** — professionals available for hire\n• **Companies** — employer directory (hiring / verified)\n• **Marketplace** — products, services, property, vehicles, accommodation, lost & found, offers\n• **Learning Hub** — articles + downloadable **resource library**\n• **Programs** — official training & credentials on hunared.org\n• **CV Builder** — create, upload, AI-improve, export CVs\n• **Finder Center** — lost & found community board\n• **Messages** — chat about jobs, listings, and profiles\n• **Premium Ads** — promote jobs/listings from the dashboard\n\nBrowse freely. Sign in to save, post, message, build a CV, and manage settings.",
    href: "/about",
    label: "About Hunared",
    secondary: [
      { label: "Jobs", href: "/jobs" },
      { label: "Marketplace", href: "/market" },
    ],
  },
  {
    id: "account-types",
    keywords:
      /\b(account type|role|personal|seeker|company account|employer account|team role|change account|switch (to )?(seeker|company|personal))\b/i,
    title: "Account types",
    answer:
      "**Account types on Hunared**\n\n• **Personal** — browse, save, message, CV Builder\n• **Talent** — talent profile, talent visibility, job interests\n• **Company** — company profile, post jobs, hire talent\n• **Team** — assigned by admins; bulk post, manage team profiles\n\nChange type from **My Profile** (or re-register with a new goal). Profile data is kept where possible.\n\nCompany accounts can add **Industry**, **Services**, and optional **Company Location** (Google Maps link).",
    href: "/dashboard/profile",
    label: "My Profile",
    secondary: [{ label: "Register", href: "/register" }],
  },
  {
    id: "how-search-jobs",
    keywords:
      /\b(how (do i |to )?search (for )?jobs?|find (a )?job|job search|filter jobs)\b/i,
    title: "How to search jobs",
    answer:
      "**Search jobs on Hunared**\n\n1. Open **Jobs** from the header or homepage search\n2. Use **keywords**, **country**, **city**, **employment type** (Permanent / Temporary), and categories\n3. Open a job → review details → **Apply** or contact the poster\n4. Sign in to **Save** jobs and get personalized ranking (**For you**)\n\nYou can also ask me: *Find instrument technician jobs in Jubail*.",
    href: "/jobs",
    label: "Browse jobs",
  },
  {
    id: "how-post-job",
    keywords:
      /\b(how (do i |to )?post (a )?job|create (a )?job post|publish (a )?job)\b/i,
    title: "How to post a job",
    answer:
      "**Post a job**\n\n1. Sign in with a **Company** (or Team) account\n2. Go to **Dashboard → My Job Posts** or **Post**\n3. Fill title, description, categories, location, employment type, salary, contact\n4. Optional: auto-close date, show profile contact\n5. Publish\n\n**Smart Fill** can parse pasted job text into fields. Team users also have **Magic Post** (raw paste).",
    href: "/dashboard/jobs/new",
    label: "Post a job",
    secondary: [{ label: "My Job Posts", href: "/dashboard/jobs" }],
  },
  {
    id: "how-marketplace",
    keywords:
      /\b(how (does |do i use )?marketplace|marketplace work|buy and sell|how (do i |to )?post (an? )?(ad|listing))\b/i,
    title: "Marketplace guide",
    answer:
      "**Hunared Marketplace**\n\nBrowse **For Sale**, **For Rent**, **Accommodation**, **Vehicles**, **Services**, **Property**, **Lost & Found**, **Offers & Deals**, and more.\n\n**Post a listing**\n1. Sign in → **Post** or **Dashboard → My Listings → New**\n2. Choose category → fill title, price, location, photos, description\n3. Publish\n\nUse filters (country, city, price, condition). Message sellers from the listing page.",
    href: "/market",
    label: "Marketplace",
    secondary: [{ label: "Create listing", href: "/dashboard/market/new" }],
  },
  {
    id: "cv-builder",
    keywords:
      /\b(cv builder|resume builder|how (do i |to )?(create|build|make|upload) (my )?(cv|resume)|sample cv|cv library)\b/i,
    title: "CV Builder",
    answer:
      "**CV Builder** (Dashboard → My CV)\n\n• Start blank, from profile, paste text, or **upload** PDF/Word/txt\n• **Sample CV library** — professional examples by field (Use this CV)\n• Templates, live preview, print/PDF\n• AI assist: improve, tailor, ATS tips (when enabled)\n• Multi-CV library with autosave\n\nUpload keeps your document structure when possible (own-document mode).",
    href: "/dashboard/cv",
    label: "Open CV Builder",
  },
  {
    id: "talent-candidates",
    keywords:
      /\b(talent|candidates|available for hire|how (do i |to )?find (candidates|talent|workers))\b/i,
    title: "Talent / Candidates",
    answer:
      "**Talent** shows professionals who opted to be listed publicly.\n\n• Filter by profession, location, skills\n• View public contact when they allow it\n• Message candidates when signed in\n\nSeekers control visibility via **listed publicly** on their profile.",
    href: "/candidates",
    label: "Browse Talent",
  },
  {
    id: "companies-dir",
    keywords:
      /\b(company directory|find companies|how (do i |to )?find (a )?compan(y|ies)|hiring companies)\b/i,
    title: "Companies",
    answer:
      "**Companies directory** lists employers on Hunared.\n\nFilter by industry, location, hiring status. Open a company page for jobs and contact details when shared.",
    href: "/companies",
    label: "Companies",
  },
  {
    id: "messages",
    keywords:
      /\b(how (do i |to )?message|messages work|chat|inbox|contact seller|contact employer)\b/i,
    title: "Messages",
    answer:
      "**Messages**\n\n• Open a job, listing, or public profile → **Message**\n• Inbox: **Dashboard → Messages**\n• Attachments supported; block/report available\n• System/team accounts are excluded from normal Message buttons where appropriate\n\nStay professional; never share passwords or pay upfront job fees.",
    href: "/dashboard/messages",
    label: "Open Messages",
  },
  {
    id: "learning-resources",
    keywords:
      /\b(learning|education|articles|resource library|my resources|courses|training hub)\b/i,
    title: "Learning & resources",
    answer:
      "**Learning Hub**\n\n• Articles by category (career, HSE, engineering, and more)\n• **Resource library** at /education/resources — public downloads\n• Contributors manage uploads under **Dashboard → My Resources**\n• **Programs & Training** on hunared.org for credentials\n\nAsk me for a topic or open Learning from the header.",
    href: "/education",
    label: "Learning",
    secondary: [
      { label: "Resources", href: "/education/resources" },
      { label: "Programs", href: "https://hunared.org/programs" },
    ],
  },
  {
    id: "finder",
    keywords:
      /\b(finder center|lost and found|report (lost|found)|how (do i |to )?report (a )?(lost|found))\b/i,
    title: "Finder Center",
    answer:
      "**Finder Center** is the community lost & found board.\n\nReport lost or found items, browse recent posts, and contact via Messages when appropriate. Also available under Marketplace → Lost & Found.",
    href: "/finder",
    label: "Finder Center",
  },
  {
    id: "pricing-free",
    keywords:
      /\b(is hunared free|pricing|cost|subscription|paid|premium ads?|how much)\b/i,
    title: "Pricing",
    answer:
      "Core browsing is free. **Register free** to post, save, message, and use CV Builder.\n\n**Premium Ads** (dashboard) promote selected jobs/listings. Billing questions → **Contact**.",
    href: "/contact",
    label: "Contact",
    secondary: [{ label: "Register free", href: "/register" }],
  },
  {
    id: "safety",
    keywords:
      /\b(safe|scam|fraud|trust|verify|secure|report (scam|fraud))\b/i,
    title: "Safety",
    answer:
      "**Stay safe on Hunared**\n\n• Never pay upfront fees to “guarantee” a job\n• Verify company contacts when possible\n• Meet in public for local deals\n• Use **Messages** on-platform when you can\n• Report problems via **Contact**\n\nYou stay in control of applications and payments.",
    href: "/contact",
    label: "Contact / Report",
  },
  {
    id: "ai-agent-help",
    keywords:
      /\b(hunared ai|ai agent|turn off (the )?ai|hide (the )?agent|privacy.?ai|ai settings)\b/i,
    title: "Hunared AI",
    answer:
      "**Hunared AI** helps you navigate the platform, search, and (when **Agent actions** is ON) pre-fill create/post flows from your words.\n\n• **Login required** to use the agent\n• **Power / Privacy & AI** — turn the agent ON/OFF (OFF removes the floating button)\n• **Agent actions** — when ON, commands like “create post room for rent in Dammam 500/month” open the form with details filled for you to review & publish\n\nManage under **Privacy & AI** or Dashboard → Settings → AI.",
    href: "/ai-settings",
    label: "Privacy & AI",
  },
  {
    id: "saved-items",
    keywords: /\b(saved|bookmarks?|my saved|save (a )?(job|listing))\b/i,
    title: "Saved items",
    answer:
      "Sign in, then use **Save** on jobs and listings. Review them under your saved collection from the dashboard / account tools. Saved activity also improves **For you** ranking when personalization is on.",
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    id: "register-signin",
    keywords:
      /\b(how (do i |to )?(register|sign up|create account|log in|sign in)|forgot password)\b/i,
    title: "Register & sign in",
    answer:
      "Use **Register** or **Sign in** in the header (Clerk-secured).\n\nDuring register you choose goal (Personal / Seeker / Company), complete required profile fields, and can add a photo.\n\nPassword recovery is handled by the sign-in provider screens.",
    href: "/sign-in",
    label: "Sign in",
    secondary: [{ label: "Register", href: "/register" }],
  },
  {
    id: "header-nav",
    keywords:
      /\b(where is|header|navigation|menu|mega menu)\b/i,
    title: "Navigation",
    answer:
      "Top navigation includes **Jobs**, **Talent**, **Companies**, **Marketplace**, **Learning**, and **More** (Programs, Finder, etc.).\n\nSigned-in users get **Dashboard** with role-based items: Overview, Profile, CV, Job Posts, Listings, Messages, Resources, Settings, and more.",
    href: "/",
    label: "Home",
  },
  {
    id: "premium-ads",
    keywords: /\b(premium ads?|promote (my )?(job|listing|ad)|boost (ad|listing))\b/i,
    title: "Premium Ads",
    answer:
      "Promote jobs or marketplace listings from **Dashboard → Premium Ads**. Follow on-screen options for placement and duration. Contact support for billing issues.",
    href: "/dashboard/premium-ads",
    label: "Premium Ads",
  },
  {
    id: "team-tools",
    keywords: /\b(team (role|tools|bulk)|bulk post|magic post)\b/i,
    title: "Team tools",
    answer:
      "**Team** accounts (admin-assigned) can:\n• Create managed profiles/companies\n• Bulk post jobs & marketplace listings\n• Use **Magic Post** (paste raw text → fill form fields)\n\nAccess from Dashboard team sections after role assignment.",
    href: "/dashboard",
    label: "Dashboard",
  },
];

/** Match first knowledge entry against user text */
export function matchKnowledge(message: string): KnowledgeEntry | null {
  const q = message.trim();
  if (!q) return null;
  for (const entry of HUNARED_KNOWLEDGE) {
    if (entry.keywords.test(q)) return entry;
  }
  return null;
}
