import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import {
  PREMIUM_AD_IMAGE_MAX_BYTES,
  PREMIUM_AD_IMAGE_TYPES,
} from "@/lib/premium-ads/constants";

export const dynamic = "force-dynamic";

const BUCKET = "premium-ads";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form" }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (!PREMIUM_AD_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Use JPG, PNG, WebP, or GIF" },
      { status: 400 }
    );
  }
  if (file.size > PREMIUM_AD_IMAGE_MAX_BYTES) {
    return NextResponse.json({ error: "Max file size is 5MB" }, { status: 400 });
  }

  const supabase = createAdminClient();
  // Ensure bucket exists (ignore error if already present)
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => null);
  try {
    await supabase.storage.updateBucket(BUCKET, { public: true });
  } catch {
    /* ignore */
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : "jpg";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return NextResponse.json(
      { error: error.message || "Upload failed. Create public bucket 'premium-ads' in Supabase Storage." },
      { status: 500 }
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
