"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ListingRowActions({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `Permanently delete "${title}"?\n\nThis cannot be undone. The listing will be removed from the marketplace.`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/market/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Delete failed");
        return;
      }
      toast.success("Listing deleted permanently");
      router.refresh();
    } catch {
      toast.error("Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
      disabled={busy}
      onClick={() => void handleDelete()}
      title="Delete permanently"
    >
      {busy ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Trash2 className="h-3 w-3" />
      )}
      Delete
    </Button>
  );
}
