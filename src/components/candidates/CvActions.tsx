"use client";

import { useState } from "react";
import { Download, Eye, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function CvActions({
  candidateId,
  hasCv,
  isSignedIn,
}: {
  candidateId: string;
  hasCv: boolean;
  isSignedIn: boolean;
}) {
  const [loading, setLoading] = useState<"view" | "download" | null>(null);

  async function getSignedUrl(): Promise<string | null> {
    const res = await fetch(
      `/api/cv/download?userId=${encodeURIComponent(candidateId)}`
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error ?? "Could not open CV");
      return null;
    }
    return data.url as string;
  }

  async function handleView() {
    setLoading("view");
    try {
      const url = await getSignedUrl();
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(null);
    }
  }

  async function handleDownload() {
    setLoading("download");
    try {
      const url = await getSignedUrl();
      if (!url) return;

      // Open as download when possible
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = "CV";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setLoading(null);
    }
  }

  if (!hasCv) {
    return (
      <p className="text-xs text-muted-foreground">
        No CV has been uploaded by this candidate yet.
      </p>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          A CV is available. Sign in to view or download it.
        </p>
        <Link
          href="/sign-in"
          className="flex items-center justify-center gap-2 w-full rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors"
        >
          Sign in to unlock CV
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground leading-relaxed">
        View the CV online or download a copy to review qualifications.
      </p>

      <button
        type="button"
        onClick={handleView}
        disabled={!!loading}
        className="flex items-center justify-center gap-2 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:border-primary/40 hover:bg-primary/5 transition-colors disabled:opacity-60"
      >
        {loading === "view" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        View CV
      </button>

      <button
        type="button"
        onClick={handleDownload}
        disabled={!!loading}
        className="relative flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-95 transition-opacity disabled:opacity-60"
      >
        {loading === "download" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Download CV
      </button>
    </div>
  );
}