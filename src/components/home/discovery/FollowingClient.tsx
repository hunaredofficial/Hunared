"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Loader2, User, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type UserRow = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  profession: string | null;
};

type CompanyRow = {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  industry: string | null;
};

export function FollowingClient() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/follow/list");
      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      const data = await res.json();
      setUsers(data.users ?? []);
      setCompanies(data.companies ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  async function unfollow(targetType: "user" | "company", targetId: string) {
    const res = await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error ?? "Could not unfollow");
      return;
    }
    if (targetType === "user") {
      setUsers((u) => u.filter((x) => x.id !== targetId));
    } else {
      setCompanies((c) => c.filter((x) => x.id !== targetId));
    }
    toast.success("Unfollowed");
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-5">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          People ({users.length})
        </h2>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You&apos;re not following anyone yet. Follow members from community
            posts on the homepage.
          </p>
        ) : (
          <ul className="divide-y divide-border/50">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                  {u.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">
                    {u.full_name || u.username || "Member"}
                  </p>
                  {u.profession ? (
                    <p className="text-xs text-muted-foreground truncate">{u.profession}</p>
                  ) : null}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 shrink-0"
                  onClick={() => unfollow("user", u.id)}
                >
                  <UserMinus className="h-3.5 w-3.5" />
                  Unfollow
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-5">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          Companies ({companies.length})
        </h2>
        {companies.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Follow companies from their profile pages to see their jobs in your
            Following feed.
          </p>
        ) : (
          <ul className="divide-y divide-border/50">
            {companies.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center shrink-0">
                  {c.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={c.slug ? `/companies/${c.slug}` : "/companies"}
                    className="text-sm font-semibold hover:text-primary truncate block"
                  >
                    {c.name}
                  </Link>
                  {c.industry ? (
                    <p className="text-xs text-muted-foreground truncate">{c.industry}</p>
                  ) : null}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 shrink-0"
                  onClick={() => unfollow("company", c.id)}
                >
                  <UserMinus className="h-3.5 w-3.5" />
                  Unfollow
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="text-center">
        <Button variant="outline" asChild>
          <Link href="/">Back to discovery feed</Link>
        </Button>
      </div>
    </div>
  );
}
