import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase";
import {
  parseUserMessage,
  enhanceAction,
  type ConversationContext,
  type AgentAction,
} from "@/lib/agent/engine";

/**
 * Hunared AI Agent API
 * Rule-based intent + optional OpenAI polish.
 * Respects profiles.ai_enabled. Never executes irreversible actions.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = String((body as { message?: string }).message || "").slice(0, 2000);
    const context = (body as { context?: ConversationContext }).context;
    const path = String((body as { path?: string }).path || "");
    const roleHint = String((body as { role?: string }).role || "");

    if (!message.trim()) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    const { userId } = await auth();
    let aiEnabled = true;
    let role = roleHint || "personal";
    let personalization = true;

    if (userId) {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("role, ai_enabled, ai_personalization")
          .eq("id", userId)
          .maybeSingle();
        if (data) {
          if (typeof data.ai_enabled === "boolean") aiEnabled = data.ai_enabled;
          if (typeof data.ai_personalization === "boolean")
            personalization = data.ai_personalization;
          if (data.role) role = String(data.role);
        }
      } catch {
        /* migration not applied — default ON */
      }
    }

    if (!aiEnabled) {
      return NextResponse.json({
        disabled: true,
        action: {
          intent: "ai_settings",
          href: "/dashboard/settings/ai",
          label: "Turn on Hunared AI",
          message:
            "Hunared AI is OFF for your account. Normal site features still work. Turn AI ON in Dashboard → Settings → Privacy & AI when you want assistance again.",
          secondary: [{ label: "Dashboard", href: "/dashboard" }],
        } satisfies AgentAction,
      });
    }

    let action = parseUserMessage(message, { path }, context);
    action = enhanceAction(action, message, role);

    if (path.startsWith("/jobs/") && /qualified|match|fit|this job/i.test(message)) {
      action = {
        ...action,
        intent: "match_job",
        message:
          `${action.message} You appear to be on a job detail page — compare requirements to your profile and CV. I will not claim you meet a requirement without supporting data.`,
        href: path,
        label: "Review this job",
      };
    }

    let polished = action.message;
    if (process.env.OPENAI_API_KEY) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            temperature: 0.3,
            max_tokens: 280,
            messages: [
              {
                role: "system",
                content:
                  "Refine Hunared AI assistant replies. Keep facts unchanged. Do not invent jobs, salaries, or qualifications. Be concise and professional.",
              },
              {
                role: "user",
                content: `User: ${message}\nDraft: ${action.message}\nReturn only the improved reply.`,
              },
            ],
          }),
        });
        if (res.ok) {
          const j = await res.json();
          const text = j.choices?.[0]?.message?.content?.trim();
          if (text && text.length > 20) polished = text;
        }
      } catch {
        /* keep rule-based */
      }
    }

    return NextResponse.json({
      disabled: false,
      action: { ...action, message: polished },
      meta: {
        role,
        personalization,
        path: path || null,
        disclaimer:
          "AI-generated assistance — verify important information before acting.",
      },
    });
  } catch (e) {
    console.error("[api/agent]", e);
    return NextResponse.json({ error: "Agent failed" }, { status: 500 });
  }
}
