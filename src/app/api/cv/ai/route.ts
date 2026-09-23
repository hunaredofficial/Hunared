import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { parseCvCommand } from "@/lib/cv/ai-fill";
import type { CvData } from "@/lib/cv/types";
import { DEFAULT_CV } from "@/lib/cv/types";

/**
 * CV AI assist — rule-based parse always works.
 * If OPENAI_API_KEY is set, enriches summary/bullets only (no invented facts).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const command = String((body as { command?: string }).command || "").slice(
      0,
      4000
    );
    const current = (body as { current?: Partial<CvData> }).current;

    if (!command.trim()) {
      return NextResponse.json({ error: "Command required" }, { status: 400 });
    }

    try {
      await auth();
    } catch {
      /* soft auth */
    }

    let cv = parseCvCommand(command, current);

    const key = process.env.OPENAI_API_KEY;
    if (key) {
      try {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.OPENAI_AGENT_MODEL || "gpt-4o-mini",
            temperature: 0.35,
            max_tokens: 1200,
            messages: [
              {
                role: "system",
                content: `You improve professional CV JSON for job seekers.
Return ONLY valid JSON matching the input shape.
Rules:
- Keep all factual fields from the user (names, employers, degrees, dates, certifications).
- You may improve wording of summary and experience bullets.
- Never invent employers, degrees, certifications, skills the user did not provide.
- If the user asks to target a role, emphasize matching existing skills in the summary only.
- Templates allowed: classic, modern, professional, minimal, executive, tech, ats, engineering, hse, graduate.`,
              },
              {
                role: "user",
                content: JSON.stringify({
                  instruction: command,
                  current: current || DEFAULT_CV(),
                  parsed: cv,
                }),
              },
            ],
          }),
        });
        if (r.ok) {
          const j = await r.json();
          const content = j.choices?.[0]?.message?.content || "";
          const match = content.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]) as Partial<CvData>;
            cv = {
              ...DEFAULT_CV(),
              ...cv,
              ...parsed,
              experience: parsed.experience?.length
                ? parsed.experience
                : cv.experience,
              education: parsed.education?.length
                ? parsed.education
                : cv.education,
              projects: parsed.projects?.length
                ? parsed.projects
                : cv.projects || [],
            };
          }
        }
      } catch (e) {
        console.warn("[cv/ai] OpenAI enrich failed, using local parse", e);
      }
    }

    return NextResponse.json({ cv });
  } catch (e) {
    console.error("[cv/ai]", e);
    return NextResponse.json({ error: "AI failed" }, { status: 500 });
  }
}
