import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { canBulkPost } from "@/lib/roles";

type BulkJob = {
  jobTitle?: string;
  jobDescription?: string;
  companyName?: string;
  companyPhone?: string;
  country?: string;
  city?: string;
  location?: string;
  employmentType?: string;
  duration?: string;
  category?: string;
  categories?: string[];
};

/**
 * POST /api/team/bulk-jobs
 * Body: { jobs: BulkJob[] }
 * Staff only (admin | team). Creates multiple jobs; auto-approved for staff.
 */
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

  const results: { index: number; ok: boolean; id?: string; error?: string }[] = [];

  for (let i = 0; i < jobs.length; i++) {
    const j = jobs[i];
    const title = j.jobTitle?.trim();
    const desc = j.jobDescription?.trim();
    const company = j.companyName?.trim() || "Hunared Team";
    if (!title || !desc) {
      results.push({ index: i, ok: false, error: "jobTitle and jobDescription required" });
      continue;
    }
    const cats = (j.categories?.length ? j.categories : j.category ? [j.category] : ["other"])
      .map((c) => String(c).trim())
      .filter(Boolean);
    const primary = cats[0] || "other";

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        employer_id: userId,
        job_title: title,
        job_description: desc,
        company_name: company,
        company_phone: j.companyPhone?.trim() || null,
        country: j.country?.trim() || null,
        city: j.city?.trim() || null,
        location: j.location?.trim() || j.city?.trim() || "Remote",
        employment_type: j.employmentType === "temporary" ? "temporary" : "permanent",
        duration: j.duration?.trim() || "Permanent",
        category: primary,
        categories: cats,
        status: "approved",
      })
      .select("id")
      .single();

    if (error) {
      results.push({ index: i, ok: false, error: error.message });
    } else {
      results.push({ index: i, ok: true, id: data?.id });
    }
  }

  const created = results.filter((r) => r.ok).length;
  return NextResponse.json({ created, total: jobs.length, results });
}
