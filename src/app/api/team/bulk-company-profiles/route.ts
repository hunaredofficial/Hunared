import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { canBypassVerification } from "@/lib/roles";
import { slugifyCompany } from "@/lib/team-profiles";
import { GULF_COMPANY_PROFILES } from "@/lib/gulfCompanyProfiles";
import { randomUUID } from "crypto";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const COUNTRY_CODE_MAP: Record<string, string> = {
  "Saudi Arabia": "SA",
  "United Arab Emirates": "AE",
  UAE: "AE",
  Qatar: "QA",
  Kuwait: "KW",
  Bahrain: "BH",
  Oman: "OM",
  Egypt: "EG",
  Jordan: "JO",
  India: "IN",
  Pakistan: "PK",
  "United Kingdom": "GB",
  "United States": "US",
  USA: "US",
  Germany: "DE",
  France: "FR",
  Singapore: "SG",
  Malaysia: "MY",
  Indonesia: "ID",
  Philippines: "PH",
  China: "CN",
  Japan: "JP",
  "South Korea": "KR",
  Australia: "AU",
  Canada: "CA",
  Turkey: "TR",
  Nigeria: "NG",
  Kenya: "KE",
  "South Africa": "ZA",
  Brazil: "BR",
  Mexico: "MX",
};

/**
 * POST /api/team/bulk-company-profiles
 * Body optional: { region?: "gulf" | "worldwide" | "all", limit?: number }
 * Creates team-managed employer profiles + companies (same as Create full profile → Company).
 * Skips company names that already exist (case-insensitive).
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: caller } = await supabase
    .from("profiles")
    .select("id, role, email")
    .eq("id", userId)
    .maybeSingle();

  if (!canBypassVerification(caller?.role)) {
    return NextResponse.json({ error: "Team or admin role required" }, { status: 403 });
  }

  let region: "gulf" | "worldwide" | "all" = "all";
  let limit = 200;
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.region === "gulf" || body?.region === "worldwide" || body?.region === "all") {
      region = body.region;
    }
    if (typeof body?.limit === "number" && body.limit > 0) {
      limit = Math.min(200, Math.floor(body.limit));
    }
  } catch {
    /* empty body ok */
  }

  let list = GULF_COMPANY_PROFILES;
  if (region === "gulf") list = list.filter((c) => c.region === "gulf");
  if (region === "worldwide") list = list.filter((c) => c.region === "worldwide");
  list = list.slice(0, limit);

  const created: string[] = [];
  const skipped: string[] = [];
  const errors: { name: string; error: string }[] = [];

  for (const item of list) {
    const name = (item.company_name || "").trim();
    if (!name) continue;

    try {
      const { data: existingCo } = await supabase
        .from("companies")
        .select("id")
        .ilike("name", name)
        .limit(1)
        .maybeSingle();

      if (existingCo) {
        skipped.push(name);
        continue;
      }

      const placeholderId = `team_${randomUUID().replace(/-/g, "")}`;
      const email =
        item.email?.trim().toLowerCase() ||
        `${placeholderId}@team-managed.hunared.local`;

      let username = (item.username || name)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 24);
      if (username.length < 3) username = `co_${placeholderId.slice(0, 8)}`;

      const { data: userTaken } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();
      if (userTaken) username = `${username}_${placeholderId.slice(-6)}`;

      const location = [item.city, item.country].filter(Boolean).join(", ");
      const industries = item.industries || [];
      const services = item.services || [];

      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .insert({
          id: placeholderId,
          full_name: name,
          role: "employer",
          email,
          phone: item.phone || null,
          username,
          country: item.country || null,
          city: item.city || null,
          location: location || null,
          profession: industries[0] || "Company",
          available_for_hire: false,
          listed_publicly: true,
          phone_verified_at: new Date().toISOString(),
          team_managed: true,
          created_by_team_id: userId,
          company_cr: item.company_cr || null,
          company_website: item.company_website || null,
          company_address: item.company_address || null,
          company_location: location || null,
        })
        .select("id")
        .single();

      if (pErr || !profile) {
        errors.push({ name, error: pErr?.message || "profile insert failed" });
        continue;
      }

      const slugBase = slugifyCompany(name) || "company";
      const slug = `${slugBase}-${placeholderId.slice(-8)}`.slice(0, 60);
      const countryCode =
        (item.country && COUNTRY_CODE_MAP[item.country]) || null;

      const { data: co, error: cErr } = await supabase
        .from("companies")
        .insert({
          owner_id: placeholderId,
          name,
          slug,
          display_name: name,
          website: item.company_website || null,
          about: item.company_about || null,
          short_description: item.short_description || null,
          email: email.endsWith("@team-managed.hunared.local") ? null : email,
          phone: item.phone || null,
          headquarters_country: item.country || null,
          headquarters_country_code: countryCode,
          headquarters_city: item.city || null,
          headquarters_address: item.company_address || null,
          industry: industries,
          services,
          services_count: services.length,
          verification_status: "verified",
          status: "active",
          is_hiring: false,
          is_featured: false,
          team_managed: true,
          created_by_team_id: userId,
        })
        .select("id, name, slug, status")
        .single();

      if (cErr || !co) {
        await supabase.from("profiles").delete().eq("id", placeholderId);
        errors.push({ name, error: cErr?.message || "company insert failed" });
        continue;
      }

      created.push(name);
    } catch (e) {
      errors.push({
        name,
        error: e instanceof Error ? e.message : "unknown error",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    requested: list.length,
    created: created.length,
    skipped: skipped.length,
    failed: errors.length,
    createdNames: created.slice(0, 30),
    skippedNames: skipped.slice(0, 30),
    errors: errors.slice(0, 20),
  });
}
