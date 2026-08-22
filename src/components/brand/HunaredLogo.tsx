"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

/** Icon pixel size — tuned so mark balances the wordmark */
const ICON_PX: Record<Size, number> = {
  sm: 30,
  md: 36,
  lg: 44,
  xl: 56,
};

const WORDMARK_CLASS: Record<Size, string> = {
  sm: "text-lg sm:text-xl",
  md: "text-[22px] sm:text-[26px]",
  lg: "text-[27px] sm:text-[31px]",
  xl: "text-3xl sm:text-4xl",
};

/** Brand mark path — must exist under /public */
const MARK_SRC = "/assets/logos/hunared-mark.png";

/**
 * Premium Hunared brand mark + animated wordmark.
 * Header / Footer / Dashboard / Register — single source of truth.
 */
export function HunaredLogo({
  href = "/",
  size = "md",
  className,
  asLink = true,
  showWordmark = true,
}: {
  href?: string;
  size?: Size;
  className?: string;
  /** false = plain span (e.g. inside another link) */
  asLink?: boolean;
  /** false = icon only */
  showWordmark?: boolean;
}) {
  const px = ICON_PX[size];

  const content = (
    <span
      className={cn(
        "group/logo inline-flex items-center gap-2.5 sm:gap-3 shrink-0",
        className
      )}
    >
      <span
        className={cn(
          "relative shrink-0 transition-transform duration-300 ease-out",
          "group-hover/logo:scale-105"
        )}
        style={{ width: px, height: px }}
      >
        {/* Soft gold glow behind the mark */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[-18%] rounded-[28%] opacity-70 blur-[10px] transition-opacity duration-300 group-hover/logo:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(212,175,55,0.55) 0%, rgba(212,175,55,0.15) 45%, transparent 70%)",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MARK_SRC}
          alt="Hunared"
          width={px}
          height={px}
          className={cn(
            "relative z-[1] h-full w-full object-cover",
            "rounded-[22%]",
            "shadow-[0_2px_12px_rgba(0,0,0,0.35),0_0_0_1px_rgba(212,175,55,0.25)]",
            "ring-1 ring-amber-400/20"
          )}
          style={{ width: px, height: px }}
          decoding="async"
        />
      </span>

      {showWordmark && (
        <span
          className={cn(
            "hunared-wordmark relative inline-block font-extrabold tracking-tight leading-none select-none",
            "transition-transform duration-300 ease-out group-hover/logo:translate-x-0.5",
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
