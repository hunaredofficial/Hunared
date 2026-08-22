// src/app/api/subscriptions/jobs/route.ts
// Job Category Subscriptions
// GET    → list current user's job category subscriptions + matching new jobs
// POST   → subscribe   { category }
// DELETE → unsubscribe { category }

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { rateLimit } from "@/lib/rateLimit";
import { JOB_CATEGORIES } from "@/lib/constants";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const { data: subs, error: subsError } = await supabase
    .from("job_category_subscriptions")
    .select("id, category, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (subsError) {
    return NextResponse.json({ error: subsError.message }, { status: 500 });
  }

  const categories = (subs ?? []).map((s) => s.category);

  let matchingJobs: any[] = [];
  if (categories.length > 0) {
    const { data: jobs } = await supabase
      .from("jobs")
      .select(
        "id, job_title, company_name, location, category, salary_rate, currency, salary_type, employment_type, status, created_at"
      )
      .eq("status", "approved")
      .in("category", categories)
      .order("created_at", { ascending: false })
      .limit(50);

    matchingJobs = jobs ?? [];
  }

  return NextResponse.json({
    subscriptions: subs ?? [],
    matchingJobs,
    newCount: matchingJobs.length,
  });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!rateLimit(`job-sub:${userId}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body: { category?: string } = await req.json();
  const category = body.category?.trim();
  if (!category) {
    return NextResponse.json({ error: "category is required" }, { status: 400 });
  }

  const isKnown = (JOB_CATEGORIES as readonly string[]).includes(category);
  if (!isKnown && category.length < 2) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("job_category_subscriptions")
    .upsert(
      { user_id: userId, category },
      { onConflict: "user_id,category", ignoreDuplicates: true }
    )
    .select("id, category, created_at")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ subscribed: true, subscription: data });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: { category?: string } = await req.json();
  if (!body.category) {
    return NextResponse.json({ error: "category is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("job_category_subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("category", body.category);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subscribed: false });
}