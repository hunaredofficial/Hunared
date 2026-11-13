/**
 * Agent form prefill — bulletproof for mobile + desktop.
 * Sources (in order): URL query → cookie → sessionStorage → localStorage
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
const COOKIE = "hunared_agent_prefill";

function safeJsonParse(raw: string | null | undefined): AgentPrefill | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as AgentPrefill;
    if (data.at && Date.now() - data.at > 20 * 60 * 1000) return null;
    if (!data.title && !data.category && !data.city && !data.price) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveAgentPrefill(data: AgentPrefill): void {
  const payload = JSON.stringify({ ...data, at: data.at || Date.now() });
  try {
    sessionStorage.setItem(KEY, payload);
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem(KEY, payload);
  } catch {
    /* ignore */
  }
  try {
    // Cookie readable on next full page load (mobile + desktop hard nav)
    const maxAge = 60 * 20; // 20 min
    document.cookie = `${COOKIE}=${encodeURIComponent(payload)};path=/;max-age=${maxAge};SameSite=Lax`;
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
  try {
    document.cookie = `${COOKIE}=;path=/;max-age=0;SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

function fromCookie(): AgentPrefill | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
    if (!match?.[1]) return null;
    return safeJsonParse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

function fromSearchString(search: string): AgentPrefill | null {
  try {
    const sp = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
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
  } catch {
    return null;
  }
}

/** Build create-form URL with discrete query params */
export function buildPrefillHref(baseHref: string, data: AgentPrefill): string {
  const path = baseHref.split("?")[0] || "/dashboard/market/new";
  const u = new URL(path, "https://hunared.local");
  // Keep any existing non-agent params from base
  try {
    const existing = baseHref.includes("?") ? new URLSearchParams(baseHref.split("?")[1]) : null;
    if (existing) {
      existing.forEach((v, k) => {
        if (v) u.searchParams.set(k, v);
      });
    }
  } catch {
    /* ignore */
  }
  u.searchParams.set("agent", "1");
  if (data.title) u.searchParams.set("title", data.title.slice(0, 120));
  if (data.city) u.searchParams.set("city", data.city);
  if (data.country) u.searchParams.set("country", data.country);
  if (data.category) u.searchParams.set("category", data.category);
  if (data.subcategory) u.searchParams.set("subcategory", data.subcategory);
  if (data.price) u.searchParams.set("price", data.price);
  if (data.rentalPeriod) u.searchParams.set("rentalPeriod", data.rentalPeriod);
  if (data.salary) u.searchParams.set("salary", data.salary);
  if (data.intent) u.searchParams.set("intent", String(data.intent));
  return `${u.pathname}?${u.searchParams.toString()}`;
}

export function readAgentPrefill(): AgentPrefill | null {
  if (typeof window === "undefined") return null;
  const fromUrl = fromSearchString(window.location.search);
  if (fromUrl) return fromUrl;
  const fromC = fromCookie();
  if (fromC) return fromC;
  try {
    const s = safeJsonParse(sessionStorage.getItem(KEY));
    if (s) return s;
  } catch {
    /* ignore */
  }
  try {
    const l = safeJsonParse(localStorage.getItem(KEY));
    if (l) return l;
  } catch {
    /* ignore */
  }
  return null;
}

/** Read + optionally clear after successful apply */
export function consumeAgentPrefill(): AgentPrefill | null {
  const data = readAgentPrefill();
  return data;
}

export function encodeAgentPrefillForUrl(data: AgentPrefill): string {
  return buildPrefillHref("/dashboard/market/new", data).replace(/^[^?]*\?/, "");
}
