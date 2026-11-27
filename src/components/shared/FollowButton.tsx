"use client";

import { useEffect, useState } from "react";
import { Loader2, UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function FollowButton({
  targetType,
  targetId,
  className,
  size = "sm",
}: {
  targetType: "user" | "company";
  targetId: string;
  className?: string;
  size?: "sm" | "default";
}) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const q = new URLSearchParams({ targetType, targetId });
        const res = await fetch(`/api/follow?${q}`);
        const data = await res.json().catch(() => ({}));
        if (alive) setFollowing(!!data.following);
      } catch {
        /* ignore */
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [targetType, targetId]);

  async function toggle() {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not update follow");
        return;
      }
      setFollowing(!!data.following);
      toast.success(data.following ? "Following" : "Unfollowed");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <Button
      type="button"
      size={size}
      variant={following ? "secondary" : "outline"}
      className={cn("gap-1.5", className)}
      disabled={loading}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : following ? (
        <UserCheck className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      {following ? "Following" : "Follow"}
    </Button>
  );
}
