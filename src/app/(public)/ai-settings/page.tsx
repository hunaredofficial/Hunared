import { Suspense } from "react";
import type { Metadata } from "next";
import AiSettingsClient from "./AiSettingsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Privacy & AI settings",
  description: "Control Hunared AI agent and privacy preferences.",
};

export default function AiSettingsPage() {
  return (
    <Suspense fallback={<div className="container max-w-lg mx-auto px-4 py-10 text-sm text-muted-foreground">Loading…</div>}>
      <AiSettingsClient />
    </Suspense>
  );
}
