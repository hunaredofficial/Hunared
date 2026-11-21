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
 * Creates team-managed company profiles the same way as manual Create full profile.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized — sign in as team" }, { status: 401 });
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Supabase admin client failed" },
      { status: 500 }
    );
  }

  const { data: caller, error: callerErr } = await supabase
    .from("profiles")
    .select("id, role, email")
    .eq("id", userId)
    .maybeSingle();

  if (callerErr) {
    return NextResponse.json({ error: `Caller lookup: ${callerErr.message}` }, { status: 500 });
  }
  if (!canBypassVerification(caller?.role)) {
    return NextResponse.json(
      { error: `Team or admin role required (your role: ${caller?.role || "none"})` },
      { status: 403 }
    );
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
    /* ok */
  }

  let list = [...GULF_COMPANY_PROFILES];
  if (region === "gulf") list = list.filter((c) => (c as { region?: string }).region === "gulf");
  if (region === "worldwide")
    list = list.filter((c) => (c as { region?: string }).region === "worldwide");
  list = list.slice(0, limit);

  if (!list.length) {
    return NextResponse.json({ error: "No companies in seed list", requested: 0 }, { status: 500 });
  }

  const created: string[] = [];
  const skipped: string[] = [];
  const errors: { name: string; step: string; error: string }[] = [];

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
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
      const email = `team_${placeholderId.slice(-12)}@team-managed.hunared.local`;

      let username = (item.username || `co${i}`)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20);
      if (username.length < 3) username = `co_${placeholderId.slice(0, 8)}`;
      username = `${username}_${placeholderId.slice(-4)}`;

      const location = [item.city, item.country].filter(Boolean).join(", ");
      const industries = Array.isArray(item.industries) ? item.industries : [];
      const services = Array.isArray(item.services) ? item.services : [];

      const profileRow: Record<string, unknown> = {
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
      };

      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .insert(profileRow)
        .select("id")
        .single();

      if (pErr || !profile) {
        errors.push({
          name,
          step: "profile",
          error: pErr?.message || "profile insert returned null",
        });
        if (errors.length >= 15) break;
        continue;
      }

      const slug = `${slugifyCompany(name)}-${placeholderId.slice(-8)}`.slice(0, 60);
      const countryCode = (item.country && COUNTRY_CODE_MAP[item.country]) || null;

      const companyRow: Record<string, unknown> = {
        owner_id: placeholderId,
        name,
        slug,
        display_name: name,
        website: item.company_website || null,
        about: item.company_about || null,
        short_description: item.short_description || null,
        email: null,
        phone: item.phone || null,
        headquarters_country: item.country || null,
        headquarters_city: item.city || null,
        headquarters_address: item.company_address || null,
        industry: industries,
        services,
        verification_status: "verified",
        status: "active",
        team_managed: true,
        created_by_team_id: userId,
      };
      if (countryCode) companyRow.headquarters_country_code = countryCode;
      if (services.length) companyRow.services_count = services.length;

      const { data: co, error: cErr } = await supabase
        .from("companies")
        .insert(companyRow)
        .select("id, name, status")
        .single();

      if (cErr || !co) {
        await supabase.from("profiles").delete().eq("id", placeholderId);
        errors.push({
          name,
          step: "company",
          error: cErr?.message || "company insert returned null",
        });
        if (errors.length >= 15) break;
        continue;
      }

      created.push(name);
    } catch (e) {
      errors.push({
        name,
        step: "exception",
        error: e instanceof Error ? e.message : String(e),
      });
      if (errors.length >= 15) break;
    }
  }

  return NextResponse.json({
    ok: created.length > 0 || skipped.length > 0,
    requested: list.length,
    created: created.length,
    skipped: skipped.length,
    failed: errors.length,
    createdNames: created.slice(0, 20),
    errors,
    hint:
      created.length === 0 && errors.length > 0
        ? "DB rejected inserts — see errors[0]. Fix that constraint/column first."
        : created.length === 0 && skipped.length === list.length
          ? "All names already exist in companies table."
          : undefined,
  });
}
