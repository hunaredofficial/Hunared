import type { Metadata } from "next";
import Link from "next/link";
import { HunaredAgent } from "@/components/agent/HunaredAgent";
import {
  Briefcase,
  FileText,
  ShoppingBag,
  GraduationCap,
  Building2,
  Users,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hunared AI",
  description:
    "Hunared AI — intelligent assistant for jobs, CV, marketplace, learning, and career on Hunared.",
};

const CAPS = [
  { icon: Briefcase, title: "Jobs", desc: "Search by role, city, country, employment type" },
  { icon: FileText, title: "CV & career", desc: "CV Builder, cover letters, interview prep" },
  { icon: ShoppingBag, title: "Marketplace", desc: "Sale, rent, services, vehicles, property" },
  { icon: Building2, title: "Companies", desc: "Directory search and employer pages" },
  { icon: Users, title: "Talent", desc: "Find professionals available for hire" },
  { icon: GraduationCap, title: "Learning", desc: "Courses, programs, and skill growth" },
];

export default function AgentPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
          Hunared AI
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          What can I help you accomplish?
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Search jobs, improve your CV, explore marketplace and learning, or manage your account —
          in plain language.{" "}
          <Link
            href="/dashboard/settings/ai"
            className="text-primary underline-offset-2 hover:underline inline-flex items-center gap-1"
          >
            <Shield className="h-3 w-3" />
            Privacy & AI settings
          </Link>
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CAPS.map((c) => (
          <div
            key={c.title}
            className="rounded-xl border border-border/70 bg-card/50 px-3.5 py-3 flex gap-3"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <c.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{c.title}</p>
              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <HunaredAgent variant="page" />

      <p className="text-[11px] text-muted-foreground text-center max-w-lg mx-auto leading-relaxed">
        You stay in control. Hunared AI does not submit applications, publish listings, or make
        payments without your action. AI-generated guidance should be verified for important
        decisions.
      </p>
    </div>
  );
}
