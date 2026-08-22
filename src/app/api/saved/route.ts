import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

type ItemType = "job" | "listing";

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

  const jobIds = (rows ?? [])
    .filter((r) => r.item_type === "job")
    .map((r) => r.item_id);
  const listingIds = (rows ?? [])
    .filter((r) => r.item_type === "listing")
    .map((r) => r.item_id);

  const [jobsRes, listingsRes] = await Promise.all([
    jobIds.length
      ? supabase
          .from("jobs")
          .select(
            "id, job_title, company_name, location, salary_rate, currency, salary_type, employment_type, created_at, status"
          )
          .in("id", jobIds)
      : Promise.resolve({ data: [] as any[] }),
    listingIds.length
      ? supabase
          .from("marketplace_listings")
          .select(
            "id, title, price, currency, location, image_url, category, created_at, status"
          )
          .in("id", listingIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const jobsMap = new Map((jobsRes.data ?? []).map((j: any) => [j.id, j]));
  const listingsMap = new Map(
    (listingsRes.data ?? []).map((l: any) => [l.id, l])
  );

  const items = (rows ?? [])
    .map((r) => {
      if (r.item_type === "job") {
        const job = jobsMap.get(r.item_id);
        if (!job) {
          return {
            saveId: r.id,
            type: "job" as const,
            savedAt: r.created_at,
            unavailable: true,
            job: { id: r.item_id, job_title: "Job unavailable" },
          };
        }
        return {
          saveId: r.id,
          type: "job" as const,
          savedAt: r.created_at,
          unavailable: job.status !== "approved",
          job,
        };
      }
      const listing = listingsMap.get(r.item_id);
      if (!listing) {
        return {
          saveId: r.id,
          type: "listing" as const,
          savedAt: r.created_at,
          unavailable: true,
          listing: { id: r.item_id, title: "Listing unavailable" },
        };
      }
      return {
        saveId: r.id,
        type: "listing" as const,
        savedAt: r.created_at,
        unavailable: listing.status !== "approved",
        listing,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ items, count: items.length });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const itemType = body.itemType as ItemType;
  const itemId = body.itemId as string;

  if (!itemId || (itemType !== "job" && itemType !== "listing")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("saved_items").upsert(
    {
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
    },
    { onConflict: "user_id,item_type,item_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ saved: true });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const itemType = body.itemType as ItemType | undefined;
  const itemId = body.itemId as string | undefined;
  const removeAll = body.removeAll === true;

  const supabase = createAdminClient();

  if (removeAll) {
    const { error } = await supabase
      .from("saved_items")
      .delete()
      .eq("user_id", userId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ saved: false, cleared: true });
  }

  if (!itemId || (itemType !== "job" && itemType !== "listing")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { error } = await supabase
    .from("saved_items")
    .delete()
    .eq("user_id", userId)
    .eq("item_type", itemType)
    .eq("item_id", itemId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ saved: false });
}