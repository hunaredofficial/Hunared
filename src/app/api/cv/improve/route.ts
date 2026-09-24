import { NextRequest, NextResponse } from "next/server";
import { improveText, type ImproveAction } from "@/lib/cv/ai-fill";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = String((body as { text?: string }).text || "");
    const action = ((body as { action?: string }).action || "professional") as ImproveAction;
    if (!text.trim()) {
      return NextResponse.json({ error: "text required" }, { status: 400 });
    }

    let result = improveText(text, action);

    const key = process.env.OPENAI_API_KEY;
    if (key && text.length > 20) {
      try {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.OPENAI_AGENT_MODEL || "gpt-4o-mini",
            temperature: 0.3,
            max_tokens: 800,
            messages: [
              {
                role: "system",
                content:
                  "You improve CV text only. Do not add employers, degrees, certifications, or achievements not present. Return plain text only.",
              },
              {
                role: "user",
                content: `Action: ${action}\n\nText:\n${text}`,
              },
            ],
          }),
        });
        if (r.ok) {
          const j = await r.json();
          const content = j.choices?.[0]?.message?.content?.trim();
          if (content) result = content;
        }
      } catch {
        /* local fallback already set */
      }
    }

    return NextResponse.json({ text: result });
  } catch (e) {
    console.error("[cv/improve]", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
