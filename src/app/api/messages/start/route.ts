import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { startOrGetConversation } from "@/lib/messages/server";
import {
  buildSuggestedOpeners,
  primaryOpener,
  contextTypeFromMarketCategory,
} from "@/lib/messages/openers";
import type { MessageContextType } from "@/lib/messages/types";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Please sign in to message." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const recipientId = String(body.recipientId || "").trim();
    if (!recipientId) {
      return NextResponse.json(
        { error: "Cannot message: missing recipient. Try refreshing the page." },
        { status: 400 }
      );
    }
    if (recipientId === userId) {
      return NextResponse.json({ error: "You cannot message yourself." }, { status: 400 });
    }

    let contextType = (body.contextType || "general") as MessageContextType;
    if (contextType === "marketplace" && body.category) {
      contextType = contextTypeFromMarketCategory(String(body.category));
    }

    const title =
      (typeof body.contextTitle === "string" && body.contextTitle.trim()) ||
      "this opportunity";

    const openerCtx = {
      contextType,
      title,
      subtitle: body.contextSubtitle as string | undefined,
      category: body.category as string | undefined,
      price: body.price as string | undefined,
      location: body.location as string | undefined,
      companyName: (body.companyName || body.contextSubtitle) as string | undefined,
    };

    let suggestions: string[] = [];
    let primary = `Hi, I'm interested in ${title}. Is this still available?`;
    try {
      suggestions = buildSuggestedOpeners(openerCtx);
      primary = primaryOpener(openerCtx) || primary;
    } catch (e) {
      console.warn("[messages/start] openers", e);
    }
    if (!primary.trim()) {
      primary = `Hi, I'm interested in ${title}.`;
    }

    // Only auto-send when client explicitly sets send: true
    const shouldSend = body.send === true;

    const result = await startOrGetConversation(userId, {
      recipientId,
      contextType,
      contextId: body.contextId ? String(body.contextId) : undefined,
      contextTitle: body.contextTitle ? String(body.contextTitle) : title,
      contextSubtitle: body.contextSubtitle ? String(body.contextSubtitle) : undefined,
      contextHref: body.contextHref ? String(body.contextHref) : undefined,
      contextMeta: {
        ...(body.contextMeta && typeof body.contextMeta === "object" ? body.contextMeta : {}),
        category: body.category,
        price: body.price,
        location: body.location,
        companyName: body.companyName,
      },
      initialMessage: shouldSend ? primary : undefined,
    });

    if (result.error || !result.conversationId) {
      return NextResponse.json(
        { error: result.error || "Could not start conversation" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      conversationId: result.conversationId,
      created: result.created,
      suggestedMessage: primary,
      suggestions,
    });
  } catch (e) {
    console.error("[messages/start]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not start conversation" },
      { status: 500 }
    );
  }
}
