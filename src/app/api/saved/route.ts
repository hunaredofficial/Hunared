import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { rateLimit } from "@/lib/rateLimit";

type ItemType = "job" | "listing" | "article";

function parseBody(
  body: unknown
): { itemType: ItemType; itemId: string } | { removeAll: true } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (b.removeAll === true) return { removeAll: true };
  const itemType = b.itemType;
  const itemId = b.itemId;
  if (itemType !== "job" && itemType !== "listing" && itemType !== "article") return null;
  if (typeof itemId !== "string" || !itemId.trim()) return null;
  return { itemType, itemId: itemId.trim() };
}

/** GET — enriched list for My Saved page → { items: [...] } */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: rows, error } = await supabase
    .from("saved_items")
    .select("id, item_type, item_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const list = rows ?? [];
  const jobIds = list.filter((r) => r.item_type === "job").map((r) => r.item_id);
  const listingIds = list
    .filter((r) => r.item_type === "listing")
    .map((r) => r.item_id);
  const articleIds = list
    .filter((r) => r.item_type === "article")
    .map((r) => r.item_id);

  const jobsMap = new Map<string, Record<string, unknown>>();
  const listingsMap = new Map<string, Record<string, unknown>>();
  const articlesMap = new Map<string, Record<string, unknown>>();

  if (jobIds.length) {
    const { data: jobs } = await supabase.from("jobs").select("*").in("id", jobIds);
    for (const j of jobs ?? []) jobsMap.set(j.id as string, j as Record<string, unknown>);
  }
  if (listingIds.length) {
    const { data: listings } = await supabase
      .from("marketplace_listings")
      .select("*")
      .in("id", listingIds);
    for (const l of listings ?? [])
      listingsMap.set(l.id as string, l as Record<string, unknown>);
  }
  if (articleIds.length) {
    const { data: articles } = await supabase
      .from("articles")
      .select("*")
      .in("id", articleIds);
    for (const a of articles ?? [])
      articlesMap.set(a.id as string, a as Record<string, unknown>);
  }

  const items = list.map((row) => {
    if (row.item_type === "article") {
      const article = articlesMap.get(row.item_id);
      if (!article) {
        return {
          type: "article" as const,
          unavailable: true,
          article: {
            id: row.item_id,
            title: "Unavailable article",
            category: null,
          },
        };
      }
      return {
        type: "article" as const,
        unavailable: article.status !== "approved",
        article: {
          id: article.id,
          title: article.title,
          category: article.category,
          created_at: article.created_at,
        },
      };
    }
    if (row.item_type === "job") {
      const job = jobsMap.get(row.item_id);
      if (!job) {
        return {
          type: "job" as const,
          unavailable: true,
          job: {
            id: row.item_id,
            job_title: "Unavailable job",
            company_name: "",
            location: "",
            salary_type: null,
            salary_rate: null,
            currency: null,
          },
        };
      }
      return {
        type: "job" as const,
        unavailable: job.status !== "approved",
        job: {
          id: job.id,
          job_title: job.job_title,
          company_name: job.company_name,
          location: job.location,
          salary_type: job.salary_type,
          salary_rate: job.salary_rate,
          currency: job.currency,
        },
      };
    }

    const listing = listingsMap.get(row.item_id);
    if (!listing) {
      return {
        type: "listing" as const,
        unavailable: true,
        listing: {
          id: row.item_id,
          title: "Unavailable listing",
          price: null,
          currency: null,
          location: "",
        },
      };
    }
    return {
      type: "listing" as const,
      unavailable: listing.status !== "approved",
      listing: {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        currency: listing.currency,
        location: listing.location ?? [listing.city, listing.country].filter(Boolean).join(", "),
      },
    };
  });

  return NextResponse.json({ items });
}

/** POST — save { itemType, itemId } */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`saved:${userId}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseBody(raw);
  if (!parsed || "removeAll" in parsed) {
    return NextResponse.json(
      { error: "itemType and itemId are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("saved_items").upsert(
    {
      user_id: userId,
      item_type: parsed.itemType,
      item_id: parsed.itemId,
    },
    { onConflict: "user_id,item_type,item_id", ignoreDuplicates: true }
  );

  if (error) {
    // Fallback insert (ignore duplicate)
    const { error: err2 } = await supabase.from("saved_items").insert({
      user_id: userId,
      item_type: parsed.itemType,
      item_id: parsed.itemId,
    });
    if (err2 && !/duplicate|unique/i.test(err2.message ?? "")) {
      return NextResponse.json({ error: err2.message }, { status: 500 });
    }
  }

  // Also mirror jobs into saved_jobs for legacy compatibility
  if (parsed.itemType === "job") {
    await supabase
      .from("saved_jobs")
      .upsert(
        { user_id: userId, job_id: parsed.itemId },
        { onConflict: "user_id,job_id", ignoreDuplicates: true }
      )
      .then(() => null)
      .catch(() => null);
  }

  return NextResponse.json({ saved: true });
}

/** DELETE — unsave one item or removeAll */
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseBody(raw);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if ("removeAll" in parsed) {
    const { error } = await supabase
      .from("saved_items")
      .delete()
      .eq("user_id", userId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // best-effort clear legacy table
    await supabase.from("saved_jobs").delete().eq("user_id", userId);
    return NextResponse.json({ cleared: true });
  }

  const { error } = await supabase
    .from("saved_items")
    .delete()
    .eq("user_id", userId)
    .eq("item_type", parsed.itemType)
    .eq("item_id", parsed.itemId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (parsed.itemType === "job") {
    await supabase
      .from("saved_jobs")
      .delete()
      .eq("user_id", userId)
      .eq("job_id", parsed.itemId);
  }

  return NextResponse.json({ saved: false });
}
