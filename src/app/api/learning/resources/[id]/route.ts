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
