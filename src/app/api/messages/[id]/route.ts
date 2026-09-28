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
  let mq = supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, message_type, metadata, created_at, deleted_at")
    .eq("conversation_id", id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);
  if (before) mq = mq.lt("created_at", before);

  const { data: messages } = await mq;

  // Mark read
  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", id)
    .eq("user_id", userId);

  const { data: parts } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", id);
  const otherId = (parts ?? []).map((p) => p.user_id).find((u) => u !== userId);
  let other = null;
  if (otherId) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url, profession, company_name, role")
      .eq("id", otherId)
      .maybeSingle();
    other = data;
  }

  const msgs = (messages ?? []).reverse();
  const senderIds = [...new Set(msgs.map((m) => m.sender_id))];
  const { data: senders } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url")
    .in("id", senderIds.length ? senderIds : ["__none__"]);
  const senderMap = new Map((senders ?? []).map((s) => [s.id, s]));
  const enriched = msgs.map((m) => ({
    ...m,
    sender: senderMap.get(m.sender_id) || null,
  }));

  return NextResponse.json({
    conversation: conv,
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
  const result = await sendMessage(userId, id, text);
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
