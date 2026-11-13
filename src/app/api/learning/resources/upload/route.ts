import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

const BUCKET = "learning-resources";
const MAX_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const EXT_OK = /\.(pdf|docx?|pptx?|xlsx?|txt|png|jpe?g|webp)$/i;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload body" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (file.size <= 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be 15MB or smaller" }, { status: 400 });
  }

  const type = (file.type || "").trim() || "application/octet-stream";
  const nameOk = EXT_OK.test(file.name);
  if (!ALLOWED.has(type) && !nameOk) {
    return NextResponse.json(
      { error: "Allowed: PDF, Word, PowerPoint, Excel, text, PNG, JPG, WebP" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === BUCKET)) {
      const { error: bErr } = await supabase.storage.createBucket(BUCKET, {
        public: false,
        fileSizeLimit: MAX_BYTES,
      });
      if (bErr && !/already exists/i.test(bErr.message)) {
        // continue — bucket may exist with different listing permissions
      }
    }
  } catch {
    /* listBuckets may fail without service role — still try upload */
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "file";
  const path = `${userId}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const contentType = ALLOWED.has(type) ? type : "application/octet-stream";
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
  });
  if (upErr) {
    let hint = upErr.message;
    if (/bucket|not found|No such/i.test(upErr.message)) {
      hint =
        "Storage bucket `learning-resources` missing. Create it in Supabase Storage (private), then try again.";
    }
    return NextResponse.json({ error: hint }, { status: 500 });
  }

  return NextResponse.json({
    file_path: path,
    file_name: file.name,
    file_type: contentType,
    file_size: file.size,
  });
}
