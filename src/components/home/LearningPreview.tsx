import Link from "next/link";
import { BookOpen, Wrench, Shield, GraduationCap, ArrowRight } from "lucide-react";

const ITEMS = [
  {
    icon: BookOpen,
    title: "Career",
    text: "Tips and guides to advance your professional path.",
    href: "/education?category=career_tips",
  },
  {
    icon: Wrench,
    title: "Engineering",
    text: "Technical knowledge for industrial and field roles.",
    href: "/education?category=engineering",
  },
  {
    icon: Shield,
    title: "HSE & Safety",
    text: "Safety standards and best practices that matter.",
    href: "/education?category=safety_hse",
  },
  {
    icon: GraduationCap,
    title: "Professional Skills",
    text: "Soft skills and development for modern workplaces.",
    href: "/education",
  },
];

export function LearningPreview() {
  return (
    <section className="relative py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div className="space-y-1.5">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Learning
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Learn something that moves your career forward
            </h2>
          </div>
          <Link
            href="/education"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline shrink-0"
          >
            Explore Learning
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {ITEMS.map(({ icon: Icon, title, text, href }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col rounded-xl border border-border/80 bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {text}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
