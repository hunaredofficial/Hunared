import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { deleteUserData } from "@/lib/deleteUserData";

/**
 * DELETE /api/account/delete
 * Signed-in user permanently deletes their own account and all related data.
 */
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const result = await deleteUserData(supabase, userId);

  if (!result.ok && result.errors.some((e) => e.startsWith("profiles:"))) {
    return NextResponse.json(
      {
        error: "Could not delete profile.",
        details: result.errors,
      },
      { status: 500 }
    );
  }

  try {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
  } catch (e) {
    console.error("[account/delete] Clerk deleteUser failed:", e);
  }

  return NextResponse.json({
    success: true,
    warnings: result.errors.length ? result.errors : undefined,
  });
}
