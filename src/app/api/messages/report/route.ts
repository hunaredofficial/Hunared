import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

const REASONS = new Set([
  "spam", "scam", "harassment", "fake_job", "fake_listing", "abuse", "inappropriate", "other",
]);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    let reason = String(body.reason || "").trim().toLowerCase().replace(/\s+/g, "_");
    if (!REASONS.has(reason)) reason = "other";
    const supabase = createAdminClient();
    const { error } = await supabase.from("message_reports").insert({
      reporter_id: userId,
      conversation_id: body.conversationId || null,
      message_id: body.messageId || null,
      reported_user_id: body.reportedUserId || null,
      reason,
      details: String(body.details || "").slice(0, 1000) || null,
      status: "open",
    });
    if (error) return NextResponse.json({ error: error.message || "Report failed" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Report failed" }, { status: 500 });
  }
}
