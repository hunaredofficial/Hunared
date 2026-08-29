import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

/** GET /api/profile/check-username?u=acme_corp */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("u") || "").trim().toLowerCase();

  if (!raw || raw.length < 3) {
    return NextResponse.json({
      available: false,
      reason: "Username must be at least 3 characters",
    });
  }

  if (!/^[a-z0-9_][a-z0-9_.-]{1,28}[a-z0-9]$/.test(raw) && raw.length >= 3) {
    // allow simpler: letters numbers underscore
    if (!/^[a-z][a-z0-9_]{2,29}$/.test(raw)) {
      return NextResponse.json({
        available: false,
        reason: "Use letters, numbers, underscore only (start with a letter)",
      });
    }
  }

  const { userId } = await auth();
  const supabase = createAdminClient();

  let q = supabase
    .from("profiles")
    .select("id")
    .ilike("username", raw)
    .limit(1);

  // allow keeping own username when editing
  if (userId) {
    q = q.neq("id", userId);
  }

  const { data, error } = await q;

  if (error) {
    console.error("[check-username]", error);
    return NextResponse.json({ available: true, suggestions: [] });
  }

  const taken = !!(data && data.length > 0);
  return NextResponse.json({
    available: !taken,
    reason: taken ? "Username is already taken" : null,
  });
}
