import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import {
  parseUserMessage,
  enhanceAction,
  type ConversationContext,
  type AgentAction,
} from "@/lib/agent/engine";

/**
 * Hunared AI Agent API
 * Login required. Rule-based intent + optional OpenAI polish.
 * Respects profiles.ai_enabled and ai_agent_actions.
 * Never publishes without the user reviewing the form.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          error: "auth_required",
          action: {
            intent: "sign_in",
            href: "/sign-in",
            label: "Sign in",
            message:
              "**Sign in required** to use Hunared AI. Register free or sign in, then ask again.",
            secondary: [{ label: "Register", href: "/register" }],
          } satisfies AgentAction,
        },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const message = String((body as { message?: string }).message || "").slice(0, 2000);
    const context = (body as { context?: ConversationContext }).context;
    const path = String((body as { path?: string }).path || "");
    const roleHint = String((body as { role?: string }).role || "");
    const clientAgentActions = Boolean((body as { agentActions?: boolean }).agentActions);

    if (!message.trim()) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    let aiEnabled = true;
    let agentActions = clientAgentActions;
    let role = roleHint || "personal";
    let personalization = true;

    try {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("profiles")
        .select("role, ai_enabled, ai_personalization, ai_agent_actions")
        .eq("id", userId)
        .maybeSingle();
      if (data) {
        if (typeof data.ai_enabled === "boolean") aiEnabled = data.ai_enabled;
        if (typeof data.ai_personalization === "boolean")
          personalization = data.ai_personalization;
        if (typeof (data as { ai_agent_actions?: boolean }).ai_agent_actions === "boolean") {
          agentActions = (data as { ai_agent_actions: boolean }).ai_agent_actions;
        }
        if (data.role) role = String(data.role);
      }
    } catch {
      /* migration not applied — defaults */
    }

    if (!aiEnabled) {
      return NextResponse.json({
        disabled: true,
        action: {
          intent: "ai_settings",
          href: "/ai-settings",
          label: "Turn on Hunared AI",
          message:
            "Hunared AI is OFF for your account. Normal site features still work. Turn AI ON in Privacy & AI when you want assistance again.",
          secondary: [{ label: "Dashboard", href: "/dashboard" }],
        } satisfies AgentAction,
      });
    }

    let action = parseUserMessage(message, { path }, context);
    action = enhanceAction(action, message, role);

    // Soft-gate execute/create when agent actions disabled
    if (
      !agentActions &&
      (action.intent === "execute_create" ||
        action.intent === "post_listing" ||
        action.intent === "post_job")
    ) {
      action = {
        ...action,
        autoNavigate: false,
        message:
          `${action.message}\n\n**Agent actions is OFF.** I can still guide you — open Privacy & AI and enable **Agent actions** so I pre-fill create/post forms from your words. You always review before publishing.`,
        secondary: [
          ...(action.secondary || []),
          { label: "Privacy & AI", href: "/ai-settings" },
          action.href ? { label: action.label || "Open form", href: action.href } : undefined,
        ].filter(Boolean) as { label: string; href: string }[],
      };
    }

    if (path.startsWith("/jobs/") && /qualified|match|fit|this job/i.test(message)) {
      action = {
        ...action,
        intent: "match_job",
        message: `${action.message} You appear to be on a job detail page — compare requirements to your profile and CV. I will not claim you meet a requirement without supporting data.`,
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
            max_tokens: 320,
            messages: [
              {
                role: "system",
                content:
                  "You refine Hunared AI replies for a professional global jobs and marketplace platform. Keep all facts and links intent unchanged. Do not invent jobs, salaries, companies, or qualifications. Use a confident, clear, helpful tone. Short paragraphs. No fluff. No 'As an AI'.",
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
        agentActions,
        path: path || null,
        disclaimer:
          "AI-generated assistance — verify important information before acting. You review before any post is published.",
      },
    });
  } catch (e) {
    console.error("[api/agent]", e);
    return NextResponse.json({ error: "Agent failed" }, { status: 500 });
  }
}
