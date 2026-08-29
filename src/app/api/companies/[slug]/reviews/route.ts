import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

/**
 * GET  /api/companies/[slug]/reviews
 * POST /api/companies/[slug]/reviews  { rating, title?, body? }
 */

async function resolveCompanyId(slug: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("companies")
    .select("id, rating_avg, reviews_count")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;
    const company = await resolveCompanyId(slug);
    if (!company) {
      return NextResponse.json({ reviews: [], total: 0 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("company_reviews")
      .select(
        "id, rating, title, body, helpful_count, created_at, reviewer_id, profiles:reviewer_id(full_name, avatar_url)"
      )
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[reviews GET]", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const reviews = (data ?? []).map((r: Record<string, unknown>) => {
      const profile = r.profiles as
        | { full_name?: string; avatar_url?: string }
        | null
        | undefined;
      return {
        id: r.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        helpful_count: r.helpful_count,
        created_at: r.created_at,
        author: profile?.full_name || "Member",
        avatar_url: profile?.avatar_url || null,
        reviewer_id: r.reviewer_id,
      };
    });

    return NextResponse.json({
      reviews,
      total: company.reviews_count ?? reviews.length,
      rating_avg: company.rating_avg ?? 0,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to leave a review." },
        { status: 401 }
      );
    }

    const { slug } = await ctx.params;
    const company = await resolveCompanyId(slug);
    if (!company) {
      return NextResponse.json(
        { error: "Company not found." },
        { status: 404 }
      );
    }

    let body: { rating?: number; title?: string; body?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be an integer from 1 to 5." },
        { status: 400 }
      );
    }

    const title = (body.title || "").trim().slice(0, 120) || null;
    const text = (body.body || "").trim().slice(0, 2000);
    if (!text || text.length < 10) {
      return NextResponse.json(
        { error: "Please write at least 10 characters for your review." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Upsert — one review per user per company
    const { data: review, error } = await supabase
      .from("company_reviews")
      .upsert(
        {
          company_id: company.id,
          reviewer_id: userId,
          rating,
          title,
          body: text,
        },
        { onConflict: "company_id,reviewer_id" }
      )
      .select("id, rating, title, body, created_at")
      .single();

    if (error) {
      console.error("[reviews POST]", error);
      return NextResponse.json(
        { error: error.message || "Could not save review." },
        { status: 500 }
      );
    }

    // Recompute aggregate rating
    const { data: aggs } = await supabase
      .from("company_reviews")
      .select("rating")
      .eq("company_id", company.id);

    const ratings = (aggs ?? []).map((r) => r.rating as number);
    const count = ratings.length;
    const avg =
      count > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / count) * 100) / 100
        : 0;

    await supabase
      .from("companies")
      .update({ rating_avg: avg, reviews_count: count })
      .eq("id", company.id);

    const user = await currentUser();
    const author =
      user?.fullName ||
      user?.firstName ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "Member";

    return NextResponse.json({
      ok: true,
      review: {
        ...review,
        author,
      },
      rating_avg: avg,
      reviews_count: count,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
