import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * After an approved job is published:
 * 1) Notify users subscribed to that job category (type: job_match)
 * 2) Optionally notify the publisher that the job is live (type: system)
 */
export async function notifyOnJobApproved(
  supabase: SupabaseClient,
  opts: {
    jobId: string;
    jobTitle: string;
    category: string | null | undefined;
    categories?: string[] | null;
    companyName?: string | null;
    /** poster — skipped for category alerts; gets "live" system notice */
    employerId: string;
    notifyPublisher?: boolean;
  }
) {
  const title = (opts.jobTitle || "New job").trim();
  const company = (opts.companyName || "").trim();
  const cats = new Set<string>();
  if (opts.category?.trim()) cats.add(opts.category.trim());
  if (Array.isArray(opts.categories)) {
    for (const c of opts.categories) {
      if (c?.trim()) cats.add(c.trim());
    }
  }

  let notified = 0;

  try {
    if (cats.size > 0) {
      const catList = [...cats];
      const { data: subs } = await supabase
        .from("job_category_subscriptions")
        .select("user_id, category")
        .in("category", catList)
        .limit(1000);

      const userIds = [
        ...new Set(
          (subs ?? [])
            .map((s) => s.user_id as string)
            .filter((id) => id && id !== opts.employerId)
        ),
      ];

      if (userIds.length) {
        const rows = userIds.map((user_id) => ({
          user_id,
          type: "job_match" as const,
          title: company ? `New job at ${company}` : "New job in your subscription",
          body: title.slice(0, 180),
          entity_type: "job" as const,
          entity_id: opts.jobId,
          is_read: false,
        }));

        for (let i = 0; i < rows.length; i += 50) {
          const chunk = rows.slice(i, i + 50);
          const { error } = await supabase.from("notifications").insert(chunk);
          if (error) {
            console.error("[notifyOnJobApproved] subscribers:", error.message);
          } else {
            notified += chunk.length;
          }
        }
      }
    }

    if (opts.notifyPublisher !== false && opts.employerId) {
      const { error } = await supabase.from("notifications").insert({
        user_id: opts.employerId,
        type: "system",
        title: "Your job is live",
        body: title.slice(0, 180),
        entity_type: "job",
        entity_id: opts.jobId,
        is_read: false,
      });
      if (error) {
        console.error("[notifyOnJobApproved] publisher:", error.message);
      } else {
        notified += 1;
      }
    }
  } catch (e) {
    console.error("[notifyOnJobApproved]", e);
  }

  return { notified };
}

export async function notifyOnListingApproved(
  supabase: SupabaseClient,
  opts: {
    listingId: string;
    title: string;
    category: string | null | undefined;
    sellerId: string;
    notifyPublisher?: boolean;
  }
) {
  const title = (opts.title || "New listing").trim();
  let notified = 0;

  try {
    if (opts.category?.trim()) {
      const { data: subs } = await supabase
        .from("marketplace_category_subscriptions")
        .select("user_id")
        .eq("category", opts.category.trim())
        .limit(1000);

      const userIds = [
        ...new Set(
          (subs ?? [])
            .map((s) => s.user_id as string)
            .filter((id) => id && id !== opts.sellerId)
        ),
      ];

      if (userIds.length) {
        const rows = userIds.map((user_id) => ({
          user_id,
          type: "listing_match" as const,
          title: "New listing in your subscription",
          body: title.slice(0, 180),
          entity_type: "listing" as const,
          entity_id: opts.listingId,
          is_read: false,
        }));

        for (let i = 0; i < rows.length; i += 50) {
          const chunk = rows.slice(i, i + 50);
          const { error } = await supabase.from("notifications").insert(chunk);
          if (!error) notified += chunk.length;
          else console.error("[notifyOnListingApproved] subs:", error.message);
        }
      }
    }

    if (opts.notifyPublisher !== false && opts.sellerId) {
      const { error } = await supabase.from("notifications").insert({
        user_id: opts.sellerId,
        type: "system",
        title: "Your listing is live",
        body: title.slice(0, 180),
        entity_type: "listing",
        entity_id: opts.listingId,
        is_read: false,
      });
      if (!error) notified += 1;
    }
  } catch (e) {
    console.error("[notifyOnListingApproved]", e);
  }

  return { notified };
}
