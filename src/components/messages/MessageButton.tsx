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
  /** Marketplace category for smarter openers */
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

  if (disabled || isSystemAccount || !recipientId) return null;

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
          send: false,
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        toast.error(j.error || "Could not start conversation");
        return;
      }
      const draft = j.suggestedMessage
        ? `?draft=${encodeURIComponent(j.suggestedMessage)}`
        : "";
      // Pass suggestions via sessionStorage for inbox
      try {
        if (j.suggestions?.length) {
          sessionStorage.setItem(
            `hunared_msg_suggestions_${j.conversationId}`,
            JSON.stringify(j.suggestions)
          );
        }
      } catch {
        /* ignore */
      }
      router.push(`/dashboard/messages/${j.conversationId}${draft}`);
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
      {label}
    </Button>
  );
}
