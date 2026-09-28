export type MessageContextType =
  | "job"
  | "talent"
  | "company"
  | "marketplace"
  | "service"
  | "property"
  | "accommodation"
  | "vehicle"
  | "temporary_work"
  | "program"
  | "general";

export type ConversationRow = {
  id: string;
  context_type: MessageContextType;
  context_id: string | null;
  context_title: string | null;
  context_subtitle: string | null;
  context_href: string | null;
  context_meta: Record<string, unknown> | null;
  created_by: string;
  status: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  message_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  deleted_at: string | null;
};

export type StartConversationInput = {
  recipientId: string;
  contextType: MessageContextType;
  contextId?: string;
  contextTitle?: string;
  contextSubtitle?: string;
  contextHref?: string;
  contextMeta?: Record<string, unknown>;
  initialMessage?: string;
};
