"use client";

import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SaveButton } from "@/components/shared/SaveButton";
import { cn } from "@/lib/utils";

export type RelatedJobCard = {
  kind: "job";
  id: string;
  title: string;
  subtitle: string;
  location?: string | null;
  category?: string | null;
  categoryClass?: string;
  date?: string | null;
  meta?: string | null;
};

export type RelatedListingCard = {
  kind: "listing";
  id: string;
  title: string;
  subtitle?: string | null;
  location?: string | null;
  category?: string | null;
  categoryClass?: string;
  date?: string | null;
  image?: string | null;
  meta?: string | null;
};

export type RelatedArticleCard = {
  kind: "article";
  id: string;
  title: string;
  subtitle?: string | null;
  category?: string | null;
  categoryClass?: string;
  date?: string | null;
};

type Card = RelatedJobCard | RelatedListingCard | RelatedArticleCard;

export function RelatedCarousel({
  title,
  items,
}: {
  title: string;
  items: Card[];
}) {
  if (!items.length) return null;

  return (
    <div className="mt-10 sm:mt-12 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Same category · swipe for more
          </p>
        </div>
      </div>

      <div className="-mx-4 sm:mx-0">
        <div
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 px-4 sm:px-1 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "thin" }}
        >
          {items.map((item) => (
            <RelatedCard key={`${item.kind}-${item.id}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RelatedCard({ item }: { item: Card }) {
  const href =
    item.kind === "job"
      ? `/jobs/${item.id}`
      : item.kind === "listing"
        ? `/market/${item.id}`
        : `/education/${item.id}`;

  return (
    <div
      className={cn(
        "snap-start shrink-0 w-[min(85vw,280px)] sm:w-[260px] rounded-xl border border-border bg-card overflow-hidden flex flex-col",
        "hover:border-primary/40 transition-colors"
      )}
    >
      {item.kind === "listing" && item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          className="h-32 w-full object-cover"
        />
      )}

      <div className="p-3.5 space-y-2 flex-1 flex flex-col">
        {item.category && (
          <Badge
            className={cn(
              "text-[10px] w-fit",
              item.categoryClass ?? "bg-muted text-muted-foreground"
            )}
          >
            {item.category}
          </Badge>
        )}

        <Link href={href} className="font-semibold text-sm line-clamp-2 hover:text-primary">
          {item.title}
        </Link>

        {item.subtitle && (
          <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
        )}

        {"location" in item && item.location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{item.location}</span>
          </p>
        )}

        {item.meta && (
          <p className="text-xs text-muted-foreground">{item.meta}</p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          {item.date ? (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {item.date}
            </span>
          ) : (
            <span />
          )}

          {(item.kind === "job" || item.kind === "listing" || item.kind === "article") && (
            <SaveButton
              itemType={
                item.kind === "job"
                  ? "job"
                  : item.kind === "listing"
                    ? "listing"
                    : "article"
              }
              itemId={item.id}
              size="sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}
