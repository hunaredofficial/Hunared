import { createAdminClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { UserRowActions } from "@/components/admin/UserRowActions";
import type { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/20 dark:text-purple-200 dark:border-purple-500/30",
  team: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-500/20 dark:text-teal-200 dark:border-teal-500/30",
  employer: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/30",
  seeker: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-200 dark:border-gray-500/30",
  personal: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-200 dark:border-slate-500/30",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  team: "Team",
  employer: "Company",
  seeker: "Seeker",
  personal: "Personal",
};

interface SearchParams {
  search?: string;
  role?: string;
  page?: string;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();

  // Verify admin role
  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (caller?.role !== "admin") redirect("/dashboard");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const roleFilter = sp.role ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const limit = 20;
  const from = (page - 1) * limit;

  let users: Partial<Profile>[] = [];
  let total = 0;

  try {
    let query = supabase
      .from("profiles")
      .select("id, full_name, role, location, created_at", { count: "exact" })
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (search) query = query.ilike("full_name", `%${search}%`);
    if (roleFilter) query = query.eq("role", roleFilter as import("@/types/database").UserRole);

    const { data, count } = await query;
    users = data ?? [];
    total = count ?? 0;
  } catch {
    // empty state if DB offline
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">{total} registered accounts</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <form method="GET" className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs text-muted-foreground mb-1 block">Search name</label>
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="search"
                  defaultValue={search}
                  placeholder="Search by name…"
                  className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Role</label>
              <select
                name="role"
                defaultValue={roleFilter}
                className="text-sm rounded-md border border-input bg-background px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All roles</option>
                <option value="personal">Personal</option>
                <option value="seeker">Seeker</option>
                <option value="employer">Company</option>
                <option value="team">Team</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" size="sm">Filter</Button>
            {(search || roleFilter) && (
              <Link
                href="/dashboard/admin/users"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Clear
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-0 pb-0 overflow-x-auto">
          {users.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Users className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground">No users found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Location</th>
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.full_name ?? "—"}</span>
                        <Badge className={`text-xs border ${ROLE_COLORS[user.role ?? "seeker"] ?? ""}`}>
                          {ROLE_LABELS[user.role ?? "seeker"] ?? user.role}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {user.location ?? "—"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <UserRowActions
                        userId={user.id!}
                        currentRole={user.role as Profile["role"]}
                        selfId={userId}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/dashboard/admin/users?${buildParams({ search, role: roleFilter, page: page - 1 })}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/dashboard/admin/users?${buildParams({ search, role: roleFilter, page: page + 1 })}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function buildParams(p: { search: string; role: string; page: number }) {
  const params = new URLSearchParams();
  if (p.search) params.set("search", p.search);
  if (p.role) params.set("role", p.role);
  if (p.page > 1) params.set("page", p.page.toString());
  return params.toString();
}
