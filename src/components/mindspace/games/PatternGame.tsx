"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Sequence pattern: find the next number in the series. */
function makeRound(level: number) {
  const start = 2 + Math.floor(Math.random() * 6);
  const step = 1 + Math.floor(Math.random() * (2 + level));
  const len = 4;
  const seq: number[] = [];
  for (let i = 0; i < len; i++) seq.push(start + i * step);
  const answer = start + len * step;
  const options = new Set<number>([answer]);
  while (options.size < 4) {
    options.add(answer + (Math.floor(Math.random() * 7) - 3) * step || answer + step);
  }
  return {
    seq,
    answer,
    options: [...options].sort(() => Math.random() - 0.5),
  };
}

export function PatternGame() {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(() => makeRound(1));
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState("");

  const prompt = useMemo(
    () => `${round.seq.join(" , ")} , ?`,
    [round]
  );

  function pick(n: number) {
    if (n === round.answer) {
      setScore((s) => s + 1);
      setMsg("Correct!");
      const nextLevel = Math.min(5, level + (score > 0 && score % 3 === 2 ? 1 : 0));
      setLevel(nextLevel);
      setTimeout(() => {
        setRound(makeRound(nextLevel));
        setMsg("");
      }, 500);
    } else {
      setMsg("Try again");
    }
  }

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Score: {score}</span>
        <span>Level {level}</span>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        What number comes next in the pattern?
      </p>
      <p className="text-center text-xl font-bold tracking-wide text-foreground py-2">
        {prompt}
      </p>
      {msg ? (
        <p className="text-center text-sm font-medium text-primary">{msg}</p>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        {round.options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => pick(n)}
            className={cn(
              "rounded-xl border border-border bg-card py-3 text-lg font-semibold",
              "hover:border-primary/40 transition"
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setRound(makeRound(level));
            setMsg("");
          }}
        >
          Skip
        </Button>
      </div>
    </div>
  );
}
