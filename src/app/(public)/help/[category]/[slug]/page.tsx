import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HELP_CATEGORIES } from "@/lib/help/categories";
import { HELP_ARTICLES, getArticle, getArticleByPath } from "@/lib/help/articles";
import { HelpArticleBody } from "@/components/help/HelpArticleBody";
import { HelpSearch } from "@/components/help/HelpSearch";

type Props = { params: Promise<{ category: string; slug: string }> };

export async function generateStaticParams() {
  return HELP_ARTICLES.map((a) => ({ category: a.category, slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const article = getArticle(category, slug);
  if (!article) return { title: "Help | Hunared" };
  return {
    title: `${article.title} | Help Center | Hunared`,
    description: article.summary,
  };
}

export default async function HelpArticlePage({ params }: Props) {
  const { category, slug } = await params;
  const article = getArticle(category, slug);
  if (!article) notFound();
  const cat = HELP_CATEGORIES.find((c) => c.id === article.category);

  const related = (article.related || [])
    .map((p) => getArticleByPath(p))
    .filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <nav className="text-xs text-muted-foreground flex flex-wrap items-center gap-1">
        <Link href="/help" className="hover:text-primary">
          Help Center
        </Link>
        <span>/</span>
        <Link href={`/help/${article.category}`} className="hover:text-primary">
          {cat?.title || article.category}
        </Link>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{article.title}</span>
      </nav>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{cat?.title}</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{article.title}</h1>
        <p className="text-muted-foreground text-sm">{article.summary}</p>
        <p className="text-[11px] text-muted-foreground">Updated {article.updated}</p>
      </header>

      <HelpSearch />

      <HelpArticleBody article={article} />

      {related.length > 0 && (
        <section className="border-t border-border pt-6 space-y-3">
          <h2 className="text-sm font-semibold">Related guides</h2>
          <ul className="space-y-1">
            {related.map(
              (r) =>
                r && (
                  <li key={`${r.category}/${r.slug}`}>
                    <Link
                      href={`/help/${r.category}/${r.slug}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {r.title}
                    </Link>
                  </li>
                )
            )}
          </ul>
        </section>
      )}

      <p className="text-xs text-muted-foreground border-t border-border pt-6">
        Was this helpful? If something is missing,{" "}
        <Link href="/contact" className="text-primary hover:underline">
          contact us
        </Link>
        .
      </p>
    </article>
  );
}
