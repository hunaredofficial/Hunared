import type { Metadata } from "next";
import { HunaredAgent } from "@/components/agent/HunaredAgent";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hunared AI",
  description:
    "Hunared AI — intelligent assistant for jobs, CV, marketplace, learning, and career on Hunared.",
};

export default function AgentPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Hunared AI</h1>
        <p className="text-sm text-muted-foreground">
          Search jobs, improve your CV, explore marketplace and learning, or manage your account —
          in plain language.{" "}
          <Link href="/dashboard/settings/ai" className="text-primary underline-offset-2 hover:underline">
            Privacy & AI settings
          </Link>
        </p>
      </div>
      <HunaredAgent variant="page" />
      <p className="text-[11px] text-muted-foreground text-center">
        You stay in control. Important actions require confirmation. AI cannot access other
        users&apos; private data.
      </p>
    </div>
  );
}
