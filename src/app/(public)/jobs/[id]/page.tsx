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

  const posterLocation =
    poster?.city || poster?.country
      ? [poster.city, poster.country].filter(Boolean).join(", ")
      : poster?.location || null;

  // Only if employer allowed it when posting the job
  const allowProfileContact = Boolean(job.show_profile_contact);
  const showPhone = allowProfileContact && Boolean(poster?.phone?.trim());
  const showEmail = allowProfileContact && Boolean(poster?.email?.trim());

  const postedOn = new Date(job.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Format salary with currency
  const formatSalary = () => {
    if (job.salary_type === "After Interview") {
      return "To be discussed";
    }

    if (job.salary_rate) {
      const currencySymbol = job.currency || "SAR";
      return `${job.salary_rate} ${currencySymbol} (${job.salary_type ?? ""})`;
    }

    return job.salary_type ?? "Not specified";
  };

  const salaryLabel = formatSalary();

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
                {job.category && (
                  <Badge
                    className={cn(
                      "text-xs mb-3",
                      CATEGORY_COLORS[job.category] ?? CATEGORY_COLORS["Other"]
                    )}
                  >
                    {job.category}
                  </Badge>
                )}
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {job.job_title}
                </h1>
                <p className="text-muted-foreground font-medium">{job.company_name}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  <Stat icon={<MapPin className="h-4 w-4" />} label="Location" value={job.location} />
                  <Stat icon={<DollarSign className="h-4 w-4" />} label="Salary" value={salaryLabel} />
                  <Stat icon={<Clock className="h-4 w-4" />} label="Duration" value={job.duration} />
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

            {(job.office_address || hasMap) && (
  <Card>
    <CardContent className="pt-6 pb-5">
      <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        Office Location
      </h2>

      {job.office_address && (
        <div className="mb-3">
          {/^https?:\/\//i.test(job.office_address) ||
          job.office_address.includes("maps.google") ||
          job.office_address.includes("goo.gl") ? (
            <a
              href={job.office_address}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline break-all inline-flex items-center gap-1.5"
            >
              Open location on Google Maps
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">{job.office_address}</p>
          )}
        </div>
      )}

      {hasMap && (
        <div className="rounded-lg overflow-hidden border border-border">
          <iframe
            title="Office Location"
            width="100%"
            height="300"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${job.office_lat},${job.office_lng}&z=15&output=embed`}
            className="block"
          />
        </div>
      )}
    </CardContent>
  </Card>
)}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick details */}
            <Card>
              <CardContent className="pt-5 pb-5 space-y-3">
                <h3 className="text-sm font-semibold">Quick Details</h3>
                <Detail icon={<Tag className="h-4 w-4" />} label="Category" value={job.category} />
                {job.subcategory && (
                  <Detail icon={<Tag className="h-4 w-4" />} label="Subcategory" value={job.subcategory} />
                )}
                <Detail icon={<Calendar className="h-4 w-4" />} label="Posted" value={postedOn} />
                <Detail icon={<Clock className="h-4 w-4" />} label="Duration" value={job.duration} />

                <div className="flex items-start gap-2.5">
                  <Banknote className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Salary</p>
                    <p className="text-sm text-foreground">
                      {job.salary_type === "After Interview"
                        ? "To be discussed"
                        : job.salary_rate
                          ? `${job.salary_rate} ${job.currency || "SAR"}`
                          : job.salary_type ?? "Not specified"}
                    </p>
                    {job.salary_type && job.salary_type !== "After Interview" && job.salary_rate && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Type: {job.salary_type}
                      </p>
                    )}
                  </div>
                </div>

                {job.currency && (
                  <Detail
                    icon={<Banknote className="h-4 w-4" />}
                    label="Currency"
                    value={job.currency}
                  />
                )}
                {job.salary_type && (
                  <Detail
                    icon={<Banknote className="h-4 w-4" />}
                    label="Salary Type"
                    value={job.salary_type}
                  />
                )}
                {job.positions != null && (
                  <Detail
                    icon={<Users className="h-4 w-4" />}
                    label="Positions"
                    value={job.positions.toString()}
                  />
                )}
              </CardContent>
            </Card>

            {/* Posted by — profile info */}
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
                      alt={poster.full_name}
                      className="h-11 w-11 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold">
                      {(poster?.full_name || job.company_name || "U")
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {poster?.full_name || job.company_name}
                    </p>
                    {poster?.profession && (
                      <p className="text-xs text-muted-foreground truncate">
                        {poster.profession}
                      </p>
                    )}
                  </div>
                </div>

                {posterLocation && (
                  <Detail
                    icon={<MapPin className="h-4 w-4" />}
                    label="Location"
                    value={posterLocation}
                  />
                )}

                {poster?.company_website && (
                  <div className="flex items-start gap-2.5">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Website</p>
                      <a
                        href={
                          poster.company_website.startsWith("http")
                            ? poster.company_website
                            : `https://${poster.company_website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {poster.company_website}
                      </a>
                    </div>
                  </div>
                )}

                {/* Profile contact (only if allowed) */}
                {showPhone && (
                  <div className="flex items-start gap-2.5">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${poster!.phone!.replace(/\s+/g, "")}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {poster!.phone}
                      </a>
                    </div>
                  </div>
                )}

                {showEmail && (
                  <div className="flex items-start gap-2.5">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${poster!.email}`}
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {poster!.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Only show message when they allowed contact but profile has none */}
                {allowProfileContact && !showPhone && !showEmail && (
                  <p className="text-xs text-muted-foreground">
                    Contact details are not available on this profile.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Company contact (always shown if available) */}
            <Card>
              <CardContent className="pt-5 pb-5 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Company Contact
                </h3>
                <Detail icon={<Building2 className="h-4 w-4" />} label="Company" value={job.company_name} />
                {job.company_address && (
                  <Detail icon={<MapPin className="h-4 w-4" />} label="Address" value={job.company_address} />
                )}
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

                {!job.company_phone && !job.company_email && !job.company_address && (
                  <p className="text-xs text-muted-foreground">
                    Contact details not provided.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Browse more */}
            <Button className="w-full" variant="outline" asChild>
              <Link href="/jobs">Browse More Jobs</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}