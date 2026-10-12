import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

const ALLOWED_TYPES = new Set([
  "page_view",
  "search",
  "job_view",
  "listing_view",
  "company_view",
  "candidate_view",
  "message_open",
  "cv_open",
  "other",
]);

const SKIP_PREFIXES = [
  "/api/",
  "/sign-in",
  "/register",
  "/_next",
];

function shouldSkipPath(path: string): boolean {
  const p = path.split("?")[0] || path;
  return SKIP_PREFIXES.some((s) => p === s || p.startsWith(s));
}

function inferType(path: string): string {
  const p = path.split("?")[0] || path;
  if (p.startsWith("/jobs/") && p !== "/jobs") return "job_view";
  if (p.startsWith("/market/") && p !== "/market") return "listing_view";
  if (p.startsWith("/companies/") && p !== "/companies") return "company_view";
  if (p.startsWith("/candidates/") && p !== "/candidates") return "candidate_view";
  if (p.startsWith("/search")) return "search";
  if (p.startsWith("/dashboard/messages")) return "message_open";
  if (p.startsWith("/dashboard/cv")) return "cv_open";
  return "page_view";
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = req.nextUrl.searchParams.get("type") || "";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 50), 100);
  const supabase = createAdminClient();

  let q = supabase
    .from("user_activity_history")
    .select("id, event_type, path, title, meta, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (type && ALLOWED_TYPES.has(type)) {
    q = q.eq("event_type", type);
  }

  const { data, error } = await q;
  if (error) {
    return NextResponse.json(
      {
        error: error.message,
        hint: "Run supabase/016_activity_history.sql in Supabase SQL Editor.",
        items: [],
      },
      { status: 500 }
    );
  }

  const { data: prof } = await supabase
    .from("profiles")
    .select("history_enabled")
    .eq("id", userId)
    .maybeSingle();

  return NextResponse.json({
    items: data || [],
    history_enabled: prof?.history_enabled !== false,
  });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false, skipped: "auth" });

  const body = await req.json().catch(() => ({}));
  const path = String(body.path || "").trim().slice(0, 500);
  if (!path || shouldSkipPath(path)) {
    return NextResponse.json({ ok: true, skipped: "path" });
  }

  const supabase = createAdminClient();
  const { data: prof } = await supabase
    .from("profiles")
    .select("history_enabled")
    .eq("id", userId)
    .maybeSingle();

  if (prof && prof.history_enabled === false) {
    return NextResponse.json({ ok: true, skipped: "disabled" });
  }

  let eventType = String(body.event_type || "").trim();
  if (!ALLOWED_TYPES.has(eventType)) {
    eventType = inferType(path);
  }

  const title = body.title != null ? String(body.title).slice(0, 200) : null;
  const meta =
    body.meta && typeof body.meta === "object" && !Array.isArray(body.meta)
      ? body.meta
      : {};

  // Dedupe: same path within last 2 minutes
  const since = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from("user_activity_history")
    .select("id")
    .eq("user_id", userId)
    .eq("path", path)
    .gte("created_at", since)
    .limit(1);

  if (recent?.length) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  const { error } = await supabase.from("user_activity_history").insert({
    user_id: userId,
    event_type: eventType,
    path,
    title,
    meta,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message, hint: "Run 016_activity_history.sql" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = body.id ? String(body.id) : null;
  const clearAll = body.clearAll === true;

  const supabase = createAdminClient();

  if (clearAll) {
    const { error } = await supabase
      .from("user_activity_history")
      .delete()
      .eq("user_id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, cleared: true });
  }

  if (id) {
    const { error } = await supabase
      .from("user_activity_history")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Provide id or clearAll" }, { status: 400 });
}
