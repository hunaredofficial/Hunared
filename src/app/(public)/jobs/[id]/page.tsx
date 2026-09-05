import { ShareButton } from "@/components/shared/ShareButton";
import { SaveButton } from "@/components/shared/SaveButton";
import { createAdminClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  Building2,
  Phone,
  Mail,
  MessageCircle,
  ArrowLeft,
  Calendar,
  Tag,
  Banknote,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/constants";
import { formatMoney } from "@/lib/currencies";
import type { Job } from "@/types/database";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let job: Job | null = null;
  let poster: {
    full_name: string;
    username: string | null;
    profession: string | null;
    location: string | null;
    city: string | null;
    country: string | null;
    avatar_url: string | null;
    company_website: string | null;
    email: string | null;
    phone: string | null;
  } | null = null;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .eq("status", "approved")
      .single();
    job = data;

    if (job?.employer_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "full_name, username, profession, location, city, country, avatar_url, company_website, email, phone"
        )
        .eq("id", job.employer_id)
        .maybeSingle();
      poster = profile;
    }
  } catch {
    // ignore
  }

  if (!job) notFound();

  // Similar jobs (same category / country), exclude current
  let relatedJobs: Pick<
    Job,
    "id" | "job_title" | "company_name" | "location" | "category" | "salary_rate" | "currency" | "salary_type" | "duration" | "positions" | "created_at"
  >[] = [];
  try {
    const supabase = createAdminClient();
    let q = supabase
      .from("jobs")
      .select(
        "id, job_title, company_name, location, category, salary_rate, currency, salary_type, duration, positions, created_at"
      )
      .eq("status", "approved")
      .neq("id", id)
      .order("created_at", { ascending: false })
      .limit(6);
    if (job.category) q = q.eq("category", job.category);
    const { data: rel } = await q;
    relatedJobs = (rel as typeof relatedJobs) ?? [];
    if (relatedJobs.length < 3 && job.country) {
      const { data: rel2 } = await supabase
        .from("jobs")
        .select(
          "id, job_title, company_name, location, category, salary_rate, currency, salary_type, duration, positions, created_at"
        )
        .eq("status", "approved")
        .eq("country", job.country)
        .neq("id", id)
        .order("created_at", { ascending: false })
        .limit(6);
      const ids = new Set(relatedJobs.map((j) => j.id));
      for (const j of rel2 ?? []) {
        if (!ids.has(j.id)) relatedJobs.push(j as (typeof relatedJobs)[0]);
      }
      relatedJobs = relatedJobs.slice(0, 6);
    }
  } catch {
    // non-fatal
  }

  const posterLocation =
    poster?.city || poster?.country
      ? [poster.city, poster.country].filter(Boolean).join(", ")
      : poster?.location || null;

  const allowProfileContact = Boolean(job.show_profile_contact);
  const showPhone = allowProfileContact && Boolean(poster?.phone?.trim());
  const showEmail = allowProfileContact && Boolean(poster?.email?.trim());

  const postedOn = new Date(job.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const salaryLabel =
    job.salary_type === "After Interview"
      ? "To be discussed"
      : job.salary_rate
        ? `${formatMoney(job.salary_rate, job.currency)}${
            job.salary_type ? ` (${job.salary_type})` : ""
          }`
        : job.salary_type ?? "Not specified";

  const hasMap = job.office_lat != null && job.office_lng != null;

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" asChild>
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4" /> Back to Jobs
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <Card>
              <CardContent className="pt-6 pb-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  {job.category ? (
                    <Badge
                      className={cn(
                        "text-xs",
                        CATEGORY_COLORS[job.category] ??
                          CATEGORY_COLORS["Other"]
                      )}
                    >
                      {job.category}
                    </Badge>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-2">
                    <ShareButton
                      url={`/jobs/${job.id}`}
                      title={job.job_title}
                      size="sm"
                    />
                    <SaveButton itemType="job" itemId={job.id} />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {job.job_title}
                </h1>
                <p className="text-muted-foreground font-medium">
                  {job.company_name}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  <Stat
                    icon={<MapPin className="h-4 w-4" />}
                    label="Location"
                    value={job.location}
                  />
                  <Stat
                    icon={<DollarSign className="h-4 w-4" />}
                    label="Salary"
                    value={salaryLabel}
                  />
                  <Stat
                    icon={<Clock className="h-4 w-4" />}
                    label="Duration"
                    value={job.duration}
                  />
                  {job.positions != null ? (
                    <Stat
                      icon={<Users className="h-4 w-4" />}
                      label="Positions"
                      value={`${job.positions} open`}
                    />
                  ) : (
                    <Stat
                      icon={<Users className="h-4 w-4" />}
                      label="Positions"
                      value="Not specified"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="pt-6 pb-6">
                <h2 className="text-lg font-semibold mb-4">Job Description</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {job.job_description}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar — order: Quick Details → Company Contact → Apply → Posted by */}
          <div className="space-y-4">
            {/* 1. Quick details */}
            <Card>
              <CardContent className="pt-5 pb-5 space-y-3">
                <h3 className="text-sm font-semibold">Quick Details</h3>
                <Detail
                  icon={<Tag className="h-4 w-4" />}
                  label="Category"
                  value={job.category}
                />
                {job.subcategory && (
                  <Detail
                    icon={<Tag className="h-4 w-4" />}
                    label="Subcategory"
                    value={job.subcategory}
                  />
                )}
                <Detail
                  icon={<Calendar className="h-4 w-4" />}
                  label="Posted"
                  value={postedOn}
                />
                <Detail
                  icon={<Clock className="h-4 w-4" />}
                  label="Duration"
                  value={job.duration}
                />
                <div className="flex items-start gap-2.5">
                  <Banknote className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Salary</p>
                    <p className="text-sm text-foreground">{salaryLabel}</p>
                    {job.salary_type && job.salary_type !== "After Interview" && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Type: {job.salary_type}
                      </p>
                    )}
                  </div>
                </div>
                <Detail
                  icon={<Users className="h-4 w-4" />}
                  label="Positions"
                  value={
                    job.positions != null
                      ? String(job.positions)
                      : "Not Specified"
                  }
                />
                {job.employment_type && (
                  <Detail
                    icon={<Tag className="h-4 w-4" />}
                    label="Employment"
                    value={job.employment_type}
                  />
                )}
              </CardContent>
            </Card>

            {/* 2. Company Contact — includes Location (map link / address) */}
            <Card>
              <CardContent className="pt-5 pb-5 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Company Contact
                </h3>
                <Detail
                  icon={<Building2 className="h-4 w-4" />}
                  label="Company"
                  value={job.company_name}
                />
                {job.company_phone && (
                  <div className="flex items-start gap-2.5">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${job.company_phone.replace(/\s+/g, "")}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {job.company_phone}
                      </a>
                    </div>
                  </div>
                )}
                {job.company_email && (
                  <div className="flex items-start gap-2.5">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${job.company_email}`}
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {job.company_email}
                      </a>
                    </div>
                  </div>
                )}
                {/* Location: map link, office address, or company address */}
                {((job as { work_location?: string | null }).work_location || job.office_address || job.company_address || hasMap) && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Work location</p>
                      {(() => {
                        const wl =
                          (job as { work_location?: string | null }).work_location ||
                          job.office_address ||
                          "";
                        const isLink =
                          /^https?:\/\//i.test(wl) ||
                          wl.includes("maps.google") ||
                          wl.includes("goo.gl") ||
                          wl.includes("maps.app.goo");
                        if (isLink && wl) {
                          return (
                            <a
                              href={wl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline break-all"
                            >
                              Open work location on Google Maps
                            </a>
                          );
                        }
                        if (wl) {
                          return (
                            <p className="text-sm text-foreground break-words">{wl}</p>
                          );
                        }
                        if (job.company_address) {
                          return (
                            <p className="text-sm text-foreground break-words">
                              {job.company_address}
                            </p>
                          );
                        }
                        return null;
                      })()}
                      {hasMap && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-border">
                          <iframe
                            title="Office Location"
                            width="100%"
                            height="180"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://maps.google.com/maps?q=${job.office_lat},${job.office_lng}&z=15&output=embed`}
                            className="block"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {!job.company_phone &&
                  !job.company_email &&
                  !(job as { work_location?: string | null }).work_location &&
                  !job.office_address &&
                  !job.company_address && (
                    <p className="text-xs text-muted-foreground">
                      Contact details not provided.
                    </p>
                  )}
              </CardContent>
            </Card>

            {/* 3. Apply for this job */}
            <Card>
              <CardContent className="pt-5 pb-5 space-y-3">
                <h3 className="text-sm font-semibold">Apply for this job</h3>
                {job.company_email || job.company_phone ? (
                  <div className="space-y-2">
                    {job.company_email && (
                      <Button className="w-full" asChild>
                        <a
                          href={`mailto:${job.company_email}?subject=${encodeURIComponent(
                            `Application: ${job.job_title}`
                          )}`}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Apply by Email
                        </a>
                      </Button>
                    )}
                    {job.company_phone && (
                      <Button className="w-full" variant="outline" asChild>
                        <a
                          href={`https://wa.me/${job.company_phone.replace(
                            /\D/g,
                            ""
                          )}?text=${encodeURIComponent(
                            `Hi, I am interested in the ${job.job_title} position.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Apply on WhatsApp
                        </a>
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Contact the company using the details above.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 4. Posted by */}
            <Card>
              <CardContent className="pt-5 pb-5 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Posted by
                </h3>
                <div className="flex items-center gap-3">
                  {poster?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={poster.avatar_url}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-semibold text-primary">
                      {(poster?.full_name || job.company_name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {poster?.full_name || job.company_name}
                    </p>
                    {posterLocation && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {posterLocation}
                      </p>
                    )}
                  </div>
                </div>
                {poster?.company_website && (
                  <a
                    href={
                      poster.company_website.startsWith("http")
                        ? poster.company_website
                        : `https://${poster.company_website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline break-all"
                  >
                    {poster.company_website}
                  </a>
                )}
              </CardContent>
            </Card>

            <Button className="w-full" variant="outline" asChild>
              <Link href="/jobs">Browse More Jobs</Link>
            </Button>
          </div>
        </div>

        {/* Related / similar jobs */}
        {relatedJobs.length > 0 && (
          <div className="mt-10 space-y-4">
            <h2 className="text-lg font-semibold">Similar jobs</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedJobs.map((rj) => (
                <Link
                  key={rj.id}
                  href={`/jobs/${rj.id}`}
                  className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors space-y-2"
                >
                  {rj.category && (
                    <Badge
                      className={cn(
                        "text-[10px]",
                        CATEGORY_COLORS[rj.category] ?? CATEGORY_COLORS["Other"]
                      )}
                    >
                      {rj.category}
                    </Badge>
                  )}
                  <p className="font-semibold text-sm line-clamp-2">
                    {rj.job_title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {rj.company_name}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{rj.location}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Positions:{" "}
                    {rj.positions != null ? rj.positions : "Not Specified"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}