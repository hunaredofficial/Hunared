"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, ExternalLink, Loader2, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ResourceActions({
  id,
  title,
  isOwner,
  viewUrl,
}: {
  id: string;
  title: string;
  isOwner: boolean;
  viewUrl: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"dl" | "del" | "share" | null>(null);

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

  async function share() {
    setBusy("share");
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/education/resources/${id}`
        : "";
    try {
      if (navigator.share) {
        await navigator.share({ title, url, text: `Learning resource on Hunared: ${title}` });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      } catch {
        toast.error("Could not share");
      }
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
      {viewUrl && (
        <Button variant="outline" asChild>
          <a href={viewUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open file
          </a>
        </Button>
      )}
      <Button variant="outline" onClick={() => void share()} disabled={busy === "share"}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
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
