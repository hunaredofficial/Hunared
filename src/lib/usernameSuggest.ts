/** Slugify a display name into username candidates */
export function slugifyUsername(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")
    .slice(0, 24);
}

/** Build ranked username suggestions from a full/company name */
export function buildUsernameSuggestions(name: string): string[] {
  const base = slugifyUsername(name);
  if (!base || base.length < 2) return [];

  const parts = base.split("_").filter(Boolean);
  const first = parts[0] || base;
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  const joined = parts.join("");
  const candidates = [
    base,
    joined.length >= 3 ? joined : "",
    last ? `${first}_${last}` : "",
    last ? `${first}${last}` : "",
    `${base}_hq`,
    `${base}_co`,
    `${first}_team`,
    `${base}1`,
    `${base}2`,
    `${base}_${new Date().getFullYear().toString().slice(-2)}`,
  ].filter((s) => s && s.length >= 3 && s.length <= 30);

  // unique preserve order
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of candidates) {
    if (!seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  return out.slice(0, 8);
}
