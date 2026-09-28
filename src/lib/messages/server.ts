import { createAdminClient } from "@/lib/supabase";
import type { MessageContextType, StartConversationInput } from "./types";

const MAX_BODY = 4000;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;

/** True if profile is Hunared team / system — messaging not allowed */
export async function isSystemAccount(userId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("is_system_account, role")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return false;
  if (data.is_system_account === true) return true;
  // Treat admin role as non-messageable team by default
  if (data.role === "admin") return true;
  return false;
}

export async function isBlocked(a: string, b: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data: d1 } = await supabase
    .from("message_blocks")
    .select("blocker_id")
    .eq("blocker_id", a)
    .eq("blocked_id", b)
    .maybeSingle();
  if (d1) return true;
  const { data: d2 } = await supabase
    .from("message_blocks")
    .select("blocker_id")
    .eq("blocker_id", b)
    .eq("blocked_id", a)
    .maybeSingle();
  return !!d2;
}

export async function canMessageRecipient(
  senderId: string,
  recipientId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (senderId === recipientId) {
    return { ok: false, error: "You cannot message yourself." };
  }
  if (await isSystemAccount(recipientId)) {
    return {
      ok: false,
      error: "This is a Hunared team post. Messaging the team is not available here — use Contact.",
    };
  }
  if (await isBlocked(senderId, recipientId)) {
    return { ok: false, error: "Messaging is not available with this user." };
  }
  const supabase = createAdminClient();
  const { data: recip } = await supabase
    .from("profiles")
    .select("message_privacy, deleted_at")
    .eq("id", recipientId)
    .maybeSingle();
  if (!recip || recip.deleted_at) {
    return { ok: false, error: "User not found." };
  }
  if (recip.message_privacy === "nobody") {
    return { ok: false, error: "This user is not accepting messages." };
  }
  return { ok: true };
}

/** Find existing 1:1 conversation for same context, or create */
export async function startOrGetConversation(
  senderId: string,
  input: StartConversationInput
): Promise<{ conversationId: string; created: boolean; error?: string }> {
  const check = await canMessageRecipient(senderId, input.recipientId);
  if (!check.ok) return { conversationId: "", created: false, error: check.error };

  const supabase = createAdminClient();

  // Find shared conversation with same context
  const { data: myParts } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", senderId);

  const myIds = (myParts ?? []).map((p) => p.conversation_id);
  if (myIds.length) {
    const { data: shared } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", input.recipientId)
      .in("conversation_id", myIds);

    const sharedIds = (shared ?? []).map((s) => s.conversation_id);
    if (sharedIds.length) {
      let q = supabase
        .from("conversations")
        .select("id")
        .in("id", sharedIds)
        .eq("context_type", input.contextType);
      if (input.contextId) q = q.eq("context_id", input.contextId);
      else q = q.is("context_id", null);
      const { data: match } = await q.limit(1).maybeSingle();
      if (match?.id) {
        return { conversationId: match.id, created: false };
      }
    }
  }

  const { data: conv, error } = await supabase
    .from("conversations")
    .insert({
      context_type: input.contextType,
      context_id: input.contextId ?? null,
      context_title: input.contextTitle ?? null,
      context_subtitle: input.contextSubtitle ?? null,
      context_href: input.contextHref ?? null,
      context_meta: input.contextMeta ?? {},
      created_by: senderId,
      last_message_at: new Date().toISOString(),
      last_message_preview: input.initialMessage?.slice(0, 120) ?? null,
    })
    .select("id")
    .single();

  if (error || !conv) {
    return { conversationId: "", created: false, error: error?.message || "Could not create conversation" };
  }

  await supabase.from("conversation_participants").insert([
    { conversation_id: conv.id, user_id: senderId, last_read_at: new Date().toISOString() },
    { conversation_id: conv.id, user_id: input.recipientId },
  ]);

  const first = (input.initialMessage || "").trim();
  if (first) {
    const sm = await sendMessage(senderId, conv.id, first);
    // Conversation is valid even if first message fails — never block start
    if (sm.error) {
      console.warn("[messages] first message failed:", sm.error);
    }
  }

  return { conversationId: conv.id, created: true };
}

export async function sendMessage(
  senderId: string,
  conversationId: string,
  body: string,
  opts?: {
    messageType?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<{ messageId?: string; error?: string }> {
  const text = body.trim().slice(0, MAX_BODY);
  const hasFile = !!(opts?.metadata && (opts.metadata as { fileUrl?: string }).fileUrl);
  if (!text && !hasFile) {
    return { error: "Message is empty" };
  }

  const supabase = createAdminClient();
  const { data: part } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", senderId)
    .maybeSingle();
  if (!part) return { error: "Not a participant" };

  // Rate limit: count recent messages from sender
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", senderId)
    .gte("created_at", since);
  if ((count ?? 0) >= RATE_MAX) {
    return { error: "Too many messages. Please wait a moment." };
  }

  // Block check vs other participants
  const { data: others } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .neq("user_id", senderId);
  for (const o of others ?? []) {
    if (await isBlocked(senderId, o.user_id)) {
      return { error: "Messaging is not available with this user." };
    }
  }

  const preview = text || String((opts?.metadata as { fileName?: string })?.fileName || "Attachment");
  const { data: msg, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body: text || preview,
      message_type: opts?.messageType || (hasFile ? "file" : "text"),
      metadata: opts?.metadata || {},
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: preview.slice(0, 120),
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", senderId);

  // Notify other participants with sender display name
  const { data: senderProf } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", senderId)
    .maybeSingle();
  const who =
    senderProf?.full_name ||
    (senderProf?.username ? `@${senderProf.username}` : "Someone");

  for (const o of others ?? []) {
    try {
      await supabase.from("notifications").insert({
        user_id: o.user_id,
        type: "message",
        title: `New message from ${who}`,
        body: text.slice(0, 140),
        entity_type: "conversation",
        entity_id: conversationId,
        is_read: false,
      });
    } catch {
      /* notifications table may differ */
    }
  }

  return { messageId: msg?.id };
}

export { primaryOpener as suggestedOpener, buildSuggestedOpeners, contextTypeFromMarketCategory } from "./openers";
export type { OpenerContext } from "./openers";



export async function deleteMessage(
  userId: string,
  messageId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient();
  const { data: msg } = await supabase
    .from("messages")
    .select("id, sender_id, conversation_id, created_at")
    .eq("id", messageId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!msg) return { ok: false, error: "Message not found" };
  if (msg.sender_id !== userId) {
    return { ok: false, error: "You can only delete your own messages" };
  }
  const { error } = await supabase
    .from("messages")
    .update({ deleted_at: new Date().toISOString(), body: "" })
    .eq("id", messageId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
