import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { startOrGetConversation } from "@/lib/messages/server";
import { buildSuggestedOpeners, primaryOpener, contextTypeFromMarketCategory } from "@/lib/messages/openers";
import type { MessageContextType } from "@/lib/messages/types";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const recipientId = String(body.recipientId || "");
  if (!recipientId) {
    return NextResponse.json({ error: "recipientId required" }, { status: 400 });
  }

  let contextType = (body.contextType || "general") as MessageContextType;
  // Auto-map marketplace categories
  if (contextType === "marketplace" && body.category) {
    contextType = contextTypeFromMarketCategory(String(body.category));
  }

  const openerCtx = {
    contextType,
    title: body.contextTitle as string | undefined,
    subtitle: body.contextSubtitle as string | undefined,
    category: body.category as string | undefined,
    price: body.price as string | undefined,
    location: body.location as string | undefined,
    companyName: body.companyName as string | undefined,
  };

  const suggestions = buildSuggestedOpeners(openerCtx);
  const primary = primaryOpener(openerCtx);

  // draftOnly default true — create conversation without auto-sending
  const shouldSend = body.send === true;
  const initialMessage =
    typeof body.initialMessage === "string" && body.initialMessage.trim()
      ? body.initialMessage.trim()
      : shouldSend
        ? primary
        : undefined;

  const result = await startOrGetConversation(userId, {
    recipientId,
    contextType,
    contextId: body.contextId,
    contextTitle: body.contextTitle,
    contextSubtitle: body.contextSubtitle,
    contextHref: body.contextHref,
    contextMeta: {
      ...(body.contextMeta || {}),
      category: body.category,
      price: body.price,
      location: body.location,
      companyName: body.companyName,
    },
    initialMessage,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    conversationId: result.conversationId,
    created: result.created,
    suggestedMessage: primary,
    suggestions,
  });
}
