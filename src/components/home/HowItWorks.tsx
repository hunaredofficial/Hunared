import { UserPlus, Search, Handshake, TrendingUp } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your profile",
    text: "Join as a professional, company, or marketplace user in minutes.",
  },
  {
    icon: Search,
    title: "Discover opportunities",
    text: "Search jobs, talent, companies, listings, and learning in one place.",
  },
  {
    icon: Handshake,
    title: "Connect",
    text: "Apply, contact candidates, or reach buyers and sellers directly.",
  },
  {
    icon: TrendingUp,
    title: "Grow",
    text: "Build your career, hire better, and access programs when ready.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-12 sm:py-16 border-y border-border/50 bg-muted/15">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-9 space-y-1.5">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Simple by design
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            How Hunared works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="flex flex-col items-start text-left">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                  0{i + 1}
                </span>
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
