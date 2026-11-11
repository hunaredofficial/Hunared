import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

/**
 * Real platform search for Hunared Agent — no invented results.
 * Queries existing jobs / market_listings / companies / profiles (public talent).
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "jobs").toLowerCase();
  const q = (searchParams.get("q") || searchParams.get("search") || "").trim().slice(0, 120);
  const country = searchParams.get("country") || undefined;
  const city = searchParams.get("city") || undefined;
  const category = searchParams.get("category") || undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(12, Math.max(1, parseInt(searchParams.get("limit") || "6", 10)));
  const from = (page - 1) * limit;

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  try {
    if (type === "jobs") {
      let query = supabase
        .from("jobs")
        .select(
          "id, job_title, city, country, employment_type, category, company_name, salary_rate, currency, status, created_at",
          { count: "exact" }
        )
        .eq("status", "approved")
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order("created_at", { ascending: false })
        .range(from, from + limit - 1);

      if (q) query = query.or(`job_title.ilike.%${q}%,company_name.ilike.%${q}%,category.ilike.%${q}%`);
      if (country) query = query.eq("country", country);
      if (city) query = query.ilike("city", `%${city}%`);
      if (category) query = query.eq("category", category);

      const { data, error, count } = await query;
      if (error) {
        return NextResponse.json({ error: error.message, results: [] }, { status: 400 });
      }
      const results = (data || []).map((row) => ({
        id: row.id,
        type: "job" as const,
        title: row.job_title,
        subtitle: [row.company_name, row.city, row.country].filter(Boolean).join(" · "),
        meta: [row.employment_type, row.category, row.salary_rate ? `${row.currency || ""} ${row.salary_rate}`.trim() : null]
          .filter(Boolean)
          .join(" · "),
        href: `/jobs/${row.id}`,
      }));
      return NextResponse.json({
        type: "jobs",
        q,
        page,
        total: count ?? results.length,
        results,
        source: "supabase.jobs",
      });
    }

    if (type === "market" || type === "listings") {
      // Table name may be market_listings or listings depending on schema — try market_listings first
      let query = supabase
        .from("market_listings")
        .select(
          "id, title, city, country, category, price, currency, status, created_at",
          { count: "exact" }
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .range(from, from + limit - 1);

      if (q) query = query.ilike("title", `%${q}%`);
      if (country) query = query.eq("country", country);
      if (city) query = query.ilike("city", `%${city}%`);
      if (category) query = query.eq("category", category);

      let { data, error, count } = await query;
      if (error) {
        // Fallback: marketplace_items or listings
        const alt = await supabase
          .from("listings")
          .select("id, title, city, country, category, price, currency, status, created_at", {
            count: "exact",
          })
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .range(from, from + limit - 1);
        data = alt.data as typeof data;
        error = alt.error;
        count = alt.count;
      }
      if (error) {
        return NextResponse.json({
          error: error.message,
          results: [],
          hint: "Check market table name matches your schema",
        }, { status: 400 });
      }
      const results = (data || []).map((row) => ({
        id: row.id,
        type: "listing" as const,
        title: row.title,
        subtitle: [row.city, row.country, row.category].filter(Boolean).join(" · "),
        meta: row.price != null ? `${row.currency || "SAR"} ${row.price}` : row.category,
        href: `/market/${row.id}`,
      }));
      return NextResponse.json({
        type: "market",
        q,
        page,
        total: count ?? results.length,
        results,
        source: "supabase.market",
      });
    }

    if (type === "companies") {
      let query = supabase
        .from("companies")
        .select("id, name, slug, city, country, industry, hiring, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, from + limit - 1);
      if (q) query = query.or(`name.ilike.%${q}%,industry.ilike.%${q}%`);
      if (country) query = query.eq("country", country);
      if (city) query = query.ilike("city", `%${city}%`);
      const { data, error, count } = await query;
      if (error) {
        return NextResponse.json({ error: error.message, results: [] }, { status: 400 });
      }
      const results = (data || []).map((row) => ({
        id: row.id,
        type: "company" as const,
        title: row.name,
        subtitle: [row.industry, row.city, row.country].filter(Boolean).join(" · "),
        meta: row.hiring ? "Hiring" : undefined,
        href: row.slug ? `/companies/${row.slug}` : `/companies`,
      }));
      return NextResponse.json({
        type: "companies",
        q,
        page,
        total: count ?? results.length,
        results,
        source: "supabase.companies",
      });
    }

    if (type === "candidates" || type === "talent") {
      let query = supabase
        .from("profiles")
        .select("id, full_name, username, profession, city, country, skill_level", {
          count: "exact",
        })
        .eq("listed_publicly", true)
        .order("updated_at", { ascending: false })
        .range(from, from + limit - 1);
      if (q) {
        query = query.or(
          `full_name.ilike.%${q}%,profession.ilike.%${q}%,username.ilike.%${q}%`
        );
      }
      if (country) query = query.eq("country", country);
      if (city) query = query.ilike("city", `%${city}%`);
      const { data, error, count } = await query;
      if (error) {
        return NextResponse.json({ error: error.message, results: [] }, { status: 400 });
      }
      const results = (data || []).map((row) => ({
        id: row.id,
        type: "candidate" as const,
        title: row.full_name || row.username || "Professional",
        subtitle: [row.profession, row.city, row.country].filter(Boolean).join(" · "),
        meta: row.skill_level || undefined,
        href: row.username ? `/candidates/${row.username}` : `/candidates`,
      }));
      return NextResponse.json({
        type: "candidates",
        q,
        page,
        total: count ?? results.length,
        results,
        source: "supabase.profiles",
      });
    }

    return NextResponse.json({ error: "Unknown type. Use jobs|market|companies|candidates" }, { status: 400 });
  } catch (e) {
    console.error("[api/agent/search]", e);
    return NextResponse.json({ error: "Search failed", results: [] }, { status: 500 });
  }
}
