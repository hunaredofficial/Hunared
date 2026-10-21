import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HELP_CATEGORIES } from "@/lib/help/categories";
import { getArticlesByCategory } from "@/lib/help/articles";
import { HelpSearch } from "@/components/help/HelpSearch";

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return HELP_CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = HELP_CATEGORIES.find((c) => c.id === category);
  if (!cat) return { title: "Help | Hunared" };
  return {
    title: `${cat.title} | Help Center | Hunared`,
    description: cat.description,
  };
}

export default async function HelpCategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = HELP_CATEGORIES.find((c) => c.id === category);
  if (!cat) notFound();
  const articles = getArticlesByCategory(category);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <nav className="text-xs text-muted-foreground">
        <Link href="/help" className="hover:text-primary">
          Help Center
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{cat.title}</span>
      </nav>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{cat.title}</h1>
        <p className="text-sm text-muted-foreground">{cat.description}</p>
      </div>
      <HelpSearch />
      <ul className="space-y-2">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/help/${a.category}/${a.slug}`}
              className="block rounded-xl border border-border/60 bg-card/30 px-4 py-3 hover:border-primary/40"
            >
              <p className="text-sm font-medium">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
