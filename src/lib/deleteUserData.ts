import type { SupabaseClient } from "@supabase/supabase-js";
import { deleteCv } from "@/lib/storage";

/**
 * Permanently remove ALL app data for any account type:
 * personal | seeker (candidate) | employer (company) | admin.
 *
 * Clerk user id === profiles.id
 * Call with the service-role Supabase client.
 */
export async function deleteUserData(
  supabase: SupabaseClient,
  userId: string
): Promise<{ ok: boolean; errors: string[] }> {
  const errors: string[] = [];

  const run = async (
    label: string,
    fn: () => PromiseLike<{ error: { message: string } | null }>
  ) => {
    try {
      const { error } = await fn();
      if (error) {
        if (/does not exist|relation/i.test(error.message)) return;
        errors.push(`${label}: ${error.message}`);
      }
    } catch (e) {
      errors.push(`${label}: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  // --- Storage: CV ---
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("cv_url, role, full_name")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.cv_url) {
      try {
        await deleteCv(profile.cv_url);
      } catch (e) {
        errors.push(`cv: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  } catch (e) {
    errors.push(`profile fetch: ${e instanceof Error ? e.message : String(e)}`);
  }

  // --- Owned companies (and nested data) ---
  let companyIds: string[] = [];
  try {
    const { data: owned } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", userId);
    companyIds = (owned ?? []).map((c: { id: string }) => c.id);
  } catch {
    /* ignore */
  }

  if (companyIds.length > 0) {
    await run("company_reviews_on_owned", () =>
      supabase.from("company_reviews").delete().in("company_id", companyIds)
    );
    await run("company_follows_on_owned", () =>
      supabase.from("company_follows").delete().in("company_id", companyIds)
    );
  }

  // Content created by this user (any role)
  await run("jobs", () =>
    supabase.from("jobs").delete().eq("employer_id", userId)
  );
  await run("articles", () =>
    supabase.from("articles").delete().eq("author_id", userId)
  );
  await run("marketplace_listings", () =>
    supabase.from("marketplace_listings").delete().eq("seller_id", userId)
  );

  // Marketplace orders
  await run("orders_as_buyer", () =>
    supabase.from("orders").delete().eq("buyer_id", userId)
  );
  await run("orders_as_seller", () =>
    supabase.from("orders").delete().eq("seller_id", userId)
  );

  // Social / engagement as this user
  await run("company_reviews_by_user", () =>
    supabase.from("company_reviews").delete().eq("reviewer_id", userId)
  );
  await run("company_follows_by_user", () =>
    supabase.from("company_follows").delete().eq("user_id", userId)
  );

  // Company directory entries owned by this user
  await run("companies", () =>
    supabase.from("companies").delete().eq("owner_id", userId)
  );

  // Saves, shares, subscriptions, notifications
  await run("saved_jobs", () =>
    supabase.from("saved_jobs").delete().eq("user_id", userId)
  );
  await run("saved_items", () =>
    supabase.from("saved_items").delete().eq("user_id", userId)
  );
  await run("job_shares", () =>
    supabase.from("job_shares").delete().eq("user_id", userId)
  );
  await run("listing_shares", () =>
    supabase.from("listing_shares").delete().eq("user_id", userId)
  );
  await run("job_category_subscriptions", () =>
    supabase.from("job_category_subscriptions").delete().eq("user_id", userId)
  );
  await run("marketplace_category_subscriptions", () =>
    supabase
      .from("marketplace_category_subscriptions")
      .delete()
      .eq("user_id", userId)
  );
  await run("notifications", () =>
    supabase.from("notifications").delete().eq("user_id", userId)
  );

  // Profile last — removes from Candidates / Personal public views
  await run("profiles", () =>
    supabase.from("profiles").delete().eq("id", userId)
  );

  return { ok: errors.length === 0, errors };
}
