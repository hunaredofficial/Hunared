"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { MemoryMatch } from "./games/MemoryMatch";
import { SlidingPuzzle } from "./games/SlidingPuzzle";
import { SudokuMini } from "./games/SudokuMini";
import { WordSearch } from "./games/WordSearch";
import { PatternGame } from "./games/PatternGame";
import { MiniCrossword } from "./games/MiniCrossword";
import { JigsawMini } from "./games/JigsawMini";

const GAMES = [
  { id: "sudoku", name: "Sudoku", desc: "Mini 4×4 logic grid" },
  { id: "memory", name: "Memory Match", desc: "Find matching pairs" },
  { id: "slide", name: "Sliding Puzzle", desc: "Order the tiles" },
  { id: "words", name: "Word Search", desc: "Find hidden words" },
  { id: "pattern", name: "Patterns", desc: "Next number in series" },
  { id: "crossword", name: "Crossword", desc: "Mini clue challenge" },
  { id: "jigsaw", name: "Jigsaw", desc: "Swap tiles to restore" },
] as const;

type GameId = (typeof GAMES)[number]["id"];

export function MindSpaceHub() {
  const sp = useSearchParams();
  const initial = (sp.get("game") as GameId) || "memory";
  const [active, setActive] = useState<GameId>(
    GAMES.some((g) => g.id === initial) ? initial : "memory"
  );

  const panel = useMemo(() => {
    switch (active) {
      case "sudoku":
        return <SudokuMini />;
      case "memory":
        return <MemoryMatch />;
      case "slide":
        return <SlidingPuzzle />;
      case "words":
        return <WordSearch />;
      case "pattern":
        return <PatternGame />;
      case "crossword":
        return <MiniCrossword />;
      case "jigsaw":
        return <JigsawMini />;
      default:
        return <MemoryMatch />;
    }
  }, [active]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <Brain className="h-3.5 w-3.5" />
          Hunared MindSpace
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Take a Break. Refresh Your Mind.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
          Short, focused puzzles designed for a mental reset between
          opportunities — no accounts required to play.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setActive(g.id)}
            className={cn(
              "rounded-xl border px-3 py-2 text-left min-w-[7.5rem] transition",
              active === g.id
                ? "border-primary bg-primary/15 text-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="block text-sm font-semibold">{g.name}</span>
            <span className="block text-[11px] opacity-80">{g.desc}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-6 shadow-sm">
        {panel}
      </div>
    </div>
  );
}
