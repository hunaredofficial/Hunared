import type { Metadata } from "next";
import Link from "next/link";
import { Bot } from "lucide-react";

export const metadata: Metadata = {
  title: "Hunared Agent | Hunared",
  description:
    "Talk to Hunared Agent — search jobs, marketplace, companies, and navigate the platform with natural language.",
};

export default function AgentPage() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
          <Bot className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Hunared Agent</h1>
        <p className="text-muted-foreground leading-relaxed">
          Use the floating Agent button (bottom-right) anywhere on Hunared to
          search jobs, marketplace, companies, and get guided navigation.
          Tell Hunared what you need — the Agent maps it to real platform
          actions.
        </p>
        <div className="rounded-xl border border-border bg-card p-5 text-left text-sm space-y-2">
          <p className="font-medium text-foreground">Examples</p>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>Find instrument technician jobs in Saudi Arabia</li>
            <li>Apartment for rent in Dammam</li>
            <li>Used laptops</li>
            <li>Show my saved jobs</li>
            <li>What can you do?</li>
          </ul>
        </div>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Back to home — open Agent from any page
        </Link>
      </div>
    </main>
  );
}
