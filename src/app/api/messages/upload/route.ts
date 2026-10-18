import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

const BUCKET = "message-files";
const MAX = 12 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const conversationId = String(form.get("conversationId") || "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ error: "File too large (max 12MB)" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Must be a participant
  const { data: part } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!part) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 });
  }

  // Ensure bucket exists (idempotent)
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.id === BUCKET || b.name === BUCKET)) {
      await supabase.storage.createBucket(BUCKET, {
        public: false,
        fileSizeLimit: MAX,
      });
    }
  } catch (e) {
    console.warn("[messages/upload] bucket ensure", e);
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const path = `${conversationId}/${userId}/${Date.now()}_${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (upErr) {
    console.error("[messages/upload]", upErr);
    return NextResponse.json(
      {
        error:
          upErr.message?.includes("Bucket not found")
            ? "Storage bucket missing. Create private bucket 'message-files' in Supabase Storage."
            : upErr.message || "Upload failed",
      },
      { status: 500 }
    );
  }

  // Signed URL — 30 days
  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 30);

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json({ error: "Could not create download link" }, { status: 500 });
  }

  return NextResponse.json({
    url: signed.signedUrl,
    storagePath: path,
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
  });
}
