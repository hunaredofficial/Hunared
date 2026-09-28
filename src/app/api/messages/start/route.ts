import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { startOrGetConversation, suggestedOpener } from "@/lib/messages/server";
import type { MessageContextType } from "@/lib/messages/types";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const recipientId = String(body.recipientId || "");
  const contextType = (body.contextType || "general") as MessageContextType;
  if (!recipientId) {
    return NextResponse.json({ error: "recipientId required" }, { status: 400 });
  }

  const initialMessage =
    typeof body.initialMessage === "string"
      ? body.initialMessage
      : suggestedOpener(contextType, body.contextTitle);

  const result = await startOrGetConversation(userId, {
    recipientId,
    contextType,
    contextId: body.contextId,
    contextTitle: body.contextTitle,
    contextSubtitle: body.contextSubtitle,
    contextHref: body.contextHref,
    contextMeta: body.contextMeta,
    initialMessage: body.send !== false ? initialMessage : undefined,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    conversationId: result.conversationId,
    created: result.created,
    suggestedMessage: suggestedOpener(contextType, body.contextTitle),
  });
}
