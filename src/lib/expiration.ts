/**
 * Optional listing/job auto-close helpers.
 * Expiration is OPTIONAL — null means keep open until manual close.
 */

export const EXPIRATION_OPTIONS = [
  { value: "never", label: "Never / Keep Open", days: null as number | null },
  { value: "1d", label: "1 Day", days: 1 },
  { value: "3d", label: "3 Days", days: 3 },
  { value: "1w", label: "1 Week", days: 7 },
  { value: "1m", label: "1 Month", days: 30 },
] as const;

export type ExpirationOptionValue = (typeof EXPIRATION_OPTIONS)[number]["value"];

/** Compute expires_at ISO string from publish time + option. null = never. */
export function computeExpiresAt(
  option: ExpirationOptionValue | string | null | undefined,
  from: Date = new Date()
): string | null {
  if (!option || option === "never") return null;
  const found = EXPIRATION_OPTIONS.find((o) => o.value === option);
  if (!found || found.days == null) return null;
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + found.days);
  return d.toISOString();
}

/** Map days back to option for form display (best effort). */
export function expiresAtToOption(
  expiresAt: string | null | undefined,
  createdAt?: string | null
): ExpirationOptionValue {
  if (!expiresAt) return "never";
  const end = new Date(expiresAt).getTime();
  const start = createdAt ? new Date(createdAt).getTime() : Date.now();
  const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
  if (days <= 1) return "1d";
  if (days <= 3) return "3d";
  if (days <= 7) return "1w";
  if (days <= 31) return "1m";
  return "never";
}

export function isExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now();
}

/** Human remaining time or "Expired". */
export function remainingLabel(expiresAt: string | null | undefined): string | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day left";
  return `${days} days left`;
}
