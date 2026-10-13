import { redirect } from "next/navigation";

/**
 * Legacy /dashboard/ai route.
 * AI controls live under Dashboard → Settings (and public /ai-settings).
 * force-dynamic avoids static prerender failures during `next build`.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DashboardAiRedirectPage() {
  redirect("/dashboard/settings");
}
