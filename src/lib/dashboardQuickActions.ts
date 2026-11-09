import type { UserRole } from "@/types/database";

export type QuickActionId = string;

export type QuickActionDef = {
  id: QuickActionId;
  href: string;
  title: string;
  desc: string;
  /** Lucide icon key */
  icon: string;
  /** Tailwind bg class for icon chip */
  iconBg: string;
  /** Icon text color class */
  iconColor: string;
};

/** Full catalog — filtered by role */
export const QUICK_ACTION_CATALOG: Record<string, QuickActionDef> = {
  browse_jobs: {
    id: "browse_jobs",
    href: "/jobs",
    title: "Browse Jobs",
    desc: "Discover open roles and opportunities",
    icon: "Search",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
  },
  my_job_posts: {
    id: "my_job_posts",
    href: "/dashboard/jobs",
    title: "My Job Posts",
    desc: "View and manage your job listings",
    icon: "Briefcase",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
  },
  post_job: {
    id: "post_job",
    href: "/dashboard/jobs/new",
    title: "Post a Job",
    desc: "Publish a new job opening",
    icon: "Plus",
    iconBg: "bg-sky-100 dark:bg-sky-900/30",
    iconColor: "text-sky-600",
  },
  my_listings: {
    id: "my_listings",
    href: "/dashboard/market",
    title: "My Listings",
    desc: "View and manage marketplace listings",
    icon: "ShoppingBag",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600",
  },
  post_listing: {
    id: "post_listing",
    href: "/dashboard/market/new",
    title: "Post Listing",
    desc: "Sell, rent, or offer a service",
    icon: "Tag",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600",
  },
  marketplace: {
    id: "marketplace",
    href: "/market",
    title: "Marketplace",
    desc: "Browse buy, sell and services",
    icon: "ShoppingBag",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600",
  },
  post_center: {
    id: "post_center",
    href: "/post",
    title: "Post",
    desc: "Choose what you want to publish",
    icon: "Plus",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
  },
  bulk_post: {
    id: "bulk_post",
    href: "/dashboard/team/bulk",
    title: "Bulk Post",
    desc: "Create many jobs or listings at once",
    icon: "Layers",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-600",
  },
  team_profiles: {
    id: "team_profiles",
    href: "/dashboard/team/profiles",
    title: "Team Profiles",
    desc: "Manage team-managed profiles",
    icon: "Users",
    iconBg: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600",
  },
  edit_profile: {
    id: "edit_profile",
    href: "/dashboard/profile",
    title: "Edit Profile",
    desc: "Keep your profile up to date",
    icon: "User",
    iconBg: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600",
  },
  company_profile: {
    id: "company_profile",
    href: "/dashboard/profile",
    title: "Company Profile",
    desc: "Update company details and branding",
    icon: "Building2",
    iconBg: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600",
  },
  cv_builder: {
    id: "cv_builder",
    href: "/dashboard/cv",
    title: "CV Builder",
    desc: "Build or update your professional CV",
    icon: "FileText",
    iconBg: "bg-teal-100 dark:bg-teal-900/30",
    iconColor: "text-teal-600",
  },
  browse_candidates: {
    id: "browse_candidates",
    href: "/candidates",
    title: "Browse Candidates",
    desc: "Find skilled professionals",
    icon: "Users",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600",
  },
  browse_companies: {
    id: "browse_companies",
    href: "/companies",
    title: "Companies",
    desc: "Explore company directory",
    icon: "Building2",
    iconBg: "bg-slate-100 dark:bg-slate-800/60",
    iconColor: "text-slate-600 dark:text-slate-300",
  },
  my_articles: {
    id: "my_articles",
    href: "/dashboard/articles",
    title: "My Articles",
    desc: "Write and manage your articles",
    icon: "BookOpen",
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600",
  },
  write_article: {
    id: "write_article",
    href: "/dashboard/articles/new",
    title: "Write Article",
    desc: "Share expertise with the community",
    icon: "BookOpen",
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600",
  },
  my_resources: {
    id: "my_resources",
    href: "/dashboard/resources",
    title: "My Resources",
    desc: "Upload and manage learning files",
    icon: "FolderOpen",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
    iconColor: "text-cyan-600",
  },
  learning_hub: {
    id: "learning_hub",
    href: "/education",
    title: "Learning Hub",
    desc: "Articles and knowledge base",
    icon: "BookOpen",
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600",
  },
  my_saved: {
    id: "my_saved",
    href: "/dashboard/saved",
    title: "My Saved",
    desc: "Jobs and listings you saved",
    icon: "Bookmark",
    iconBg: "bg-rose-100 dark:bg-rose-900/30",
    iconColor: "text-rose-600",
  },
  messages: {
    id: "messages",
    href: "/dashboard/messages",
    title: "Messages",
    desc: "Inbox and conversations",
    icon: "MessageSquare",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
  },
  notifications: {
    id: "notifications",
    href: "/dashboard/notifications",
    title: "Notifications",
    desc: "Alerts and updates",
    icon: "Bell",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600",
  },
  premium_ads: {
    id: "premium_ads",
    href: "/dashboard/premium-ads",
    title: "Premium Ads",
    desc: "Promote jobs and listings",
    icon: "Megaphone",
    iconBg: "bg-fuchsia-100 dark:bg-fuchsia-900/30",
    iconColor: "text-fuchsia-600",
  },
  settings: {
    id: "settings",
    href: "/dashboard/settings",
    title: "Settings",
    desc: "Account and preferences",
    icon: "Settings",
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
  history: {
    id: "history",
    href: "/dashboard/history",
    title: "History",
    desc: "Activity and past posts",
    icon: "History",
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
  admin_jobs: {
    id: "admin_jobs",
    href: "/dashboard/admin/jobs",
    title: "Job Queue",
    desc: "Review pending job posts",
    icon: "Briefcase",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600",
  },
  admin_users: {
    id: "admin_users",
    href: "/dashboard/admin/users",
    title: "Manage Users",
    desc: "View and manage platform users",
    icon: "Users",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
  },
  admin_market: {
    id: "admin_market",
    href: "/dashboard/admin/market",
    title: "Marketplace Review",
    desc: "Approve marketplace listings",
    icon: "ShoppingBag",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600",
  },
  admin_articles: {
    id: "admin_articles",
    href: "/dashboard/admin/articles",
    title: "Articles Review",
    desc: "Moderate submitted articles",
    icon: "BookOpen",
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600",
  },
  admin_security: {
    id: "admin_security",
    href: "/dashboard/admin/security",
    title: "Security",
    desc: "Audit logs and access control",
    icon: "ShieldCheck",
    iconBg: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600",
  },
};

/** Actions allowed per role */
export const ROLE_ACTION_POOL: Record<UserRole, QuickActionId[]> = {
  seeker: [
    "browse_jobs",
    "cv_builder",
    "edit_profile",
    "my_saved",
    "marketplace",
    "my_listings",
    "post_listing",
    "my_articles",
    "write_article",
    "my_resources",
    "learning_hub",
    "messages",
    "notifications",
    "browse_candidates",
    "browse_companies",
    "premium_ads",
    "settings",
    "history",
  ],
  personal: [
    "browse_jobs",
    "edit_profile",
    "marketplace",
    "my_listings",
    "post_listing",
    "learning_hub",
    "my_resources",
    "messages",
    "settings",
  ],
  employer: [
    "my_job_posts",
    "post_job",
    "browse_candidates",
    "company_profile",
    "my_listings",
    "post_listing",
    "marketplace",
    "my_articles",
    "write_article",
    "my_resources",
    "premium_ads",
    "messages",
    "notifications",
    "browse_companies",
    "settings",
    "history",
  ],
  team: [
    "post_center",
    "bulk_post",
    "team_profiles",
    "my_listings",
    "post_listing",
    "marketplace",
    "browse_jobs",
    "browse_candidates",
    "browse_companies",
    "my_resources",
    "my_articles",
    "write_article",
    "premium_ads",
    "messages",
    "edit_profile",
    "settings",
    "history",
  ],
  admin: [
    "admin_jobs",
    "admin_users",
    "admin_market",
    "admin_articles",
    "admin_security",
    "browse_jobs",
    "marketplace",
    "settings",
    "history",
  ],
};

/** Default visible favorites per role */
export const ROLE_DEFAULT_ACTIONS: Record<UserRole, QuickActionId[]> = {
  seeker: [
    "browse_jobs",
    "cv_builder",
    "edit_profile",
    "my_saved",
    "marketplace",
    "my_articles",
  ],
  personal: [
    "browse_jobs",
    "edit_profile",
    "marketplace",
    "learning_hub",
    "my_resources",
  ],
  employer: [
    "my_job_posts",
    "post_job",
    "browse_candidates",
    "company_profile",
    "my_listings",
    "premium_ads",
  ],
  team: [
    "post_center",
    "bulk_post",
    "my_listings",
    "team_profiles",
    "marketplace",
    "browse_jobs",
  ],
  admin: [
    "admin_jobs",
    "admin_users",
    "admin_market",
    "admin_articles",
    "admin_security",
  ],
};

export const MAX_QUICK_ACTIONS = 8;

export function storageKey(userId: string, role: UserRole): string {
  return `hunared_qa_${role}_${userId}`;
}

export function resolveActions(ids: QuickActionId[]): QuickActionDef[] {
  return ids
    .map((id) => QUICK_ACTION_CATALOG[id])
    .filter(Boolean);
}

export function getPoolForRole(role: UserRole): QuickActionDef[] {
  const ids = ROLE_ACTION_POOL[role] ?? ROLE_ACTION_POOL.seeker;
  return resolveActions(ids);
}

export function getDefaultsForRole(role: UserRole): QuickActionId[] {
  return [...(ROLE_DEFAULT_ACTIONS[role] ?? ROLE_DEFAULT_ACTIONS.seeker)];
}
