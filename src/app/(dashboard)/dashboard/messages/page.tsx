import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MessagesInbox } from "@/components/messages/MessagesInbox";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Messages",
  description: "Hunared Messages — conversations about jobs, marketplace and more.",
};

export default async function MessagesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/dashboard/messages");
  return (
    <div className="h-[calc(100vh-5.5rem)] min-h-[480px] -mx-2 sm:mx-0">
      <MessagesInbox currentUserId={userId} />
    </div>
  );
}
