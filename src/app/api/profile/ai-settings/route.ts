import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("ai_enabled, ai_personalization, ai_cv_analysis, ai_notifications")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      // Columns may not exist yet
      return NextResponse.json({
        ai_enabled: true,
        ai_personalization: true,
        ai_cv_analysis: true,
        ai_notifications: false,
        migrationRequired: true,
      });
    }
    return NextResponse.json({
      ai_enabled: data?.ai_enabled ?? true,
      ai_personalization: data?.ai_personalization ?? true,
      ai_cv_analysis: data?.ai_cv_analysis ?? true,
      ai_notifications: data?.ai_notifications ?? false,
    });
  } catch {
    return NextResponse.json({
      ai_enabled: true,
      ai_personalization: true,
      ai_cv_analysis: true,
      ai_notifications: false,
      migrationRequired: true,
    });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, boolean> = {};
  for (const key of [
    "ai_enabled",
    "ai_personalization",
    "ai_cv_analysis",
    "ai_notifications",
  ] as const) {
    if (typeof (body as Record<string, unknown>)[key] === "boolean") {
      patch[key] = (body as Record<string, boolean>)[key];
    }
  }
  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "No settings provided" }, { status: 400 });
  }
  try {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
    if (error) {
      return NextResponse.json(
        {
          error:
            "Could not save. Run supabase/009_ai_preferences.sql on your database, then try again.",
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
