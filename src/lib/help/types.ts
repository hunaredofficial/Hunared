export type HelpRole =
  | "all"
  | "guest"
  | "personal"
  | "seeker"
  | "employer"
  | "team"
  | "admin";

export type HelpCategoryId =
  | "getting-started"
  | "accounts"
  | "jobs"
  | "cv-builder"
  | "companies"
  | "marketplace"
  | "messaging"
  | "agent"
  | "saved-notifications"
  | "premium"
  | "team"
  | "troubleshooting";

export type HelpArticle = {
  slug: string;
  category: HelpCategoryId;
  title: string;
  summary: string;
  keywords: string[];
  roles: HelpRole[];
  /** Deep link to real feature when applicable */
  action?: { href: string; label: string; requiresAuth?: boolean };
  related?: string[]; // "category/slug"
  updated: string;
  steps?: { title: string; body: string }[];
  body: string; // markdown-ish plain sections separated by \n\n
};

export type HelpCategory = {
  id: HelpCategoryId;
  title: string;
  description: string;
  icon: string; // lucide icon name key
};
