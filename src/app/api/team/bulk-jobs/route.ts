import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { canBulkPost } from "@/lib/roles";
import { findTeamManagedCompanyByName } from "@/lib/team-profiles";

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
  positions?: string | number;
  salaryRate?: string;
  salaryType?: string;
  currency?: string;
  mapLocation?: string;
};

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
    const cats = (
      j.categories?.length ? j.categories : j.category ? [j.category] : ["other"]
    )
      .map((c) => String(c).trim())
      .filter(Boolean);
    const primary = cats[0] || "other";

    const emp =
      j.employmentType === "temporary" ||
      (j.duration && j.duration !== "Permanent")
        ? "temporary"
        : "permanent";

    const teamCo = await findTeamManagedCompanyByName(supabase, company);

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        employer_id: userId,
        job_title: title,
        job_description: desc,
        company_name: company,
        company_phone: j.companyPhone?.trim() || null,
        company_email: j.companyEmail?.trim() || null,
        company_address: j.companyAddress?.trim() || null,
        country: j.country?.trim() || null,
        city: j.city?.trim() || null,
        location:
          j.location?.trim() ||
          j.workLocation?.trim() ||
          j.city?.trim() ||
          "Remote",
        work_location: j.workLocation?.trim() || null,
        employment_type: emp,
        duration: j.duration?.trim() || (emp === "permanent" ? "Permanent" : "UnSpecified"),
        category: primary,
        categories: cats,
        positions: j.positions != null && String(j.positions).trim() !== ""
          ? Number(j.positions) || String(j.positions)
          : null,
        salary_rate: j.salaryRate?.trim() || null,
        salary_type: j.salaryType?.trim() || null,
        currency: j.currency?.trim() || null,
        map_location: j.mapLocation?.trim() || null,
        status: "approved",
        linked_company_id: teamCo?.id ?? null,
        show_profile_contact: false,
      })
      .select("id")
      .single();

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
  return NextResponse.json({ created, linked, total: jobs.length, results });
}
