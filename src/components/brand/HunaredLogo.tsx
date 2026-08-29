"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

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

const MARK_SRC = "/assets/logos/hunared-mark.png";

/**
 * Premium Hunared brand mark + white/gold metallic wordmark.
 * Header / Footer / Dashboard / Auth — single source of truth.
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
  asLink?: boolean;
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
          "relative shrink-0 transition-transform duration-500 ease-out",
          "group-hover/logo:scale-[1.06]"
        )}
        style={{ width: px, height: px }}
      >
        {/* Ambient gold glow */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[-22%] rounded-[30%] opacity-60 blur-[12px] transition-all duration-500 group-hover/logo:opacity-100 group-hover/logo:blur-[14px]"
          style={{
            background:
              "radial-gradient(circle at 50% 42%, rgba(232,197,71,0.65) 0%, rgba(212,175,55,0.2) 42%, transparent 68%)",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MARK_SRC}
          alt=""
          width={px}
          height={px}
          className={cn(
            "relative z-[1] h-full w-full object-cover",
            "rounded-[22%]",
            "shadow-[0_2px_14px_rgba(0,0,0,0.4),0_0_0_1px_rgba(212,175,55,0.35)]",
            "ring-1 ring-amber-400/25",
            "transition-shadow duration-500",
            "group-hover/logo:shadow-[0_4px_20px_rgba(212,175,55,0.35),0_0_0_1px_rgba(232,197,71,0.45)]"
          )}
          style={{ width: px, height: px }}
          decoding="async"
        />
      </span>

      {showWordmark && (
        <span
          className={cn(
            "hunared-wordmark relative inline-block leading-none select-none",
            "transition-transform duration-500 ease-out group-hover/logo:translate-x-[2px]",
            WORDMARK_CLASS[size]
          )}
          aria-hidden={false}
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
