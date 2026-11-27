"use client";

import Link from "next/link";
import { Brain, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const DAILY = [
  { id: "sudoku", name: "Sudoku", blurb: "Logic grid · 5 min" },
  { id: "memory", name: "Memory Match", blurb: "Focus · 3 min" },
  { id: "slide", name: "Sliding Puzzle", blurb: "Spatial · 4 min" },
  { id: "words", name: "Word Search", blurb: "Vocabulary · 5 min" },
];

function dayIndex() {
  const d = new Date();
  return (d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % DAILY.length;
}

export function DailyPuzzleWidget() {
  const puzzle = DAILY[dayIndex()];

  return (
    <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold">MindSpace · Daily</p>
      </div>
      <p className="text-base font-bold text-foreground">{puzzle.name}</p>
      <p className="text-xs text-muted-foreground mb-3">{puzzle.blurb}</p>
      <Button size="sm" className="w-full h-9 rounded-xl font-semibold" asChild>
        <Link href={`/mindspace?game=${puzzle.id}`}>
          <Play className="h-3.5 w-3.5 mr-1.5" />
          Play today&apos;s puzzle
        </Link>
      </Button>
      <Link
        href="/mindspace"
        className="mt-2 block text-center text-[11px] font-medium text-primary hover:underline"
      >
        All games
      </Link>
    </div>
  );
}
