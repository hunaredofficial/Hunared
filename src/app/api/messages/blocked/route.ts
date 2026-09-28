import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  const { data: rows, error } = await supabase
    .from("message_blocks")
    .select("blocked_id, created_at")
    .eq("blocker_id", userId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = (rows || []).map((r) => r.blocked_id);
  let profiles: Record<string, { full_name: string | null; username: string | null; avatar_url: string | null }> = {};
  if (ids.length) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url")
      .in("id", ids);
    for (const p of profs || []) {
      profiles[p.id] = {
        full_name: p.full_name,
        username: p.username,
        avatar_url: p.avatar_url,
      };
    }
  }

  return NextResponse.json({
    blocked: (rows || []).map((r) => ({
      userId: r.blocked_id,
      createdAt: r.created_at,
      profile: profiles[r.blocked_id] || null,
    })),
  });
}
