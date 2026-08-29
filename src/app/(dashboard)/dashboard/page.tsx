import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";
import {
  Briefcase,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  ArrowRight,
  SearchIcon,
  ShoppingBag,
  BookOpen,
  Users,
  ShieldCheck,
  Sparkles,
  Activity,
  PackageOpen,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Profile, Job } from "@/types/database";

type ActivityItem = {
  id: string;
  type: "order_received" | "order_placed" | "listing_posted";
  title: string;
  created_at: string;
  status?: string;
  price?: string;
  currency?: string;
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) redirect("/register?mode=complete");

  if (profile.role === "employer") {
    // Fetch true counts using head requests, then fetch the recent 5 jobs for display
    const [
      { count: totalJobs },
      { count: pendingJobs },
      { count: approvedJobs },
      { data: jobs },
      { data: empOrdersRaw },
      { data: empListingsRaw },
    ] = await Promise.all([
      supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("employer_id", userId),
      supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("employer_id", userId)
        .eq("status", "pending"),
      supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("employer_id", userId)
        .eq("status", "approved"),
      supabase
        .from("jobs")
        .select("id, job_title, status, created_at, category, location, positions")
        .eq("employer_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("orders")
        .select("id, created_at, status, price, currency, buyer_id, seller_id, marketplace_listings(title)")
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("marketplace_listings")
        .select("id, title, created_at, status")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const allJobs = jobs ?? [];
    const total = totalJobs ?? 0;
    const pending = pendingJobs ?? 0;
    const approved = approvedJobs ?? 0;

    const empActivity = buildActivity(
      userId,
      (empOrdersRaw ?? []) as unknown as RawOrderActivity[],
      (empListingsRaw ?? []) as unknown as RawListingActivity[]
    );

    return (
      <EmployerDashboard
        profile={profile}
        jobs={allJobs}
        total={total}
        pending={pending}
        approved={approved}
        recentActivity={empActivity}
      />
    );
  }

  if (profile.role === "admin") {
    const [
      { count: usersCount },
      { count: jobsCount },
      { count: pendingCount },
      { count: pendingListings },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("jobs").select("*", { count: "exact", head: true }),
      supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("marketplace_listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

    return (
      <AdminDashboard
        usersCount={usersCount ?? 0}
        jobsCount={jobsCount ?? 0}
        pendingCount={pendingCount ?? 0}
        pendingListings={pendingListings ?? 0}
      />
    );
  }

  // Seeker dashboard
  const [
    { count: approvedJobs },
    { data: seekerOrdersRaw },
    { data: seekerListingsRaw },
  ] = await Promise.all([
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase
      .from("orders")
      .select("id, created_at, status, price, currency, buyer_id, seller_id, marketplace_listings(title)")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("marketplace_listings")
      .select("id, title, created_at, status")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const seekerActivity = buildActivity(
    userId,
    (seekerOrdersRaw ?? []) as unknown as RawOrderActivity[],
    (seekerListingsRaw ?? []) as unknown as RawListingActivity[]
  );

  return <SeekerDashboard profile={profile} approvedJobs={approvedJobs ?? 0} recentActivity={seekerActivity} />;
}

/* ── Seeker Dashboard ─────────────────────────────────────── */
function SeekerDashboard({
  profile,
  approvedJobs,
  recentActivity,
}: {
  profile: Profile;
  approvedJobs: number;
  recentActivity: ActivityItem[];
}) {
  const completeness = calcProfileCompleteness(profile);
  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground mb-1">Good day,</p>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              {firstName}
            </span>{" "}
            <span className="text-foreground">👋</span>
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Here&apos;s an overview of your activity and opportunities.
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/jobs">
            <SearchIcon className="h-3.5 w-3.5" /> Browse Jobs
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Briefcase className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          label="Jobs Available"
          value={approvedJobs.toLocaleString()}
          link={{ href: "/jobs", label: "View" }}
        />
        <StatCard
          icon={<User className="h-5 w-5 text-violet-600" />}
          iconBg="bg-violet-100 dark:bg-violet-900/30"
          label="Profile Complete"
          value={`${completeness}%`}
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          label="Account Status"
          value="Active"
        />
      </div>

      {/* Profile completeness banner */}
      {completeness < 80 && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                Complete your profile
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                A complete profile gets up to 3× more views from employers.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" asChild className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300">
            <Link href="/dashboard/profile">
              Complete now <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            href="/jobs"
            icon={<SearchIcon className="h-5 w-5 text-blue-600" />}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            title="Browse Jobs"
            desc="Discover thousands of expat opportunities"
          />
          <ActionCard
            href="/dashboard/profile"
            icon={<User className="h-5 w-5 text-violet-600" />}
            iconBg="bg-violet-100 dark:bg-violet-900/30"
            title="Edit Profile"
            desc="Keep your profile up to date"
          />
          <ActionCard
            href="/candidates"
            icon={<Users className="h-5 w-5 text-emerald-600" />}
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            title="Browse Candidates"
            desc="Connect with expat professionals"
          />
          <ActionCard
            href="/dashboard/market"
            icon={<ShoppingBag className="h-5 w-5 text-orange-600" />}
            iconBg="bg-orange-100 dark:bg-orange-900/30"
            title="Marketplace"
            desc="Buy, sell or browse listings"
          />
          <ActionCard
            href="/dashboard/articles"
            icon={<BookOpen className="h-5 w-5 text-pink-600" />}
            iconBg="bg-pink-100 dark:bg-pink-900/30"
            title="My Articles"
            desc="Write and share your expertise"
          />
        </div>
      </div>

      {/* Recent activity */}
      <RecentActivity items={recentActivity} />
    </div>
  );
}

/* ── Employer Dashboard ───────────────────────────────────── */
function EmployerDashboard({
  profile,
  jobs,
  total,
  pending,
  approved,
  recentActivity,
}: {
  profile: Profile;
  jobs: Pick<Job, "id" | "job_title" | "status" | "created_at" | "category" | "location" | "positions">[];
  total: number;
  pending: number;
  approved: number;
  recentActivity: ActivityItem[];
}) {
  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground mb-1">Good day,</p>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              {firstName}
            </span>{" "}
            <span className="text-foreground">👋</span>
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Manage your job posts and find top talent.
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/dashboard/jobs/new">
            <Plus className="h-3.5 w-3.5" /> Post a Job
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Briefcase className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          label="Total Posts"
          value={total.toString()}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          label="Pending Review"
          value={pending.toString()}
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          label="Approved"
          value={approved.toString()}
        />
      </div>

      {/* Recent job posts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Recent Job Posts</h2>
          <Button variant="ghost" size="sm" asChild className="text-xs h-7">
            <Link href="/dashboard/jobs">
              View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {jobs.length === 0 ? (
            <div className="text-center py-14 text-muted-foreground text-sm">
              <Briefcase className="h-9 w-9 mx-auto mb-3 opacity-25" />
              <p>No job posts yet.</p>
              <Link href="/dashboard/jobs/new" className="text-primary hover:underline text-sm mt-1 inline-block">
                Post your first job →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {jobs.map((job) => (
                <div key={job.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{job.job_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.location} · {job.positions} position{job.positions !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "text-xs shrink-0 border-0",
                      job.status === "approved" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
                      job.status === "pending" && "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
                      job.status === "rejected" && "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    )}
                  >
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            href="/dashboard/jobs/new"
            icon={<Plus className="h-5 w-5 text-blue-600" />}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            title="Post a New Job"
            desc="Reach thousands of expat professionals"
          />
          <ActionCard
            href="/candidates"
            icon={<Users className="h-5 w-5 text-violet-600" />}
            iconBg="bg-violet-100 dark:bg-violet-900/30"
            title="Browse Candidates"
            desc="Find skilled expat talent"
          />
          <ActionCard
            href="/dashboard/market"
            icon={<ShoppingBag className="h-5 w-5 text-orange-600" />}
            iconBg="bg-orange-100 dark:bg-orange-900/30"
            title="Marketplace"
            desc="Post and manage your listings"
          />
        </div>
      </div>

      <RecentActivity items={recentActivity} />
    </div>
  );
}

/* ── Admin Dashboard ──────────────────────────────────────── */
function AdminDashboard({
  usersCount,
  jobsCount,
  pendingCount,
  pendingListings,
}: {
  usersCount: number;
  jobsCount: number;
  pendingCount: number;
  pendingListings: number;
}) {
  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Platform overview</p>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Admin
          </span>{" "}
          <span className="text-foreground">Dashboard</span>
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Monitor platform activity and manage content.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          label="Total Users"
          value={usersCount.toLocaleString()}
        />
        <StatCard
          icon={<Briefcase className="h-5 w-5 text-violet-600" />}
          iconBg="bg-violet-100 dark:bg-violet-900/30"
          label="Total Jobs"
          value={jobsCount.toLocaleString()}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          label="Pending Jobs"
          value={pendingCount.toLocaleString()}
        />
        <StatCard
          icon={<ShoppingBag className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          label="Pending Listings"
          value={pendingListings.toLocaleString()}
        />
      </div>

      <div>
        <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            href="/dashboard/admin/jobs"
            icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            title="Review Job Queue"
            desc={`${pendingCount} job${pendingCount !== 1 ? "s" : ""} awaiting approval`}
          />
          <ActionCard
            href="/dashboard/admin/users"
            icon={<Users className="h-5 w-5 text-blue-600" />}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            title="Manage Users"
            desc="View and manage all platform users"
          />
          <ActionCard
            href="/dashboard/admin/market"
            icon={<ShoppingBag className="h-5 w-5 text-orange-600" />}
            iconBg="bg-orange-100 dark:bg-orange-900/30"
            title="Marketplace"
            desc={`${pendingListings} listing${pendingListings !== 1 ? "s" : ""} pending review`}
          />
          <ActionCard
            href="/dashboard/admin/articles"
            icon={<BookOpen className="h-5 w-5 text-pink-600" />}
            iconBg="bg-pink-100 dark:bg-pink-900/30"
            title="Articles"
            desc="Review and approve submitted articles"
          />
          <ActionCard
            href="/dashboard/admin/security"
            icon={<ShieldCheck className="h-5 w-5 text-violet-600" />}
            iconBg="bg-violet-100 dark:bg-violet-900/30"
            title="Security"
            desc="Audit logs and access control"
          />
        </div>
      </div>

      <RecentActivity items={[]} />
    </div>
  );
}

/* ── Shared helper components ─────────────────────────────── */

function StatCard({
  icon,
  iconBg,
  label,
  value,
  link,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow p-5">
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-4", iconBg)}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        {link && (
          <Link href={link.href} className="text-xs text-primary hover:underline font-medium">
            {link.label} &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  iconBg,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-200"
    >
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
    </Link>
  );
}

function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-base font-semibold">Recent Activity</h2>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 flex flex-col items-center justify-center py-14 text-center px-4">
          <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Activity className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground">No recent activity</p>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
            Your recent activity — marketplace orders and listings — will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
              <div
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                  item.type === "order_received" && "bg-emerald-100 dark:bg-emerald-900/30",
                  item.type === "order_placed" && "bg-blue-100 dark:bg-blue-900/30",
                  item.type === "listing_posted" && "bg-orange-100 dark:bg-orange-900/30"
                )}
              >
                {item.type === "order_received" && (
                  <PackageOpen className="h-3.5 w-3.5 text-emerald-600" />
                )}
                {item.type === "order_placed" && (
                  <ShoppingBag className="h-3.5 w-3.5 text-blue-600" />
                )}
                {item.type === "listing_posted" && (
                  <Tag className="h-3.5 w-3.5 text-orange-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.type === "order_received" && `New order for "${item.title}"`}
                  {item.type === "order_placed" && `You ordered "${item.title}"`}
                  {item.type === "listing_posted" && `Listed "${item.title}"`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.price ? `${item.currency} ${item.price}` : ""}
                  {item.price && item.status ? " · " : ""}
                  {item.status ?? ""}
                </p>
              </div>
              <p className="text-xs text-muted-foreground shrink-0">
                {new Date(item.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type RawOrderActivity = {
  id: string;
  created_at: string;
  status: string;
  price: string;
  currency: string;
  buyer_id: string;
  seller_id: string;
  marketplace_listings: { title: string } | null;
};

type RawListingActivity = {
  id: string;
  title: string;
  created_at: string;
  status: string;
};

function buildActivity(
  userId: string,
  ordersData: RawOrderActivity[],
  listingsData: RawListingActivity[]
): ActivityItem[] {
  const orderItems: ActivityItem[] = ordersData.map((o) => ({
    id: `order-${o.id}`,
    type: o.seller_id === userId ? ("order_received" as const) : ("order_placed" as const),
    title: o.marketplace_listings?.title ?? "an item",
    created_at: o.created_at,
    status: o.status,
    price: o.price,
    currency: o.currency,
  }));
  const listingItems: ActivityItem[] = listingsData.map((l) => ({
    id: `listing-${l.id}`,
    type: "listing_posted" as const,
    title: l.title,
    created_at: l.created_at,
    status: l.status,
  }));
  return [...orderItems, ...listingItems]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
}

function calcProfileCompleteness(profile: Profile): number {
  const fields = [
    profile.full_name,
    profile.phone,
    profile.gender,
    profile.location,
    profile.avatar_url,
    profile.role === "seeker" ? profile.profession : profile.company_cr,
    profile.role === "seeker" ? profile.cv_url : profile.company_address,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

