import { createAdminClient } from "@/lib/supabase";

/** Best-effort in-app notification (uses existing notifications table). */
export async function notifyUser(opts: {
  userId: string;
  title: string;
  body?: string;
  entityType?: "job" | "listing" | "order" | "article" | null;
  entityId?: string | null;
}) {
  try {
    if (!opts.userId) return;
    const supabase = createAdminClient();
    await supabase.from("notifications").insert({
      user_id: opts.userId,
      type: "system",
      title: opts.title,
      body: opts.body ?? null,
      entity_type: opts.entityType ?? null,
      entity_id: opts.entityId ?? null,
      is_read: false,
    });
  } catch (e) {
    console.warn("[notifyUser]", e);
  }
}
