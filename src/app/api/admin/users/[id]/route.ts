import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { deleteCv } from "@/lib/storage";
import type { UserRole } from "@/types/database";

const VALID_ROLES: UserRole[] = ["seeker", "employer", "personal", "admin"];

/** PATCH /api/admin/users/[id]  — change role */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (caller?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: { role?: string } = await req.json();

  if (!body.role || !VALID_ROLES.includes(body.role as UserRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (id === userId && body.role !== "admin") {
    return NextResponse.json(
      { error: "Cannot change your own role away from admin" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: body.role as UserRole })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/admin/users/[id]
 * Permanent delete: removes profile (frees email), deletes Clerk user, cleans CV.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (caller?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (id === userId) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("cv_url")
    .eq("id", id)
    .maybeSingle();

  if (profile?.cv_url) {
    try {
      await deleteCv(profile.cv_url);
    } catch (e) {
      console.error("[admin/users DELETE] CV cleanup failed:", e);
    }
  }

  const { error } = await supabase.from("profiles").delete().eq("id", id);

  if (error) {
    console.error("[admin/users DELETE] Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const client = await clerkClient();
    await client.users.deleteUser(id);
  } catch (e) {
    console.error("[admin/users DELETE] Clerk deleteUser failed:", e);
  }

  return NextResponse.json({ success: true, permanent: true });
}
