import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { rateLimit } from "@/lib/rateLimit";

type ItemType = "job" | "listing";

function parseBody(body: unknown): { itemType: ItemType; itemId: string } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const itemType = b.itemType;
  const itemId = b.itemId;
  if (itemType !== "job" && itemType !== "listing") return null;
  if (typeof itemId !== "string" || !itemId.trim()) return null;
  return { itemType, itemId: itemId.trim() };
}

/** GET — list current user's saved items */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("saved_items")
    .select("id, item_type, item_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ saved: data ?? [] });
}

/** POST — save an item { itemType, itemId } */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`saved:${userId}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseBody(raw);
  if (!parsed) {
    return NextResponse.json(
      { error: "itemType and itemId are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("saved_items").upsert(
    {
      user_id: userId,
      item_type: parsed.itemType,
      item_id: parsed.itemId,
    },
    { onConflict: "user_id,item_type,item_id", ignoreDuplicates: true }
  );

  if (error) {
    // Fallback: try without ignoreDuplicates style if constraint name differs
    const { error: err2 } = await supabase.from("saved_items").insert({
      user_id: userId,
      item_type: parsed.itemType,
      item_id: parsed.itemId,
    });
    if (err2 && !err2.message?.includes("duplicate")) {
      return NextResponse.json({ error: err2.message }, { status: 500 });
    }
  }

  return NextResponse.json({ saved: true });
}

/** DELETE — unsave an item { itemType, itemId } */
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseBody(raw);
  if (!parsed) {
    return NextResponse.json(
      { error: "itemType and itemId are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("saved_items")
    .delete()
    .eq("user_id", userId)
    .eq("item_type", parsed.itemType)
    .eq("item_id", parsed.itemId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ saved: false });
}
