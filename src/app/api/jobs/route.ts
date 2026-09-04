import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { JOB_CATEGORIES, DURATIONS, SALARY_TYPES } from "@/lib/constants";
import { COUNTRIES } from "@/lib/countries";
import { computeExpiresAt } from "@/lib/expiration";
import type { EmploymentType } from "@/types/database";

const EMPLOYMENT_TYPES = ["permanent", "temporary"] as const;

interface PostJobBody {
  jobTitle: string;
  jobDescription: string;
  positions?: number | null;
  location: string;
  country: string;
  city: string;
  employmentType: string;
  duration: string;
  salaryType: string;
  salaryRate?: string | null;
  currency?: string | null;
  category: string;
  categories?: string[] | null;
  subcategory?: string | null;
  companyName: string;
  companyPhone: string;
  companyEmail?: string | null;
  companyAddress?: string | null;
  mapLocation?: string | null;
  officeAddress?: string | null;
  officeLat?: number | null;
  officeLng?: number | null;
  officeAddress?: string | null;
  showProfileContact?: boolean;
  expiration?: string | null;
  expiresAt?: string | null;
}

/* ── GET: list approved jobs (public) ─────────────────────── */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const country = searchParams.get("country");
  const city = searchParams.get("city");
  const employmentTypeParam = searchParams.get("employmentType");
  const employmentType =
    employmentTypeParam && EMPLOYMENT_TYPES.includes(employmentTypeParam as EmploymentType)
      ? (employmentTypeParam as EmploymentType)
      : null;
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 12;
  const from = (page - 1) * limit;

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();
  let query = supabase
    .from("jobs")
    .select(
      "id, job_title, company_name, location, country, city, employment_type, salary_rate, duration, category, categories, positions, status, expires_at, created_at",
      { count: "exact" }
    )
    .eq("status", "approved")
    .is("closed_at", null)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (category) {
    query = query.or(
      `category.eq.${category},categories.cs.{"${category}"}`
    );
  }
  if (country) query = query.eq("country", country);
  if (city) query = query.ilike("city", `%${city}%`);
  if (employmentType) query = query.eq("employment_type", employmentType);
  if (search) query = query.ilike("job_title", `%${search}%`);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ jobs: data ?? [], total: count ?? 0, page, limit });
}

/* ── POST: create job (employer only) ─────────────────────── */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  // Confirm user is an employer
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, phone_verified_at, phone")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404 }
    );
  }

  if (!["admin", "employer", "seeker", "personal"].includes(profile.role)) {
    return NextResponse.json(
      { error: "You must complete registration before posting jobs." },
      { status: 403 }
    );
  }

  let body: PostJobBody;
  try {
    body = (await req.json()) as PostJobBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate required fields
  if (!body.jobTitle?.trim()) return NextResponse.json({ error: "Job title is required" }, { status: 400 });
  if (!body.jobDescription?.trim()) return NextResponse.json({ error: "Job description is required" }, { status: 400 });
  if (!body.companyName?.trim()) return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  if (!body.companyPhone?.trim() || body.companyPhone.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ error: "A valid company phone number is required to post a job." }, { status: 400 });
  }

  if (!body.country || !COUNTRIES.some((c) => c.code === body.country)) {
    return NextResponse.json({ error: "Invalid country" }, { status: 400 });
  }
  if (!body.city?.trim()) {
    return NextResponse.json({ error: "City is required" }, { status: 400 });
  }
  if (!EMPLOYMENT_TYPES.includes(body.employmentType as (typeof EMPLOYMENT_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid employment type" }, { status: 400 });
  }
  if (!body.location?.trim()) {
    return NextResponse.json({ error: "Location is required" }, { status: 400 });
  }

  const rawDur = String(body.duration ?? "").trim();
  const normalizedDuration = rawDur
    .replace(/^(\d+) Month$/, "$1 Months");
  const durationOk =
    (DURATIONS as readonly string[]).includes(rawDur) ||
    (DURATIONS as readonly string[]).includes(normalizedDuration);
  if (!durationOk) return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
  body.duration = (DURATIONS as readonly string[]).includes(rawDur) ? rawDur : normalizedDuration;
  if (!SALARY_TYPES.includes(body.salaryType as (typeof SALARY_TYPES)[number])) return NextResponse.json({ error: "Invalid salary type" }, { status: 400 });
  if (body.positions != null && body.positions !== "") {
    const n = typeof body.positions === "number" ? body.positions : parseInt(String(body.positions), 10);
    if (isNaN(n) || n < 1) return NextResponse.json({ error: "Invalid positions count" }, { status: 400 });
    body.positions = n;
  } else {
    body.positions = null as unknown as number;
  }

  const rawCats = Array.isArray(body.categories)
    ? body.categories
    : body.category
      ? [body.category]
      : [];
  const categories = [
    ...new Set(
      rawCats
        .map((c) => String(c).trim())
        .filter((c) => (JOB_CATEGORIES as readonly string[]).includes(c))
    ),
  ];
  if (categories.length === 0) {
    return NextResponse.json(
      { error: "At least one valid job category is required" },
      { status: 400 }
    );
  }
  const primaryCategory = categories[0];

  let expiresAt: string | null = null;
  if (body.expiresAt) {
    const t = new Date(body.expiresAt).getTime();
    if (Number.isNaN(t) || t <= Date.now()) {
      return NextResponse.json({ error: "Invalid expiration date" }, { status: 400 });
    }
    expiresAt = new Date(t).toISOString();
  } else if (body.expiration) {
    expiresAt = computeExpiresAt(body.expiration);
  }

  // Check auto-approve setting
  const { data: settings } = await supabase
    .from("site_settings")
    .select("auto_approve_jobs")
    .single();
  const jobStatus = settings?.auto_approve_jobs ? "approved" : "pending";

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      employer_id: userId,
      job_title: body.jobTitle.trim(),
      job_description: body.jobDescription.trim(),
      positions: body.positions ?? null,
      location: body.location.trim(),
      country: body.country,
      city: body.city.trim(),
      employment_type: body.employmentType as EmploymentType,
      duration: body.duration,
      salary_type: body.salaryType,
      salary_rate: body.salaryRate?.trim() ?? null,
      currency: body.currency ?? "SAR",
      category: primaryCategory,
      categories,
      subcategory: body.subcategory ?? null,
      company_name: body.companyName.trim(),
      company_phone: body.companyPhone.trim(),
      company_email: body.companyEmail ?? null,
      company_address: body.companyAddress ?? null,
      office_lat: body.officeLat ?? null,
      office_lng: body.officeLng ?? null,
      office_address: body.mapLocation ?? body.officeAddress ?? null,
      status: jobStatus,
      expires_at: expiresAt,
      show_profile_contact: Boolean(body.showProfileContact),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[POST /api/jobs] Supabase error:", error.message);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}