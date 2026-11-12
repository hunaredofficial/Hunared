/**
 * Agent form prefill — mobile-first.
 * Uses discrete URL query params (reliable on phones) + dual storage backup.
 */

export type AgentPrefill = {
  intent?: string;
  title?: string;
  city?: string;
  country?: string;
  category?: string;
  subcategory?: string;
  price?: string;
  rentalPeriod?: string;
  description?: string;
  salary?: string;
  autoDescription?: boolean;
  raw?: string;
  at?: number;
};

const KEY = "hunared_agent_prefill";

export function saveAgentPrefill(data: AgentPrefill): void {
  const payload = JSON.stringify({ ...data, at: data.at || Date.now() });
  try {
    sessionStorage.setItem(KEY, payload);
  } catch {
    /* private mode */
  }
  try {
    localStorage.setItem(KEY, payload);
  } catch {
    /* ignore */
  }
}

export function clearAgentPrefillStorage(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Build create-form URL with discrete query params (works on mobile). */
export function buildPrefillHref(baseHref: string, data: AgentPrefill): string {
  const u = new URL(baseHref, "https://hunared.local");
  u.searchParams.set("agent", "1");
  if (data.title) u.searchParams.set("title", data.title);
  if (data.city) u.searchParams.set("city", data.city);
  if (data.country) u.searchParams.set("country", data.country);
  if (data.category) u.searchParams.set("category", data.category);
  if (data.subcategory) u.searchParams.set("subcategory", data.subcategory);
  if (data.price) u.searchParams.set("price", data.price);
  if (data.rentalPeriod) u.searchParams.set("rentalPeriod", data.rentalPeriod);
  if (data.salary) u.searchParams.set("salary", data.salary);
  if (data.intent) u.searchParams.set("intent", data.intent);
  // path + search only
  return `${u.pathname}${u.search}`;
}

function fromSearchParams(sp: URLSearchParams): AgentPrefill | null {
  if (sp.get("agent") !== "1" && !sp.get("title") && !sp.get("category")) {
    // still allow title/category without agent=1 for robustness
    if (!sp.has("title") && !sp.has("category") && !sp.has("city") && !sp.has("price")) {
      return null;
    }
  }
  const data: AgentPrefill = { at: Date.now(), autoDescription: true };
  const title = sp.get("title");
  const city = sp.get("city");
  const country = sp.get("country");
  const category = sp.get("category");
  const subcategory = sp.get("subcategory");
  const price = sp.get("price");
  const rentalPeriod = sp.get("rentalPeriod");
  const salary = sp.get("salary");
  const intent = sp.get("intent");
  if (title) data.title = title;
  if (city) data.city = city;
  if (country) data.country = country;
  if (category) data.category = category;
  if (subcategory) data.subcategory = subcategory;
  if (price) data.price = price;
  if (rentalPeriod) data.rentalPeriod = rentalPeriod;
  if (salary) data.salary = salary;
  if (intent) data.intent = intent;
  if (!data.title && !data.category && !data.city && !data.price) return null;
  return data;
}

function fromStorage(): AgentPrefill | null {
  for (const store of [sessionStorage, localStorage]) {
    try {
      const raw = store.getItem(KEY);
      if (!raw) continue;
      const data = JSON.parse(raw) as AgentPrefill;
      if (data.at && Date.now() - data.at > 15 * 60 * 1000) continue;
      return data;
    } catch {
      /* try next */
    }
  }
  return null;
}

/**
 * Read prefill from URL (first) then storage.
 * Does NOT clear until apply succeeds — call clearAgentPrefillStorage after apply.
 */
export function readAgentPrefill(): AgentPrefill | null {
  if (typeof window === "undefined") return null;
  try {
    const fromUrl = fromSearchParams(new URLSearchParams(window.location.search));
    if (fromUrl) return fromUrl;
  } catch {
    /* ignore */
  }
  return fromStorage();
}

/** @deprecated use readAgentPrefill + clear after apply */
export function consumeAgentPrefill(maxAgeMs = 15 * 60 * 1000): AgentPrefill | null {
  const data = readAgentPrefill();
  if (!data) return null;
  if (data.at && Date.now() - data.at > maxAgeMs) return null;
  // strip agent query params from address bar
  try {
    const sp = new URLSearchParams(window.location.search);
    let changed = false;
    for (const k of [
      "agent",
      "title",
      "city",
      "country",
      "category",
      "subcategory",
      "price",
      "rentalPeriod",
      "salary",
      "intent",
      "agentPrefill",
    ]) {
      if (sp.has(k)) {
        sp.delete(k);
        changed = true;
      }
    }
    if (changed) {
      const url = `${window.location.pathname}${sp.toString() ? `?${sp}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", url);
    }
  } catch {
    /* ignore */
  }
  clearAgentPrefillStorage();
  return data;
}

/** Encode legacy — kept for compatibility */
export function encodeAgentPrefillForUrl(data: AgentPrefill): string {
  return buildPrefillHref("/dashboard/market/new", data).replace(/^[^?]*\?/, "");
}
