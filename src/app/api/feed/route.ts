import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDiscoveryFeedPage } from "@/lib/home/feed";

export const dynamic = "force-dynamic";

/** GET /api/feed?type=all|job|listing|article|following&cursor=ISO&limit=12 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const type = (sp.get("type") || "all") as
      | "all"
      | "job"
      | "listing"
      | "article"
      | "following";
    const cursor = sp.get("cursor");
    const limit = Math.min(30, Math.max(6, Number(sp.get("limit") || 12)));
    const { userId } = await auth();

    const { items, nextCursor } = await getDiscoveryFeedPage({
      type,
      cursor,
      limit,
      userId,
    });

    return NextResponse.json({ items, nextCursor });
  } catch (e) {
    console.error("[api/feed]", e);
    return NextResponse.json(
      { items: [], nextCursor: null, error: "feed_unavailable" },
      { status: 200 }
    );
  }
}
