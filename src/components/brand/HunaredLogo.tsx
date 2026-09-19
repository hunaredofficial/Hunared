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
  sm: "text-lg sm:text-xl",
  md: "text-[22px] sm:text-[26px]",
  lg: "text-[26px] sm:text-[30px]",
  xl: "text-[30px] sm:text-[34px]",
};

/**
 * Hunared brand mark — navy field + blue H geometry.
 * Wordmark uses professional navy→blue gradient (not gold).
 */
function MarkIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-[1] h-full w-full"
      aria-hidden
    >
      <rect width="40" height="40" rx="9" fill="#0B1F3A" />
      <rect
        x="1.25"
        y="1.25"
        width="37.5"
        height="37.5"
        rx="7.75"
        stroke="#155EEF"
        strokeOpacity="0.55"
        strokeWidth="1.5"
      />
      <path d="M12 11.5V28.5" stroke="#60A5FA" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M28 11.5V28.5" stroke="#60A5FA" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M12 20H28" stroke="#155EEF" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="12" cy="11.5" r="2.1" fill="#93C5FD" />
      <circle cx="28" cy="11.5" r="2.1" fill="#93C5FD" />
      <circle cx="12" cy="28.5" r="2.1" fill="#93C5FD" />
      <circle cx="28" cy="28.5" r="2.1" fill="#93C5FD" />
      <circle cx="20" cy="20" r="2.4" fill="#12B76A" />
    </svg>
  );
}

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
        "group/logo inline-flex items-center justify-center gap-2.5 sm:gap-3 shrink-0",
        className
      )}
    >
      {showIcon && (
        <span
          className={cn(
            "relative shrink-0 transition-transform duration-300 ease-out",
            "group-hover/logo:scale-[1.04]"
          )}
          style={{ width: px, height: px }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[-14%] rounded-[22%] opacity-40 blur-[9px] transition-opacity duration-300 group-hover/logo:opacity-70"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(21, 94, 239, 0.55) 0%, transparent 70%)",
            }}
          />
          <MarkIcon size={px} />
        </span>
      )}

      {showWordmark && (
        <span
          className={cn(
            "hunared-wordmark relative inline-block leading-none select-none",
            "transition-transform duration-300 ease-out group-hover/logo:translate-x-[1px]",
            WORDMARK_CLASS[size]
          )}
        >
          <span className="hunared-wordmark-text font-extrabold tracking-tight">
            Hunared
          </span>
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
