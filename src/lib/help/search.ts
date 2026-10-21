import { HELP_ARTICLES } from "./articles";
import type { HelpArticle } from "./types";

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Simple client/server search — no external AI cost */
export function searchHelpArticles(query: string, limit = 20): HelpArticle[] {
  const q = normalize(query);
  if (!q) return [];

  const terms = q.split(" ").filter(Boolean);
  const scored: { a: HelpArticle; score: number }[] = [];

  for (const a of HELP_ARTICLES) {
    const hay = normalize(
      [a.title, a.summary, a.slug, a.category, ...a.keywords, a.body.slice(0, 500)].join(" ")
    );
    let score = 0;
    if (hay.includes(q)) score += 50;
    for (const t of terms) {
      if (normalize(a.title).includes(t)) score += 20;
      if (a.keywords.some((k) => normalize(k).includes(t))) score += 12;
      if (hay.includes(t)) score += 5;
    }
    if (score > 0) scored.push({ a, score });
  }

  scored.sort((x, y) => y.score - x.score);
  return scored.slice(0, limit).map((s) => s.a);
}

export const POPULAR_SLUGS = [
  "getting-started/create-account",
  "accounts/complete-profile",
  "jobs/search-jobs",
  "jobs/post-a-job",
  "cv-builder/cv-overview",
  "cv-builder/upload-cv",
  "messaging/how-messaging-works",
  "agent/hide-agent",
  "marketplace/browse-and-post",
  "troubleshooting/login-issues",
];

export function getPopularArticles(): HelpArticle[] {
  return POPULAR_SLUGS.map((p) => {
    const [c, s] = p.split("/");
    return HELP_ARTICLES.find((a) => a.category === c && a.slug === s);
  }).filter(Boolean) as HelpArticle[];
}
