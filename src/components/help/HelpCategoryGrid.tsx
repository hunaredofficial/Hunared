import Link from "next/link";
import {
  Rocket,
  UserCog,
  Briefcase,
  FileText,
  Building2,
  Store,
  MessageSquare,
  Bot,
  Bell,
  Megaphone,
  Users,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import { HELP_CATEGORIES } from "@/lib/help/categories";
import { getArticlesByCategory } from "@/lib/help/articles";

const ICONS: Record<string, LucideIcon> = {
  Rocket,
  UserCog,
  Briefcase,
  FileText,
  Building2,
  Store,
  MessageSquare,
  Bot,
  Bell,
  Megaphone,
  Users,
  LifeBuoy,
};

export function HelpCategoryGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {HELP_CATEGORIES.map((c) => {
        const Icon = ICONS[c.icon] || Rocket;
        const count = getArticlesByCategory(c.id).length;
        return (
          <Link
            key={c.id}
            href={`/help/${c.id}`}
            className="group rounded-2xl border border-border/70 bg-card/40 p-4 hover:border-primary/40 hover:bg-card/70 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                  {c.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                <p className="text-[11px] text-muted-foreground mt-2">{count} articles</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
