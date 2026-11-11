/**
 * Approved agent actions — no arbitrary SQL/code execution.
 * Each action has risk level and permission key.
 */

import type { AgentPermissionKey } from "./permissions";

export type ActionRisk = "low" | "medium" | "high" | "critical";

export type RegistryAction = {
  id: string;
  label: string;
  risk: ActionRisk;
  permission: AgentPermissionKey | null;
  /** Navigate-only vs needs server write */
  kind: "navigate" | "search" | "prefill_form" | "draft" | "write";
};

export const ACTION_REGISTRY: RegistryAction[] = [
  { id: "search_jobs", label: "Search jobs", risk: "low", permission: "search_browse", kind: "search" },
  { id: "search_market", label: "Search marketplace", risk: "low", permission: "search_browse", kind: "search" },
  { id: "search_companies", label: "Search companies", risk: "low", permission: "search_browse", kind: "search" },
  { id: "search_candidates", label: "Search talent", risk: "low", permission: "search_browse", kind: "search" },
  { id: "open_cv", label: "Open CV Builder", risk: "low", permission: "improve_cv", kind: "navigate" },
  { id: "prefill_job", label: "Pre-fill job form", risk: "medium", permission: "create_jobs", kind: "prefill_form" },
  { id: "prefill_listing", label: "Pre-fill listing form", risk: "medium", permission: "create_market", kind: "prefill_form" },
  { id: "draft_message", label: "Draft message", risk: "medium", permission: "draft_messages", kind: "draft" },
  { id: "publish_listing", label: "Publish listing", risk: "high", permission: "publish", kind: "write" },
  { id: "publish_job", label: "Publish job", risk: "high", permission: "publish", kind: "write" },
  { id: "delete_content", label: "Delete content", risk: "critical", permission: "manage_listings", kind: "write" },
];

export function getRegistryAction(id: string): RegistryAction | undefined {
  return ACTION_REGISTRY.find((a) => a.id === id);
}

/** Whether execution preference allows auto-run for this risk */
export function mayAutoExecute(
  risk: ActionRisk,
  preference: "ask_always" | "confirm_important" | "auto_low_risk"
): boolean {
  if (preference === "ask_always") return false;
  if (risk === "critical" || risk === "high") return false;
  if (preference === "auto_low_risk" && risk === "low") return true;
  if (preference === "confirm_important" && risk === "low") return true;
  return false;
}
