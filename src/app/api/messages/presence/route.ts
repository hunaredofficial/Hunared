import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

const ONLINE_MS = 2 * 60 * 1000; // 2 minutes

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  await supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", userId);
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ids = (req.nextUrl.searchParams.get("ids") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);
  if (!ids.length) return NextResponse.json({ presence: {} });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, last_seen_at")
    .in("id", ids);

  const now = Date.now();
  const presence: Record<string, { online: boolean; lastSeenAt: string | null }> = {};
  for (const id of ids) {
    const row = (data || []).find((d) => d.id === id);
    const ts = row?.last_seen_at ? new Date(row.last_seen_at).getTime() : 0;
    presence[id] = {
      online: ts > 0 && now - ts < ONLINE_MS,
      lastSeenAt: row?.last_seen_at || null,
    };
  }
  return NextResponse.json({ presence });
}
