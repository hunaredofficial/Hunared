import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { HelpSearch } from "@/components/help/HelpSearch";
import { HelpCategoryGrid } from "@/components/help/HelpCategoryGrid";
import { getPopularArticles } from "@/lib/help/search";
import { HELP_CATEGORIES } from "@/lib/help/categories";

export const metadata: Metadata = {
  title: "Help Center | Hunared",
  description:
    "Learn how to use Hunared — jobs, CV Builder, marketplace, messaging, accounts, and more.",
};

export default function HelpCenterPage() {
  const popular = getPopularArticles();

  return (
    <div className="min-h-[70vh] bg-background">
      <section className="border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3 py-1 text-xs text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5" />
            Hunared Help Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            How can we help you?
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Guides for jobs, CV Builder, marketplace, messaging, accounts, and every major
            Hunared feature — based on how the platform actually works.
          </p>
          <HelpSearch autoFocus />
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {["Create account", "CV Builder", "Post a job", "Messages", "Hide Agent"].map(
              (label) => (
                <span
                  key={label}
                  className="rounded-full border border-border/60 px-2.5 py-1 text-muted-foreground"
                >
                  {label}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 space-y-12">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Browse by category</h2>
          <HelpCategoryGrid />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Popular guides</h2>
          <ul className="grid sm:grid-cols-2 gap-2">
            {popular.map((a) => {
              const cat = HELP_CATEGORIES.find((c) => c.id === a.category);
              return (
                <li key={`${a.category}/${a.slug}`}>
                  <Link
                    href={`/help/${a.category}/${a.slug}`}
                    className="block rounded-xl border border-border/60 bg-card/30 px-4 py-3 hover:border-primary/40 transition-colors"
                  >
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cat?.title} · {a.summary}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/30 p-6 text-center space-y-2">
          <h2 className="text-base font-semibold">Still need help?</h2>
          <p className="text-sm text-muted-foreground">
            If a guide does not solve your issue, contact us with the page URL and a short
            description.
          </p>
          <Link href="/contact" className="text-sm text-primary hover:underline">
            Contact support →
          </Link>
        </section>
      </div>
    </div>
  );
}
