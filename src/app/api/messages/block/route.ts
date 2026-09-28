import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const blockedId = String(body.blockedId || "").trim();
    if (!blockedId || blockedId === userId) {
      return NextResponse.json({ error: "Invalid user to block" }, { status: 400 });
    }
    const supabase = createAdminClient();
    const { error } = await supabase.from("message_blocks").upsert(
      { blocker_id: userId, blocked_id: blockedId },
      { onConflict: "blocker_id,blocked_id" }
    );
    if (error) return NextResponse.json({ error: error.message || "Could not block" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Block failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const blockedId = String(body.blockedId || "").trim();
  if (!blockedId) return NextResponse.json({ error: "blockedId required" }, { status: 400 });
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("message_blocks")
    .delete()
    .eq("blocker_id", userId)
    .eq("blocked_id", blockedId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
