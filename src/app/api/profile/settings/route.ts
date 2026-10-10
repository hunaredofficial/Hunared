import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

const THEMES = new Set(["system", "light", "dark"]);

const SELECT_COLS =
  "username, full_name, email, role, country, preferred_theme, preferred_timezone, preferred_country, ai_enabled, ai_personalization, ai_cv_analysis, ai_notifications, email_job_alerts, email_messages, show_online_status, compact_mode";

export type UserSettings = {
  username: string | null;
  full_name: string | null;
  email: string | null;
  role: string | null;
  country: string | null;
  preferred_theme: "system" | "light" | "dark";
  preferred_timezone: string;
  preferred_country: string | null;
  ai_enabled: boolean;
  ai_personalization: boolean;
  ai_cv_analysis: boolean;
  ai_notifications: boolean;
  email_job_alerts: boolean;
  email_messages: boolean;
  show_online_status: boolean;
  compact_mode: boolean;
};

const defaults: UserSettings = {
  username: null,
  full_name: null,
  email: null,
  role: null,
  country: null,
  preferred_theme: "system",
  preferred_timezone: "Asia/Riyadh",
  preferred_country: null,
  ai_enabled: true,
  ai_personalization: true,
  ai_cv_analysis: true,
  ai_notifications: false,
  email_job_alerts: true,
  email_messages: true,
  show_online_status: true,
  compact_mode: false,
};

function normalize(data: Record<string, unknown> | null): UserSettings {
  if (!data) return { ...defaults };
  const theme = String(data.preferred_theme || "system");
  return {
    username: (data.username as string) ?? null,
    full_name: (data.full_name as string) ?? null,
    email: (data.email as string) ?? null,
    role: (data.role as string) ?? null,
    country: (data.country as string) ?? null,
    preferred_theme: THEMES.has(theme)
      ? (theme as UserSettings["preferred_theme"])
      : "system",
    preferred_timezone:
      (data.preferred_timezone as string) || defaults.preferred_timezone,
    preferred_country: (data.preferred_country as string) ?? null,
    ai_enabled: data.ai_enabled !== false,
    ai_personalization: data.ai_personalization !== false,
    ai_cv_analysis: data.ai_cv_analysis !== false,
    ai_notifications: data.ai_notifications === true,
    email_job_alerts: data.email_job_alerts !== false,
    email_messages: data.email_messages !== false,
    show_online_status: data.show_online_status !== false,
    compact_mode: data.compact_mode === true,
  };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(SELECT_COLS)
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      return NextResponse.json({
        ...defaults,
        migrationRequired: true,
        error: error.message,
      });
    }
    return NextResponse.json(normalize(data as Record<string, unknown> | null));
  } catch {
    return NextResponse.json({ ...defaults, migrationRequired: true });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};

  if (typeof body.preferred_theme === "string" && THEMES.has(body.preferred_theme)) {
    patch.preferred_theme = body.preferred_theme;
  }
  if (typeof body.preferred_timezone === "string" && body.preferred_timezone.length < 64) {
    patch.preferred_timezone = body.preferred_timezone.trim();
  }
  if (body.preferred_country === null || body.preferred_country === "") {
    patch.preferred_country = null;
  } else if (typeof body.preferred_country === "string") {
    patch.preferred_country = body.preferred_country.trim().toUpperCase().slice(0, 2);
  }

  for (const key of [
    "ai_enabled",
    "ai_personalization",
    "ai_cv_analysis",
    "ai_notifications",
    "email_job_alerts",
    "email_messages",
    "show_online_status",
    "compact_mode",
  ] as const) {
    if (typeof body[key] === "boolean") patch[key] = body[key];
  }

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "No settings provided" }, { status: 400 });
  }

  patch.updated_at = new Date().toISOString();

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
    if (error) {
      return NextResponse.json(
        {
          error:
            error.message.includes("column")
              ? "Run supabase/015_user_settings.sql in Supabase, then try again."
              : error.message,
        },
        { status: 500 }
      );
    }

    // Keep agent local flag in sync for guests of this browser
    if (typeof patch.ai_enabled === "boolean") {
      // client will set localStorage; nothing to do server-side
    }

    const { data } = await supabase
      .from("profiles")
      .select(SELECT_COLS)
      .eq("id", userId)
      .maybeSingle();

    return NextResponse.json({
      ok: true,
      settings: normalize(data as Record<string, unknown> | null),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
