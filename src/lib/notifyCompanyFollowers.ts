import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Notify users who follow a company when that company publishes a new job or listing.
 */
export async function notifyCompanyFollowers(
  supabase: SupabaseClient,
  opts: {
    companyId: string | null | undefined;
    companyName?: string | null;
    kind: "job" | "listing";
    entityId: string;
    title: string;
    /** employer/seller user id — never notify them about their own post */
    actorUserId?: string | null;
  }
) {
  const companyId = opts.companyId?.trim();
  if (!companyId) return { notified: 0 };

  try {
    const { data: follows } = await supabase
      .from("company_follows")
      .select("user_id")
      .eq("company_id", companyId)
      .limit(500);

    const followers = (follows ?? [])
      .map((f) => f.user_id as string)
      .filter((id) => id && id !== opts.actorUserId);

    if (!followers.length) return { notified: 0 };

    const name = opts.companyName?.trim() || "A company you follow";
    const isJob = opts.kind === "job";
    const rows = followers.map((user_id) => ({
      user_id,
      type: "company_update",
      title: isJob
        ? `${name} posted a new job`
        : `${name} posted a new listing`,
      body: opts.title.slice(0, 180),
      entity_type: isJob ? "job" : "listing",
      entity_id: opts.entityId,
      is_read: false,
    }));

    // insert in chunks
    let notified = 0;
    for (let i = 0; i < rows.length; i += 50) {
      const chunk = rows.slice(i, i + 50);
      const { error } = await supabase.from("notifications").insert(chunk);
      if (!error) notified += chunk.length;
    }
    return { notified };
  } catch {
    return { notified: 0 };
  }
}
