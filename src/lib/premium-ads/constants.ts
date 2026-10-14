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

export const DURATION_OPTIONS = [
  { days: 7, label: "7 days", hint: "Test campaign" },
  { days: 14, label: "14 days", hint: "Standard" },
  { days: 30, label: "30 days", hint: "Best value" },
  { days: 60, label: "60 days", hint: "Extended reach" },
];

export const PREMIUM_ADS_ADMIN_CONTACT = {
  email: process.env.NEXT_PUBLIC_PREMIUM_ADS_EMAIL || "ads@hunared.com",
  whatsapp: process.env.NEXT_PUBLIC_PREMIUM_ADS_WHATSAPP || "",
  note:
    "Complete payment, then submit your reference. An admin reviews the creative and publishes after confirmation.",
};

/** Max creative upload size */
export const PREMIUM_AD_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB
export const PREMIUM_AD_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
