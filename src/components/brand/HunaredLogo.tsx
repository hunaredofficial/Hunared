"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

/** Icon mark sizes (px) — slightly larger for stronger presence */
const ICON_PX: Record<Size, number> = {
  sm: 30,
  md: 38,
  lg: 46,
  xl: 58,
};

const WORDMARK_CLASS: Record<Size, string> = {
  sm: "text-[17px] sm:text-lg",
  md: "text-[21px] sm:text-[24px]",
  lg: "text-[26px] sm:text-[29px]",
  xl: "text-[30px] sm:text-[34px]",
};

const MARK_SRC = "/assets/logos/hunared-mark.png";

/**
 * Hunared brand mark + white animated wordmark.
 * Single component used sitewide (header, footer, auth pages).
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
        "group/logo inline-flex items-center gap-2.5 sm:gap-3 shrink-0",
        className
      )}
    >
      {showIcon && (
        <span
          className={cn(
            "relative shrink-0 transition-transform duration-500 ease-out",
            "group-hover/logo:scale-[1.08] group-hover/logo:-rotate-[2deg]"
          )}
          style={{ width: px, height: px }}
        >
          {/* Soft white/cool glow behind mark */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[-18%] rounded-[22%] opacity-40 blur-[10px] transition-all duration-500 group-hover/logo:opacity-70 group-hover/logo:blur-[14px]"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.55) 0%, rgba(200,220,255,0.15) 45%, transparent 72%)",
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
              "drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]",
              "transition-[filter,transform] duration-500",
              "group-hover/logo:drop-shadow-[0_4px_14px_rgba(255,255,255,0.28)]"
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
    <Link
      href={href}
      className="inline-flex items-center shrink-0"
      aria-label="Hunared home"
    >
      {content}
    </Link>
  );
}
