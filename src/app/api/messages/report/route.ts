import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const reason = String(body.reason || "").slice(0, 80);
  if (!reason) return NextResponse.json({ error: "reason required" }, { status: 400 });
  const supabase = createAdminClient();
  const { error } = await supabase.from("message_reports").insert({
    reporter_id: userId,
    conversation_id: body.conversationId || null,
    message_id: body.messageId || null,
    reported_user_id: body.reportedUserId || null,
    reason,
    details: String(body.details || "").slice(0, 1000) || null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
