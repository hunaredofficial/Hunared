import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { blockedId } = await req.json().catch(() => ({}));
  if (!blockedId || blockedId === userId) {
    return NextResponse.json({ error: "Invalid user" }, { status: 400 });
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("message_blocks").upsert({
    blocker_id: userId,
    blocked_id: blockedId,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
