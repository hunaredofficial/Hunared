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
  | "outbid"
  | "scheduled";

export const PREMIUM_AD_STATUS_LABEL: Record<PremiumAdStatus, string> = {
  draft: "Draft",
  pending_payment: "Awaiting payment",
  pending_approval: "Under review",
  active: "Live",
  rejected: "Rejected",
  expired: "Expired",
  outbid: "Outbid",
  scheduled: "Scheduled",
};

/** Fixed duration packages — price = base_price_sar × multiplier (rounded) */
export const DURATION_OPTIONS = [
  { days: 7, label: "1 week", hint: "7 days", multiplier: 1 },
  { days: 14, label: "2 weeks", hint: "14 days", multiplier: 1.8 },
  { days: 30, label: "1 month", hint: "30 days", multiplier: 3.2 },
  { days: 60, label: "2 months", hint: "60 days", multiplier: 5.5 },
  { days: 90, label: "3 months", hint: "90 days", multiplier: 7.5 },
] as const;

export function packagePrice(baseSar: number, days: number): number {
  const opt = DURATION_OPTIONS.find((d) => d.days === days) || DURATION_OPTIONS[0];
  return Math.max(1, Math.round(Number(baseSar) * opt.multiplier));
}

export const PREMIUM_ADS_ADMIN_CONTACT = {
  email: process.env.NEXT_PUBLIC_PREMIUM_ADS_EMAIL || "ads@hunared.com",
  whatsapp: process.env.NEXT_PUBLIC_PREMIUM_ADS_WHATSAPP || "",
  note:
    "Pay the package price, then submit your payment reference. An admin reviews and publishes your ad.",
};

export const PREMIUM_AD_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PREMIUM_AD_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
