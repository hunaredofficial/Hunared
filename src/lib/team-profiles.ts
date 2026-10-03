import type { SupabaseClient } from "@supabase/supabase-js";
import { deleteUserData } from "@/lib/deleteUserData";

export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

export function slugifyCompany(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "company";
}

/** Find a team-managed profile by email or phone (digits). */
export async function findTeamManagedProfile(
  supabase: SupabaseClient,
  opts: { email?: string | null; phone?: string | null }
) {
  const email = opts.email?.trim().toLowerCase();
  const phoneDigits = normalizePhone(opts.phone);

  if (email) {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, phone, full_name, role, team_managed")
      .eq("team_managed", true)
      .ilike("email", email)
      .limit(1)
      .maybeSingle();
    if (data) return data;
  }

  if (phoneDigits.length >= 7) {
    const { data: rows } = await supabase
      .from("profiles")
      .select("id, email, phone, full_name, role, team_managed")
      .eq("team_managed", true)
      .not("phone", "is", null)
      .limit(50);
    const hit = (rows ?? []).find(
      (r: { phone?: string | null }) => normalizePhone(r.phone) === phoneDigits
    );
    if (hit) return hit;
  }

  return null;
}

/**
 * When a real user signs up with email/phone matching a team-created profile,
 * delete the team placeholder (and its data) so the real account can own the identity.
 */
export async function claimOrReplaceTeamProfile(
  supabase: SupabaseClient,
  realUserId: string,
  opts: { email?: string | null; phone?: string | null }
): Promise<{ replaced: boolean; deletedId?: string }> {
  const match = await findTeamManagedProfile(supabase, opts);
  if (!match) return { replaced: false };
  if (match.id === realUserId) return { replaced: false };

  await deleteUserData(supabase, match.id);
  return { replaced: true, deletedId: match.id };
}

/** Match ONLY team-managed companies by name (case-insensitive). */
export async function findTeamManagedCompanyByName(
  supabase: SupabaseClient,
  companyName: string
) {
  const name = companyName.trim();
  if (!name) return null;
  const { data } = await supabase
    .from("companies")
    .select("id, name, owner_id, team_managed")
    .eq("team_managed", true)
    .ilike("name", name)
    .limit(1)
    .maybeSingle();
  return data;
}
