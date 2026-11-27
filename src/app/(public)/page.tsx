import Link from "next/link";
import type { Metadata } from "next";
import { CreatePostBar } from "@/components/home/discovery/CreatePostBar";
import { FeedCard } from "@/components/home/discovery/FeedCard";
import { LeftSidebar } from "@/components/home/discovery/LeftSidebar";
import { RightSidebar } from "@/components/home/discovery/RightSidebar";
import { getDiscoveryFeed, getFeedSidebarData } from "@/lib/home/feed";
import { PremiumAdSlot } from "@/components/ads/PremiumAdSlot";
import { Button } from "@/components/ui/button";
import { Compass, Search } from "lucide-react";

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

const FILTERS = [
  { label: "All", href: "/" },
  { label: "Jobs", href: "/jobs" },
  { label: "Business", href: "/business" },
  { label: "Talent", href: "/candidates" },
  { label: "Companies", href: "/companies" },
  { label: "Learning", href: "/education" },
  { label: "MindSpace", href: "/mindspace" },
];

export default async function HomePage() {
  let feed: Awaited<ReturnType<typeof getDiscoveryFeed>> = [];
  let sidebar: Awaited<ReturnType<typeof getFeedSidebarData>> = {
    jobs: [],
    companies: [],
    listings: [],
    articles: [],
  };

  try {
    [feed, sidebar] = await Promise.all([
      getDiscoveryFeed(30),
      getFeedSidebarData(),
    ]);
  } catch {
    // Keep empty states if DB env is unavailable
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

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {FILTERS.map((f) => (
                <Link
                  key={f.label}
                  href={f.href}
                  className="shrink-0 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border transition"
                >
                  {f.label}
                </Link>
              ))}
            </div>

            <div className="rounded-xl overflow-hidden">
              <PremiumAdSlot slotId="home_hero" legacySlotName="homepage_hero" />
            </div>

            {feed.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-10 text-center">
                <p className="text-sm font-medium text-foreground">
                  Your feed is warming up
                </p>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                  When jobs, listings, and articles are published, they appear
                  here in one discovery stream.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button size="sm" asChild>
                    <Link href="/jobs">Browse jobs</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/business">Explore business</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/mindspace">MindSpace</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {feed.map((item, i) => (
                  <div key={item.id}>
                    <FeedCard item={item} />
                    {i === 4 ? (
                      <div className="my-3">
                        <PremiumAdSlot slotId="homepage_mid" />
                      </div>
                    ) : null}
                  </div>
                ))}
                <div className="rounded-2xl border border-border/50 bg-card/50 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    Explore more on Hunared
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/jobs">Jobs</Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/business">Business</Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/education">Learning</Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/mindspace">MindSpace</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
