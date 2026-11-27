"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WORDS = ["JOB", "TEAM", "SKILL", "LEARN", "BUILD"];
const SIZE = 8;

function buildGrid() {
  const grid: string[][] = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => "")
  );
  const placed: { word: string; cells: string[] }[] = [];

  for (const word of WORDS) {
    let placedOk = false;
    for (let attempt = 0; attempt < 40 && !placedOk; attempt++) {
      const horiz = Math.random() > 0.4;
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      const cells: string[] = [];
      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const rr = horiz ? r : r + i;
        const cc = horiz ? c + i : c;
        if (rr >= SIZE || cc >= SIZE) {
          ok = false;
          break;
        }
        const ch = grid[rr][cc];
        if (ch && ch !== word[i]) {
          ok = false;
          break;
        }
        cells.push(`${rr}-${cc}`);
      }
      if (!ok) continue;
      for (let i = 0; i < word.length; i++) {
        const rr = horiz ? r : r + i;
        const cc = horiz ? c + i : c;
        grid[rr][cc] = word[i];
      }
      placed.push({ word, cells });
      placedOk = true;
    }
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!grid[r][c]) grid[r][c] = letters[Math.floor(Math.random() * 26)];
    }
  }
  return { grid, placed };
}

export function WordSearch() {
  const seed = useMemo(() => buildGrid(), []);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [path, setPath] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);

  function endSelect() {
    if (path.length < 2) {
      setPath([]);
      setDrag(false);
      return;
    }
    const word = path
      .map((p) => {
        const [r, c] = p.split("-").map(Number);
        return seed.grid[r][c];
      })
      .join("");
    const rev = word.split("").reverse().join("");
    const hit = seed.placed.find(
      (p) => p.word === word || p.word === rev
    );
    if (hit) setFound((s) => new Set(s).add(hit.word));
    setPath([]);
    setDrag(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {WORDS.map((w) => (
          <span
            key={w}
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full border",
              found.has(w)
                ? "bg-primary/15 border-primary/30 text-primary line-through"
                : "border-border text-muted-foreground"
            )}
          >
            {w}
          </span>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Drag across letters to select a word.
      </p>
      <div
        className="grid gap-1 max-w-sm mx-auto select-none"
        style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
        onMouseLeave={endSelect}
        onMouseUp={endSelect}
      >
        {seed.grid.map((row, r) =>
          row.map((ch, c) => {
            const key = `${r}-${c}`;
            const active = path.includes(key);
            return (
              <button
                key={key}
                type="button"
                className={cn(
                  "aspect-square rounded-md border text-sm font-bold",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/30"
                )}
                onMouseDown={() => {
                  setDrag(true);
                  setPath([key]);
                }}
                onMouseEnter={() => {
                  if (drag) setPath((p) => (p.includes(key) ? p : [...p, key]));
                }}
              >
                {ch}
              </button>
            );
          })
        )}
      </div>
      {found.size === WORDS.length ? (
        <p className="text-center text-sm font-semibold text-primary">
          All words found!
        </p>
      ) : null}
      <div className="flex justify-center">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setFound(new Set());
            setPath([]);
          }}
        >
          Clear found
        </Button>
      </div>
    </div>
  );
}
