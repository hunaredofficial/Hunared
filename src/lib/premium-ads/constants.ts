/** Premium ad product constants — prices in USD; scale with duration */

export const PREMIUM_AD_KINDS = [
  {
    id: "job" as const,
    label: "Promote a Job",
    description: "Boost one of your job posts to top placements",
  },
  {
    id: "market" as const,
    label: "Promote a Listing",
    description: "Highlight a marketplace item, service, or property",
  },
  {
    id: "standalone" as const,
    label: "Brand / Custom ad",
    description: "Any creative linking to your page or external URL",
  },
];

export type PremiumAdKind = (typeof PREMIUM_AD_KINDS)[number]["id"];

export type PremiumAdStatus =
  | "draft"
  | "pending_payment"
  | "pending_approval"
  | "active"
  | "rejected"
  | "expired"
  | "outbid";

export const PREMIUM_AD_STATUS_LABEL: Record<PremiumAdStatus, string> = {
  draft: "Draft",
  pending_payment: "Awaiting payment",
  pending_approval: "Under review",
  active: "Live",
  rejected: "Rejected",
  expired: "Expired",
  outbid: "Outbid",
};

/** Duration packages — package price = base × multiplier */
export const DURATION_OPTIONS = [
  { days: 7, label: "7 days", hint: "Test", multiplier: 1 },
  { days: 14, label: "14 days", hint: "Standard", multiplier: 1.75 },
  { days: 30, label: "30 days", hint: "Best value", multiplier: 3.0 },
  { days: 60, label: "60 days", hint: "Extended", multiplier: 5.0 },
] as const;

export function packagePrice(baseUsd: number, days: number): number {
  const opt =
    DURATION_OPTIONS.find((d) => d.days === days) || DURATION_OPTIONS[0];
  return Math.max(1, Math.round(Number(baseUsd) * opt.multiplier));
}

export const PREMIUM_ADS_ADMIN_CONTACT = {
  email: process.env.NEXT_PUBLIC_PREMIUM_ADS_EMAIL || "ads@hunared.com",
  whatsapp: process.env.NEXT_PUBLIC_PREMIUM_ADS_WHATSAPP || "",
  note:
    "Pay the package price, then submit your payment reference. An admin reviews and publishes your ad.",
};

export const PREMIUM_ADS_CURRENCY = "USD";

export const PREMIUM_AD_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB
export const PREMIUM_AD_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
