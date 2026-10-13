/** Standard bookable premium ad sizes (IAB-inspired) for UI copy */
export const PREMIUM_AD_KINDS = [
  {
    id: "job" as const,
    label: "Promote a Job",
    description: "Boost visibility of one of your job posts",
  },
  {
    id: "market" as const,
    label: "Promote a Marketplace listing",
    description: "Highlight a sale, rent, service, or other listing",
  },
  {
    id: "standalone" as const,
    label: "Standalone premium ad",
    description: "Custom creative linking to any URL (company, offer, external)",
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
  pending_approval: "Awaiting admin approval",
  active: "Live",
  rejected: "Rejected",
  expired: "Expired",
  outbid: "Outbid",
};

export const DURATION_OPTIONS = [
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
  { days: 60, label: "60 days" },
];

/** Shown on payment step — admin contact for bank transfer / confirmation */
export const PREMIUM_ADS_ADMIN_CONTACT = {
  email: process.env.NEXT_PUBLIC_PREMIUM_ADS_EMAIL || "ads@hunared.com",
  whatsapp: process.env.NEXT_PUBLIC_PREMIUM_ADS_WHATSAPP || "",
  note:
    "Pay the offered amount, then submit payment reference. An admin reviews and publishes your ad after confirmation.",
};
