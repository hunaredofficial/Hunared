"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * Temporary site-wide notice while Hunared is under active development.
 * Dismissed state is stored in sessionStorage (reappears next browser session).
 */
export function DevelopmentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("hunared_dev_banner_dismissed") === "1") return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, []);

  function dismiss() {
    try {
      sessionStorage.setItem("hunared_dev_banner_dismissed", "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="status"
      className="relative z-[60] w-full border-b border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-amber-50"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <span className="hidden sm:inline-flex shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
          Notice
        </span>
        <p className="flex-1 text-center text-[12px] sm:text-[13px] leading-snug text-slate-100">
          <span className="font-medium text-white">Hunared is under active development.</span>{" "}
          Features may change, and some areas are still being improved. Thank you for your patience.
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss notice"
          className="shrink-0 rounded-md p-1 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
