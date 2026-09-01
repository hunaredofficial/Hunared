"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

const ICON_PX: Record<Size, number> = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 60,
};

const WORDMARK_CLASS: Record<Size, string> = {
  sm: "text-[17px] sm:text-lg",
  md: "text-[21px] sm:text-[24px]",
  lg: "text-[26px] sm:text-[30px]",
  xl: "text-[30px] sm:text-[34px]",
};

/** Gold mark v3 — new filename busts CDN/browser cache */
const MARK_SRC = "/assets/logos/hunared-mark-v3.png";

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
        "group/logo inline-flex items-center gap-2.5 sm:gap-3 shrink-0",
        className
      )}
    >
      {showIcon && (
        <span
          className={cn(
            "relative shrink-0 transition-transform duration-500 ease-out",
            "group-hover/logo:scale-[1.09] group-hover/logo:-rotate-[3deg]"
          )}
          style={{ width: px, height: px }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[-16%] rounded-[22%] opacity-45 blur-[9px] transition-all duration-500 group-hover/logo:opacity-75 group-hover/logo:blur-[13px]"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(245,186,24,0.65) 0%, rgba(212,175,55,0.2) 50%, transparent 72%)",
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
              "drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]",
              "transition-[filter,transform] duration-500",
              "group-hover/logo:drop-shadow-[0_4px_16px_rgba(245,186,24,0.45)]"
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
            "transition-transform duration-500 ease-out group-hover/logo:translate-x-[2px]",
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
    <Link href={href} className="inline-flex items-center shrink-0" aria-label="Hunared home">
      {content}
    </Link>
  );
}
