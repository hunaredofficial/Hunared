import { NextRequest, NextResponse } from "next/server";
import { parseCvCommand } from "@/lib/cv/ai-fill";
import { applyLocalCommand, getPersonalizedCommands } from "@/lib/cv/ai-engine";
import { DEFAULT_CV, type CvData } from "@/lib/cv/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const command = String((body as { command?: string }).command || "").trim();
    const current = {
      ...DEFAULT_CV(),
      ...((body as { current?: Partial<CvData> }).current || {}),
    } as CvData;
    const sourceText = String((body as { sourceText?: string }).sourceText || "");

    if (!command) {
      return NextResponse.json({ error: "command required" }, { status: 400 });
    }

    // Always compute local baseline (never invent employers/dates/certs)
    let cv = parseCvCommand(command, current);
    cv = applyLocalCommand(command, cv);

    const key = process.env.OPENAI_API_KEY;
    if (key && command.length > 3) {
      try {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.OPENAI_AGENT_MODEL || "gpt-4o-mini",
            temperature: 0.25,
            max_tokens: 2500,
            messages: [
              {
                role: "system",
                content: `You are Hunared CV AI. Improve professional CV content only.
HARD RULES:
- Never invent employers, job titles, dates, degrees, certifications, skills, metrics, or projects.
- If information is missing, leave fields unchanged or write a short note in summary that the user should add facts.
- Prefer strong action verbs and clear bullets from existing facts.
- Return ONLY valid JSON matching the CV fields you change, or a full CV object.
- Do not use markdown.`,
              },
              {
                role: "user",
                content: JSON.stringify({
                  command,
                  currentCv: cv,
                  sourceText: sourceText?.slice(0, 12000) || undefined,
                }),
              },
            ],
          }),
        });
        if (r.ok) {
          const j = await r.json();
          const content = j.choices?.[0]?.message?.content?.trim();
          if (content) {
            try {
              const cleaned = content.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
              const parsed = JSON.parse(cleaned) as Partial<CvData>;
              cv = { ...cv, ...parsed, experience: parsed.experience || cv.experience };
            } catch {
              /* keep local */
            }
          }
        }
      } catch {
        /* local fallback */
      }
    }

    return NextResponse.json({
      cv,
      suggestions: getPersonalizedCommands(cv, cv.title),
    });
  } catch (e) {
    console.error("[cv/ai]", e);
    return NextResponse.json({ error: "AI failed" }, { status: 500 });
  }
}
