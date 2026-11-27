import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { notifyUser } from "@/lib/social/notify";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("community_comments")
      .select("id, post_id, author_id, body, created_at")
      .eq("post_id", id)
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) {
      if (/relation|does not exist/i.test(error.message)) {
        return NextResponse.json({ items: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const authorIds = [...new Set((data ?? []).map((c) => c.author_id))];
    let names: Record<string, string> = {};
    if (authorIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", authorIds);
      for (const p of profiles ?? []) {
        names[p.id] = p.full_name || p.username || "Member";
      }
    }

    const items = (data ?? []).map((c) => ({
      ...c,
      author_name: names[c.author_id] ?? "Member",
    }));

    return NextResponse.json({ items });
  } catch (e) {
    console.error("[comments GET]", e);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const text = (body.body ?? "").trim();
  if (text.length < 1 || text.length > 2000) {
    return NextResponse.json({ error: "Comment length invalid" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("community_comments")
    .insert({ post_id: id, author_id: userId, body: text })
    .select("id, post_id, author_id, body, created_at")
    .single();

  if (error) {
    if (/relation|does not exist/i.test(error.message)) {
      return NextResponse.json(
        { error: "Run supabase/017_community_posts.sql" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // best-effort bump comments_count + notify author
  try {
    const { data: post } = await supabase
      .from("community_posts")
      .select("comments_count, author_id")
      .eq("id", id)
      .maybeSingle();
    if (post) {
      await supabase
        .from("community_posts")
        .update({ comments_count: (post.comments_count ?? 0) + 1 })
        .eq("id", id);
      if (post.author_id && post.author_id !== userId) {
        await notifyUser({
          userId: post.author_id,
          title: "New comment on your post",
          body: text.slice(0, 140),
          entityId: id,
        });
      }
    }
  } catch {
    /* ignore */
  }

  return NextResponse.json({ ok: true, comment: data });
}
