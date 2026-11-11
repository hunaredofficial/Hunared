import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

const KEYS = [
  "ai_enabled",
  "ai_personalization",
  "ai_cv_analysis",
  "ai_notifications",
  "ai_agent_actions",
  "ai_agent_permissions",
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
        ai_agent_permissions: {},
        migrationRequired: true,
      });
    }
    return NextResponse.json({
      ai_enabled: data?.ai_enabled ?? true,
      ai_personalization: data?.ai_personalization ?? true,
      ai_cv_analysis: data?.ai_cv_analysis ?? true,
      ai_notifications: data?.ai_notifications ?? false,
      ai_agent_actions: data?.ai_agent_actions ?? false,
      ai_agent_permissions: data?.ai_agent_permissions ?? {},
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
  const patch: Record<string, unknown> = {};
  for (const key of KEYS) {
    const v = (body as Record<string, unknown>)[key];
    if (key === "ai_agent_permissions" && v && typeof v === "object") {
      patch[key] = v;
    } else if (typeof v === "boolean") {
      patch[key] = v;
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
            "Could not save. Run supabase/016_agent_permissions.sql on your database, then try again.",
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
