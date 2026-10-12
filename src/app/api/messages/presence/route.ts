import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

/** Consider online if seen within 3 minutes */
const ONLINE_MS = 3 * 60 * 1000;

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
  if (!userId) return NextResponse.json({ presence: {} });
  const ids = (req.nextUrl.searchParams.get("ids") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40);
  if (!ids.length) return NextResponse.json({ presence: {} });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, last_seen_at")
    .in("id", ids);

  const now = Date.now();
  const presence: Record<string, { online: boolean; lastSeen: string | null }> = {};
  for (const p of data ?? []) {
    const t = p.last_seen_at ? new Date(p.last_seen_at).getTime() : 0;
    presence[p.id] = {
      online: t > 0 && now - t < ONLINE_MS,
      lastSeen: p.last_seen_at,
    };
  }
  return NextResponse.json({ presence });
}
