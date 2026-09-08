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
    .from("companies" as any)
    .select("id, rating_avg, reviews_count")
    .eq("slug", slug)
    .maybeSingle();
  return data as { id: string; rating_avg: number | null; reviews_count: number } | null;
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

    // Prefer join for author name; fall back to plain rows if join fails
    let data: Record<string, unknown>[] | null = null;
    let error: { message?: string } | null = null;

    const joined = await supabase
      .from("company_reviews" as any)
      .select(
        "id, rating, title, body, helpful_count, created_at, reviewer_id, profiles:reviewer_id(full_name, avatar_url)"
      )
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (joined.error) {
      console.warn("[reviews GET] join failed, plain select", joined.error.message);
      const plain = await supabase
        .from("company_reviews" as any)
        .select("id, rating, title, body, helpful_count, created_at, reviewer_id")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false })
        .limit(50);
      data = (plain.data as Record<string, unknown>[] | null) ?? null;
      error = plain.error;
    } else {
      data = (joined.data as Record<string, unknown>[] | null) ?? null;
    }

    if (error) {
      console.error("[reviews GET]", error);
      return NextResponse.json(
        { error: error.message || "Failed to load reviews" },
        { status: 500 }
      );
    }

    // Optionally resolve author names for plain rows
    const reviewerIds = [
      ...new Set(
        (data ?? [])
          .map((r) => r.reviewer_id as string)
          .filter(Boolean)
      ),
    ];
    const nameById: Record<string, { full_name?: string; avatar_url?: string | null }> = {};
    if (reviewerIds.length > 0 && data && data.some((r) => !r.profiles)) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", reviewerIds);
      for (const pr of profiles ?? []) {
        nameById[(pr as any).id] = {
          full_name: (pr as any).full_name,
          avatar_url: (pr as any).avatar_url,
        };
      }
    }

    const reviews = (data ?? []).map((r: Record<string, unknown>) => {
      const profile = (r.profiles as
        | { full_name?: string; avatar_url?: string }
        | null
        | undefined) || nameById[r.reviewer_id as string];
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

    // Ensure profile row exists (FK: company_reviews.reviewer_id → profiles.id)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json(
        {
          error:
            "Please complete your profile before leaving a review.",
        },
        { status: 400 }
      );
    }

    // Upsert — one review per user per company
    const { data: review, error } = await supabase
      .from("company_reviews" as any)
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
      const msg = error.message || "Could not save review.";
      // Friendlier message when table/constraint is missing
      if (/relation .* does not exist/i.test(msg)) {
        return NextResponse.json(
          { error: "Reviews are not set up yet. Please contact support." },
          { status: 500 }
        );
      }
      if (/foreign key|violates foreign key/i.test(msg)) {
        return NextResponse.json(
          { error: "Please complete your profile before leaving a review." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // Recompute aggregate rating
    const { data: aggs } = await supabase
      .from("company_reviews" as any)
      .select("rating")
      .eq("company_id", company.id);

    const ratings = (aggs ?? []).map((r: any) => r.rating as number);
    const count = ratings.length;
    const avg =
      count > 0
        ? Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / count) * 100) / 100
        : 0;

    await supabase
      .from("companies" as any)
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


async function recomputeCompanyRating(supabase: ReturnType<typeof createAdminClient>, companyId: string) {
  const { data: aggs } = await supabase
    .from("company_reviews" as any)
    .select("rating")
    .eq("company_id", companyId);

  const ratings = (aggs ?? []).map((r: any) => r.rating as number);
  const count = ratings.length;
  const avg =
    count > 0
      ? Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / count) * 100) / 100
      : 0;

  await supabase
    .from("companies" as any)
    .update({ rating_avg: avg, reviews_count: count })
    .eq("id", companyId);

  return { avg, count };
}

/**
 * PATCH /api/companies/[slug]/reviews
 * Body: { rating, title?, body? } — updates the signed-in user's review
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to edit your review." },
        { status: 401 }
      );
    }

    const { slug } = await ctx.params;
    const company = await resolveCompanyId(slug);
    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
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

    const { data: existing } = await supabase
      .from("company_reviews" as any)
      .select("id")
      .eq("company_id", company.id)
      .eq("reviewer_id", userId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: "You have not reviewed this company yet." },
        { status: 404 }
      );
    }

    const { data: review, error } = await supabase
      .from("company_reviews" as any)
      .update({ rating, title, body: text })
      .eq("id", (existing as any).id)
      .eq("reviewer_id", userId)
      .select("id, rating, title, body, created_at, reviewer_id")
      .single();

    if (error) {
      console.error("[reviews PATCH]", error);
      return NextResponse.json(
        { error: error.message || "Could not update review." },
        { status: 500 }
      );
    }

    const { avg, count } = await recomputeCompanyRating(supabase, company.id);
    const user = await currentUser();
    const author =
      user?.fullName ||
      user?.firstName ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "Member";

    return NextResponse.json({
      ok: true,
      review: { ...review, author },
      rating_avg: avg,
      reviews_count: count,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/companies/[slug]/reviews
 * Deletes the signed-in user's review for this company
 */
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to delete your review." },
        { status: 401 }
      );
    }

    const { slug } = await ctx.params;
    const company = await resolveCompanyId(slug);
    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("company_reviews" as any)
      .select("id")
      .eq("company_id", company.id)
      .eq("reviewer_id", userId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: "You have not reviewed this company yet." },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("company_reviews" as any)
      .delete()
      .eq("id", (existing as any).id)
      .eq("reviewer_id", userId);

    if (error) {
      console.error("[reviews DELETE]", error);
      return NextResponse.json(
        { error: error.message || "Could not delete review." },
        { status: 500 }
      );
    }

    const { avg, count } = await recomputeCompanyRating(supabase, company.id);

    return NextResponse.json({
      ok: true,
      rating_avg: avg,
      reviews_count: count,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
