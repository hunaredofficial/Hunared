import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COUNTRIES } from "@/lib/countries";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase";
import { normalizeCvUrl } from "@/lib/cloudinary";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  ArrowLeft,
  User,
  Briefcase,
  Lock,
  Phone,
  Globe,
  Calendar,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { auth } from "@clerk/nextjs/server";
import type { Profile } from "@/types/database";
import { CvActions } from "@/components/candidates/CvActions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("profiles")
      .select("full_name, profession")
      .eq("id", id)
      .single();
    if (data) {
      return {
        title: data.full_name,
        description: data.profession
          ? `${data.full_name} — ${data.profession} on Hunared`
          : `${data.full_name}'s profile on Hunared`,
      };
    }
  } catch {
    /* ignore */
  }
  return { title: "Candidate Profile" };
}

const AVATAR_GRADIENTS = [
  "from-blue-500 via-indigo-500 to-cyan-500",
  "from-violet-500 via-purple-500 to-fuchsia-500",
  "from-orange-500 via-red-500 to-rose-500",
  "from-green-500 via-teal-500 to-emerald-500",
];

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();

  let candidate: Profile | null = null;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("role", "seeker")
      .is("deleted_at", null)
      .single();
    candidate = data;
  } catch {
    /* ignore */
  }

  if (!candidate) notFound();

  // Normalise any legacy /image/upload/ CV URLs to /raw/upload/
  if (candidate.cv_url) {
    candidate = { ...candidate, cv_url: normalizeCvUrl(candidate.cv_url) };
  }

  const initials = candidate.full_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const gradient =
    AVATAR_GRADIENTS[candidate.id.charCodeAt(0) % AVATAR_GRADIENTS.length];

  const joinedDate = new Date(candidate.created_at).toLocaleDateString(
    "en-GB",
    {
      month: "long",
      year: "numeric",
    }
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero banner ─────────────────────────────────────────── */}
      <div className="relative h-52 sm:h-64 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/80 via-[#7c3aed]/70 to-[#0ea5e9]/80"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          }}
        />
        <div
          aria-hidden
          className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-white/10 blur-2xl"
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Back link ───────────────────────────────────────────── */}
        <div className="pt-4 pb-2">
          <Link
            href="/candidates"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Candidates
          </Link>
        </div>

        {/* ── Main grid ───────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3 pb-20">
          {/* ── LEFT / MAIN ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Profile identity card — overlaps hero via negative margin */}
            <div className="relative -mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md p-6 shadow-2xl shadow-primary/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="h-24 w-24 rounded-2xl ring-4 ring-background shadow-xl overflow-hidden">
                      {candidate.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={candidate.avatar_url}
                          alt={candidate.full_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-2xl`}
                        >
                          {initials}
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-400 ring-2 ring-background" />
                  </div>

                  {/* Name / profession */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                      {candidate.full_name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {candidate.profession && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-medium px-2.5">
                          {candidate.profession}
                        </Badge>
                      )}
                      {candidate.skill_level && (
                        <Badge variant="outline" className="text-xs">
                          {candidate.skill_level}
                        </Badge>
                      )}
                      {(candidate.city || candidate.country) && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {[
                            candidate.city,
                            COUNTRIES.find((c) => c.code === candidate.country)
                              ?.name,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}
                      {candidate.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {candidate.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Member since badge */}
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                    Member since {joinedDate}
                  </div>
                </div>
              </div>
            </div>

            {/* About section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-75">
              <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <h2 className="font-semibold text-foreground">About</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {candidate.full_name} is a dedicated expat professional
                  {candidate.profession
                    ? ` specialising in ${candidate.profession}`
                    : ""}
                  {candidate.location
                    ? `, currently based in ${candidate.location}`
                    : ""}
                  .
                  {candidate.gender
                    ? ` They identify as ${candidate.gender.replace(/_/g, " ")}.`
                    : ""}{" "}
                  {candidate.cv_url
                    ? "A full CV is available for verified members to download."
                    : "CV not yet uploaded to the platform."}
                </p>
              </div>
            </div>

            {/* Professional details */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <h2 className="font-semibold text-foreground">
                    Professional Info
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {candidate.profession && (
                    <InfoTile
                      icon={<Briefcase className="h-4 w-4" />}
                      label="Profession"
                      value={candidate.profession}
                    />
                  )}
                  {candidate.skill_level && (
                    <InfoTile
                      icon={<Briefcase className="h-4 w-4" />}
                      label="Skill Level"
                      value={candidate.skill_level}
                    />
                  )}
                  {candidate.location && (
                    <InfoTile
                      icon={<Globe className="h-4 w-4" />}
                      label="Location"
                      value={candidate.location}
                    />
                  )}
                  {candidate.gender && (
                    <InfoTile
                      icon={<User className="h-4 w-4" />}
                      label="Gender"
                      value={candidate.gender.replace(/_/g, " ")}
                      capitalize
                    />
                  )}
                  {candidate.phone && userId && (
                    <InfoTile
                      icon={<Phone className="h-4 w-4" />}
                      label="Phone"
                      value={candidate.phone}
                      href={`tel:${candidate.phone.replace(/[^+\d]/g, "")}`}
                    />
                  )}
                  {!userId && (
                    <InfoTile
                      icon={<Phone className="h-4 w-4" />}
                      label="Phone"
                      value="Sign in to view"
                      muted
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Sign-in CTA for guests */}
            {!userId && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      Want the full profile?
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sign in to view phone number and download the CV.
                    </p>
                  </div>
                  <Link
                    href="/sign-in"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shrink-0"
                  >
                    Sign In <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Browse more */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <Link
                href="/candidates"
                className="flex items-center justify-center gap-2 w-full rounded-2xl border border-border/60 bg-card/60 py-3 text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-card transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Browse More Candidates
              </Link>
            </div>
          </div>

          {/* ── RIGHT / SIDEBAR ───────────────────────────────────── */}
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
            {/* CV Download card */}
            <div className="sticky top-24">
              <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-6 shadow-lg hover:border-primary/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">
                    CV / Resume
                  </h3>
                </div>

                <CvActions
                  candidateId={candidate.id}
                  hasCv={Boolean(candidate.cv_url)}
                  isSignedIn={Boolean(userId)}
                />

                {/* Send Offer – only when logged in */}
                {userId && (candidate.email || candidate.phone) && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Send job offer
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.email && (
                        <Button size="sm" className="gap-1.5" asChild>
                          <a
                            href={`mailto:${candidate.email}?subject=${encodeURIComponent(
                              `Job Offer – ${candidate.full_name}`
                            )}&body=${encodeURIComponent(
                              `Hello ${candidate.full_name},\n\nI would like to discuss a job opportunity with you on Hunared.\n\nBest regards`
                            )}`}
                          >
                            <Mail className="h-4 w-4" />
                            Offer by Email
                          </a>
                        </Button>
                      )}
                      {candidate.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          asChild
                        >
                          <a
                            href={`https://wa.me/${candidate.phone
                              .replace(/[^\d+]/g, "")
                              .replace(/^\+/, "")}?text=${encodeURIComponent(
                              `Hello ${candidate.full_name}, I would like to discuss a job opportunity with you on Hunared.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Offer on WhatsApp
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick stats card */}
              <div className="mt-5 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-300">
                <h3 className="font-semibold text-foreground text-sm mb-4">
                  Quick Details
                </h3>
                <ul className="space-y-3">
                  {candidate.profession && (
                    <SidebarDetail
                      icon={<Briefcase className="h-4 w-4" />}
                      label="Role"
                      value={candidate.profession}
                    />
                  )}
                  {candidate.skill_level && (
                    <SidebarDetail
                      icon={<Briefcase className="h-4 w-4" />}
                      label="Skill Level"
                      value={candidate.skill_level}
                    />
                  )}
                  {candidate.location && (
                    <SidebarDetail
                      icon={<MapPin className="h-4 w-4" />}
                      label="Based in"
                      value={candidate.location}
                    />
                  )}
                  {candidate.gender && (
                    <SidebarDetail
                      icon={<User className="h-4 w-4" />}
                      label="Gender"
                      value={candidate.gender.replace(/_/g, " ")}
                      capitalize
                    />
                  )}
                  <SidebarDetail
                    icon={<Calendar className="h-4 w-4" />}
                    label="Joined"
                    value={joinedDate}
                  />
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function InfoTile({
  icon,
  label,
  value,
  capitalize,
  muted,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  capitalize?: boolean;
  muted?: boolean;
  href?: string;
}) {
  const valueClassName = `text-sm font-medium truncate mt-0.5 ${
    muted ? "text-muted-foreground italic" : "text-foreground"
  } ${capitalize ? "capitalize" : ""}`;

  return (
    <div className="flex items-start gap-3 rounded-xl bg-muted/40 border border-border/40 p-3 hover:bg-muted/60 transition-colors">
      <span className="mt-0.5 shrink-0 text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            className={`${valueClassName} block hover:text-primary hover:underline transition-colors`}
          >
            {value}
          </a>
        ) : (
          <p className={valueClassName}>{value}</p>
        )}
      </div>
    </div>
  );
}

function SidebarDetail({
  icon,
  label,
  value,
  capitalize,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`text-sm text-foreground font-medium truncate ${
            capitalize ? "capitalize" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </li>
  );
}