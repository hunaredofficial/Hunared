import { NextRequest, NextResponse } from "next/server";
import { parseUserMessage } from "@/lib/agent/engine";
import { auth } from "@clerk/nextjs/server";

/**
 * Hunared Agent API
 * - Always runs secure rule-based intent parser (maps to real routes)
 * - Optional: if OPENAI_API_KEY is set, refine the reply message (not privileged actions)
 * - Never executes irreversible writes from this endpoint
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = String((body as { message?: string }).message || "").slice(0, 2000);
    const path = String((body as { path?: string }).path || "");
    if (!message.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Auth context (optional — read-only awareness)
    let userId: string | null = null;
    try {
      const a = await auth();
      userId = a.userId;
    } catch {
      userId = null;
    }

    const action = parseUserMessage(message, { path });

    // Soft personalization note only — no data leakage
    if (userId && (action.intent === "saved" || action.intent === "profile")) {
      // already points to dashboard routes which enforce auth
    } else if (!userId && (action.intent === "saved" || action.intent === "profile" || action.intent === "post")) {
      action.href = "/sign-in";
      action.message =
        action.message + " Sign in is required — I’ll take you to sign in first.";
    }

    // Optional LLM polish (message only)
    const key = process.env.OPENAI_API_KEY;
    if (key && action.intent !== "unknown") {
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
            max_tokens: 180,
            messages: [
              {
                role: "system",
                content:
                  "You are Hunared Agent. Rewrite the assistant message to be clear, short, and professional. Do not invent features. Do not claim an action completed. Keep under 60 words.",
              },
              {
                role: "user",
                content: `User said: ${message}\nPlanned action: ${action.label}\nDraft: ${action.message}`,
              },
            ],
          }),
        });
        if (r.ok) {
          const data = await r.json();
          const polished = data?.choices?.[0]?.message?.content?.trim();
          if (polished) action.message = polished;
        }
      } catch {
        // keep rule-based message
      }
    }

    return NextResponse.json({
      ok: true,
      action,
      authenticated: Boolean(userId),
    });
  } catch (e) {
    console.error("[agent]", e);
    return NextResponse.json(
      { error: "Agent temporarily unavailable" },
      { status: 500 }
    );
  }
}
