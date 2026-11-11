import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

const KEYS = [
  "ai_enabled",
  "ai_personalization",
  "ai_cv_analysis",
  "ai_notifications",
  "ai_agent_actions",
] as const;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(KEYS.join(", "))
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      return NextResponse.json({
        ai_enabled: true,
        ai_personalization: true,
        ai_cv_analysis: true,
        ai_notifications: false,
        ai_agent_actions: false,
        migrationRequired: true,
      });
    }
    return NextResponse.json({
      ai_enabled: data?.ai_enabled ?? true,
      ai_personalization: data?.ai_personalization ?? true,
      ai_cv_analysis: data?.ai_cv_analysis ?? true,
      ai_notifications: data?.ai_notifications ?? false,
      ai_agent_actions: data?.ai_agent_actions ?? false,
    });
  } catch {
    return NextResponse.json({
      ai_enabled: true,
      ai_personalization: true,
      ai_cv_analysis: true,
      ai_notifications: false,
      ai_agent_actions: false,
      migrationRequired: true,
    });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, boolean> = {};
  for (const key of KEYS) {
    if (typeof (body as Record<string, unknown>)[key] === "boolean") {
      patch[key] = (body as Record<string, boolean>)[key];
    }
  }
  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "No settings provided" }, { status: 400 });
  }
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
    if (error) {
      return NextResponse.json(
        {
          error:
            "Could not save. Run supabase/015_ai_agent_actions.sql on your database, then try again.",
          detail: error.message,
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, ...patch });
  } catch (e) {
    console.error("[ai-settings]", e);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
