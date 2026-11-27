import Link from "next/link";
import type { Metadata } from "next";
import { CreatePostBar } from "@/components/home/discovery/CreatePostBar";
import { DiscoveryFeedClient } from "@/components/home/discovery/DiscoveryFeedClient";
import { LeftSidebar } from "@/components/home/discovery/LeftSidebar";
import { RightSidebar } from "@/components/home/discovery/RightSidebar";
import {
  getDiscoveryFeedPage,
  getFeedSidebarData,
} from "@/lib/home/feed";
import { PremiumAdSlot } from "@/components/ads/PremiumAdSlot";
import { Button } from "@/components/ui/button";
import { Compass, Search } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import type { PersonalizationProfile } from "@/lib/personalization";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Hunared — Global discovery for work, business & learning",
  },
  description:
    "Discover jobs, talent, companies, business listings, learning, and take a mindful break in MindSpace — one global platform.",
  openGraph: {
    title: "Hunared — Global discovery platform",
  },
};

async function loadProfile(): Promise<PersonalizationProfile | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("profiles")
      .select("job_interests, profession, country, city, skill_level")
      .eq("id", userId)
      .maybeSingle();
    if (!data) return null;
    return {
      job_interests: data.job_interests,
      profession: data.profession,
      country: data.country,
      city: data.city,
      skill_level: data.skill_level,
    };
  } catch {
    return null;
  }
}

export default async function HomePage() {
  let items: Awaited<ReturnType<typeof getDiscoveryFeedPage>>["items"] = [];
  let nextCursor: string | null = null;
  let sidebar: Awaited<ReturnType<typeof getFeedSidebarData>> = {
    jobs: [],
    companies: [],
    listings: [],
    articles: [],
  };

  try {
    const profile = await loadProfile();
    const [page, side] = await Promise.all([
      getDiscoveryFeedPage({ limit: 12, type: "all", profile }),
      getFeedSidebarData(),
    ]);
    items = page.items;
    nextCursor = page.nextCursor;
    sidebar = side;
  } catch {
    // empty states
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="border-b border-border/50 bg-card/40">
        <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Compass className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground truncate">
              <span className="font-semibold text-foreground">Discover</span>{" "}
              jobs, business, learning — and refresh in MindSpace
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 rounded-lg" asChild>
              <Link href="/search">
                <Search className="h-3.5 w-3.5 mr-1.5" />
                Search everything
              </Link>
            </Button>
            <Button size="sm" className="h-8 rounded-lg" asChild>
              <Link href="/post">Create</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-6 py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_280px] gap-4 lg:gap-5 items-start">
          <div className="hidden lg:block">
            <LeftSidebar />
          </div>

          <main className="min-w-0 space-y-4">
            <CreatePostBar />

            <div className="rounded-xl overflow-hidden">
              <PremiumAdSlot slotId="home_hero" legacySlotName="homepage_hero" />
            </div>

            <DiscoveryFeedClient
              initialItems={items}
              initialCursor={nextCursor}
            />
          </main>

          <div className="hidden lg:block">
            <RightSidebar data={sidebar} />
          </div>
        </div>

        <div className="lg:hidden mt-6 grid grid-cols-2 gap-2">
          <Link
            href="/mindspace"
            className="rounded-xl border border-primary/25 bg-primary/10 px-3 py-3 text-sm font-semibold text-primary"
          >
            MindSpace
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-border/60 bg-card px-3 py-3 text-sm font-semibold"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
