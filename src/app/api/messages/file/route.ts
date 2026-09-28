import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import crypto from "crypto";

const BUCKET = "message-files";

/**
 * Open a message attachment securely.
 *
 * Query options:
 *   ?path=storage/path.pdf          → Supabase Storage
 *   ?messageId=uuid                 → load metadata from messages table
 *   ?url=https://res.cloudinary...  → legacy Cloudinary (signed if API secret set)
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to open this file." }, { status: 401 });
  }

  const pathParam = req.nextUrl.searchParams.get("path") || "";
  const messageId = req.nextUrl.searchParams.get("messageId") || "";
  const urlParam = req.nextUrl.searchParams.get("url") || "";

  const supabase = createAdminClient();

  let storagePath = pathParam;
  let fileUrl = urlParam;
  let fileName = "file";
  let conversationId = "";

  if (messageId) {
    const { data: msg, error } = await supabase
      .from("messages")
      .select("id, conversation_id, metadata, sender_id")
      .eq("id", messageId)
      .maybeSingle();
    if (error || !msg) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    conversationId = msg.conversation_id;
    const meta = (msg.metadata || {}) as {
      storagePath?: string;
      fileUrl?: string;
      fileName?: string;
    };
    storagePath = meta.storagePath || storagePath;
    fileUrl = meta.fileUrl || fileUrl;
    fileName = meta.fileName || fileName;
  }

  if (storagePath) {
    conversationId = conversationId || storagePath.split("/")[0] || "";
  }

  // Participant check when we know the conversation
  if (conversationId) {
    const { data: part } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!part) {
      return NextResponse.json({ error: "You cannot access this file." }, { status: 403 });
    }
  }

  // ── Supabase Storage path (preferred) ──────────────────────────
  if (storagePath && !storagePath.startsWith("http")) {
    if (storagePath.includes("..")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }
    const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);
    if (error || !data) {
      console.error("[messages/file] download", error);
      return NextResponse.json(
        {
          error:
            "File not found in storage. If this is an old attachment, ask the sender to share it again.",
        },
        { status: 404 }
      );
    }
    const buf = Buffer.from(await data.arrayBuffer());
    const ext = storagePath.split(".").pop()?.toLowerCase() || "";
    const type =
      ext === "pdf"
        ? "application/pdf"
        : ext === "png"
          ? "image/png"
          : ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : "application/octet-stream";
    const name = storagePath.split("/").pop() || fileName;
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Content-Disposition": `inline; filename="${name}"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  }

  // ── Legacy Cloudinary URL ──────────────────────────────────────
  if (fileUrl && fileUrl.includes("res.cloudinary.com")) {
    const opened = await tryCloudinary(fileUrl, fileName);
    if (opened) return opened;
    return NextResponse.json(
      {
        error:
          "This file was saved with an old Cloudinary link that is no longer accessible (401). Ask the sender to upload the file again. New uploads use secure Hunared storage and open correctly.",
      },
      { status: 410 }
    );
  }

  // ── Generic external URL (try proxy) ───────────────────────────
  if (fileUrl.startsWith("https://")) {
    try {
      const r = await fetch(fileUrl);
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        return new NextResponse(buf, {
          status: 200,
          headers: {
            "Content-Type": r.headers.get("content-type") || "application/octet-stream",
            "Content-Disposition": `inline; filename="${fileName}"`,
          },
        });
      }
    } catch {
      /* fall through */
    }
  }

  return NextResponse.json(
    {
      error:
        "Cannot open this file. Ask the sender to share it again using the paperclip button.",
    },
    { status: 404 }
  );
}

async function tryCloudinary(fileUrl: string, fileName: string): Promise<NextResponse | null> {
  // 1) Try as-is
  try {
    let r = await fetch(fileUrl);
    if (r.ok) {
      const buf = Buffer.from(await r.arrayBuffer());
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": r.headers.get("content-type") || "application/pdf",
          "Content-Disposition": `inline; filename="${fileName}"`,
        },
      });
    }
  } catch {
    /* continue */
  }

  // 2) Rewrite raw → image (sometimes helps)
  const alt = fileUrl
    .replace("/raw/upload/", "/image/upload/")
    .replace("/fl_attachment/", "/");
  if (alt !== fileUrl) {
    try {
      const r = await fetch(alt);
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        return new NextResponse(buf, {
          status: 200,
          headers: {
            "Content-Type": r.headers.get("content-type") || "application/pdf",
            "Content-Disposition": `inline; filename="${fileName}"`,
          },
        });
      }
    } catch {
      /* continue */
    }
  }

  // 3) Signed URL if Cloudinary API secret is configured
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  if (cloud && apiSecret && apiKey) {
    try {
      // public_id from URL: .../upload/v123/folder/name.pdf
      const m = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
      const publicId = m?.[1]?.replace(/\.[^.]+$/, ""); // without extension for some APIs
      const publicIdWithExt = m?.[1];
      if (publicIdWithExt) {
        const timestamp = Math.floor(Date.now() / 1000);
        // For delivery signing (simple auth token style used by Cloudinary)
        const toSign = `public_id=${publicIdWithExt}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash("sha1").update(toSign).digest("hex");
        // Admin API resource download
        const adminUrl = `https://api.cloudinary.com/v1_1/${cloud}/resources/download`;
        // Prefer direct signed delivery URL for raw
        const exp = timestamp + 3600;
        const params = `expires_at=${exp}`;
        // Use API to get resource details
        const resUrl = `https://api.cloudinary.com/v1_1/${cloud}/resources/raw/upload/${encodeURIComponent(publicIdWithExt)}`;
        const authHeader =
          "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
        const info = await fetch(resUrl, { headers: { Authorization: authHeader } });
        if (info.ok) {
          const j = await info.json();
          const secure = j.secure_url as string | undefined;
          if (secure) {
            const r2 = await fetch(secure);
            if (r2.ok) {
              const buf = Buffer.from(await r2.arrayBuffer());
              return new NextResponse(buf, {
                status: 200,
                headers: {
                  "Content-Type": "application/pdf",
                  "Content-Disposition": `inline; filename="${fileName}"`,
                },
              });
            }
          }
        }
        void signature;
        void toSign;
        void params;
        void adminUrl;
        void publicId;
      }
    } catch (e) {
      console.error("[messages/file] cloudinary signed", e);
    }
  }

  return null;
}
