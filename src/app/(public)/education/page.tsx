import { createAdminClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ArrowRight,
  GraduationCap,
  FileText,
  ExternalLink,
  Sparkles,
  Shield,
  Wrench,
  Briefcase,
  Scale,
  Users,
  Newspaper,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ARTICLE_CATEGORIES, ARTICLE_CATEGORY_COLORS } from "@/lib/constants";
import { SaveButton } from "@/components/shared/SaveButton";
import { LearningResourcesSection } from "@/components/learning/LearningResourcesSection";
import { PremiumAdSlot } from "@/components/ads/PremiumAdSlot";
import type { Article } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Hub",
  description:
    "Hunared Learning Hub — professional articles, downloadable resources, programs and training for global careers.",
};

interface SearchParams {
  category?: string;
  page?: string;
  q?: string;
}

const PATHS = [
  {
    title: "Safety & HSE",
    desc: "Workplace safety, procedures, and compliance essentials.",
    href: "/education?category=safety_hse",
    icon: Shield,
  },
  {
    title: "Engineering",
    desc: "Technical knowledge for industrial and field professionals.",
    href: "/education?category=engineering",
    icon: Wrench,
  },
  {
    title: "Career growth",
    desc: "CV tips, interviews, and professional development.",
    href: "/education?category=career_tips",
    icon: Briefcase,
  },
  {
    title: "Rights & work",
    desc: "Contracts, responsibilities, and workplace clarity.",
    href: "/education?category=rights_responsibilities",
    icon: Scale,
  },
  {
    title: "Soft skills",
    desc: "Communication, leadership, and teamwork at work.",
    href: "/education?category=soft_skills",
    icon: Users,
  },
  {
    title: "Industry news",
    desc: "Sector trends and practical updates for professionals.",
    href: "/education?category=industry_news",
    icon: Newspaper,
  },
];

function buildParams(opts: { category?: string; page?: number; q?: string }) {
  const p = new URLSearchParams();
  if (opts.category) p.set("category", opts.category);
  if (opts.page && opts.page > 1) p.set("page", String(opts.page));
  if (opts.q) p.set("q", opts.q);
  return p.toString();
}

