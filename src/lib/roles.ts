import type { UserRole } from "@/types/database";

/** Human labels for roles (UI) */
export const ROLE_LABELS: Record<UserRole, string> = {
  personal: "Personal",
  seeker: "Seeker",
  employer: "Company",
  team: "Team",
  admin: "Admin",
};

/** Roles assigned only by admins (not self-selected on register) */
export const STAFF_ROLES: UserRole[] = ["admin", "team"];

export function isStaffRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "team";
}

/** Team/admin may bypass phone/email verification gates */
export function canBypassVerification(role: string | null | undefined): boolean {
  return isStaffRole(role);
}

/** Team/admin may bulk-post jobs & marketplace listings */
export function canBulkPost(role: string | null | undefined): boolean {
  return isStaffRole(role);
}

/** Roles allowed to post jobs */
export function canPostJobs(role: string | null | undefined): boolean {
  return (
    role === "admin" ||
    role === "team" ||
    role === "employer" ||
    role === "seeker" ||
    role === "personal"
  );
}
