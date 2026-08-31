import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

/**
 * GET /api/companies
 * Server-side company directory search & filters.
 * Query params:
 *   q, page, limit, sort
 *   type (comma), industry (comma), services (comma)
 *   size, employees, status, country, city
 *   verified, featured, hiring, max_services
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const q = (sp.get("q") || "").trim();
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(sp.get("limit") || "12", 10) || 12));
    const sort = sp.get("sort") || "relevant";
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const types = (sp.get("type") || "").split(",").map((s) => s.trim()).filter(Boolean);
    const industries = (sp.get("industry") || "").split(",").map((s) => s.trim()).filter(Boolean);
    const services = (sp.get("services") || "").split(",").map((s) => s.trim()).filter(Boolean);
    const size = sp.get("size") || "";
    const employees = sp.get("employees") || "";
    const status = sp.get("status") || "";
    const country = sp.get("country") || "";
    const city = (sp.get("city") || "").trim();
    const verified = sp.get("verified") === "1" || sp.get("verified") === "true";
    const featured = sp.get("featured") === "1" || sp.get("featured") === "true";
    const hiring = sp.get("hiring") === "1" || sp.get("hiring") === "true";
    const maxServices = parseInt(sp.get("max_services") || "", 10);

    const supabase = createAdminClient();

    let query = supabase
      .from("companies" as any)
      .select(
        `id, slug, name, logo_url, short_description, about, company_type,
         industry, services, business_size, employee_range, founded_year,
         status, verification_status, is_featured, is_premium, is_hiring,
         headquarters_country, headquarters_country_code, headquarters_city,
         website, rating_avg, reviews_count, followers_count, jobs_count,
         services_count, created_at, updated_at`,
        { count: "exact" }
      )
      .eq("status", "active");

    if (q) {
      // Basic ilike on name + about; expand with full-text later
      query = query.or(
        `name.ilike.%${q}%,about.ilike.%${q}%,short_description.ilike.%${q}%,headquarters_city.ilike.%${q}%`
      );
    }
    if (types.length === 1) query = query.eq("company_type", types[0]);
    else if (types.length > 1) query = query.in("company_type", types);

    if (industries.length) query = query.overlaps("industry", industries);
    if (services.length) query = query.overlaps("services", services);

    if (size) query = query.eq("business_size", size);
    if (employees) query = query.eq("employee_range", employees);
    if (status === "verified") query = query.eq("verification_status", "verified");
    else if (status && status !== "active") query = query.eq("status", status);

    if (country) {
      query = query.or(
        `headquarters_country_code.eq.${country},headquarters_country.ilike.%${country}%`
      );
    }
    if (city) query = query.ilike("headquarters_city", `%${city}%`);

    if (verified) query = query.eq("verification_status", "verified");
    if (featured) query = query.eq("is_featured", true);
    if (hiring) query = query.eq("is_hiring", true);
    if (!Number.isNaN(maxServices) && maxServices > 0) {
      query = query.lte("services_count", maxServices);
    }

    switch (sort) {
      case "az":
        query = query.order("name", { ascending: true });
        break;
      case "za":
        query = query.order("name", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "recently_updated":
        query = query.order("updated_at", { ascending: false });
        break;
      case "most_followed":
        query = query.order("followers_count", { ascending: false });
        break;
      case "highest_rated":
        query = query.order("rating_avg", { ascending: false });
        break;
      case "most_jobs":
        query = query.order("jobs_count", { ascending: false });
        break;
      case "most_services":
        query = query.order("services_count", { ascending: false });
        break;
      case "verified_first":
        query = query
          .order("verification_status", { ascending: false })
          .order("rating_avg", { ascending: false });
        break;
      case "hiring":
        query = query
          .order("is_hiring", { ascending: false })
          .order("jobs_count", { ascending: false });
        break;
      default:
        query = query
          .order("is_featured", { ascending: false })
          .order("verification_status", { ascending: false })
          .order("rating_avg", { ascending: false });
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error("[api/companies]", error);
      return NextResponse.json(
        { error: error.message || "Failed to load companies" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      companies: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
    });
  } catch (e) {
    console.error("[api/companies]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
