"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ListingCategoryIcon,
  isListingPhotoUrl,
} from "@/components/market/ListingCategoryIcon";

interface ListingGalleryProps {
  /** Accepts a string[] or a single string for legacy backward compatibility. */
  images: string[] | string;
  title: string;
  /** Used for vector icon when there is no real photo */
  category?: string | null;
}

export function ListingGallery({
  images: imagesProp,
  title,
  category,
}: ListingGalleryProps) {
  const images: string[] = (
    Array.isArray(imagesProp)
      ? imagesProp
      : imagesProp
        ? [imagesProp]
        : []
  ).filter((src) => isListingPhotoUrl(src));

  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <ListingCategoryIcon
        category={category}
        size="lg"
        boxClassName="w-full h-[420px] rounded-2xl border border-border"
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[activeIndex]}
          alt={`${title} — image ${activeIndex + 1}`}
          className="max-w-full h-auto max-h-[480px] object-contain rounded-2xl border border-border bg-muted/10"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                "h-16 w-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activeIndex === i
                  ? "border-primary ring-1 ring-primary/40"
                  : "border-border hover:border-primary/50 opacity-70 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${title} thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
