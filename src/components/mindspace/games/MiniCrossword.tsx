"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Mini crossword (5×5) with three fixed clues.
 * Across 1: JOBS (row0 col0-3)
 * Down 2: TEAM (col1 row0-3) — shares O? Use:
 *   JOBS across row 0
 *   CODE down col 3
 *   LEARN across row 2 starting col 0 - might overlap awkwardly
 *
 * Simpler: fill-in blanks for 3 words with letter grid display.
 */

const CLUES = [
  { id: "a1", dir: "Across", num: 1, clue: "Open positions on Hunared", answer: "JOBS" },
  { id: "a2", dir: "Across", num: 3, clue: "What you build with a team", answer: "CODE" },
  { id: "d1", dir: "Down", num: 2, clue: "Group of colleagues", answer: "TEAM" },
];

export function MiniCrossword() {
  const [answers, setAnswers] = useState<Record<string, string>>({
    a1: "",
    a2: "",
    d1: "",
  });
  const [msg, setMsg] = useState("");

  function check() {
    const ok = CLUES.every(
      (c) => (answers[c.id] ?? "").trim().toUpperCase() === c.answer
    );
    setMsg(ok ? "All clues solved — nice work!" : "Keep trying — check spelling.");
  }

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <p className="text-xs text-muted-foreground text-center">
        Mini crossword — type answers for each clue.
      </p>
      <div className="space-y-3">
        {CLUES.map((c) => (
          <div key={c.id} className="rounded-xl border border-border/60 bg-card p-3">
            <p className="text-[11px] font-semibold text-muted-foreground mb-1">
              {c.num}. {c.dir} · {c.answer.length} letters
            </p>
            <p className="text-sm mb-2">{c.clue}</p>
            <input
              value={answers[c.id]}
              onChange={(e) =>
                setAnswers((a) => ({
                  ...a,
                  [c.id]: e.target.value.toUpperCase().slice(0, c.answer.length),
                }))
              }
              maxLength={c.answer.length}
              placeholder={"_ ".repeat(c.answer.length).trim()}
              className={cn(
                "w-full rounded-lg border border-border bg-background px-3 py-2",
                "text-sm font-mono tracking-[0.3em] uppercase"
              )}
            />
          </div>
        ))}
      </div>
      {msg ? (
        <p className="text-center text-sm font-medium text-primary">{msg}</p>
      ) : null}
      <div className="flex justify-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setAnswers({ a1: "", a2: "", d1: "" });
            setMsg("");
          }}
        >
          Clear
        </Button>
        <Button size="sm" onClick={check}>
          Check
        </Button>
      </div>
    </div>
  );
}
