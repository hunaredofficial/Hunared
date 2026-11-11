/**
 * Agent form prefill from sessionStorage (written by HunaredAgent when Agent actions is ON).
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
  raw?: string;
  at?: number;
};

const KEY = "hunared_agent_prefill";

export function consumeAgentPrefill(maxAgeMs = 5 * 60 * 1000): AgentPrefill | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const data = JSON.parse(raw) as AgentPrefill;
    if (data.at && Date.now() - data.at > maxAgeMs) return null;
    return data;
  } catch {
    return null;
  }
}
