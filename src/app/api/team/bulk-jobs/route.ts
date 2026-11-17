import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase";
import { canBulkPost } from "@/lib/roles";
import { findTeamManagedCompanyByName } from "@/lib/team-profiles";
import { JOB_CATEGORIES, SALARY_TYPES } from "@/lib/constants";

type BulkJob = {
  jobTitle?: string;
  jobDescription?: string;
  companyName?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
  country?: string;
  city?: string;
  location?: string;
  workLocation?: string;
  employmentType?: string;
  duration?: string;
  category?: string;
  categories?: string[];
  subcategory?: string;
  experienceLevel?: string;
  positions?: string | number;
  salaryRate?: string;
  salaryType?: string;
  currency?: string;
  mapLocation?: string;
};

const VALID_CATS = new Set<string>(JOB_CATEGORIES as unknown as string[]);
const VALID_SALARY = new Set<string>(SALARY_TYPES as unknown as string[]);

function normalizeCategories(j: BulkJob): string[] {
  const raw = (
    j.categories?.length ? j.categories : j.category ? [j.category] : []
  )
    .map((c) => String(c).trim())
    .filter(Boolean);
  const valid = [...new Set(raw.filter((c) => VALID_CATS.has(c)))];
  if (valid.length) return valid;
  return [JOB_CATEGORIES[0]];
}

