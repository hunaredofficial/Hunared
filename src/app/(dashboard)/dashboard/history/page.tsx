import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HistoryClient } from "@/components/activity/HistoryClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Activity history",
  description: "Your private browsing history on Hunared",
};

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/dashboard/history");
  return <HistoryClient />;
}
