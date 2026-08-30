"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

const ICON_PX: Record<Size, number> = {
  sm: 28,
  md: 34,
  lg: 40,
  xl: 52,
};

const WORDMARK_CLASS: Record<Size, string> = {
  sm: "text-base sm:text-lg",
  md: "text-[20px] sm:text-[23px]",
  lg: "text-[24px] sm:text-[27px]",
  xl: "text-[28px] sm:text-3xl",
};

const MARK_SRC = "/assets/logos/hunared-mark.png";

/**
 * Hunared brand mark (gold H, gold border, black field) + refined metallic wordmark.
 */
export function HunaredLogo({
  href = "/",
  size = "md",
  className,
  asLink = true,
  showWordmark = true,
  showIcon = true,
}: {
  href?: string;
  size?: Size;
  className?: string;
  asLink?: boolean;
  showWordmark?: boolean;
  showIcon?: boolean;
}) {
  const px = ICON_PX[size];

  const content = (
    <span
      className={cn(
        "group/logo inline-flex items-center gap-2 sm:gap-2.5 shrink-0",
        className
      )}
    >
      {showIcon && (
        <span
          className={cn(
            "relative shrink-0 transition-transform duration-400 ease-out",
            "group-hover/logo:scale-[1.06]"
          )}
          style={{ width: px, height: px }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[-12%] rounded-[22%] opacity-35 blur-[8px] transition-all duration-400 group-hover/logo:opacity-60 group-hover/logo:blur-[10px]"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(212,175,55,0.55) 0%, transparent 70%)",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MARK_SRC}
            alt=""
            width={px}
            height={px}
            className={cn(
              "relative z-[1] h-full w-full object-contain rounded-[18%]",
              "drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]",
              "transition-[filter] duration-400",
              "group-hover/logo:drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]"
            )}
            style={{ width: px, height: px }}
            decoding="async"
          />
        </span>
      )}

      {showWordmark && (
        <span
          className={cn(
            "hunared-wordmark relative inline-block leading-none select-none",
            "transition-transform duration-400 ease-out group-hover/logo:translate-x-[1.5px]",
            WORDMARK_CLASS[size]
          )}
        >
          <span className="hunared-wordmark-text">Hunared</span>
        </span>
      )}
    </span>
  );

  if (!asLink) {
    return (
      <span className="inline-flex items-center" aria-label="Hunared">
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center shrink-0"
      aria-label="Hunared home"
    >
      {content}
    </Link>
  );
}