function normalizePositions(v: string | number | undefined | null): number {
  if (v == null || String(v).trim() === "") return 1;
  const n =
    typeof v === "number"
      ? v
      : parseInt(String(v).replace(/[^\d]/g, ""), 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

/** Force every public-page filter field so rows always appear on /jobs */
async function forceJobsPublic(
  supabase: SupabaseAdmin,
  ids: string[],
  countryById: Record<string, string>
) {
  if (!ids.length) return;

  await supabase
    .from("jobs")
    .update({
      status: "approved",
      closed_at: null,
      close_reason: null,
      expires_at: null,
    })
    .in("id", ids);

  for (const id of ids) {
    await supabase
      .from("jobs")
      .update({
        status: "approved",
        closed_at: null,
        close_reason: null,
        expires_at: null,
        country: countryById[id] || "SA",
      })
      .eq("id", id);
  }

  const { data: rows } = await supabase
    .from("jobs")
    .select("id, status, closed_at, expires_at")
    .in("id", ids);

  const ok = new Set(
    (rows ?? [])
      .filter(
        (r) =>
          r.status === "approved" &&
          r.closed_at == null &&
          (r.expires_at == null || new Date(r.expires_at) > new Date())
      )
      .map((r) => r.id)
  );

  for (const id of ids) {
    if (ok.has(id)) continue;
    await supabase
      .from("jobs")
      .update({
        status: "approved",
        closed_at: null,
        close_reason: null,
        expires_at: null,
      })
      .eq("id", id);
  }
}

function buildJobRows(
  jobs: BulkJob[],
  userId: string,
  teamCoCache: Map<string, { id: string; name: string } | null>
) {
  const now = Date.now();
  return jobs.map((j, i) => {
    const title = j.jobTitle?.trim() || "";
    const desc = j.jobDescription?.trim() || "";
    const company = j.companyName?.trim() || "Hunared Team";
    const cats = normalizeCategories(j);
    const primary = cats[0];
    const durationRaw = j.duration?.trim() || "";
    const empRaw = (j.employmentType || "").toLowerCase();
    const emp: "permanent" | "temporary" =
      empRaw === "temporary" ||
      empRaw === "task_force" ||
      (durationRaw !== "" && durationRaw.toLowerCase() !== "permanent")
        ? "temporary"
        : "permanent";
    const duration =
      durationRaw || (emp === "permanent" ? "Permanent" : "UnSpecified");
    const positions = normalizePositions(j.positions);
    const city = j.city?.trim() || null;
    const country = (j.country?.trim() || "SA").toUpperCase().slice(0, 2);
    const location =
      j.location?.trim() ||
      j.workLocation?.trim() ||
      (city ? `${city}` : "Remote");
    const salaryRate = j.salaryRate?.trim() || "Negotiable";
    let salaryType = j.salaryType?.trim() || "Negotiable";
    if (salaryType === "After Interview") salaryType = "Negotiable";
    if (!VALID_SALARY.has(salaryType)) salaryType = "Negotiable";

    // Stagger created_at so every row sorts distinctly on /jobs
    const created_at = new Date(now - (jobs.length - 1 - i) * 1000).toISOString();

    return {
      index: i,
      title,
      desc,
      company,
      country,
      city,
      full: {
        employer_id: userId,
        job_title: title,
        job_description: desc,
        company_name: company,
        company_phone: j.companyPhone?.trim() || null,
        company_email: j.companyEmail?.trim() || null,
        company_address: j.companyAddress?.trim() || null,
        country,
        city,
        location,
        work_location: j.workLocation?.trim() || null,
        employment_type: emp,
        duration,
        category: primary,
        categories: cats,
        subcategory: j.subcategory?.trim() || null,
        experience_level:
          j.experienceLevel && j.experienceLevel !== "any"
            ? j.experienceLevel.trim()
            : null,
        positions,
        salary_rate: salaryRate,
        salary_type: salaryType,
        currency: j.currency?.trim() || "SAR",
        office_location_link: j.mapLocation?.trim() || null,
        linked_company_id: teamCoCache.get(company)?.id ?? null,
        status: "approved" as const,
        show_profile_contact: false,
        closed_at: null,
        close_reason: null,
        expires_at: null,
        created_at,
      },
      lean: {
        employer_id: userId,
        job_title: title,
        job_description: desc,
        company_name: company,
        country,
        city,
        location,
        employment_type: emp,
        duration,
        category: primary,
        categories: cats,
        positions,
        salary_rate: salaryRate,
        salary_type: salaryType,
        currency: j.currency?.trim() || "SAR",
        status: "approved" as const,
        closed_at: null,
        expires_at: null,
        created_at,
      },
      minimal: {
        employer_id: userId,
        job_title: title,
        job_description: desc,
        company_name: company,
        location,
        duration,
        category: primary,
        positions,
        salary_rate: salaryRate,
        status: "approved" as const,
        country,
        city,
        employment_type: emp,
        closed_at: null,
        expires_at: null,
        created_at,
      },
    };
  });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!canBulkPost(profile?.role)) {
    return NextResponse.json(
      { error: "Team or admin role required." },
      { status: 403 }
    );
  }

  let body: { jobs?: BulkJob[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const jobs = Array.isArray(body.jobs) ? body.jobs.slice(0, 50) : [];
  if (!jobs.length) {
    return NextResponse.json(
      { error: "Provide jobs: [] (max 50)." },
      { status: 400 }
    );
  }

  const teamCoCache = new Map<string, { id: string; name: string } | null>();
  for (const j of jobs) {
    const name = j.companyName?.trim() || "Hunared Team";
    if (teamCoCache.has(name)) continue;
    const co = await findTeamManagedCompanyByName(supabase, name);
    teamCoCache.set(name, co ? { id: co.id, name: co.name } : null);
  }

  const built = buildJobRows(jobs, userId, teamCoCache);

  const results: {
    index: number;
    ok: boolean;
    id?: string;
    status?: string;
    linkedCompanyId?: string | null;
    linkedCompanyName?: string | null;
    error?: string;
  }[] = [];

  const createdIds: string[] = [];
  const countryById: Record<string, string> = {};

  // Insert ONE BY ONE so one failure never blocks the rest
  for (const item of built) {
    if (!item.title || !item.desc) {
      results.push({
        index: item.index,
        ok: false,
        error: "jobTitle and jobDescription required",
      });
      continue;
    }

    let insertedId: string | null = null;
    let lastError = "";

    for (const row of [item.full, item.lean, item.minimal]) {
      const { data, error } = await supabase
        .from("jobs")
        .insert(row)
        .select("id")
        .single();
      if (!error && data?.id) {
        insertedId = data.id;
        break;
      }
      lastError = error?.message || "insert failed";
    }

    if (!insertedId) {
      results.push({ index: item.index, ok: false, error: lastError });
      continue;
    }

    createdIds.push(insertedId);
    countryById[insertedId] = item.country;
    const teamCo = teamCoCache.get(item.company) ?? null;
    results.push({
      index: item.index,
      ok: true,
      id: insertedId,
      status: "approved",
      linkedCompanyId: teamCo?.id ?? null,
      linkedCompanyName: teamCo?.name ?? null,
    });
  }

  if (createdIds.length) {
    await forceJobsPublic(supabase, createdIds, countryById);
  }

  const created = results.filter((r) => r.ok).length;
  if (created > 0) {
    try {
      revalidatePath("/jobs");
      revalidatePath("/jobs", "layout");
      revalidatePath("/");
      revalidatePath("/dashboard/jobs");
      revalidatePath("/dashboard");
      revalidatePath("/search");
      revalidatePath("/api/jobs");
    } catch {
      /* ignore */
    }
  }

  return NextResponse.json({
    created,
    linked: results.filter((r) => r.linkedCompanyId).length,
    total: jobs.length,
    results,
    ok: created > 0,
    ids: createdIds,
  });
}
