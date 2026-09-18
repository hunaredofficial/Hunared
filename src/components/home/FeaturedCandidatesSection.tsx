import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";

const AVATAR_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-500",
  "from-orange-500 to-red-500",
  "from-green-500 to-emerald-500",
];

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

export async function FeaturedCandidatesSection() {
  const supabase = getSupabaseClient();

  const { data: candidates } = await supabase
    .from("profiles")
    .select("id, full_name, profession, location")
    .eq("role", "seeker")
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <section className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Talent</p>
          <h2 className="text-3xl sm:text-4xl font-bold">
            Discover professionals
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Professionals building profiles and open to opportunities.
          </p>
        </div>

        {!candidates || candidates.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">New candidates joining soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {candidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className="group flex flex-col items-center rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-center"
              >
                {/* Avatar */}
                <div className="relative mb-4">
                  <div
                    className={`h-20 w-20 rounded-full bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-xl shadow-md`}
                  >
                    {getInitials(candidate.full_name)}
                  </div>
                  <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-card" />
                </div>

                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                  {candidate.full_name ?? "Anonymous"}
                </h3>
                {(candidate.profession) && (
                  <p className="text-sm text-muted-foreground mt-0.5">{candidate.profession}</p>
                )}
                {candidate.location && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {candidate.location}
                  </p>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full text-xs group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 py-4"
                  asChild
                >
                  <Link href={`/candidates/${candidate.id}`}>View Short CV</Link>
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Button variant="outline" size="lg" className="border-primary/30 hover:border-primary" asChild>
            <Link href="/candidates">
              View All Candidates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
