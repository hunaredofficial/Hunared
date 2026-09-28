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

  let count = 0;
  for (const p of parts) {
    const { data: last } = await supabase
      .from("messages")
      .select("sender_id, created_at")
      .eq("conversation_id", p.conversation_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (
      last &&
      last.sender_id !== userId &&
      (!p.last_read_at || new Date(last.created_at) > new Date(p.last_read_at))
    ) {
      count++;
    }
  }
  return NextResponse.json({ count });
}
