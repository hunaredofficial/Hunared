/**
 * Client-side notification preferences (header bell + alert types).
 * Stored in localStorage so it works without DB migration.
 */

export type NotifCategory =
  | "jobs"
  | "market"
  | "orders"
  | "subscription"
  | "system";

export type NotificationPrefs = {
  /** Show bell icon in header */
  showHeaderBell: boolean;
  /** Mute all in-app notification badges / pop */
  silenceAll: boolean;
  /** Which categories contribute to header badge & are emphasized */
  categories: Record<NotifCategory, boolean>;
};

const KEY = "hunared_notification_prefs_v1";

export const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  showHeaderBell: true,
  silenceAll: false,
  categories: {
    jobs: true,
    market: true,
    orders: true,
    subscription: true,
    system: true,
  },
};

export const CATEGORY_META: Record<
  NotifCategory,
  { label: string; order: number }
> = {
  jobs: { label: "Jobs", order: 0 },
  market: { label: "Market", order: 1 },
  orders: { label: "Orders", order: 2 },
  subscription: { label: "Subscription", order: 3 },
  system: { label: "System", order: 4 },
};

export function loadNotificationPrefs(): NotificationPrefs {
  if (typeof window === "undefined") {
    return {
      ...DEFAULT_NOTIF_PREFS,
      categories: { ...DEFAULT_NOTIF_PREFS.categories },
    };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return {
        ...DEFAULT_NOTIF_PREFS,
        categories: { ...DEFAULT_NOTIF_PREFS.categories },
      };
    }
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs> & {
      categories?: Partial<Record<string, boolean>>;
    };
    const cat = parsed.categories || {};
    return {
      showHeaderBell: parsed.showHeaderBell !== false,
      silenceAll: parsed.silenceAll === true,
      categories: {
        jobs: cat.jobs !== false && cat.company !== false,
        market: cat.market !== false,
        orders: cat.orders !== false,
        subscription:
          cat.subscription !== false && cat.subscriptions !== false,
        system: cat.system !== false && cat.other !== false,
      },
    };
  } catch {
    return {
      ...DEFAULT_NOTIF_PREFS,
      categories: { ...DEFAULT_NOTIF_PREFS.categories },
    };
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(prefs));
  window.dispatchEvent(
    new CustomEvent("hunared-notif-prefs", { detail: prefs })
  );
}

/** Map API notification.type (+ optional title/body) → display category */
export function categoryForType(
  type: string | null | undefined,
  title?: string | null,
  body?: string | null
): NotifCategory {
  const t = (type || "").toLowerCase();
  const text = `${title || ""} ${body || ""}`.toLowerCase();

  if (
    t === "job_match" ||
    t === "application" ||
    t.includes("job") ||
    text.includes("job application") ||
    text.includes("applied to")
  ) {
    return "jobs";
  }
  if (
    t === "listing_match" ||
    t.includes("listing") ||
    t.includes("market") ||
    text.includes("marketplace") ||
    text.includes("listing")
  ) {
    return "market";
  }
  if (
    t === "order" ||
    t.includes("order") ||
    t.includes("purchase") ||
    t.includes("sale") ||
    text.includes("order")
  ) {
    return "orders";
  }
  if (
    t.includes("subscription") ||
    t.includes("premium") ||
    t.includes("plan") ||
    text.includes("subscription") ||
    text.includes("premium") ||
    text.includes("plan renew")
  ) {
    return "subscription";
  }
  return "system";
}

/** Whether this notification type is enabled in prefs */
export function isTypeEnabled(
  prefs: NotificationPrefs,
  type: string | null | undefined,
  title?: string | null,
  body?: string | null
): boolean {
  if (prefs.silenceAll) return false;
  const cat = categoryForType(type, title, body);
  return prefs.categories[cat] !== false;
}
