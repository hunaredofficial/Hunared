import { cn } from "@/lib/utils";

/**
 * Custom dashboard icon matching the provided design:
 * blue rounded square with light panels (left tall + right stacked).
 */
export function DashboardIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
      {...props}
    >
      {/* Outer rounded square - brand blue */}
      <rect x="1.5" y="1.5" width="21" height="21" rx="5" fill="#3B82F6" />
      {/* Left tall panel */}
      <rect x="4.5" y="4.5" width="6.5" height="15" rx="1.5" fill="#BFDBFE" />
      {/* Top-right panel */}
      <rect x="13" y="4.5" width="6.5" height="6.5" rx="1.5" fill="#BFDBFE" />
      {/* Bottom-right panel */}
      <rect x="13" y="13" width="6.5" height="6.5" rx="1.5" fill="#BFDBFE" />
    </svg>
  );
}
