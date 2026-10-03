import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { canBypassVerification } from "@/lib/roles";
import { slugifyCompany } from "@/lib/team-profiles";
import type { UserRole } from "@/types/database";
import { randomUUID } from "crypto";

async function requireTeam(userId: string) {
  const supabase = createAdminClient();
  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (!canBypassVerification(caller?.role)) return null;
  return { supabase, caller };
}

function parseBody(body: Record<string, unknown>) {
  const role = body.role as UserRole | undefined;
  return {
    role,
    full_name: typeof body.full_name === "string" ? body.full_name.trim() : "",
    username:
      typeof body.username === "string"
        ? body.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "")
        : "",
    email: typeof body.email === "string" ? body.email.trim().toLowerCase() : "",
    phone: typeof body.phone === "string" ? body.phone.trim() : "",
    gender: typeof body.gender === "string" ? body.gender.trim() : "",
    country: typeof body.country === "string" ? body.country.trim() : "",
    city: typeof body.city === "string" ? body.city.trim() : "",
    location: typeof body.location === "string" ? body.location.trim() : "",
    profession: typeof body.profession === "string" ? body.profession.trim() : "",
    skill_level: typeof body.skill_level === "string" ? body.skill_level.trim() : "",
    job_interests: Array.isArray(body.job_interests)
      ? (body.job_interests as string[]).map(String).filter(Boolean)
      : null,
    available_for_hire: Boolean(body.available_for_hire),
    listed_publicly: body.listed_publicly !== false,
    company_name:
      typeof body.company_name === "string" ? body.company_name.trim() : "",
    company_cr: typeof body.company_cr === "string" ? body.company_cr.trim() : "",
    company_website:
      typeof body.company_website === "string" ? body.company_website.trim() : "",
    company_address:
      typeof body.company_address === "string" ? body.company_address.trim() : "",
    company_location:
      typeof body.company_location === "string" ? body.company_location.trim() : "",
    industries: Array.isArray(body.industries)
      ? (body.industries as string[]).map(String).filter(Boolean)
      : null,
    services: Array.isArray(body.services)
      ? (body.services as string[]).map(String).filter(Boolean)
      : null,
    company_about:
      typeof body.company_about === "string" ? body.company_about.trim() : "",
    short_description:
      typeof body.short_description === "string"
        ? body.short_description.trim()
        : "",
    avatar_url:
      typeof body.avatar_url === "string" ? body.avatar_url.trim() : "",
    avatar_public_id:
      typeof body.avatar_public_id === "string"
        ? body.avatar_public_id.trim()
        : "",
  };
}

/**
 * POST — create team-managed profile (no verification)
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await requireTeam(userId);
  if (!ctx) return NextResponse.json({ error: "Team or admin role required." }, { status: 403 });
  const { supabase } = ctx;

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const body = parseBody(raw);
  const role = body.role;
  if (!role || !["seeker", "employer", "personal"].includes(role)) {
    return NextResponse.json({ error: "role must be seeker, employer, or personal" }, { status: 400 });
  }
  if (!body.full_name) {
    return NextResponse.json({ error: "full_name is required" }, { status: 400 });
  }
  if (role === "employer" && !body.company_name) {
    return NextResponse.json({ error: "company_name is required for Company profiles" }, { status: 400 });
  }

  const placeholderId = `team_${randomUUID().replace(/-/g, "")}`;
  const email = body.email || `${placeholderId}@team-managed.hunared.local`;
  let username = body.username.length >= 3 ? body.username : null;
  if (username) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (existing) username = `${username}_${placeholderId.slice(-4)}`;
  }

  const row: Record<string, unknown> = {
    id: placeholderId,
    full_name: body.full_name,
    role,
    email,
    phone: body.phone || null,
    gender: body.gender || null,
    username,
    country: body.country || null,
    city: body.city || null,
    location:
      body.location ||
      [body.city, body.country].filter(Boolean).join(", ") ||
      null,
    profession: body.profession || null,
    skill_level: body.skill_level || null,
    job_interests: role === "seeker" ? body.job_interests : null,
    available_for_hire: role === "seeker" ? body.available_for_hire : false,
    listed_publicly: body.listed_publicly,
    phone_verified_at: new Date().toISOString(),
    team_managed: true,
    created_by_team_id: userId,
    company_cr: role === "employer" ? body.company_cr || null : null,
    company_website: role === "employer" ? body.company_website || null : null,
    company_address: role === "employer" ? body.company_address || null : null,
    company_location: role === "employer" ? body.company_location || null : null,
    avatar_url: body.avatar_url || null,
    avatar_public_id: body.avatar_public_id || null,
  };

  const { data: profile, error } = await supabase
    .from("profiles")
    .insert(row)
    .select(
      "id, full_name, role, email, phone, username, profession, city, country, avatar_url, team_managed"
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let company = null;
  if (role === "employer") {
    const name = body.company_name;
    const slug = `${slugifyCompany(name)}-${placeholderId.slice(-8)}`.slice(0, 60);
    const { data: co, error: coErr } = await supabase
      .from("companies")
      .insert({
        owner_id: placeholderId,
        name,
        slug,
        display_name: name,
        website: body.company_website || null,
        about: body.company_about || null,
        short_description: body.short_description || null,
        email: body.email || null,
        phone: body.phone || null,
        headquarters_country: body.country || null,
        headquarters_city: body.city || null,
        headquarters_address: body.company_address || null,
        industry: body.industries,
        services: body.services,
        verification_status: "verified",
        status: "active",
        team_managed: true,
        created_by_team_id: userId,
        logo_url: body.avatar_url || null,
        logo_public_id: body.avatar_public_id || null,
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

/**
 * PATCH — edit existing team-managed profile
 * Body must include id of the team profile.
 */
