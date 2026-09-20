/**
 * Hunared — Personalization helpers
 * Rank jobs & marketplace listings for signed-in users based on
 * profile (job_interests, profession, country, city, skill_level)
 * and recent activity (saved items).
 */

export type PersonalizationProfile = {
  job_interests?: string[] | null;
  profession?: string | null;
  country?: string | null;
  city?: string | null;
  skill_level?: string | null;
  location?: string | null;
};

export type ScoreableJob = {
  id: string;
  job_title?: string | null;
  category?: string | null;
  categories?: string[] | null;
  country?: string | null;
  city?: string | null;
  location?: string | null;
  employment_type?: string | null;
  experience_level?: string | null;
  company_name?: string | null;
  [key: string]: unknown;
};

export type ScoreableListing = {
  id: string;
  title?: string | null;
  category?: string | null;
  subcategory?: string | null;
  country?: string | null;
  city?: string | null;
  location?: string | null;
  [key: string]: unknown;
};

function norm(s: string | null | undefined): string {
  return (s ?? "").toLowerCase().trim();
}

function tokenOverlap(a: string, b: string): number {
  const ta = new Set(a.split(/[\s,/|-]+/).filter((t) => t.length > 2));
  const tb = new Set(b.split(/[\s,/|-]+/).filter((t) => t.length > 2));
  if (ta.size === 0 || tb.size === 0) return 0;
  let hits = 0;
  for (const t of ta) if (tb.has(t)) hits++;
  return hits / Math.max(ta.size, 1);
}

/** Score a job for a profile. Higher = better match. */
export function scoreJob(
  job: ScoreableJob,
  profile: PersonalizationProfile | null,
  savedIds: Set<string> = new Set()
): number {
  if (!profile) return 0;
  let score = 0;

  const interests = (profile.job_interests ?? []).map(norm).filter(Boolean);
  const cats = [
    norm(job.category),
    ...(job.categories ?? []).map(norm),
  ].filter(Boolean);

  // Category / interest overlap (strong signal)
  for (const interest of interests) {
    for (const c of cats) {
      if (c === interest || c.includes(interest) || interest.includes(c)) {
        score += 40;
      } else if (tokenOverlap(c, interest) > 0.3) {
        score += 15;
      }
    }
    // Title match against interests
    const title = norm(job.job_title);
    if (title.includes(interest) || tokenOverlap(title, interest) > 0.25) {
      score += 25;
    }
  }

  // Profession vs title
  const profession = norm(profile.profession);
  if (profession) {
    const title = norm(job.job_title);
    if (title.includes(profession) || tokenOverlap(title, profession) > 0.3) {
      score += 30;
    }
  }

  // Location match
  const pCountry = norm(profile.country);
  const pCity = norm(profile.city);
  const jCountry = norm(job.country);
  const jCity = norm(job.city);
  const jLoc = norm(job.location);

  if (pCountry && (jCountry === pCountry || jLoc.includes(pCountry))) {
    score += 20;
  }
  if (pCity && (jCity.includes(pCity) || jLoc.includes(pCity))) {
    score += 25;
  }

  // Skill / experience soft boost
  const skill = norm(profile.skill_level);
  const exp = norm(job.experience_level);
  if (skill && exp) {
    if (skill === exp) score += 10;
    else if (
      (skill === "beginner" && (exp === "entry" || exp === "junior")) ||
      (skill === "intermediate" && exp === "mid") ||
      (skill === "advanced" && (exp === "senior" || exp === "expert"))
    ) {
      score += 8;
    }
  }

  // Already saved → mild boost so they stay visible
  if (savedIds.has(job.id)) score += 5;

  return score;
}

/** Score a marketplace listing for a profile. */
export function scoreListing(
  listing: ScoreableListing,
  profile: PersonalizationProfile | null,
  savedIds: Set<string> = new Set()
): number {
  if (!profile) return 0;
  let score = 0;

  const pCountry = norm(profile.country);
  const pCity = norm(profile.city);
  const lCountry = norm(listing.country);
  const lCity = norm(listing.city);
  const lLoc = norm(listing.location);

  if (pCountry && (lCountry === pCountry || lLoc.includes(pCountry))) {
    score += 25;
  }
  if (pCity && (lCity.includes(pCity) || lLoc.includes(pCity))) {
    score += 30;
  }

  // Soft interest via profession / interests in title
  const title = norm(listing.title);
  const interests = (profile.job_interests ?? []).map(norm);
  for (const interest of interests) {
    if (title.includes(interest) || tokenOverlap(title, interest) > 0.25) {
      score += 12;
    }
  }
  const profession = norm(profile.profession);
  if (profession && (title.includes(profession) || tokenOverlap(title, profession) > 0.25)) {
    score += 10;
  }

  if (savedIds.has(listing.id)) score += 5;

  return score;
}

/**
 * Stable personalization sort: recommended first (score desc),
 * then preserve original relative order for ties.
 */
export function rankByPersonalization<T extends { id: string }>(
  items: T[],
  scoreFn: (item: T) => number
): (T & { _matchScore: number })[] {
  return items
    .map((item, index) => ({
      ...item,
      _matchScore: scoreFn(item),
      _origIndex: index,
    }))
    .sort((a, b) => {
      if (b._matchScore !== a._matchScore) return b._matchScore - a._matchScore;
      return a._origIndex - b._origIndex;
    })
    .map(({ _origIndex, ...rest }) => rest as T & { _matchScore: number });
}
