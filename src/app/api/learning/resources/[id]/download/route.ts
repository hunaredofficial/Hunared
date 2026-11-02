import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

const BUCKET = "learning-resources";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("learning_resources")
    .select("id, file_path, file_name, status, download_count")
    .eq("id", id)
    .maybeSingle();

  if (error || !row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.status !== "approved") {
    return NextResponse.json({ error: "Resource not available" }, { status: 403 });
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(row.file_path, 60 * 10);

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json(
      { error: signErr?.message || "Could not create download link" },
      { status: 500 }
    );
  }

  await supabase
    .from("learning_resources")
    .update({ download_count: (row.download_count ?? 0) + 1 })
    .eq("id", id);

  return NextResponse.json({
    url: signed.signedUrl,
    file_name: row.file_name,
  });
}
