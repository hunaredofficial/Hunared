import type { Metadata } from "next";
import { SiteContainer } from "@/components/layout/SiteContainer";
import { ContactContent } from "@/components/contact/ContactContent";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us", 
  description:
    "Get in touch with the Hunared team. We're here to help with questions, feedback, or partnership enquiries.",
}; 
 
export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-background py-20 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
        />
        <SiteContainer className="relative text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-6">
            <Mail className="h-3.5 w-3.5" />
            Get in touch
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            We&apos;d love to{" "}
            <span className="gradient-text">hear from you</span>
          </h1>
          <p className="mx-auto max-w-xl text-muted-foreground text-lg">
            Have a question, suggestion, or just want to say hello? Reach out
            and our team will get back to you.
          </p>
        </SiteContainer>
      </section>

      {/* ── Split layout ──────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <SiteContainer>
          <ContactContent />
        </SiteContainer>
      </section>
    </div>
  );
}
