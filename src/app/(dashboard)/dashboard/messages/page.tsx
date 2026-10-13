import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MessagesInbox } from "@/components/messages/MessagesInbox";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function InboxFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground gap-2">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Loading messages…</span>
    </div>
  );
}

export default async function MessagesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return (
    <div className="space-y-3">
      <Suspense fallback={<InboxFallback />}>
        <MessagesInbox currentUserId={userId} />
      </Suspense>
    </div>
  );
}
