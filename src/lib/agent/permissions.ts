/**
 * Granular Hunared Agent permissions + execution preference.
 * Stored on profiles.ai_agent_permissions (jsonb) — see 016 migration.
 */

export type AgentPermissionKey =
  | "search_browse"
  | "access_own_profile"
  | "create_drafts"
  | "create_jobs"
  | "create_market"
  | "create_services"
  | "edit_own"
  | "publish"
  | "manage_listings"
  | "improve_cv"
  | "save_items"
  | "draft_messages"
  | "apply_jobs"
  | "manage_notifications"
  | "learning";

export type ExecutionPreference = "ask_always" | "confirm_important" | "auto_low_risk";

export type AgentPermissions = Record<AgentPermissionKey, boolean> & {
  execution: ExecutionPreference;
};

export const DEFAULT_AGENT_PERMISSIONS: AgentPermissions = {
  search_browse: true,
  access_own_profile: true,
  create_drafts: true,
  create_jobs: false,
  create_market: false,
  create_services: false,
  edit_own: false,
  publish: false,
  manage_listings: false,
  improve_cv: true,
  save_items: true,
  draft_messages: true,
  apply_jobs: false,
  manage_notifications: false,
  learning: true,
  execution: "confirm_important",
};

export const PERMISSION_META: {
  key: AgentPermissionKey;
  label: string;
  desc: string;
  roles?: string[]; // if set, only show for these roles
}[] = [
  {
    key: "search_browse",
    label: "Search & browse",
    desc: "Find jobs, listings, companies, talent, and learning",
  },
  {
    key: "access_own_profile",
    label: "Use my profile data",
    desc: "Read your own profile to personalize answers",
  },
  {
    key: "create_drafts",
    label: "Create drafts",
    desc: "Prepare titles and descriptions without publishing",
  },
  {
    key: "create_jobs",
    label: "Create job ads",
    desc: "Open and pre-fill job posting forms",
    roles: ["employer", "company", "team"],
  },
  {
    key: "create_market",
    label: "Create marketplace listings",
    desc: "Open and pre-fill marketplace forms",
  },
  {
    key: "create_services",
    label: "Create service ads",
    desc: "Pre-fill services category listings",
  },
  {
    key: "edit_own",
    label: "Edit my content",
    desc: "Help update your own jobs and listings",
  },
  {
    key: "publish",
    label: "Publish content",
    desc: "Allow guided publish after your confirmation (never silent)",
  },
  {
    key: "manage_listings",
    label: "Manage my listings",
    desc: "List, deactivate, or open your posts for edit",
  },
  {
    key: "improve_cv",
    label: "Improve CV & profile",
    desc: "CV Builder guidance and profile tips",
  },
  {
    key: "save_items",
    label: "Save jobs & listings",
    desc: "Guide you to save items (you confirm in UI)",
  },
  {
    key: "draft_messages",
    label: "Draft messages",
    desc: "Help write professional messages — you send them",
  },
  {
    key: "apply_jobs",
    label: "Job applications",
    desc: "Help prepare applications — you submit",
  },
  {
    key: "manage_notifications",
    label: "Notifications",
    desc: "Explain and open notification settings",
  },
  {
    key: "learning",
    label: "Learning recommendations",
    desc: "Suggest articles, resources, and programs",
  },
];

export function mergePermissions(
  raw: unknown
): AgentPermissions {
  const base = { ...DEFAULT_AGENT_PERMISSIONS };
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  for (const k of Object.keys(DEFAULT_AGENT_PERMISSIONS) as (keyof AgentPermissions)[]) {
    if (k === "execution") {
      const v = o.execution;
      if (v === "ask_always" || v === "confirm_important" || v === "auto_low_risk") {
        base.execution = v;
      }
      continue;
    }
    if (typeof o[k] === "boolean") base[k] = o[k] as boolean;
  }
  return base;
}

/** Map intent → required permission */
export function permissionForIntent(intent: string): AgentPermissionKey | null {
  switch (intent) {
    case "search_jobs":
    case "search_market":
    case "search_companies":
    case "search_candidates":
    case "search_learning":
    case "search_universal":
    case "search_finder":
      return "search_browse";
    case "post_job":
      return "create_jobs";
    case "post_listing":
    case "execute_create":
      return "create_market";
    case "cv":
    case "cover_letter":
      return "improve_cv";
    case "messages":
      return "draft_messages";
    case "saved":
      return "save_items";
    case "profile":
      return "access_own_profile";
    default:
      return null;
  }
}
