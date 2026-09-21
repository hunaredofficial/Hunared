import { NextRequest, NextResponse } from "next/server";
import {
  parseUserMessage,
  type ConversationContext,
  type AgentAction,
} from "@/lib/agent/engine";
import { auth } from "@clerk/nextjs/server";

/**
 * Hunared Agent API
 * - Secure rule-based intent → real platform routes
 * - Conversation context for follow-ups (“only temporary”, “in Khobar”)
 * - Optional OPENAI_API_KEY polishes the message only (never invents write actions)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = String((body as { message?: string }).message || "").slice(
      0,
      2000
    );
    const path = String((body as { path?: string }).path || "");
    const ctx = (body as { context?: ConversationContext }).context;

    if (!message.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    let userId: string | null = null;
    try {
      const a = await auth();
      userId = a.userId;
    } catch {
      userId = null;
    }

    const action: AgentAction = parseUserMessage(message, { path }, ctx);

    // Gate private routes
    const privateIntents = new Set([
      "saved",
      "profile",
      "cv",
      "post_job",
      "post_listing",
      "dashboard",
      "notifications",
      "subscriptions",
    ]);
    if (!userId && privateIntents.has(action.intent)) {
      action.href = `/sign-in?redirect_url=${encodeURIComponent(action.href || "/dashboard")}`;
      action.message =
        (action.message || "") +
        " You need to sign in first — I’ll take you there.";
      action.autoNavigate = true;
    }

    // Optional LLM message polish only
    const key = process.env.OPENAI_API_KEY;
    if (key && action.intent !== "unknown" && action.intent !== "clarify") {
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
            max_tokens: 160,
            messages: [
              {
                role: "system",
                content:
                  "You are Hunared Agent on hunared.com. Rewrite the assistant message to be clear, confident, and short (max 50 words). Do not invent features. Do not say the action is already completed. Keep the meaning.",
              },
              {
                role: "user",
                content: `User: ${message}\nAction: ${action.label}\nDraft: ${action.message}`,
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
        /* keep rule-based */
      }
    }

    const nextContext: ConversationContext = {
      lastIntent: action.intent,
      lastEntities: action.entities,
      lastHref: action.href,
    };

    return NextResponse.json({
      ok: true,
      action,
      context: nextContext,
      authenticated: Boolean(userId),
    });
  } catch (e) {
    console.error("[agent]", e);
    return NextResponse.json(
      { error: "Agent temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