export default async function EducationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const category = sp.category ?? "";
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const limit = 12;
  const from = (page - 1) * limit;

  const { userId } = await auth();

  let articles: Article[] = [];
  let total = 0;

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("articles")
      .select("*", { count: "exact" })
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (category) {
      query = query.eq("category", category as Article["category"]);
    }
    if (q) {
      query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    }

    const { data, count } = await query;
    articles = data ?? [];
    total = count ?? 0;
  } catch {
    // DB not configured
  }

  const totalPages = Math.ceil(total / limit);
  const activeCategory = ARTICLE_CATEGORIES.find((c) => c.value === category);

  return (
    <div className="min-h-screen pb-16">
      <section className="relative border-b border-border bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              Hunared Learning Hub
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Learn. Grow.{" "}
              <span className="text-primary">Advance your career.</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
              Professional articles, downloadable templates, and official programs — built for
              global talent, employers, and industry professionals.
            </p>

            <form
              action="/education"
              method="get"
              className="mt-6 flex flex-col sm:flex-row gap-2 max-w-xl"
            >
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <input
                name="q"
                defaultValue={q}
                placeholder="Search articles…"
                className="flex-1 h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button type="submit" className="h-11 px-6">
                Search
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link href="/education/resources">
                  <ClipboardList className="h-4 w-4 mr-1.5" />
                  Resource library
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="https://hunared.org/programs" target="_blank" rel="noopener noreferrer">
                  <GraduationCap className="h-4 w-4 mr-1.5" />
                  Programs
                  <ExternalLink className="h-3 w-3 ml-1.5 opacity-70" />
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="https://hunared.org/courses" target="_blank" rel="noopener noreferrer">
                  Training courses
                  <ExternalLink className="h-3 w-3 ml-1.5 opacity-70" />
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/cv">
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  CV Builder
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/articles/new">Write an article</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14 mt-10">
        <section>
          <h2 className="text-lg font-semibold mb-4">Learning paths</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PATHS.map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.href}
                  href={p.href}
                  className="group rounded-xl border border-border bg-card/50 p-4 hover:border-primary/40 hover:bg-card transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">
                    {p.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.desc}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Articles
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {activeCategory
                ? `Category: ${activeCategory.label}`
                : "Expert reading for safety, engineering, careers, and more"}
              {q ? ` · “${q}”` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Button asChild size="sm" variant={!category ? "default" : "outline"} className="h-8">
              <Link href={`/education?${buildParams({ q: q || undefined })}`}>All</Link>
            </Button>
            {ARTICLE_CATEGORIES.map((c) => (
              <Button
                key={c.value}
                asChild
                size="sm"
                variant={category === c.value ? "default" : "outline"}
                className="h-8"
              >
                <Link href={`/education?${buildParams({ category: c.value, q: q || undefined })}`}>
                  {c.label}
                </Link>
              </Button>
            ))}
          </div>

          {articles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-14 text-center px-4">
              <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">No articles in this view yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Share practical knowledge with the community.
              </p>
              <Button asChild size="sm">
                <Link href="/dashboard/articles/new">Write an article</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  {page > 1 && (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/education?${buildParams({
                          category: category || undefined,
                          page: page - 1,
                          q: q || undefined,
                        })}`}
                      >
                        Previous
                      </Link>
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages && (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/education?${buildParams({
                          category: category || undefined,
                          page: page + 1,
                          q: q || undefined,
                        })}`}
                      >
                        Next
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <section className="border-t border-border pt-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Resource library
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Download templates, guides, and training files — or open the full Resources page.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href="/education/resources">
                <ClipboardList className="h-4 w-4 mr-1.5" />
                Open Resources page
              </Link>
            </Button>
          </div>
          <LearningResourcesSection signedIn={!!userId} />
        </section>

        <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <GraduationCap className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold text-sm">Official programs</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Explore Hunared programs and structured learning pathways.
              </p>
              <Button asChild size="sm" variant="secondary">
                <a href="https://hunared.org/programs" target="_blank" rel="noopener noreferrer">
                  Open programs
                </a>
              </Button>
            </div>
            <div>
              <FileText className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold text-sm">Training courses</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Certification and training pathways on hunared.org.
              </p>
              <Button asChild size="sm" variant="outline">
                <a href="https://hunared.org/courses" target="_blank" rel="noopener noreferrer">
                  Explore courses
                </a>
              </Button>
            </div>
            <div>
              <Sparkles className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold text-sm">Build your CV</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Turn learning into a stronger professional profile.
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/cv">Open CV Builder</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const color =
    ARTICLE_CATEGORY_COLORS?.[article.category as keyof typeof ARTICLE_CATEGORY_COLORS] ??
    "bg-muted text-muted-foreground";
  const catLabel =
    ARTICLE_CATEGORIES.find((c) => c.value === article.category)?.label ?? article.category;
  const excerpt =
    typeof article.content === "string"
      ? article.content.replace(/[#*_>`]/g, "").slice(0, 140)
      : "";

  return (
    <Card className="overflow-hidden border-border bg-card/60 hover:border-primary/30 transition-colors h-full flex flex-col">
      <CardContent className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <Badge className={`text-[10px] font-medium ${color}`}>{catLabel}</Badge>
          <SaveButton itemType="article" itemId={article.id} />
        </div>
        <Link href={`/education/${article.id}`} className="group">
          <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>
        {excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{excerpt}…</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {article.created_at
              ? new Date(article.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : ""}
          </span>
          <Link
            href={`/education/${article.id}`}
            className="text-xs font-medium text-primary inline-flex items-center gap-0.5 hover:underline"
          >
            Read
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
