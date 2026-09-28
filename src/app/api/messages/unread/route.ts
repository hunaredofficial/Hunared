import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ count: 0 });

  const supabase = createAdminClient();
  const { data: parts } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId)
    .is("archived_at", null);

  if (!parts?.length) return NextResponse.json({ count: 0 });

  const ids = parts.map((p) => p.conversation_id);
  const readMap = new Map(parts.map((p) => [p.conversation_id, p.last_read_at]));

  const { data: msgs } = await supabase
    .from("messages")
    .select("conversation_id, sender_id, created_at")
    .in("conversation_id", ids)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const lastByConv = new Map<string, { sender_id: string; created_at: string }>();
  for (const m of msgs ?? []) {
    if (!lastByConv.has(m.conversation_id)) {
      lastByConv.set(m.conversation_id, {
        sender_id: m.sender_id,
        created_at: m.created_at,
      });
    }
  }

  let count = 0;
  for (const id of ids) {
    const last = lastByConv.get(id);
    const lastRead = readMap.get(id);
    if (
      last &&
      last.sender_id !== userId &&
      (!lastRead || new Date(last.created_at) > new Date(lastRead))
    ) {
      count++;
    }
  }

  return NextResponse.json({ count });
}
