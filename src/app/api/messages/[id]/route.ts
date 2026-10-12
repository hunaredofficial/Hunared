import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { sendMessage, deleteMessage } from "@/lib/messages/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const supabase = createAdminClient();

  const { data: part } = await supabase
    .from("conversation_participants")
    .select("user_id, last_read_at")
    .eq("conversation_id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!part) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: conv } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .single();

  const before = req.nextUrl.searchParams.get("before");
  const after = req.nextUrl.searchParams.get("after");
  const light = req.nextUrl.searchParams.get("light") === "1";

  let mq = supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, message_type, metadata, created_at, deleted_at")
    .eq("conversation_id", id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(light && after ? 30 : 50);
  if (before) mq = mq.lt("created_at", before);
  if (after) {
    mq = mq.gt("created_at", after).order("created_at", { ascending: true });
  }

  const { data: messages } = await mq;

  // Full open marks read; light poll only marks when new messages arrived
  if (!light || (after && (messages?.length ?? 0) > 0)) {
    await supabase
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", id)
      .eq("user_id", userId);
  }

  let other = null;
  if (!light) {
    const { data: parts } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", id);
    const otherId = (parts ?? []).map((p) => p.user_id).find((u) => u !== userId);
    if (otherId) {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, profession, role")
        .eq("id", otherId)
        .maybeSingle();
      other = data;
    }
  }

  const msgs = after ? (messages ?? []) : (messages ?? []).reverse();
  const senderIds = [...new Set(msgs.map((m) => m.sender_id))];
  let enriched = msgs;
  if (senderIds.length) {
    const { data: senders } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url")
      .in("id", senderIds);
    const senderMap = new Map((senders ?? []).map((s) => [s.id, s]));
    enriched = msgs.map((m) => ({
      ...m,
      sender: senderMap.get(m.sender_id) || null,
    }));
  }

  return NextResponse.json({
    conversation: light ? undefined : conv,
    messages: enriched,
    other,
  });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const text = String(body.body || "");
  const result = await sendMessage(userId, id, text, {
    messageType: body.messageType,
    metadata: body.metadata,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, messageId: result.messageId });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const supabase = createAdminClient();

  const { data: part } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!part) return NextResponse.json({ error: "Not found" }, { status: 404 });

  
  if (body.deleteForEveryone === true) {
    // Soft-delete all messages + remove both participants' access
    await supabase
      .from("messages")
      .update({ deleted_at: new Date().toISOString(), body: "" })
      .eq("conversation_id", id)
      .is("deleted_at", null);
    await supabase
      .from("conversation_participants")
      .update({ archived_at: new Date().toISOString() })
      .eq("conversation_id", id);
    await supabase
      .from("conversations")
      .update({ status: "closed", last_message_preview: "Chat deleted" })
      .eq("id", id);
    return NextResponse.json({ ok: true, deletedForEveryone: true });
  }

  if (body.archive === true) {
    await supabase
      .from("conversation_participants")
      .update({ archived_at: new Date().toISOString() })
      .eq("conversation_id", id)
      .eq("user_id", userId);
  } else if (body.archive === false) {
    await supabase
      .from("conversation_participants")
      .update({ archived_at: null })
      .eq("conversation_id", id)
      .eq("user_id", userId);
  }

  // Remove conversation from this user's inbox only
  if (body.deleteForMe === true) {
    await supabase
      .from("conversation_participants")
      .delete()
      .eq("conversation_id", id)
      .eq("user_id", userId);
  }

  return NextResponse.json({ ok: true });
}


export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  // id can be conversation id — messageId in body or query
  const messageId = req.nextUrl.searchParams.get("messageId") || "";
  const body = await req.json().catch(() => ({}));
  const mid = messageId || String((body as { messageId?: string }).messageId || "");
  if (!mid) return NextResponse.json({ error: "messageId required" }, { status: 400 });
  const result = await deleteMessage(userId, mid);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
