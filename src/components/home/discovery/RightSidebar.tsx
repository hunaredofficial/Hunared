import Link from "next/link";
import { Brain, Building2, GraduationCap, Sparkles, Tag } from "lucide-react";
import { DailyPuzzleWidget } from "@/components/mindspace/DailyPuzzleWidget";

type SidebarData = {
  jobs: { id: string; title: string; country?: string | null; company_name?: string | null }[];
  companies: { id: string; name: string; industry?: string | null; country?: string | null }[];
  listings: { id: string; title: string; category?: string | null; price?: number | null; currency?: string | null }[];
  articles: { id: string; title: string; category?: string | null }[];
};

function Section({
  title,
  icon: Icon,
  children,
  href,
}: {
  title: string;
  icon: typeof Sparkles;
  children: React.ReactNode;
  href?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {href ? (
          <Link href={href} className="text-[11px] font-medium text-primary hover:underline">
            See all
          </Link>
        ) : null}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function RightSidebar({ data }: { data: SidebarData }) {
  return (
    <aside className="space-y-4 sticky top-[4.25rem]">
      <DailyPuzzleWidget />

      <Section title="Trending jobs" icon={Sparkles} href="/jobs">
        {(data.jobs.length ? data.jobs : []).map((j) => (
          <Link
            key={j.id}
            href={`/jobs/${j.id}`}
            className="block rounded-xl px-2 py-1.5 hover:bg-muted/50 transition"
          >
            <p className="text-sm font-medium text-foreground line-clamp-1">{j.title}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {[j.company_name, j.country].filter(Boolean).join(" · ")}
            </p>
          </Link>
        ))}
        {!data.jobs.length ? (
          <p className="text-xs text-muted-foreground px-2">No jobs yet.</p>
        ) : null}
      </Section>

      <Section title="Companies" icon={Building2} href="/companies">
        {(data.companies.length ? data.companies : []).map((c) => (
          <Link
            key={c.id}
            href={`/companies/${c.id}`}
            className="block rounded-xl px-2 py-1.5 hover:bg-muted/50 transition"
          >
            <p className="text-sm font-medium line-clamp-1">{c.name}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {[c.industry, c.country].filter(Boolean).join(" · ")}
            </p>
          </Link>
        ))}
        {!data.companies.length ? (
          <p className="text-xs text-muted-foreground px-2">No companies yet.</p>
        ) : null}
      </Section>

      <Section title="Featured listings" icon={Tag} href="/business">
        {(data.listings.length ? data.listings : []).map((l) => (
          <Link
            key={l.id}
            href={`/business/${l.id}`}
            className="block rounded-xl px-2 py-1.5 hover:bg-muted/50 transition"
          >
            <p className="text-sm font-medium line-clamp-1">{l.title}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-1 capitalize">
              {l.category?.replace(/_/g, " ")}
              {l.price != null ? ` · ${l.currency ?? ""} ${l.price}` : ""}
            </p>
          </Link>
        ))}
        {!data.listings.length ? (
          <p className="text-xs text-muted-foreground px-2">No listings yet.</p>
        ) : null}
      </Section>

      <Section title="Learning" icon={GraduationCap} href="/education">
        {(data.articles.length ? data.articles : []).map((a) => (
          <Link
            key={a.id}
            href={`/education/${a.id}`}
            className="block rounded-xl px-2 py-1.5 hover:bg-muted/50 transition"
          >
            <p className="text-sm font-medium line-clamp-2">{a.title}</p>
          </Link>
        ))}
        {!data.articles.length ? (
          <p className="text-xs text-muted-foreground px-2">No articles yet.</p>
        ) : null}
      </Section>

      <div className="rounded-2xl border border-border/50 bg-muted/20 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Sponsored
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Promote jobs, listings, and brands with Hunared Premium Ads.
        </p>
        <Link
          href="/dashboard/premium-ads"
          className="inline-block mt-2 text-[11px] font-semibold text-primary hover:underline"
        >
          Learn more →
        </Link>
      </div>
    </aside>
  );
}
