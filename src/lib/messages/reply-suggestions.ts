import type { MessageContextType } from "./types";

/**
 * Suggest professional replies based on the last inbound message + conversation context.
 */
export function buildReplySuggestions(opts: {
  lastMessage: string;
  contextType?: string | null;
  contextTitle?: string | null;
  isEmployerSide?: boolean;
}): string[] {
  const text = (opts.lastMessage || "").toLowerCase();
  const title = opts.contextTitle || "this";
  const type = opts.contextType || "general";
  const out: string[] = [];

  const add = (s: string) => {
    if (!out.includes(s) && out.length < 5) out.push(s);
  };

  // Availability / still open
  if (/still (open|available)|is this (open|available)|available\?/.test(text)) {
    if (type === "job" || type === "temporary_work") {
      add(`Yes, the ${title} position is still open. Are you available for a short discussion?`);
      add(`Thank you for your interest. The role is open — please share your experience and CV.`);
      add(`This position is currently under review. May I have your relevant experience summary?`);
    } else {
      add(`Yes, it is still available. When would you like to proceed?`);
      add(`Yes, still available. Happy to answer any questions you have.`);
      add(`It is available. Would you like more details or photos?`);
    }
  }

  // Price / salary / negotiable
  if (/price|salary|negotiable|how much|cost|rate/.test(text)) {
    if (type === "job" || type === "temporary_work") {
      add(`Compensation depends on experience. Please share your expected range and background.`);
      add(`We can discuss the package after reviewing your qualifications. Could you share your CV?`);
    } else {
      add(`The listed price is firm at the moment, but I am open to a reasonable offer.`);
      add(`Yes, there is some room for negotiation for a serious buyer.`);
      add(`Please share your offer and I will get back to you shortly.`);
    }
  }

  // Accommodation
  if (/accommodation|housing|transport|provided/.test(text)) {
    add(`Accommodation details depend on the contract. I can confirm after reviewing your profile.`);
    add(`Please share your experience level and I will confirm what is included.`);
  }

  // Start date / when
  if (/start date|when can|when (do|does)|available (this|next)|schedule/.test(text)) {
    if (type === "job" || type === "temporary_work") {
      add(`Start date is flexible depending on the selected candidate. When can you join?`);
      add(`We are looking to fill this soon. What is your earliest availability?`);
    } else if (type === "service") {
      add(`I can start based on mutual schedule. What dates work for you?`);
      add(`Please share your preferred timeline and location.`);
    } else {
      add(`You can view it at a mutually convenient time. What day works for you?`);
    }
  }

  // Location / viewing
  if (/where|location|viewing|see it|inspect|meet/.test(text)) {
    add(`We can arrange a viewing. Please share a suitable day and time.`);
    add(`Location details can be shared once we confirm interest. Are you available this week?`);
  }

  // Experience / qualifications / CV
  if (/experience|qualification|cv|resume|background|skill/.test(text)) {
    add(`Thank you. Please share your CV and a short summary of relevant experience.`);
    add(`Could you outline your key skills related to ${title}?`);
  }

  // Greeting / general interest
  if (/interested|would like|hello|hi[,.]|get in touch/.test(text) && out.length < 2) {
    if (type === "job" || type === "temporary_work") {
      add(`Thank you for your interest in ${title}. Could you share your CV and relevant experience?`);
      add(`Appreciate your message. Are you available for a brief call this week?`);
    } else if (type === "talent") {
      add(`Thank you for reaching out. I am open to discussing suitable opportunities.`);
      add(`Please share more details about the role and I will review.`);
    } else {
      add(`Thank you for your message. How can I help you further?`);
      add(`Thanks for contacting me. Happy to provide more details.`);
    }
  }

  // Defaults by context if still empty
  if (out.length === 0) {
    if (type === "job" || type === "temporary_work") {
      add(`Thank you for your message. Could you share your CV and availability?`);
      add(`Appreciate your interest. What is your relevant experience for this role?`);
      add(`Thanks — I will review and get back to you shortly.`);
    } else if (type === "marketplace" || type === "vehicle" || type === "property" || type === "accommodation") {
      add(`Thank you for your interest. It is available — any specific questions?`);
      add(`Yes, happy to help. Would you like to arrange a viewing?`);
      add(`Thanks for messaging. Please share your best offer or preferred time to talk.`);
    } else if (type === "service") {
      add(`Thank you. Please share the scope and location so I can provide a quote.`);
      add(`I am available. When do you need the service?`);
    } else {
      add(`Thank you for your message. I will get back to you shortly.`);
      add(`Appreciate you reaching out. How can I assist?`);
      add(`Thanks — could you share a bit more detail?`);
    }
  }

  return out.slice(0, 5);
}
