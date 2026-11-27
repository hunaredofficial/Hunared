import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { notifyUser } from "@/lib/social/notify";

export const dynamic = "force-dynamic";

/** POST { targetType: 'user'|'company', targetId } — toggle follow */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { targetType?: string; targetId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const targetType = body.targetType;
  const targetId = body.targetId;
  if (
    !targetType ||
    !targetId ||
    !["user", "company"].includes(targetType)
  ) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }
  if (targetType === "user" && targetId === userId) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", userId)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from("follows").delete().eq("id", existing.id);
    return NextResponse.json({ following: false });
  }

  const { error } = await supabase.from("follows").insert({
    follower_id: userId,
    target_type: targetType,
    target_id: targetId,
  });

  if (error) {
    if (/relation|does not exist/i.test(error.message)) {
      return NextResponse.json(
        { error: "Run supabase/018_follows.sql", following: false },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify user targets (not companies — no profile inbox)
  if (targetType === "user") {
    await notifyUser({
      userId: targetId,
      title: "New follower",
      body: "Someone started following you on Hunared.",
    });
  }

  return NextResponse.json({ following: true });
}

/** GET ?targetType=&targetId= — is following + count */
export async function GET(req: Request) {
  const { userId } = await auth();
  const url = new URL(req.url);
  const targetType = url.searchParams.get("targetType");
  const targetId = url.searchParams.get("targetId");
  if (!targetType || !targetId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { count } = await supabase
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("target_type", targetType)
    .eq("target_id", targetId);

  let following = false;
  if (userId) {
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", userId)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .maybeSingle();
    following = !!data?.id;
  }

  return NextResponse.json({ following, count: count ?? 0 });
}
