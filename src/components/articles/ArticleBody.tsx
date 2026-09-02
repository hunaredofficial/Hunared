/**
 * Renders article content with the same rules as the write-article live preview:
 * # / ## headings, * / - bullets, 1. numbered lists, **bold**
 */
export function ArticleBody({ content }: { content: string }) {
  if (!content?.trim()) {
    return (
      <p className="text-muted-foreground italic">No content.</p>
    );
  }

  const lines = content.split("\n");

  return (
    <div className="max-w-3xl space-y-1 text-base sm:text-lg leading-[1.85] text-muted-foreground">
      {lines.map((line, i) => {
        const t = line.trim();

        if (t.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="text-xl sm:text-2xl font-bold text-foreground pt-6 pb-1"
            >
              {t.replace(/^##\s+/, "")}
            </h2>
          );
        }
        if (t.startsWith("# ")) {
          return (
            <h1
              key={i}
              className="text-2xl sm:text-3xl font-bold text-foreground pt-6 pb-1"
            >
              {t.replace(/^#\s+/, "")}
            </h1>
          );
        }
        if (t.startsWith("* ") || t.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2.5 pl-1 py-0.5">
              <span className="text-primary mt-1.5 shrink-0">•</span>
              <span className="text-foreground/90">
                {formatInline(t.replace(/^[\*\-]\s+/, ""))}
              </span>
            </div>
          );
        }
        if (/^\d+\.\s+/.test(t)) {
          return (
            <div key={i} className="flex gap-2.5 pl-1 py-0.5">
              <span className="text-muted-foreground font-medium min-w-[1.5rem] mt-0.5">
                {t.match(/^\d+/)?.[0]}.
              </span>
              <span className="text-foreground/90">
                {formatInline(t.replace(/^\d+\.\s+/, ""))}
              </span>
            </div>
          );
        }
        if (!t) {
          return <div key={i} className="h-3" />;
        }
        return (
          <p key={i} className="text-foreground/90 py-1">
            {formatInline(line)}
          </p>
        );
      })}
    </div>
  );
}

function formatInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
