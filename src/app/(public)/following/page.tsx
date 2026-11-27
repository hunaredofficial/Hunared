import type { Metadata } from "next";
import { FollowingClient } from "@/components/home/discovery/FollowingClient";

export const metadata: Metadata = {
  title: "Following | Hunared",
  description: "People and companies you follow on Hunared.",
};

export default function FollowingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Following</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage people and companies you follow. Their community posts and jobs
          appear in your homepage Following feed.
        </p>
      </div>
      <FollowingClient />
    </div>
  );
}
