import type { Metadata } from "next";
import Link from "next/link";
import { Bot, Mic, Command, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Hunared Agent | Hunared",
  description:
    "Hunared Agent — natural language search, navigation, and guidance across jobs, marketplace, companies, and more.",
};

export default function AgentPage() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg brand-glow">
          <Bot className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Hunared Agent</h1>
        <p className="text-muted-foreground leading-relaxed">
          Use the floating button (bottom-right) on any page. Speak or type what
          you need — jobs, rentals, services, companies, profile, saved items.
          The Agent understands intent and takes you to the right place on
          Hunared.
        </p>
        <div className="grid sm:grid-cols-3 gap-3 text-left">
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <Mic className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">Voice</p>
            <p className="text-xs text-muted-foreground">
              Tap the mic and speak your request.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <Command className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">Commands</p>
            <p className="text-xs text-muted-foreground">
              Dozens of ready-made actions by category.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <Search className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">Deep search</p>
            <p className="text-xs text-muted-foreground">
              Profession, city, rent/sale, talent, learning.
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Go home — open Agent from any page
        </Link>
      </div>
    </main>
  );
}
