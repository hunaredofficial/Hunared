import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { canBypassVerification } from "@/lib/roles";
import type { UserRole } from "@/types/database";

/**
 * Team/Admin can create or upsert a lightweight profile row for candidates/companies
 * without requiring email/phone verification on that profile.
 * Body: { id?: string, full_name, role: seeker|employer|personal, email?, phone?, ... }
 * Prefer linking to an existing Clerk user id when known.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!canBypassVerification(caller?.role)) {
    return NextResponse.json({ error: "Team or admin role required." }, { status: 403 });
  }

  let body: {
    id?: string;
    full_name?: string;
    role?: UserRole;
    email?: string;
    phone?: string;
    country?: string;
    city?: string;
    profession?: string;
    company_name?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const role = body.role;
  if (!role || !["seeker", "employer", "personal"].includes(role)) {
    return NextResponse.json(
      { error: "role must be seeker, employer, or personal" },
      { status: 400 }
    );
  }
  if (!body.full_name?.trim()) {
    return NextResponse.json({ error: "full_name is required" }, { status: 400 });
  }

  const targetId = body.id?.trim();
  if (!targetId) {
    return NextResponse.json(
      {
        error:
          "id (Clerk user id) is required. Create the user in Clerk first, then pass their user id here. Verification is skipped for team-managed profiles.",
      },
      { status: 400 }
    );
  }

  const row = {
    id: targetId,
    full_name: body.full_name.trim(),
    role,
    email: body.email?.trim() || `${targetId}@team.hunared.local`,
    phone: body.phone?.trim() || null,
    country: body.country?.trim() || null,
    city: body.city?.trim() || null,
    profession: body.profession?.trim() || null,
    // Mark phone as verified so downstream gates do not block team-managed accounts
    phone_verified_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(row, { onConflict: "id" })
    .select("id, full_name, role, email")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Optional company row for employer
  if (role === "employer" && body.company_name?.trim()) {
    await supabase.from("companies").upsert(
      {
        owner_id: targetId,
        name: body.company_name.trim(),
        verification_status: "verified",
        status: "active",
      },
      { onConflict: "owner_id" }
    );
  }

  return NextResponse.json({ ok: true, profile: data });
}
