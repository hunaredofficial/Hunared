import { Suspense } from "react";
import type { Metadata } from "next";
import { MindSpaceHub } from "@/components/mindspace/MindSpaceHub";

export const metadata: Metadata = {
  title: "MindSpace — Take a Break | Hunared",
  description:
    "Hunared MindSpace: short puzzle games to refresh your mind — Sudoku, Memory Match, Sliding Puzzle, and Word Search.",
};

export default function MindSpacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
          Loading MindSpace…
        </div>
      }
    >
      <MindSpaceHub />
    </Suspense>
  );
}
