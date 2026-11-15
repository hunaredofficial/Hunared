/** Duration multipliers on base 7-day package price */
export const DURATION_MULTIPLIER: Record<number, number> = {
  7: 1,
  14: 1.75,
  30: 3.2,
  60: 5.5,
};

/** Fixed promote ranking packages (USD) by duration — competitive, not free */
export const PROMOTE_PACKAGE_USD: Record<number, number> = {
  7: 19,
  14: 32,
  30: 55,
  60: 95,
};

export function packagePriceUsd(baseUsd: number, durationDays: number): number {
  const m = DURATION_MULTIPLIER[durationDays] ?? durationDays / 7;
  return Math.max(1, Math.round(baseUsd * m));
}

export function promotePackageUsd(durationDays: number): number {
  return PROMOTE_PACKAGE_USD[durationDays] ?? Math.round(19 * (durationDays / 7));
}
