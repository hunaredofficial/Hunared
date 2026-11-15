/** Duration multipliers on base 7-day package price (brand banners) */
export const DURATION_MULTIPLIER: Record<number, number> = {
  7: 1,
  14: 1.75,
  30: 3.2,
  60: 5.5,
};

/** Promote ranking packages (USD) — affordable */
export const PROMOTE_PACKAGE_USD: Record<number, number> = {
  7: 9,
  14: 15,
  30: 25,
  60: 42,
};

export function packagePriceUsd(baseUsd: number, durationDays: number): number {
  const m = DURATION_MULTIPLIER[durationDays] ?? durationDays / 7;
  return Math.max(1, Math.round(baseUsd * m));
}

export function promotePackageUsd(durationDays: number): number {
  return PROMOTE_PACKAGE_USD[durationDays] ?? Math.round(9 * (durationDays / 7));
}
