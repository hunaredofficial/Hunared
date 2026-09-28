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
  /** Hide button entirely (e.g. system listing) */
  disabled?: boolean;
  /** Pre-known system account — skip render */
  isSystemAccount?: boolean;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  /** If true, open composer with suggested text without auto-send */
  draftOnly?: boolean;
};

export function MessageButton({
  recipientId,
  contextType,
  contextId,
  contextTitle,
  contextSubtitle,
  contextHref,
  disabled,
  isSystemAccount,
  label = "Message",
  variant = "outline",
  size = "sm",
  className,
  draftOnly = true,
}: Props) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (disabled || isSystemAccount || !recipientId) return null;

  async function onClick() {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(contextHref || "/dashboard/messages")}`);
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
          send: !draftOnly,
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        toast.error(j.error || "Could not start conversation");
        return;
      }
      const q = draftOnly && j.suggestedMessage
        ? `?draft=${encodeURIComponent(j.suggestedMessage)}`
        : "";
      router.push(`/dashboard/messages/${j.conversationId}${q}`);
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
