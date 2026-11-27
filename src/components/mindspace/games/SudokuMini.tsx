"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Simple 4×4 sudoku (digits 1–4). */
const PUZZLE = [
  [1, 0, 0, 4],
  [0, 0, 1, 0],
  [0, 3, 0, 0],
  [4, 0, 0, 2],
];
const SOLUTION = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 3, 4, 1],
  [4, 1, 2, 3],
];

export function SudokuMini() {
  const [grid, setGrid] = useState(() => PUZZLE.map((r) => [...r]));
  const [msg, setMsg] = useState("");

  function setCell(r: number, c: number, v: number) {
    if (PUZZLE[r][c] !== 0) return;
    const next = grid.map((row) => [...row]);
    next[r][c] = v;
    setGrid(next);
    setMsg("");
  }

  function check() {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] !== SOLUTION[r][c]) {
          setMsg("Not quite — keep going.");
          return;
        }
      }
    }
    setMsg("Perfect — sudoku complete!");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setGrid(PUZZLE.map((r) => [...r]));
            setMsg("");
          }}
        >
          Restart
        </Button>
        <Button size="sm" onClick={check}>
          Check
        </Button>
      </div>
      {msg ? (
        <p className="text-center text-sm font-medium text-primary">{msg}</p>
      ) : (
        <p className="text-center text-xs text-muted-foreground">
          Fill 1–4 so each row, column, and 2×2 block is unique.
        </p>
      )}
      <div className="grid grid-cols-4 gap-1.5 max-w-[240px] mx-auto">
        {grid.map((row, r) =>
          row.map((val, c) => {
            const fixed = PUZZLE[r][c] !== 0;
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                disabled={fixed}
                onClick={() => setCell(r, c, val === 4 ? 0 : val + 1)}
                className={cn(
                  "h-12 w-12 rounded-lg border text-base font-semibold",
                  fixed
                    ? "bg-muted border-border text-foreground"
                    : "bg-card border-border hover:border-primary/40",
                  (r === 1 || r === 3) && "mb-1",
                  (c === 1 || c === 3) && "mr-0"
                )}
              >
                {val || ""}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
