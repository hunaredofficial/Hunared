import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

const BUCKET = "message-files";

/**
 * Refresh a signed download URL for a message attachment stored in Supabase.
 * Query: ?path=conversationId/userId/file.pdf
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const path = req.nextUrl.searchParams.get("path") || "";
  if (!path || path.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const conversationId = path.split("/")[0];
  if (!conversationId) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: part } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!part) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60); // 1 hour

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message || "File not found" }, { status: 404 });
  }

  // Redirect to signed URL so browser opens/downloads the file
  return NextResponse.redirect(data.signedUrl);
}
