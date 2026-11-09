import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

const BUCKET = "learning-resources";

/** DELETE — owner can remove their published resource */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("learning_resources")
    .select("id, uploaded_by, file_path")
    .eq("id", id)
    .maybeSingle();

  if (error || !row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.uploaded_by !== userId) {
    return NextResponse.json({ error: "You can only delete your own resources" }, { status: 403 });
  }

  // Best-effort storage cleanup
  if (row.file_path) {
    await supabase.storage.from(BUCKET).remove([row.file_path]).catch(() => null);
  }

  const { error: delErr } = await supabase.from("learning_resources").delete().eq("id", id);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

/** GET single resource metadata (public if approved / owner) */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("learning_resources")
    .select(
      "id, title, description, category, file_name, file_type, file_size, download_count, created_at, uploaded_by, status"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.status !== "approved" && row.uploaded_by !== userId) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  return NextResponse.json({ resource: row });
}

/** PATCH — owner can update title, description, category */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  let body: { title?: string; description?: string; category?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("learning_resources")
    .select("id, uploaded_by")
    .eq("id", id)
    .maybeSingle();

  if (error || !row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.uploaded_by !== userId) {
    return NextResponse.json({ error: "You can only edit your own resources" }, { status: 403 });
  }

  const updates: Record<string, string> = {};
  if (typeof body.title === "string") {
    const t = body.title.trim();
    if (!t) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    updates.title = t;
  }
  if (typeof body.description === "string") {
    updates.description = body.description.trim();
  }
  if (typeof body.category === "string" && body.category.trim()) {
    updates.category = body.category.trim();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  const { data: updated, error: upErr } = await supabase
    .from("learning_resources")
    .update(updates)
    .eq("id", id)
    .select(
      "id, title, description, category, file_name, file_type, file_size, download_count, created_at, uploaded_by, status"
    )
    .single();

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
  return NextResponse.json({ resource: updated, message: "Resource updated" });
}
