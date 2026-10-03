import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { canBypassVerification } from "@/lib/roles";
import { slugifyCompany } from "@/lib/team-profiles";
import type { UserRole } from "@/types/database";
import { randomUUID } from "crypto";

/**
 * Team/Admin creates candidate or company profiles without email/phone verification.
 * Generates a placeholder profile id when Clerk id is not provided.
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
    email?: string;
    phone?: string;
    country?: string;
    city?: string;
    location?: string;
    profession?: string;
    company_name?: string;
    company_website?: string;
    company_about?: string;
    listed_publicly?: boolean;
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
    return NextResponse.json({ error: "company_name is required for Company profiles" }, { status: 400 });
  }

  const placeholderId = `team_${randomUUID().replace(/-/g, "")}`;
  const email =
    body.email?.trim().toLowerCase() ||
    `${placeholderId}@team-managed.hunared.local`;

  const row = {
    id: placeholderId,
    full_name: body.full_name.trim(),
    role,
    email,
    phone: body.phone?.trim() || null,
    country: body.country?.trim() || null,
    city: body.city?.trim() || null,
    location: body.location?.trim() || null,
    profession: body.profession?.trim() || null,
    listed_publicly: body.listed_publicly !== false,
    available_for_hire: role === "seeker",
    phone_verified_at: new Date().toISOString(),
    team_managed: true,
    created_by_team_id: userId,
  };

  const { data: profile, error } = await supabase
    .from("profiles")
    .insert(row)
    .select("id, full_name, role, email, phone, team_managed")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let company = null;
  if (role === "employer") {
    const name = body.company_name!.trim();
    const base = slugifyCompany(name);
    const slug = `${base}-${placeholderId.slice(-8)}`.slice(0, 60);
    const { data: co, error: coErr } = await supabase
      .from("companies")
      .insert({
        owner_id: placeholderId,
        name,
        slug,
        display_name: name,
        website: body.company_website?.trim() || null,
        about: body.company_about?.trim() || null,
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        headquarters_country: body.country?.trim() || null,
        headquarters_city: body.city?.trim() || null,
        verification_status: "verified",
        status: "active",
        team_managed: true,
        created_by_team_id: userId,
      })
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

/** List team-managed profiles created by current team (or all for admin). */
export async function GET(req: Request) {
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
    .select("id, full_name, role, email, phone, city, country, profession, team_managed, created_at")
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
