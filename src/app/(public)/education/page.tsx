import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";
import { BookOpen, CalendarDays, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ARTICLE_CATEGORIES, ARTICLE_CATEGORY_COLORS } from "@/lib/constants";
import { SaveButton } from "@/components/shared/SaveButton";
import type { Article } from "@/types/database";

interface SearchParams {
  category?: string;
  page?: string;
}

export default async function EducationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const category = sp.category ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const limit = 12;
  const from = (page - 1) * limit;

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

    const { data, count } = await query;
    articles = data ?? [];
    total = count ?? 0;
  } catch {
    // DB not configured
  }

  const totalPages = Math.ceil(total / limit);
  const activeCategory = ARTICLE_CATEGORIES.find((c) => c.value === category);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border py-12 pt-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span className="gradient-text">Education Hub</span>
            </h1>
          </div>
          <p className="text-muted-foreground max-w-xl">
            Expert articles on safety, engineering, and career development — written by and for expat professionals.
          </p>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mt-6">
            <Button
              variant={!category ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href="/education">All Articles</Link>
            </Button>
            {ARTICLE_CATEGORIES.map((c) => (
              <Button
                key={c.value}
                variant={category === c.value ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href={`/education?category=${c.value}`}>{c.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {activeCategory && (
          <p className="text-sm text-muted-foreground mb-5">
            {total} article{total !== 1 ? "s" : ""} in{" "}
            <span className="text-foreground font-medium">{activeCategory.label}</span>
          </p>
        )}

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-lg">No articles published yet.</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/dashboard/articles/new">Write the first article</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {page > 1 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/education?${buildParams({ category, page: page - 1 })}`}>
                      Previous
                    </Link>
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/education?${buildParams({ category, page: page + 1 })}`}>
                      Next
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA for contributors */}
      <section className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Share your expertise</h2>
          <p className="text-muted-foreground text-sm mb-5">
            Sign in to contribute an article. All submissions are reviewed before publishing.
          </p>
          <Button asChild>
            <Link href="/dashboard/articles/new">Write an Article</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function plainExcerpt(content: string, max = 150) {
  const cleaned = content
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^[\*\-]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > max ? cleaned.slice(0, max).trim() + "…" : cleaned;
}

function ArticleCard({ article }: { article: Article }) {
  const catLabel =
    ARTICLE_CATEGORIES.find((c) => c.value === article.category)?.label ??
    article.category;
  const colorClass =
    ARTICLE_CATEGORY_COLORS[article.category] ??
    "bg-muted text-muted-foreground";
  const excerpt = plainExcerpt(article.content);

  return (
    <Card className="group relative flex flex-col overflow-hidden border-border/80 bg-card/80 hover:border-primary/45 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-[var(--brand-via)]/70 to-primary/40 opacity-80"
      />
      <CardContent className="pt-5 pb-4 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <Badge className={`text-[10px] border-0 w-fit ${colorClass}`}>
            {catLabel}
          </Badge>
          <SaveButton
            itemType="article"
            itemId={article.id}
            size="icon"
            className="h-8 w-8 rounded-full"
          />
        </div>

        <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
          <Link href={`/education/${article.id}`}>{article.title}</Link>
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-3 flex-1 leading-relaxed">
          {excerpt}
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-border/60 mt-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(article.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs gap-1 px-2 text-primary hover:text-primary"
            asChild
          >
            <Link href={`/education/${article.id}`}>
              Read <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function buildParams(p: { category: string; page: number }) {
  const params = new URLSearchParams();
  if (p.category) params.set("category", p.category);
  if (p.page > 1) params.set("page", p.page.toString());
  return params.toString();
}
