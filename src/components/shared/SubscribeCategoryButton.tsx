"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Kind = "job" | "market";

interface Props {
  kind: Kind;
  category: string;
  label?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost" | "secondary";
}

export function SubscribeCategoryButton({
  kind,
  category,
  label,
  className,
  size = "sm",
  variant = "outline",
}: Props) {
  const { isSignedIn } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const endpoint =
    kind === "job" ? "/api/subscriptions/jobs" : "/api/subscriptions/market";

  useEffect(() => {
    if (!isSignedIn || !category) {
      setChecked(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(endpoint);
        if (!res.ok) return;
        const data = await res.json();
        const list = data.subscriptions ?? [];
        if (!cancelled) {
          setSubscribed(list.some((s: any) => s.category === category));
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, category, endpoint]);

  async function toggle() {
    if (!isSignedIn) {
      toast.info("Sign in to subscribe to categories");
      window.location.href = "/sign-in";
      return;
    }
    setLoading(true);
    try {
      const method = subscribed ? "DELETE" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setSubscribed(!subscribed);
      toast.success(
        subscribed
          ? `Unsubscribed from ${label || category}`
          : `Subscribed to ${label || category}`
      );
    } catch (e: any) {
      toast.error(e.message || "Could not update subscription");
    } finally {
      setLoading(false);
    }
  }

  if (!checked && isSignedIn) {
    return (
      <Button size={size} variant={variant} disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={toggle}
      disabled={loading}
      className={cn("gap-1.5", className)}
      title={
        subscribed
          ? `Unsubscribe from ${label || category}`
          : `Subscribe to ${label || category}`
      }
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : subscribed ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {subscribed ? "Unsubscribe" : "Subscribe"}
      {label ? ` · ${label}` : ""}
    </Button>
  );
}