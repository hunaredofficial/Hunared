"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ItemType = "job" | "listing";

export function SaveButton({
  itemType,
  itemId,
  initialSaved = false,
  className,
  size = "sm",
}: {
  itemType: ItemType;
  itemId: string;
  initialSaved?: boolean;
  className?: string;
  size?: "sm" | "default" | "icon";
}) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!isSignedIn) {
      const returnUrl = encodeURIComponent(pathname || "/");
      router.push(`/sign-in?redirect_url=${returnUrl}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/saved", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, itemId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error ?? "Could not update saved items");
        return;
      }
      setSaved(!saved);
      toast.success(
        saved ? "Removed from saved items." : "Saved to your list."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={saved ? "default" : "outline"}
      size={size}
      onClick={toggle}
      disabled={loading}
      className={cn("gap-1.5 shrink-0", className)}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : saved ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {size !== "icon" && (saved ? "Saved" : "Save")}
    </Button>
  );
}