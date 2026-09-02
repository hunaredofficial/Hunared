import { createAdminClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, User, BookOpen, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ARTICLE_CATEGORIES, ARTICLE_CATEGORY_COLORS } from "@/lib/constants";
import type { Article, Profile } from "@/types/database";
import { ArticleBody } from "@/components/articles/ArticleBody";
import { ShareButton } from "@/components/shared/ShareButton";
import { SaveButton } from "@/components/shared/SaveButton";
import { RelatedCarousel } from "@/components/shared/RelatedCarousel";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let article: Article | null = null;
  let author: Partial<Profile> | null = null;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .eq("status", "approved")
      .single();
    article = data;

    if (article) {
      const { data: authorData } = await supabase
        .from("profiles")
        .select("id, full_name, profession, location")
        .eq("id", article.author_id)
        .single();
      author = authorData;
    }
  } catch {
    // ignore
  }

  if (!article) notFound();

  let relatedArticles: Article[] = [];
  try {
    const supabase = createAdminClient();
    let q = supabase
      .from("articles")
      .select("*")
      .eq("status", "approved")
      .neq("id", id)
      .order("created_at", { ascending: false })
      .limit(24);
    if (article.category) q = q.eq("category", article.category);
    const { data } = await q;
    relatedArticles = (data as Article[]) ?? [];
  } catch {
    // non-fatal
  }

  const catLabel =
    ARTICLE_CATEGORIES.find((c) => c.value === article!.category)?.label ??
    article.category;
  const colorClass =
    ARTICLE_CATEGORY_COLORS[article.category] ?? "bg-muted text-muted-foreground";

  // Author initials for avatar
  const initials = author?.full_name
    ? author.full_name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="min-h-screen py-12 pt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[1fr_280px]">
          {/* ── Main content ── */}
          <article className="min-w-0">
            {/* Back */}
            <div className="mb-8">
              <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground" asChild>
                <Link href="/education">
                  <ArrowLeft className="h-4 w-4" /> Education Hub
                </Link>
              </Button>
            </div>

            {/* Header */}
            <div className="mb-10">
              <Badge className={`text-xs border-0 mb-4 ${colorClass}`}>{catLabel}</Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight mb-5">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  {new Date(article.created_at).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                {author?.full_name && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <User className="h-4 w-4 shrink-0" />
                    {author.full_name}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-5">
                <SaveButton itemType="article" itemId={article.id} size="sm" />
                <ShareButton
                  url={`/education/${article.id}`}
                  title={article.title}
                  size="sm"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border mb-10" />

            {/* Body — rendered like write-article preview */}
            <ArticleBody content={article.content} />

            {/* Bottom back link */}
            <div className="mt-16 pt-8 border-t border-border">
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <Link href="/education">
                  <ArrowLeft className="h-4 w-4" /> Back to Education Hub
                </Link>
              </Button>
            </div>
          </article>

          {/* ── Sticky Sidebar ── */}
          <aside className="sticky top-24 self-start space-y-5 hidden lg:block">
            {/* Author card */}
            <Card className="overflow-hidden">
              <CardContent className="pt-5 pb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Written by
                </p>
                {author ? (
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm select-none">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-snug">{author.full_name}</p>
                      {author.profession && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Briefcase className="h-3 w-3 shrink-0" />
                          {author.profession}
                        </p>
                      )}
                      {author.location && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {author.location}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Hunared contributor</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Browse by topic */}
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> Browse by Topic
                </p>
                <div className="flex flex-col gap-2">
                  {ARTICLE_CATEGORIES.map((c) => (
                    <Link
                      key={c.value}
                      href={`/education?category=${c.value}`}
                      className={`text-sm px-2 py-1 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground ${
                        c.value === article!.category ? "bg-muted text-foreground font-medium" : ""
                      }`}
                    >
                      {c.label}
                    </Link>
                  ))}
                  <Link
                    href="/education"
                    className="text-sm px-2 py-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    All Articles
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full gap-1.5" asChild>
              <Link href="/education">
                <ArrowLeft className="h-4 w-4" /> Back to Hub
              </Link>
            </Button>
          </aside>
        </div>

        {/* Similar articles — same category, scroll for more */}
        <RelatedCarousel
          title="Similar articles"
          items={relatedArticles.map((a) => ({
            kind: "article" as const,
            id: a.id,
            title: a.title,
            category:
              ARTICLE_CATEGORIES.find((c) => c.value === a.category)?.label ??
              a.category,
            categoryClass:
              ARTICLE_CATEGORY_COLORS[a.category] ??
              "bg-muted text-muted-foreground",
            date: new Date(a.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          }))}
        />
      </div>
    </div>
  );
}
