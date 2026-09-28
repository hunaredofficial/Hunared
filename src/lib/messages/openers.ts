import type { MessageContextType } from "./types";

export type OpenerContext = {
  contextType: MessageContextType;
  title?: string | null;
  subtitle?: string | null;
  category?: string | null;
  price?: string | null;
  location?: string | null;
  companyName?: string | null;
};

/** Smart first-message suggestions based on full Hunared context */
export function buildSuggestedOpeners(ctx: OpenerContext): string[] {
  const title = (ctx.title || "").trim() || "this";
  const loc = (ctx.location || "").trim();
  const price = (ctx.price || "").trim();
  const cat = (ctx.category || "").toLowerCase();
  const company = (ctx.companyName || ctx.subtitle || "").trim();

  switch (ctx.contextType) {
    case "job":
    case "temporary_work":
      return [
        `Hi, I'm interested in the **${title}** role${company ? ` at ${company}` : ""}. Is this position still open?`,
        `Hello, could you share more details about the **${title}** position${loc ? ` in ${loc}` : ""}?`,
        `Hi, I have relevant experience for **${title}**. What are the key requirements and next steps?`,
        `Hello, is accommodation or transportation provided for the **${title}** role?`,
        `Hi, what is the expected start date and contract type for **${title}**?`,
      ].map(stripBold);

    case "marketplace":
      return marketOpeners(title, cat, price, loc);

    case "vehicle":
      return [
        `Hi, is the **${title}** still available${price ? ` at ${price}` : ""}?`,
        `Hello, can I schedule a viewing for the **${title}**${loc ? ` in ${loc}` : ""}?`,
        `Hi, is the price for **${title}** negotiable? Any service history you can share?`,
        `Hello, what is the current mileage/condition of the **${title}**?`,
      ].map(stripBold);

    case "property":
    case "accommodation":
      return [
        `Hi, is **${title}** still available${loc ? ` in ${loc}` : ""}?`,
        `Hello, when can I visit/view **${title}**?`,
        `Hi, is the rent/price for **${title}** negotiable? What is included?`,
        `Hello, what is the deposit and lease terms for **${title}**?`,
      ].map(stripBold);

    case "service":
      return [
        `Hi, I'm interested in your **${title}** service. Are you available?`,
        `Hello, what is your typical price/quote for **${title}**?`,
        `Hi, when can you start for **${title}**? I can share more requirements.`,
        `Hello, do you cover ${loc || "my area"} for **${title}**?`,
      ].map(stripBold);

    case "talent":
      return [
        `Hi ${title}, I found your profile on Hunared and would like to discuss an opportunity.`,
        `Hello, are you currently open to new roles matching your experience?`,
        `Hi, could we schedule a short call about a position that fits your background?`,
      ].map(stripBold);

    case "company":
      return [
        `Hi, I'd like to learn more about opportunities at **${title}**.`,
        `Hello, who is the best contact for hiring inquiries at **${title}**?`,
        `Hi, I'm interested in working with **${title}**. How can I apply or share my CV?`,
      ].map(stripBold);

    case "program":
      return [
        `Hi, I'd like more information about **${title}**.`,
        `Hello, what are the requirements and schedule for **${title}**?`,
      ].map(stripBold);

    default:
      return [
        `Hi, I'd like to get in touch regarding ${title}.`,
        `Hello, is this still available / open?`,
        `Hi, could you share more details?`,
      ];
  }
}

function marketOpeners(title: string, cat: string, price: string, loc: string): string[] {
  const baseAvail = `Hi, is **${title}** still available${price ? ` (${price})` : ""}?`;
  const locQ = loc
    ? `Hello, where exactly can I see **${title}** in ${loc}?`
    : `Hello, where is **${title}** located for viewing?`;
  const nego = `Hi, is the price for **${title}** negotiable?`;
  const photos = `Hello, could you share more photos or details of **${title}**?`;

  if (/rent|for_rent|accommodation|property|apartment|room|villa/i.test(cat)) {
    return [
      baseAvail,
      `Hi, when is **${title}** available to move in?`,
      nego,
      locQ,
      `Hello, what utilities are included with **${title}**?`,
    ].map(stripBold);
  }
  if (/vehicle|car|auto|motors/i.test(cat)) {
    return [
      baseAvail,
      `Hi, what is the mileage and service history for **${title}**?`,
      nego,
      `Hello, can I arrange an inspection for **${title}**?`,
    ].map(stripBold);
  }
  if (/service|services/i.test(cat)) {
    return [
      `Hi, I'm interested in **${title}**. Are you available this week?`,
      `Hello, what is your quote for **${title}**?`,
      `Hi, do you serve ${loc || "my area"}?`,
    ].map(stripBold);
  }
  if (/electronics|phone|laptop|computer/i.test(cat)) {
    return [
      baseAvail,
      `Hi, what is the condition and warranty status of **${title}**?`,
      nego,
      photos,
    ].map(stripBold);
  }
  if (/job|work|temporary/i.test(cat)) {
    return [
      `Hi, is the **${title}** opportunity still open?`,
      `Hello, what are the hours and pay for **${title}**?`,
    ].map(stripBold);
  }
  // default for sale
  return [baseAvail, nego, locQ, photos, `Hi, can we meet to see **${title}**?`].map(stripBold);
}

function stripBold(s: string): string {
  return s.replace(/\*\*/g, "");
}

/** Primary default opener (first suggestion) */
export function primaryOpener(ctx: OpenerContext): string {
  return buildSuggestedOpeners(ctx)[0] || "Hi, I'd like to get in touch.";
}

/** Map marketplace listing category → message context type */
export function contextTypeFromMarketCategory(category?: string | null): MessageContextType {
  const c = (category || "").toLowerCase();
  if (/vehicle|car|auto|motors|bike/.test(c)) return "vehicle";
  if (/property|real.?estate/.test(c)) return "property";
  if (/accommodation|rent|room|apartment|villa|housing/.test(c)) return "accommodation";
  if (/service/.test(c)) return "service";
  if (/temporary|day.?work|job/.test(c)) return "temporary_work";
  return "marketplace";
}
