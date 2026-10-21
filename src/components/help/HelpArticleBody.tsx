import Link from "next/link";
import type { HelpArticle } from "@/lib/help/types";

/** Lightweight renderer for simple markdown-ish help body */
export function HelpArticleBody({ article }: { article: HelpArticle }) {
  const blocks = article.body.split(/\n\n+/);

  return (
    <div className="prose-help space-y-4 text-sm leading-relaxed text-foreground/90">
      {article.steps && article.steps.length > 0 && (
        <ol className="space-y-3 list-none counter-reset-step">
          {article.steps.map((s, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl border border-border/60 bg-card/30 p-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-foreground">{s.title}</p>
                <p className="text-muted-foreground mt-0.5">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
      {blocks.map((block, i) => {
        const lines = block.trim().split("\n");
        if (lines[0]?.startsWith("## ")) {
          return (
            <div key={i} className="space-y-2">
              <h2 className="text-base font-semibold text-foreground pt-2">
                {lines[0].replace(/^## /, "")}
              </h2>
              {lines.slice(1).map((line, j) => renderLine(line, `${i}-${j}`))}
            </div>
          );
        }
        return (
          <div key={i} className="space-y-1">
            {lines.map((line, j) => renderLine(line, `${i}-${j}`))}
          </div>
        );
      })}
      {article.action && (
        <p className="pt-2">
          <Link
            href={article.action.href}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            {article.action.label}
            {article.action.requiresAuth ? " →" : " →"}
          </Link>
          {article.action.requiresAuth && (
            <span className="ml-2 text-xs text-muted-foreground">Sign in required</span>
          )}
        </p>
      )}
    </div>
  );
}

function renderLine(line: string, key: string) {
  const t = line.trim();
  if (!t) return null;
  if (t.startsWith("|")) {
    return (
      <p key={key} className="font-mono text-xs text-muted-foreground overflow-x-auto">
        {t}
      </p>
    );
  }
  if (t.startsWith("- ")) {
    return (
      <p key={key} className="pl-3 border-l-2 border-primary/30 text-muted-foreground">
        {formatInline(t.slice(2))}
      </p>
    );
  }
  return (
    <p key={key} className="text-muted-foreground">
      {formatInline(t)}
    </p>
  );
}

function formatInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="text-foreground font-medium">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}
