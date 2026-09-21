import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { parseCvCommand } from "@/lib/cv/ai-fill";
import type { CvData } from "@/lib/cv/types";

/**
 * CV AI assist — always returns rule-based parse.
 * If OPENAI_API_KEY is set, attempts to enrich summary/bullets only.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const command = String((body as { command?: string }).command || "").slice(0, 4000);
    const current = (body as { current?: Partial<CvData> }).current;

    if (!command.trim()) {
      return NextResponse.json({ error: "Command required" }, { status: 400 });
    }

    // Optional: require auth for rate control (soft — still works for signed-in)
    try {
      await auth();
    } catch {
      /* allow anonymous free use */
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
            temperature: 0.4,
            max_tokens: 900,
            messages: [
              {
                role: "system",
                content: `You improve CV JSON for job seekers. Return ONLY valid JSON matching this shape:
{"fullName":"","title":"","email":"","phone":"","location":"","website":"","summary":"","skills":"","languages":"","certifications":"","template":"professional|classic|modern|minimal|executive|tech","experience":[{"title":"","company":"","location":"","start":"","end":"","current":false,"bullets":"line1\\nline2"}],"education":[{"school":"","degree":"","field":"","start":"","end":"","details":""}]}
Keep facts from the user. Improve wording of summary and bullets. Do not invent employers or degrees.`,
              },
              {
                role: "user",
                content: `User command:\n${command}\n\nCurrent draft JSON:\n${JSON.stringify(cv)}`,
              },
            ],
            response_format: { type: "json_object" },
          }),
        });
        if (r.ok) {
          const data = await r.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content) as Partial<CvData>;
            cv = {
              ...cv,
              ...parsed,
              experience: Array.isArray(parsed.experience)
                ? parsed.experience.map((e, i) => ({
                    id: cv.experience[i]?.id || `exp-${i}`,
                    title: e.title || "",
                    company: e.company || "",
                    location: e.location || "",
                    start: e.start || "",
                    end: e.end || "",
                    current: Boolean(e.current),
                    bullets: e.bullets || "",
                  }))
                : cv.experience,
              education: Array.isArray(parsed.education)
                ? parsed.education.map((e, i) => ({
                    id: cv.education[i]?.id || `edu-${i}`,
                    school: e.school || "",
                    degree: e.degree || "",
                    field: e.field || "",
                    start: e.start || "",
                    end: e.end || "",
                    details: e.details || "",
                  }))
                : cv.education,
              template: (parsed.template as CvData["template"]) || cv.template,
            };
          }
        }
      } catch (e) {
        console.error("[cv/ai] openai", e);
      }
    }

    return NextResponse.json({ ok: true, cv });
  } catch (e) {
    console.error("[cv/ai]", e);
    return NextResponse.json({ error: "CV AI unavailable" }, { status: 500 });
  }
}
