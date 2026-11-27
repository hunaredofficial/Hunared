import Link from "next/link";
import {
  Briefcase,
  Building2,
  GraduationCap,
  MapPin,
  Tag,
  Bookmark,
  MessageCircle,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FeedItem } from "@/lib/home/feed";

const TYPE_META: Record<
  FeedItem["type"],
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
    icon: Briefcase,
    accent: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
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

export function FeedCard({ item }: { item: FeedItem }) {
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;
  const price =
    item.meta?.price != null
      ? `${item.meta.currency ?? ""} ${item.meta.price}`.trim()
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
              <Badge
                variant="outline"
                className={cn("text-[10px] font-medium border", meta.accent)}
              >
                {meta.label}
              </Badge>
              <span className="text-[11px] text-muted-foreground">
                {timeAgo(item.createdAt)}
              </span>
            </div>
            {item.category ? (
              <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                {String(item.category).replace(/_/g, " ")}
              </p>
            ) : null}
          </div>
        </div>

        <div>
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
        </div>

        {item.image && item.type !== "job" ? (
          <Link
            href={item.href}
            className="block rounded-xl overflow-hidden border border-border/50 bg-muted/30 aspect-[16/9] max-h-56"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </Link>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {item.location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {item.location}
            </span>
          ) : null}
          {price ? (
            <span className="font-semibold text-foreground">{price}</span>
          ) : null}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" disabled title="Coming soon">
              <ThumbsUp className="h-3.5 w-3.5 mr-1" /> Like
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" disabled title="Coming soon">
              <MessageCircle className="h-3.5 w-3.5 mr-1" /> Comment
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" disabled title="Coming soon">
              <Share2 className="h-3.5 w-3.5 mr-1" /> Share
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled title="Coming soon">
              <Bookmark className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" className="h-8 rounded-lg text-xs font-semibold" asChild>
              <Link href={item.href}>
                {item.type === "job"
                  ? "View job"
                  : item.type === "listing"
                    ? "View listing"
                    : "Read more"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
