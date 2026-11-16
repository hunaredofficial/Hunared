import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { canBulkPost } from "@/lib/roles";
import { findTeamManagedCompanyByName } from "@/lib/team-profiles";
import { JOB_CATEGORIES } from "@/lib/constants";

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

function normalizeCategories(j: BulkJob): string[] {
  const raw = (
    j.categories?.length ? j.categories : j.category ? [j.category] : []
  )
    .map((c) => String(c).trim())
    .filter(Boolean);
  const valid = [...new Set(raw.filter((c) => VALID_CATS.has(c)))];
  // Prefer a real category; fall back to first catalog entry so NOT NULL + public filters work
  if (valid.length) return valid;
  return [JOB_CATEGORIES[0] || "engineering"];
}

function normalizePositions(v: string | number | undefined | null): number | null {
  if (v == null || String(v).trim() === "") return null;
  const n = typeof v === "number" ? v : parseInt(String(v).replace(/[^\d]/g, ""), 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return n;
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
    const emp =
      empRaw === "temporary" ||
      empRaw === "task_force" ||
      (durationRaw && durationRaw.toLowerCase() !== "permanent")
        ? "temporary"
        : "permanent";
    const duration =
      durationRaw || (emp === "permanent" ? "Permanent" : "UnSpecified");

    const positions = normalizePositions(j.positions);
    const city = j.city?.trim() || null;
    const country = j.country?.trim() || null;
    const location =
      j.location?.trim() ||
      j.workLocation?.trim() ||
      city ||
      "Remote";

    // salary_rate may still be NOT NULL on older DBs — never send null
    const salaryRate = j.salaryRate?.trim() || "Negotiable";
    const salaryType = j.salaryType?.trim() || "After Interview";

    const teamCo = await findTeamManagedCompanyByName(supabase, company);

    // Full row matching single-post API (with safe defaults)
    const fullRow: Record<string, unknown> = {
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
      // Prefer null when column is nullable; fallback retry uses 1
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
    };

    let { data, error } = await supabase
      .from("jobs")
      .insert(fullRow)
      .select("id")
      .single();

    // Retry without optional / newer columns if schema is stricter
    if (error) {
      const slim: Record<string, unknown> = {
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
        positions: positions ?? 1,
        salary_rate: salaryRate,
        salary_type: salaryType,
        currency: j.currency?.trim() || "SAR",
        status: "approved",
      };
      const retry = await supabase.from("jobs").insert(slim).select("id").single();
      data = retry.data;
      error = retry.error;
    }

    // Last-chance: minimal columns from original schema
    if (error) {
      const minimal: Record<string, unknown> = {
        employer_id: userId,
        job_title: title,
        job_description: desc,
        positions: positions ?? 1,
        location,
        duration,
        salary_rate: salaryRate,
        category: primary,
        company_name: company,
        status: "approved",
      };
      const retry2 = await supabase.from("jobs").insert(minimal).select("id").single();
      data = retry2.data;
      error = retry2.error;
    }

    if (error) {
      results.push({ index: i, ok: false, error: error.message });
    } else {
      results.push({
        index: i,
        ok: true,
        id: data?.id,
        linkedCompanyId: teamCo?.id ?? null,
        linkedCompanyName: teamCo?.name ?? null,
      });
    }
  }

  const created = results.filter((r) => r.ok).length;
  const linked = results.filter((r) => r.linkedCompanyId).length;
  return NextResponse.json({
    created,
    linked,
    total: jobs.length,
    results,
    ok: created > 0,
  });
}
