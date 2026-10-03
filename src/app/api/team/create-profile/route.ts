import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { canBypassVerification } from "@/lib/roles";
import { slugifyCompany } from "@/lib/team-profiles";
import type { UserRole } from "@/types/database";
import { randomUUID } from "crypto";

/**
 * Team/Admin creates full candidate or company profiles
 * (same field surface as signup/profile) without verification.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!canBypassVerification(caller?.role)) {
    return NextResponse.json({ error: "Team or admin role required." }, { status: 403 });
  }

  let body: {
    full_name?: string;
    role?: UserRole;
    username?: string;
    email?: string;
    phone?: string;
    gender?: string;
    country?: string;
    city?: string;
    location?: string;
    profession?: string;
    skill_level?: string;
    job_interests?: string[];
    available_for_hire?: boolean;
    listed_publicly?: boolean;
    company_name?: string;
    company_cr?: string;
    company_website?: string;
    company_address?: string;
    company_location?: string;
    industries?: string[];
    services?: string[];
    company_about?: string;
    short_description?: string;
    avatar_url?: string;
    avatar_public_id?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const role = body.role;
  if (!role || !["seeker", "employer", "personal"].includes(role)) {
    return NextResponse.json(
      { error: "role must be seeker, employer, or personal" },
      { status: 400 }
    );
  }
  if (!body.full_name?.trim()) {
    return NextResponse.json({ error: "full_name is required" }, { status: 400 });
  }
  if (role === "employer" && !body.company_name?.trim()) {
    return NextResponse.json(
      { error: "company_name is required for Company profiles" },
      { status: 400 }
    );
  }

  const placeholderId = `team_${randomUUID().replace(/-/g, "")}`;
  const email =
    body.email?.trim().toLowerCase() ||
    `${placeholderId}@team-managed.hunared.local`;

  let username =
    body.username?.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") || null;
  if (username && username.length < 3) username = null;
  // Ensure unique username when provided
  if (username) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (existing) {
      username = `${username}_${placeholderId.slice(-4)}`;
    }
  }

  const row: Record<string, unknown> = {
    id: placeholderId,
    full_name: body.full_name.trim(),
    role,
    email,
    phone: body.phone?.trim() || null,
    gender: body.gender?.trim() || null,
    username,
    country: body.country?.trim() || null,
    city: body.city?.trim() || null,
    location:
      body.location?.trim() ||
      [body.city?.trim(), body.country?.trim()].filter(Boolean).join(", ") ||
      null,
    profession: body.profession?.trim() || null,
    skill_level: body.skill_level?.trim() || null,
    job_interests:
      role === "seeker" && Array.isArray(body.job_interests)
        ? body.job_interests
        : null,
    available_for_hire: role === "seeker" ? Boolean(body.available_for_hire) : false,
    listed_publicly: body.listed_publicly !== false,
    phone_verified_at: new Date().toISOString(),
    team_managed: true,
    created_by_team_id: userId,
    avatar_url: body.avatar_url?.trim() || null,
    avatar_public_id: body.avatar_public_id?.trim() || null,
    company_cr: role === "employer" ? body.company_cr?.trim() || null : null,
    company_website: role === "employer" ? body.company_website?.trim() || null : null,
    company_address: role === "employer" ? body.company_address?.trim() || null : null,
  };

  // company_location may exist as extra column
  if (role === "employer" && body.company_location?.trim()) {
    row.company_location = body.company_location.trim();
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .insert(row)
    .select(
      "id, full_name, role, email, phone, username, profession, city, country, team_managed"
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let company = null;
  if (role === "employer") {
    const name = body.company_name!.trim();
    const base = slugifyCompany(name);
    const slug = `${base}-${placeholderId.slice(-8)}`.slice(0, 60);
    const industries = Array.isArray(body.industries) ? body.industries : null;
    const services = Array.isArray(body.services) ? body.services : null;

    const coInsert: Record<string, unknown> = {
      owner_id: placeholderId,
      name,
      slug,
      display_name: name,
      website: body.company_website?.trim() || null,
      about: body.company_about?.trim() || null,
      short_description: body.short_description?.trim() || null,
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      headquarters_country: body.country?.trim() || null,
      headquarters_city: body.city?.trim() || null,
      headquarters_address: body.company_address?.trim() || null,
      industry: industries,
      services,
      verification_status: "verified",
      status: "active",
      team_managed: true,
      created_by_team_id: userId,
      logo_url: body.avatar_url?.trim() || null,
      logo_public_id: body.avatar_public_id?.trim() || null,
    };

    const { data: co, error: coErr } = await supabase
      .from("companies")
      .insert(coInsert)
      .select("id, name, slug, team_managed")
      .single();

    if (coErr) {
      return NextResponse.json(
        { error: `Profile created but company failed: ${coErr.message}`, profile },
        { status: 500 }
      );
    }
    company = co;
  }

  return NextResponse.json({ ok: true, profile, company });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!canBypassVerification(caller?.role)) {
    return NextResponse.json({ error: "Team or admin role required." }, { status: 403 });
  }

  let q = supabase
    .from("profiles")
    .select(
      "id, full_name, role, email, phone, city, country, profession, username, avatar_url, team_managed, created_at"
    )
    .eq("team_managed", true)
    .order("created_at", { ascending: false })
    .limit(100);

  if (caller?.role === "team") {
    q = q.eq("created_by_team_id", userId);
  }

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profiles: data ?? [] });
}
