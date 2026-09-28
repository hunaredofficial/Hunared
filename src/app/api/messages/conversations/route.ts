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

  let archivedIds = new Set(
    parts.filter((p) => p.archived_at).map((p) => p.conversation_id)
  );
  let activeIds = parts.filter((p) => !p.archived_at).map((p) => p.conversation_id);
  const readMap = new Map(parts.map((p) => [p.conversation_id, p.last_read_at]));

  let ids = filter === "archived" ? [...archivedIds] : activeIds;
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

  // Other participants
  const convIds = (convs ?? []).map((c) => c.id);
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

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url, profession, company_name, role")
    .in("id", [...otherIds]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  let list = (convs ?? []).map((c) => {
    const otherId = otherByConv.get(c.id);
    const other = otherId ? profileMap.get(otherId) : null;
    const lastRead = readMap.get(c.id);
    const unread =
      !!c.last_message_at &&
      (!lastRead || new Date(c.last_message_at) > new Date(lastRead)) &&
      c.created_by !== userId; // approximate: unread if last activity after read
    // Better unread: last message not from me after last_read
    return {
      ...c,
      other,
      unread,
    };
  });

  // Refine unread using last message sender
  for (const item of list) {
    const { data: last } = await supabase
      .from("messages")
      .select("sender_id, created_at")
      .eq("conversation_id", item.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const lastRead = readMap.get(item.id);
    item.unread = !!(
      last &&
      last.sender_id !== userId &&
      (!lastRead || new Date(last.created_at) > new Date(lastRead))
    );
  }

  if (filter === "unread") list = list.filter((c) => c.unread);
  if (q) {
    list = list.filter((c) => {
      const hay = [
        c.context_title,
        c.context_subtitle,
        c.last_message_preview,
        c.other?.full_name,
        c.other?.username,
        c.other?.company_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  return NextResponse.json({ conversations: list });
}
