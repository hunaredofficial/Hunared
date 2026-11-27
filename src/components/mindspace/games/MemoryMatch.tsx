"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICONS = ["⚙️", "🔧", "📡", "💡", "🏗️", "🧭", "📐", "🔬"];

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MemoryMatch() {
  const deck = useMemo(
    () =>
      shuffle(
        [...ICONS, ...ICONS].map((icon, i) => ({ id: i, icon, key: `${icon}-${i}` }))
      ),
    []
  );
  const [cards, setCards] = useState(deck);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);

  function reset() {
    setCards(
      shuffle(
        [...ICONS, ...ICONS].map((icon, i) => ({ id: i, icon, key: `${icon}-${i}` }))
      )
    );
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setLock(false);
  }

  function flip(idx: number) {
    if (lock) return;
    if (open.includes(idx)) return;
    if (matched.has(cards[idx].icon)) return;
    const next = [...open, idx];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      setLock(true);
      const [a, b] = next;
      if (cards[a].icon === cards[b].icon) {
        setMatched((s) => new Set(s).add(cards[a].icon));
        setOpen([]);
        setLock(false);
      } else {
        setTimeout(() => {
          setOpen([]);
          setLock(false);
        }, 650);
      }
    }
  }

  const won = matched.size === ICONS.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Moves: {moves}</span>
        <Button size="sm" variant="outline" onClick={reset}>
          Restart
        </Button>
      </div>
      {won ? (
        <p className="text-center text-sm font-semibold text-primary">
          Great focus — board cleared in {moves} moves!
        </p>
      ) : null}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto">
        {cards.map((c, idx) => {
          const show = open.includes(idx) || matched.has(c.icon);
          return (
            <button
              key={c.key + idx}
              type="button"
              onClick={() => flip(idx)}
              className={cn(
                "aspect-square rounded-xl border text-2xl flex items-center justify-center transition",
                show
                  ? "bg-card border-primary/40"
                  : "bg-muted/50 border-border hover:border-primary/30"
              )}
            >
              {show ? c.icon : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
