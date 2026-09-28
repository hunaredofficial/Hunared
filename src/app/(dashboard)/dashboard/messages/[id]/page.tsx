import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MessagesInbox } from "@/components/messages/MessagesInbox";

export const dynamic = "force-dynamic";

export default async function MessageThreadPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return (
    <div className="space-y-3">
      <MessagesInbox currentUserId={userId} />
    </div>
  );
}
