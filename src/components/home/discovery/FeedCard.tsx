"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Briefcase,
  Building2,
  GraduationCap,
  MapPin,
  MessageCircle,
  Share2,
  Tag,
  ThumbsUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/shared/SaveButton";
import { cn } from "@/lib/utils";
import type { FeedItem } from "@/lib/home/feed";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PostComments } from "./PostComments";
import { FollowButton } from "@/components/shared/FollowButton";

const TYPE_META: Record<
  string,
  { label: string; icon: typeof Briefcase; accent: string }
> = {
  job: {
    label: "Job",
    icon: Briefcase,
    accent: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  },
  listing: {
    label: "Business",
    icon: Tag,
    accent: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  },
  article: {
    label: "Learning",
    icon: GraduationCap,
    accent: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  },
  company: {
    label: "Company",
    icon: Building2,
    accent: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  },
  candidate: {
    label: "Talent",
    icon: Users,
    accent: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  },
  post: {
    label: "Community",
    icon: MessageCircle,
    accent: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  },
};

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  if (!Number.isFinite(d)) return "";
  const s = Math.max(0, Math.floor((Date.now() - d) / 1000));
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString();
}

function rawId(item: FeedItem) {
  const i = item.id.indexOf("-");
  return i >= 0 ? item.id.slice(i + 1) : item.id;
}

export function FeedCard({ item }: { item: FeedItem }) {
  const meta = TYPE_META[item.type] ?? TYPE_META.post;
  const Icon = meta.icon;
  const price =
    item.meta?.price != null
      ? `${item.meta.currency ?? ""} ${item.meta.price}`.trim()
      : null;
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Number(item.meta?.likes ?? 0) || 0);
  const [liking, setLiking] = useState(false);

  async function onLike() {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    const itemType =
      item.type === "post" || item.type === "job" || item.type === "listing" || item.type === "article"
        ? item.type
        : null;
    if (!itemType) return;
    setLiking(true);
    try {
      const res = await fetch("/api/feed/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, itemId: rawId(item), reaction: "like" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not react");
        return;
      }
      setLiked(!!data.liked);
      if (typeof data.count === "number") setLikeCount(data.count);
    } finally {
      setLiking(false);
    }
  }

  async function onShare() {
    try {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}${item.href.startsWith("#") ? "/" : item.href}`
          : item.href;
      if (navigator.share) {
        await navigator.share({ title: item.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* cancelled */
    }
  }

  const st =
    item.type === "job" || item.type === "listing" || item.type === "article"
      ? item.type
      : null;

  return (
    <article className="rounded-2xl border border-border/60 bg-card/80 shadow-sm overflow-hidden transition hover:border-border">
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-border/50">
            {item.authorImage || item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={(item.authorImage || item.image) as string}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Icon className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground truncate">
                {item.authorName ?? "Hunared"}
              </span>
              <Badge variant="outline" className={cn("text-[10px] font-medium border", meta.accent)}>
                {meta.label}
              </Badge>
              <span className="text-[11px] text-muted-foreground">{timeAgo(item.createdAt)}</span>
            </div>
            {item.category ? (
              <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                {String(item.category).replace(/_/g, " ")}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          {item.type === "post" ? (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          ) : (
            <>
              <Link href={item.href} className="group">
                <h3 className="text-[15px] sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {item.title}
                </h3>
              </Link>
              {item.description ? (
                <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              ) : null}
            </>
          )}
        </div>

        {item.image && item.type !== "job" && item.type !== "post" ? (
          <Link
            href={item.href}
            className="block rounded-xl overflow-hidden border border-border/50 bg-muted/30 aspect-[16/9] max-h-56"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />
          </Link>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {item.location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {item.location}
            </span>
          ) : null}
          {price ? <span className="font-semibold text-foreground">{price}</span> : null}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border/50 gap-2">
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 px-2 text-muted-foreground", liked && "text-primary")}
              disabled={liking}
              onClick={onLike}
            >
              <ThumbsUp className="h-3.5 w-3.5 mr-1" />
              {likeCount > 0 ? likeCount : "Like"}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={onShare}>
              <Share2 className="h-3.5 w-3.5 mr-1" /> Share
            </Button>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {st ? (
              <SaveButton itemType={st} itemId={rawId(item)} size="icon" className="h-8 w-8" />
            ) : null}
            {item.type !== "post" ? (
              <Button size="sm" className="h-8 rounded-lg text-xs font-semibold" asChild>
                <Link href={item.href}>
                  {item.type === "job" ? "View job" : item.type === "listing" ? "View listing" : "Read more"}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
        {item.type === "post" ? (
          <div className="space-y-1">
            <div className="flex justify-end">
              {item.meta?.authorId ? (
                <FollowButton
                  targetType="user"
                  targetId={String(item.meta.authorId)}
                  className="h-7 text-xs"
                />
              ) : null}
            </div>
            <PostComments postId={rawId(item)} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
