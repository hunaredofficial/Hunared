import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filter = req.nextUrl.searchParams.get("filter") || "all";
  const q = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  const supabase = createAdminClient();

  const { data: parts, error: pErr } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at, archived_at")
    .eq("user_id", userId);

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });
  if (!parts?.length) return NextResponse.json({ conversations: [] });

  const archivedIds = new Set(
    parts.filter((p) => p.archived_at).map((p) => p.conversation_id)
  );
  const activeIds = parts.filter((p) => !p.archived_at).map((p) => p.conversation_id);
  const readMap = new Map(parts.map((p) => [p.conversation_id, p.last_read_at]));

  const ids = filter === "archived" ? [...archivedIds] : activeIds;
  if (!ids.length) return NextResponse.json({ conversations: [] });

  let query = supabase
    .from("conversations")
    .select(
      "id, context_type, context_id, context_title, context_subtitle, context_href, context_meta, created_by, status, last_message_at, last_message_preview, created_at"
    )
    .in("id", ids)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(80);

  if (filter !== "all" && filter !== "unread" && filter !== "archived") {
    query = query.eq("context_type", filter);
  }

  const { data: convs, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const convIds = (convs ?? []).map((c) => c.id);
  if (!convIds.length) return NextResponse.json({ conversations: [] });

  const { data: allParts } = await supabase
    .from("conversation_participants")
    .select("conversation_id, user_id")
    .in("conversation_id", convIds);

  const otherIds = new Set<string>();
  const otherByConv = new Map<string, string>();
  for (const p of allParts ?? []) {
    if (p.user_id !== userId) {
      otherByConv.set(p.conversation_id, p.user_id);
      otherIds.add(p.user_id);
    }
  }

  // Only select columns that exist on profiles (company_name does NOT)
  let profileMap = new Map<
    string,
    {
      id: string;
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
      profession: string | null;
      role: string | null;
    }
  >();

  if (otherIds.size) {
    const { data: profiles, error: profErr } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url, profession, role")
      .in("id", [...otherIds]);
    if (profErr) {
      console.error("[messages/conversations] profiles", profErr.message);
    }
    profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  }

  // Batch last messages for unread (avoid N+1)
  const { data: recentMsgs } = await supabase
    .from("messages")
    .select("conversation_id, sender_id, created_at")
    .in("conversation_id", convIds)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const lastByConv = new Map<string, { sender_id: string; created_at: string }>();
  for (const m of recentMsgs ?? []) {
    if (!lastByConv.has(m.conversation_id)) {
      lastByConv.set(m.conversation_id, {
        sender_id: m.sender_id,
        created_at: m.created_at,
      });
    }
  }

  let list = (convs ?? []).map((c) => {
    const otherId = otherByConv.get(c.id);
    const other = otherId ? profileMap.get(otherId) ?? null : null;
    const last = lastByConv.get(c.id);
    const lastRead = readMap.get(c.id);
    const unread = !!(
      last &&
      last.sender_id !== userId &&
      (!lastRead || new Date(last.created_at) > new Date(lastRead))
    );
    return {
      ...c,
      other: other
        ? {
            id: other.id,
            full_name: other.full_name,
            username: other.username,
            avatar_url: other.avatar_url,
            profession: other.profession,
            role: other.role,
          }
        : otherId
          ? { id: otherId, full_name: null, username: null, avatar_url: null }
          : null,
      unread,
      is_archived: archivedIds.has(c.id),
    };
  });

  if (filter === "unread") list = list.filter((c) => c.unread);
  if (q) {
    list = list.filter((c) => {
      const hay = [
        c.context_title,
        c.context_subtitle,
        c.last_message_preview,
        c.other?.full_name,
        c.other?.username,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  return NextResponse.json({ conversations: list });
}
