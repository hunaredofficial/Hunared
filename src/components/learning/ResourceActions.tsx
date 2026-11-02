"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/shared/ShareButton";
import { SaveButton } from "@/components/shared/SaveButton";
import { toast } from "sonner";

export function ResourceActions({
  id,
  title,
  isOwner,
}: {
  id: string;
  title: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"dl" | "del" | null>(null);

  async function download() {
    setBusy("dl");
    try {
      const res = await fetch(`/api/learning/resources/${id}/download`);
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error || "Download failed");
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Download failed");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!confirm("Delete this resource permanently?")) return;
    setBusy("del");
    try {
      const res = await fetch(`/api/learning/resources/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Delete failed");
        return;
      }
      toast.success("Resource deleted");
      router.push("/education#resources");
      router.refresh();
    } catch {
      toast.error("Delete failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => void download()} disabled={busy === "dl"}>
        {busy === "dl" ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Download
      </Button>
      <ShareButton url={`/education/resources/${id}`} title={title} size="default" />
      <SaveButton itemType="resource" itemId={id} size="default" />
      {isOwner && (
        <Button variant="destructive" onClick={() => void remove()} disabled={busy === "del"}>
          {busy === "del" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Delete
        </Button>
      )}
    </div>
  );
}
