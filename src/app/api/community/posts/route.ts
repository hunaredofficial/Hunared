import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const limit = Math.min(
      30,
      Math.max(5, Number(req.nextUrl.searchParams.get("limit") || 12))
    );
    const cursor = req.nextUrl.searchParams.get("cursor");
    const supabase = createAdminClient();
    let q = supabase
      .from("community_posts")
      .select(
        "id, author_id, post_type, title, body, category, country, city, image_urls, likes_count, comments_count, created_at, status"
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (cursor) q = q.lt("created_at", cursor);
    const { data, error } = await q;
    if (error) {
      if (/relation|does not exist/i.test(error.message)) {
        return NextResponse.json({ items: [], nextCursor: null });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const items = data ?? [];
    const nextCursor =
      items.length === limit ? items[items.length - 1]?.created_at ?? null : null;
    return NextResponse.json({ items, nextCursor });
  } catch (e) {
    console.error("[community/posts GET]", e);
    return NextResponse.json({ items: [], nextCursor: null });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    body?: string;
    title?: string;
    post_type?: string;
    category?: string;
    country?: string;
    city?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = (body.body ?? "").trim();
  if (text.length < 3) {
    return NextResponse.json(
      { error: "Write a short update (min 3 characters)." },
      { status: 400 }
    );
  }
  if (text.length > 4000) {
    return NextResponse.json({ error: "Too long" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      author_id: userId,
      body: text,
      title: body.title?.trim() || null,
      post_type: body.post_type || "update",
      category: body.category || null,
      country: body.country || null,
      city: body.city || null,
      status: "approved",
    })
    .select("id, created_at")
    .single();

  if (error) {
    if (/relation|does not exist/i.test(error.message)) {
      return NextResponse.json(
        {
          error:
            "Community posts table not installed. Run supabase/017_community_posts.sql",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, post: data });
}
