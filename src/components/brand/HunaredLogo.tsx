"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

/** Slightly smaller marks so header sits balanced / centered */
const ICON_PX: Record<Size, number> = {
  sm: 26,
  md: 32,
  lg: 36,
  xl: 44,
};

const WORDMARK_CLASS: Record<Size, string> = {
  sm: "text-[15px] sm:text-base",
  md: "text-[18px] sm:text-[20px]",
  lg: "text-[20px] sm:text-[22px]",
  xl: "text-[24px] sm:text-[26px]",
};

const MARK_SRC = "/assets/logos/hunared-mark-v4.png";

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
        "group/logo inline-flex items-center gap-2 sm:gap-2.5 shrink-0 leading-none",
        className
      )}
    >
      {showIcon && (
        <span
          className={cn(
            "relative shrink-0 flex items-center justify-center",
            "transition-transform duration-500 ease-out",
            "group-hover/logo:scale-[1.07] group-hover/logo:-rotate-[2deg]"
          )}
          style={{ width: px, height: px }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[-14%] rounded-[22%] opacity-50 blur-[8px] transition-all duration-500 group-hover/logo:opacity-80 group-hover/logo:blur-[12px]"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(245,186,24,0.7) 0%, rgba(212,175,55,0.25) 48%, transparent 72%)",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MARK_SRC}
            alt=""
            width={px}
            height={px}
            className={cn(
              "relative z-[1] h-full w-full object-contain",
              "drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]",
              "transition-[filter] duration-500",
              "group-hover/logo:drop-shadow-[0_3px_14px_rgba(245,186,24,0.5)]"
            )}
            style={{ width: px, height: px }}
            decoding="async"
          />
        </span>
      )}

      {showWordmark && (
        <span
          className={cn(
            "hunared-wordmark relative inline-flex items-center leading-none select-none",
            "transition-transform duration-500 ease-out group-hover/logo:translate-x-[1.5px]",
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
      className="inline-flex items-center shrink-0 self-center"
      aria-label="Hunared home"
    >
      {content}
    </Link>
  );
}
