/**
 * Context-aware reply chips for both sides of a conversation.
 */

export function buildReplySuggestions(opts: {
  lastMessage?: string | null;
  contextType?: string | null;
  contextTitle?: string | null;
  /** When true, chips are for the person who sent the last message (follow-ups). */
  iAmLastSender?: boolean;
}): string[] {
  const last = (opts.lastMessage || "").toLowerCase();
  const title = opts.contextTitle || "this";
  const ct = (opts.contextType || "").toLowerCase();
  const mine = !!opts.iAmLastSender;

  if (!last.trim()) {
    if (ct === "job") {
      return mine
        ? []
        : [
            `Hi, I'm interested in the ${title} role. Is this position still open?`,
            `Could you share more about ${title}?`,
            "Is accommodation provided?",
          ];
    }
    return ["Hello!", "Thank you for connecting."];
  }

  if (/still (open|available)|is this (open|available)/.test(last)) {
    return mine
      ? ["Thank you — I look forward to your reply.", "Happy to share more details."]
      : [
          `Yes, ${title} is still available.`,
          "Could you share your relevant experience?",
          "What is your availability / timeline?",
        ];
  }

  if (/cv|resume|experience|skills/.test(last)) {
    return mine
      ? ["I have attached my CV.", "I have relevant experience in this field."]
      : [
          "Thank you. Please share your CV and a short experience summary.",
          "Which tools or certifications do you have?",
        ];
  }

  if (/salary|price|rate|negotiable|budget|pay/.test(last)) {
    return mine
      ? ["Is this negotiable?", "What is the expected range?"]
      : [
          "As listed — open to discussion for the right fit.",
          "Please share your expected range.",
        ];
  }

  if (/location|where|map|address|meet/.test(last)) {
    return mine
      ? ["I can share my location.", "Where would you like to meet?"]
      : ["I will share the location details.", "Are you able to visit the site?"];
  }

  if (/start date|when can|availability|notice/.test(last)) {
    return mine
      ? ["I can start within 2 weeks.", "What is the expected start date?"]
      : ["As soon as possible — depending on notice period.", "When can you start?"];
  }

  if (/accommodation|transport|housing|visa/.test(last)) {
    return mine
      ? ["Is accommodation or transport provided?", "Is visa sponsorship available?"]
      : [
          "Please see the job details for benefits.",
          "We can discuss benefits during the interview.",
        ];
  }

  if (ct === "job") {
    return mine
      ? [
          "Thank you for the update.",
          "I am available for an interview.",
          "Please let me know the next steps.",
        ]
      : [
          "Thank you for your interest.",
          "Please share your CV so we can review.",
          "Are you available for a short call?",
        ];
  }

  if (["marketplace", "product", "vehicle", "property", "accommodation", "service"].includes(ct)) {
    return mine
      ? ["Is this still available?", "Can we arrange a viewing?", "Is the price firm?"]
      : ["Yes, it is still available.", "Happy to arrange a time to meet.", "Open to reasonable offers."];
  }

  return mine
    ? ["Thank you.", "Looking forward to your reply."]
    : ["Thank you for your message.", "How can I help further?"];
}