export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await requireTeam(userId);
  if (!ctx) return NextResponse.json({ error: "Team or admin role required." }, { status: 403 });
  const { supabase, caller } = ctx;

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, role, team_managed, created_by_team_id, email")
    .eq("id", id)
    .maybeSingle();

  if (!existing?.team_managed) {
    return NextResponse.json({ error: "Only team-managed profiles can be edited here." }, { status: 403 });
  }
  if (caller?.role === "team" && existing.created_by_team_id !== userId) {
    return NextResponse.json({ error: "You can only edit profiles your team created." }, { status: 403 });
  }

  const body = parseBody(raw);
  if (!body.full_name) {
    return NextResponse.json({ error: "full_name is required" }, { status: 400 });
  }

  // Keep role of existing profile (don't switch seeker↔employer via edit without care)
  const role = (existing.role as UserRole) || body.role;

  let username =
    body.username.length >= 3 ? body.username : null;
  if (username) {
    const { data: clash } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", id)
      .maybeSingle();
    if (clash) username = `${username}_${id.slice(-4)}`;
  }

  const email =
    body.email ||
    (existing.email?.includes("@team-managed.")
      ? existing.email
      : body.email) ||
    existing.email;

  const update: Record<string, unknown> = {
    full_name: body.full_name,
    email: email || existing.email,
    phone: body.phone || null,
    gender: body.gender || null,
    username,
    country: body.country || null,
    city: body.city || null,
    location:
      body.location ||
      [body.city, body.country].filter(Boolean).join(", ") ||
      null,
    profession: body.profession || null,
    skill_level: body.skill_level || null,
    job_interests: role === "seeker" ? body.job_interests : null,
    available_for_hire: role === "seeker" ? body.available_for_hire : false,
    listed_publicly: body.listed_publicly,
    company_cr: role === "employer" ? body.company_cr || null : null,
    company_website: role === "employer" ? body.company_website || null : null,
    company_address: role === "employer" ? body.company_address || null : null,
    company_location: role === "employer" ? body.company_location || null : null,
  };

  if (body.avatar_url) {
    update.avatar_url = body.avatar_url;
    update.avatar_public_id = body.avatar_public_id || null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", id)
    .select(
      "id, full_name, role, email, phone, username, profession, city, country, avatar_url, team_managed"
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (role === "employer") {
    const coUpdate: Record<string, unknown> = {
      name: body.company_name || undefined,
      display_name: body.company_name || undefined,
      website: body.company_website || null,
      about: body.company_about || null,
      short_description: body.short_description || null,
      email: body.email || null,
      phone: body.phone || null,
      headquarters_country: body.country || null,
      headquarters_city: body.city || null,
      headquarters_address: body.company_address || null,
      industry: body.industries,
      services: body.services,
    };
    if (body.avatar_url) {
      coUpdate.logo_url = body.avatar_url;
      coUpdate.logo_public_id = body.avatar_public_id || null;
    }
    // Remove undefined name if empty
    if (!body.company_name) {
      delete coUpdate.name;
      delete coUpdate.display_name;
    }
    await supabase.from("companies").update(coUpdate).eq("owner_id", id);
  }

  return NextResponse.json({ ok: true, profile });
}

/**
 * GET — list team profiles, or ?id= for one full record + company
 */
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await requireTeam(userId);
  if (!ctx) return NextResponse.json({ error: "Team or admin role required." }, { status: 403 });
  const { supabase, caller } = ctx;

  const id = new URL(req.url).searchParams.get("id");

  if (id) {
    let q = supabase
      .from("profiles")
      .select(
        "id, full_name, role, email, phone, gender, username, country, city, location, profession, skill_level, job_interests, available_for_hire, listed_publicly, company_cr, company_website, company_address, company_location, avatar_url, avatar_public_id, team_managed, created_by_team_id, created_at"
      )
      .eq("id", id)
      .eq("team_managed", true)
      .maybeSingle();

    const { data: profile, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (caller?.role === "team" && profile.created_by_team_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let company = null;
    if (profile.role === "employer") {
      const { data: co } = await supabase
        .from("companies")
        .select(
          "id, name, website, about, short_description, industry, services, logo_url"
        )
        .eq("owner_id", id)
        .maybeSingle();
      company = co;
    }

    return NextResponse.json({ profile, company });
  }

  let listQ = supabase
    .from("profiles")
    .select(
      "id, full_name, role, email, phone, city, country, profession, username, avatar_url, team_managed, created_at"
    )
    .eq("team_managed", true)
    .order("created_at", { ascending: false })
    .limit(100);

  if (caller?.role === "team") {
    listQ = listQ.eq("created_by_team_id", userId);
  }

  const { data, error } = await listQ;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profiles: data ?? [] });
}
