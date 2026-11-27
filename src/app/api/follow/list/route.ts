import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** GET — people & companies the current user follows */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data: rows, error } = await supabase
      .from("follows")
      .select("id, target_type, target_id, created_at")
      .eq("follower_id", userId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      if (/relation|does not exist/i.test(error.message)) {
        return NextResponse.json({ users: [], companies: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const userIds = (rows ?? [])
      .filter((r) => r.target_type === "user")
      .map((r) => r.target_id);
    const companyIds = (rows ?? [])
      .filter((r) => r.target_type === "company")
      .map((r) => r.target_id);

    let users: {
      id: string;
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
      profession: string | null;
      followed_at: string;
    }[] = [];

    let companies: {
      id: string;
      name: string;
      slug: string | null;
      logo_url: string | null;
      industry: string | null;
      followed_at: string;
    }[] = [];

    if (userIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, profession")
        .in("id", userIds);
      const at = Object.fromEntries(
        (rows ?? [])
          .filter((r) => r.target_type === "user")
          .map((r) => [r.target_id, r.created_at])
      );
      users = (profiles ?? []).map((p) => ({
        ...p,
        followed_at: at[p.id] ?? "",
      }));
    }

    if (companyIds.length) {
      const { data: cos } = await supabase
        .from("companies")
        .select("id, name, slug, logo_url, industry")
        .in("id", companyIds);
      const at = Object.fromEntries(
        (rows ?? [])
          .filter((r) => r.target_type === "company")
          .map((r) => [r.target_id, r.created_at])
      );
      companies = (cos ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        logo_url: c.logo_url,
        industry: Array.isArray(c.industry) ? c.industry[0] : (c.industry as string | null),
        followed_at: at[c.id] ?? "",
      }));
    }

    return NextResponse.json({ users, companies });
  } catch (e) {
    console.error("[follow/list]", e);
    return NextResponse.json({ users: [], companies: [] });
  }
}
