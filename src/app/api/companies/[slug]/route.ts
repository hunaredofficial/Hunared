import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

/**
 * GET /api/companies/[slug]
 * Public company profile by slug (only active / listed companies).
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("companies" as any)
      .select(
        `id, slug, name, logo_url, short_description, about, company_type,
         industry, services, business_size, employee_range, founded_year,
         status, verification_status, is_featured, is_premium, is_hiring,
         headquarters_country, headquarters_country_code, headquarters_city,
         headquarters_address, website, email, phone, whatsapp, social_links,
         rating_avg, reviews_count, followers_count, jobs_count,
         services_count, locations, created_at, updated_at, owner_id`
      )
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("[api/companies/slug]", error);
      return NextResponse.json(
        { error: error.message || "Failed to load company" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Map to public shape used by CompanyProfile
    let logoUrl = data.logo_url ?? null;

    // Fallback: use owner profile avatar when company has no logo
    if (!logoUrl && data.owner_id) {
      const { data: owner } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", data.owner_id)
        .maybeSingle();
      if (owner?.avatar_url) logoUrl = owner.avatar_url;
    }

    const company = {
      ...data,
      logo_url: logoUrl,
      public_email: data.email ?? null,
      public_phone: data.phone ?? null,
      is_verified: data.verification_status === "verified",
      employee_count: data.employee_range ?? null,
    };

    return NextResponse.json({ company });
  } catch (e) {
    console.error("[api/companies/slug]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
