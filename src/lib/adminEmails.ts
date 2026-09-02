/**
 * Official platform admin emails.
 * These accounts always receive role = admin on signup/login sync.
 * Override with env ADMIN_EMAILS (comma-separated) if needed.
 */
const DEFAULT_ADMIN_EMAILS = ["hunaredofficial@gmail.com"];

export function getAdminEmails(): string[] {
  const fromEnv = process.env.ADMIN_EMAILS;
  if (fromEnv && fromEnv.trim()) {
    return fromEnv
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }
  return DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase());
}

export function isOfficialAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
