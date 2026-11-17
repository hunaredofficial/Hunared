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

/** Force a job row to be publicly listable. Returns true if status is approved. */
async function forcePublicVisible(
  supabase: ReturnType<typeof createAdminClient>,
  id: string,
  country: string
): Promise<{ ok: boolean; status?: string; error?: string }> {
  const patch = {
    status: "approved" as const,
    closed_at: null,
    close_reason: null,
    expires_at: null,
    country,
  };

  const { error: upErr } = await supabase.from("jobs").update(patch).eq("id", id);
  if (upErr) {
    // Retry without close_reason in case column is missing on older DBs
    const { error: upErr2 } = await supabase
      .from("jobs")
      .update({
        status: "approved",
        closed_at: null,
        expires_at: null,
        country,
      })
      .eq("id", id);
    if (upErr2) {
      return { ok: false, error: upErr2.message || upErr.message };
    }
  }

  const { data: row, error: selErr } = await supabase
    .from("jobs")
    .select("id, status, closed_at, expires_at, country")
    .eq("id", id)
    .maybeSingle();

  if (selErr || !row) {
    return { ok: false, error: selErr?.message || "verify failed" };
  }

  const visible =
    row.status === "approved" &&
    (row.closed_at == null || row.closed_at === undefined);

  return {
    ok: visible,
    status: row.status,
    error: visible ? undefined : `status=${row.status} closed_at=${row.closed_at}`,
  };
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!canBulkPost(profile?.role)) {
    return NextResponse.json({ error: "Team or admin role required." }, { status: 403 });
  }

  let body: { jobs?: BulkJob[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const jobs = Array.isArray(body.jobs) ? body.jobs.slice(0, 50) : [];
  if (!jobs.length) {
    return NextResponse.json({ error: "Provide jobs: [] (max 50)." }, { status: 400 });
  }

  const results: {
    index: number;
    ok: boolean;
    id?: string;
    status?: string;
    linkedCompanyId?: string | null;
    linkedCompanyName?: string | null;
    error?: string;
  }[] = [];

  for (let i = 0; i < jobs.length; i++) {
    const j = jobs[i];
    const title = j.jobTitle?.trim();
    const desc = j.jobDescription?.trim();
    const company = j.companyName?.trim() || "Hunared Team";
    if (!title || !desc) {
      results.push({ index: i, ok: false, error: "jobTitle and jobDescription required" });
      continue;
    }

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
    // Default SA so geo-filtered /jobs?country=SA still shows team posts
    const country = (j.country?.trim() || "SA").toUpperCase().slice(0, 2);
    const location =
      j.location?.trim() ||
      j.workLocation?.trim() ||
      (city ? `${city}` : "Remote");

    const salaryRate = j.salaryRate?.trim() || "Negotiable";
    let salaryType = j.salaryType?.trim() || "Negotiable";
    if (salaryType === "After Interview") salaryType = "Negotiable";
    if (!VALID_SALARY.has(salaryType)) salaryType = "Negotiable";

    const teamCo = await findTeamManagedCompanyByName(supabase, company);

    // Richest → leanest so insert succeeds across schema variants
    const attempts: Record<string, unknown>[] = [
      {
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
        linked_company_id: teamCo?.id ?? null,
        status: "approved",
        show_profile_contact: false,
        closed_at: null,
        close_reason: null,
        expires_at: null,
      },
      {
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
        employment_type: emp,
        duration,
        category: primary,
        categories: cats,
        subcategory: j.subcategory?.trim() || null,
        positions,
        salary_rate: salaryRate,
        salary_type: salaryType,
        currency: j.currency?.trim() || "SAR",
        status: "approved",
        closed_at: null,
        expires_at: null,
      },
      {
        employer_id: userId,
        job_title: title,
        job_description: desc,
        positions,
        location,
        duration,
        salary_rate: salaryRate,
        category: primary,
        company_name: company,
        status: "approved",
        country,
        city,
        employment_type: emp,
      },
    ];

    let insertedId: string | null = null;
    let lastError = "";

    for (const row of attempts) {
      const { data, error } = await supabase
        .from("jobs")
        .insert(row)
        .select("id, status")
        .single();
      if (!error && data?.id) {
        insertedId = data.id;
        break;
      }
      lastError = error?.message || "insert failed";
    }

    if (!insertedId) {
      results.push({ index: i, ok: false, error: lastError });
      continue;
    }

    // Always force public visibility (counters DB triggers / defaults that set pending)
    const vis = await forcePublicVisible(supabase, insertedId, country);
    if (!vis.ok) {
      results.push({
        index: i,
        ok: false,
        id: insertedId,
        status: vis.status,
        error: vis.error || "created but not publicly visible",
      });
      continue;
    }

    results.push({
      index: i,
      ok: true,
      id: insertedId,
      status: "approved",
      linkedCompanyId: teamCo?.id ?? null,
      linkedCompanyName: teamCo?.name ?? null,
    });
  }

  const created = results.filter((r) => r.ok).length;
  if (created > 0) {
    try {
      revalidatePath("/jobs");
      revalidatePath("/");
      revalidatePath("/dashboard/jobs");
      revalidatePath("/search");
      revalidatePath("/dashboard");
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
  });
}
