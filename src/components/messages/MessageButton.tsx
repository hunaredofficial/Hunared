"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { MessageContextType } from "@/lib/messages/types";
import { cn } from "@/lib/utils";

type Props = {
  recipientId: string;
  contextType: MessageContextType;
  contextId?: string;
  contextTitle?: string;
  contextSubtitle?: string;
  contextHref?: string;
  category?: string;
  price?: string;
  location?: string;
  companyName?: string;
  disabled?: boolean;
  isSystemAccount?: boolean;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export function MessageButton({
  recipientId,
  contextType,
  contextId,
  contextTitle,
  contextSubtitle,
  contextHref,
  category,
  price,
  location,
  companyName,
  disabled,
  isSystemAccount,
  label = "Message",
  variant = "outline",
  size = "sm",
  className,
}: Props) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const rid = (recipientId || "").trim();
  if (disabled || isSystemAccount || !rid) return null;

  async function onClick() {
    if (!isSignedIn) {
      router.push(
        `/sign-in?redirect_url=${encodeURIComponent(contextHref || "/dashboard/messages")}`
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/messages/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: rid,
          contextType: contextType || "general",
          contextId: contextId || undefined,
          contextTitle: contextTitle || undefined,
          contextSubtitle: contextSubtitle || undefined,
          contextHref: contextHref || undefined,
          category: category || undefined,
          price: price || undefined,
          location: location || undefined,
          companyName: companyName || undefined,
          // User types/sends the first message themselves
          send: false,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !(j as { conversationId?: string }).conversationId) {
        toast.error(
          (j as { error?: string }).error || "Could not start conversation"
        );
        return;
      }
      const cid = (j as { conversationId: string; suggestedMessage?: string; suggestions?: string[] })
        .conversationId;
      try {
        if (Array.isArray((j as { suggestions?: string[] }).suggestions)) {
          sessionStorage.setItem(
            `hunared_msg_suggestions_${cid}`,
            JSON.stringify((j as { suggestions: string[] }).suggestions)
          );
        }
      } catch {
        /* ignore */
      }
      const draft = (j as { suggestedMessage?: string }).suggestedMessage
        ? `?draft=${encodeURIComponent((j as { suggestedMessage: string }).suggestedMessage)}`
        : "";
      router.push(`/dashboard/messages/${cid}${draft}`);
    } catch {
      toast.error("Could not start conversation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("gap-1.5", className)}
      disabled={loading}
      onClick={() => void onClick()}
    >
      <MessageSquare className="h-3.5 w-3.5" />
      {loading ? "Opening…" : label}
    </Button>
  );
}
