"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIZE = 3;
const COLORS = [
  "bg-sky-600",
  "bg-sky-500",
  "bg-sky-400",
  "bg-indigo-600",
  "bg-indigo-500",
  "bg-indigo-400",
  "bg-violet-600",
  "bg-violet-500",
  "bg-muted/30",
];

function solved() {
  return Array.from({ length: SIZE * SIZE }, (_, i) => i);
}

function shuffle() {
  const t = solved();
  // Fisher-Yates but keep last as "blank" style by swapping many times
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

export function JigsawMini() {
  const goal = useMemo(() => solved(), []);
  const [board, setBoard] = useState(shuffle);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);

  function tap(idx: number) {
    if (selected === null) {
      setSelected(idx);
      return;
    }
    if (selected === idx) {
      setSelected(null);
      return;
    }
    const next = [...board];
    [next[selected], next[idx]] = [next[idx], next[selected]];
    setBoard(next);
    setSelected(null);
    setMoves((m) => m + 1);
  }

  const won = board.every((v, i) => v === goal[i]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Moves: {moves}</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setBoard(shuffle());
            setSelected(null);
            setMoves(0);
          }}
        >
          Restart
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Tap two tiles to swap. Restore the gradient order (1→9).
      </p>
      {won ? (
        <p className="text-center text-sm font-semibold text-primary">
          Picture restored in {moves} swaps!
        </p>
      ) : null}
      <div
        className="grid gap-1.5 max-w-xs mx-auto"
        style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
      >
        {board.map((tile, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => tap(idx)}
            className={cn(
              "aspect-square rounded-lg border text-sm font-bold text-white flex items-center justify-center transition",
              COLORS[tile] ?? "bg-muted",
              selected === idx ? "ring-2 ring-primary scale-[0.97]" : "border-border/40"
            )}
          >
            {tile + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
