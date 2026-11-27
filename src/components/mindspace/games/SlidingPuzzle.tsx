"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIZE = 3;

function solved() {
  const t: number[] = [];
  for (let i = 1; i < SIZE * SIZE; i++) t.push(i);
  t.push(0);
  return t;
}

function shuffleBoard() {
  const t = solved();
  // random valid moves from solved to keep solvable
  let empty = t.indexOf(0);
  for (let i = 0; i < 80; i++) {
    const r = Math.floor(empty / SIZE);
    const c = empty % SIZE;
    const opts: number[] = [];
    if (r > 0) opts.push(empty - SIZE);
    if (r < SIZE - 1) opts.push(empty + SIZE);
    if (c > 0) opts.push(empty - 1);
    if (c < SIZE - 1) opts.push(empty + 1);
    const n = opts[Math.floor(Math.random() * opts.length)];
    [t[empty], t[n]] = [t[n], t[empty]];
    empty = n;
  }
  return t;
}

export function SlidingPuzzle() {
  const [board, setBoard] = useState(shuffleBoard);
  const [moves, setMoves] = useState(0);
  const goal = useMemo(() => solved(), []);

  function move(idx: number) {
    const empty = board.indexOf(0);
    const r = Math.floor(idx / SIZE);
    const c = idx % SIZE;
    const er = Math.floor(empty / SIZE);
    const ec = empty % SIZE;
    if (Math.abs(r - er) + Math.abs(c - ec) !== 1) return;
    const next = [...board];
    [next[idx], next[empty]] = [next[empty], next[idx]];
    setBoard(next);
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
            setBoard(shuffleBoard());
            setMoves(0);
          }}
        >
          Restart
        </Button>
      </div>
      {won ? (
        <p className="text-center text-sm font-semibold text-primary">
          Solved in {moves} moves!
        </p>
      ) : null}
      <div
        className="grid gap-2 max-w-xs mx-auto"
        style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
      >
        {board.map((n, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => move(idx)}
            disabled={n === 0 || won}
            className={cn(
              "aspect-square rounded-xl border text-lg font-bold flex items-center justify-center transition",
              n === 0
                ? "border-transparent bg-transparent"
                : "bg-card border-border hover:border-primary/40 text-foreground"
            )}
          >
            {n || ""}
          </button>
        ))}
      </div>
    </div>
  );
}
