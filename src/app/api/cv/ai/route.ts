import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { parseCvCommand } from "@/lib/cv/ai-fill";
import type { CvData } from "@/lib/cv/types";
import { DEFAULT_CV } from "@/lib/cv/types";

const SYSTEM = `You are Hunared CV Assistant — a professional CV writer for global job seekers (especially Gulf / international technical and professional roles).

Return ONLY valid JSON matching the CV schema the user provides (parsed + current).

HARD RULES:
1. NEVER invent employers, job titles the user did not state, degrees, certifications, dates, skills, or achievements.
2. You MAY improve wording of summary and bullets when facts exist.
3. You MAY structure incomplete user text into fields.
4. If the user asks for a "full professional CV" but gave only a role + location, fill summary/template only and leave experience empty or only with facts they provided.
5. Prefer ATS-friendly clear language.
6. Templates: classic, modern, professional, minimal, executive, tech, ats, engineering, hse, graduate.
7. Keep phone/email/location only if present in input.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const command = String((body as { command?: string }).command || "").slice(0, 6000);
    const current = (body as { current?: Partial<CvData> }).current;
    const sourceText = String((body as { sourceText?: string }).sourceText || "").slice(0, 20000);

    if (!command.trim() && !sourceText.trim()) {
      return NextResponse.json({ error: "Command or sourceText required" }, { status: 400 });
    }

    try {
      await auth();
    } catch {
      /* soft */
    }

    const seed = sourceText ? parseCvCommand(sourceText, current) : parseCvCommand(command, current);
    let cv = command && sourceText
      ? parseCvCommand(command, seed)
      : seed;

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
            temperature: 0.25,
            max_tokens: 2000,
            messages: [
              { role: "system", content: SYSTEM },
              {
                role: "user",
                content: JSON.stringify({
                  instruction: command || "Structure and professionally polish this CV from source text without inventing facts.",
                  sourceText: sourceText || undefined,
                  current: current || DEFAULT_CV(),
                  localParse: cv,
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
              experience: parsed.experience?.length ? parsed.experience : cv.experience,
              education: parsed.education?.length ? parsed.education : cv.education,
              projects: parsed.projects?.length ? parsed.projects : cv.projects || [],
            };
          }
        }
      } catch (e) {
        console.warn("[cv/ai] enrich failed", e);
      }
    }

    return NextResponse.json({ cv });
  } catch (e) {
    console.error("[cv/ai]", e);
    return NextResponse.json({ error: "AI failed" }, { status: 500 });
  }
}
