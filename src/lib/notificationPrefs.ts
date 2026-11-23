/**
 * Client-side notification preferences (header bell + alert types).
 * Stored in localStorage so it works without DB migration.
 */

export type NotifCategory =
  | "subscriptions"
  | "orders"
  | "company"
  | "messages"
  | "other";

export type NotificationPrefs = {
  /** Show bell icon in header */
  showHeaderBell: boolean;
  /** Mute all in-app notification badges / pop */
  silenceAll: boolean;
  /** Which types contribute to header badge & are emphasized */
  categories: Record<NotifCategory, boolean>;
};

const KEY = "hunared_notification_prefs_v1";

export const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  showHeaderBell: true,
  silenceAll: false,
  categories: {
    subscriptions: true,
    orders: true,
    company: true,
    messages: true,
    other: true,
  },
};

export function loadNotificationPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return { ...DEFAULT_NOTIF_PREFS, categories: { ...DEFAULT_NOTIF_PREFS.categories } };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_NOTIF_PREFS, categories: { ...DEFAULT_NOTIF_PREFS.categories } };
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
    return {
      showHeaderBell: parsed.showHeaderBell !== false,
      silenceAll: parsed.silenceAll === true,
      categories: {
        subscriptions: parsed.categories?.subscriptions !== false,
        orders: parsed.categories?.orders !== false,
        company: parsed.categories?.company !== false,
        messages: parsed.categories?.messages !== false,
        other: parsed.categories?.other !== false,
      },
    };
  } catch {
    return { ...DEFAULT_NOTIF_PREFS, categories: { ...DEFAULT_NOTIF_PREFS.categories } };
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent("hunared-notif-prefs", { detail: prefs }));
}

/** Map API notification.type → category */
export function categoryForType(type: string | null | undefined): NotifCategory {
  const t = (type || "").toLowerCase();
  if (t.includes("subscription") || t.includes("job_alert") || t.includes("listing_alert") || t === "category")
    return "subscriptions";
  if (t.includes("order") || t.includes("purchase") || t.includes("sale")) return "orders";
  if (t.includes("company") || t.includes("follow") || t === "company_update") return "company";
  if (t.includes("message") || t === "chat") return "messages";
  return "other";
}

export function isTypeEnabled(prefs: NotificationPrefs, type: string | null | undefined): boolean {
  if (prefs.silenceAll) return false;
  return prefs.categories[categoryForType(type)] !== false;
}
