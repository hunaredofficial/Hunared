/**
 * Agent form prefill — dual storage + URL for mobile reliability
 * (sessionStorage alone can fail on some mobile browsers / in-app webviews).
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
  /** Prefer form's buildDescription after fields apply */
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

export function consumeAgentPrefill(maxAgeMs = 10 * 60 * 1000): AgentPrefill | null {
  if (typeof window === "undefined") return null;

  // 1) URL ?agentPrefill= (most reliable on mobile navigation)
  try {
    const sp = new URLSearchParams(window.location.search);
    const encoded = sp.get("agentPrefill");
    if (encoded) {
      const pad = encoded.length % 4 === 0 ? "" : "=".repeat(4 - (encoded.length % 4));
      const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/") + pad;
      const json = decodeURIComponent(escape(atob(b64)));
      const data = JSON.parse(json) as AgentPrefill;
      sp.delete("agentPrefill");
      const url = `${window.location.pathname}${sp.toString() ? `?${sp}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", url);
      clearAgentPrefillStorage();
      if (data.at && Date.now() - data.at > maxAgeMs) return null;
      return data;
    }
  } catch {
    /* ignore url */
  }

  // 2) sessionStorage then localStorage
  for (const store of [sessionStorage, localStorage]) {
    try {
      const raw = store.getItem(KEY);
      if (!raw) continue;
      const data = JSON.parse(raw) as AgentPrefill;
      clearAgentPrefillStorage();
      if (data.at && Date.now() - data.at > maxAgeMs) continue;
      return data;
    } catch {
      /* try next */
    }
  }
  return null;
}

/** Encode prefill for URL (mobile-safe) */
export function encodeAgentPrefillForUrl(data: AgentPrefill): string {
  const json = JSON.stringify({ ...data, at: data.at || Date.now() });
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
