import type { Metadata } from "next";
import { SiteContainer } from "@/components/layout/SiteContainer";
import { ContactContent } from "@/components/contact/ContactContent";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Hunared support — questions about accounts, jobs, marketplace, programs, or partnerships. We typically respond within one business day.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <section className="relative border-b border-border overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/12 via-background to-background"
          aria-hidden
        />
        <SiteContainer className="relative py-12 sm:py-16 md:py-18 text-center sm:text-left">
          <div className="max-w-3xl mx-auto sm:mx-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <MessageSquare className="h-3.5 w-3.5" />
              Support
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Contact us
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
              Questions about accounts, listings, programs, or partnerships —
              send a message and our team will get back to you, typically within
              one business day.
            </p>
          </div>
        </SiteContainer>
      </section>

      <SiteContainer className="py-12 sm:py-16 md:py-20">
        <ContactContent />
      </SiteContainer>
    </div>
  );
}
