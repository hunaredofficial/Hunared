"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Briefcase,
  Users,
  Star,
  CheckCircle2,
  Share2,
  ExternalLink,
  Calendar,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock data keyed by slug — replace with real Supabase fetch later
const MOCK_PROFILES: Record<string, any> = {
  "abc-engineering": {
    id: "1",
    slug: "abc-engineering",
    name: "ABC Engineering",
    logo_url: null,
    about:
      "ABC Engineering is a leading multidisciplinary engineering and construction company specializing in industrial, oil & gas, and infrastructure projects across the GCC region.",
    description:
      "Founded in 2008, ABC Engineering has delivered over 120 major projects. We provide end-to-end solutions including engineering design, procurement, construction and maintenance services.",
    industry: ["Engineering", "Construction", "Oil & Gas"],
    company_type: "Private Company",
    business_size: "Medium Enterprise",
    founded_year: 2008,
    employee_count: "200-500",
    headquarters_country: "Saudi Arabia",
    headquarters_city: "Riyadh",
    headquarters_address: "King Fahd Road, Al Olaya District, Riyadh 12211",
    website: "https://example.com",
    public_email: "info@abc-engineering.example",
    public_phone: "+966 11 000 0000",
    is_verified: true,
    is_featured: true,
    is_hiring: true,
    followers_count: 1280,
    jobs_count: 18,
    reviews_count: 42,
    rating_avg: 4.6,
    badges: ["verified_company", "hiring_now", "top_rated"],
    social_links: { linkedin: "https://linkedin.com", twitter: "" },
    locations: [
      {
        label: "Headquarters",
        country: "Saudi Arabia",
        city: "Riyadh",
        address: "King Fahd Road, Al Olaya",
        is_headquarters: true,
      },
      {
        label: "Branch",
        country: "Saudi Arabia",
        city: "Jeddah",
        address: "Corniche Road",
        is_headquarters: false,
      },
    ],
    services: [
      "Engineering Design",
      "Project Management",
      "Construction",
      "Maintenance",
      "HSE Consultancy",
    ],
    open_jobs: [
      {
        id: "j1",
        title: "Senior Mechanical Engineer",
        location: "Riyadh",
        salary: "SAR 18,000 – 25,000",
        type: "Permanent",
        posted: "3 days ago",
      },
      {
        id: "j2",
        title: "HSE Officer",
        location: "Jeddah",
        salary: "SAR 12,000 – 15,000",
        type: "Permanent",
        posted: "1 week ago",
      },
      {
        id: "j3",
        title: "Project Engineer – Civil",
        location: "Riyadh",
        salary: "SAR 15,000 – 20,000",
        type: "Contract",
        posted: "2 weeks ago",
      },
    ],
    updates: [
      {
        id: "u1",
        title: "We are expanding our Riyadh office",
        content:
          "ABC Engineering is pleased to announce the expansion of our Riyadh headquarters to support growing project demand.",
        date: "2026-08-10",
      },
      {
        id: "u2",
        title: "New graduate training program",
        content:
          "Applications are now open for our 2026 Graduate Engineer Training Program. 20 positions available.",
        date: "2026-08-01",
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "Ahmed K.",
        rating: 5,
        title: "Great place to grow",
        body: "Excellent project exposure and supportive management. Highly recommend for mechanical engineers.",
        date: "2026-07-15",
      },
      {
        id: "r2",
        author: "Sara M.",
        rating: 4,
        title: "Professional environment",
        body: "Good work-life balance for the industry. Clear career paths.",
        date: "2026-06-20",
      },
    ],
  },
};

// Fallback for any slug
function getProfile(slug: string) {
  if (MOCK_PROFILES[slug]) return MOCK_PROFILES[slug];
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    id: "0",
    slug,
    name,
    logo_url: null,
    about: `${name} is a company on Hunared.`,
    description: "",
    industry: ["Other"],
    company_type: "Private Company",
    business_size: "Medium Enterprise",
    founded_year: null,
    employee_count: null,
    headquarters_country: null,
    headquarters_city: null,
    headquarters_address: null,
    website: null,
    public_email: null,
    public_phone: null,
    is_verified: false,
    is_featured: false,
    is_hiring: false,
    followers_count: 0,
    jobs_count: 0,
    reviews_count: 0,
    rating_avg: 0,
    badges: [],
    social_links: {},
    locations: [],
    services: [],
    open_jobs: [],
    updates: [],
    reviews: [],
  };
}

type Tab = "overview" | "jobs" | "services" | "about" | "locations" | "updates" | "reviews";

export function CompanyProfile({ slug }: { slug: string }) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [following, setFollowing] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [liveReviews, setLiveReviews] = useState<any[] | null>(null);
  const [liveAvg, setLiveAvg] = useState<number | null>(null);
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const company = getProfile(slug);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading company…</div>
      </div>
    );
  }

  
  async function submitReview() {
    setReviewError("");
    setReviewSuccess(false);
    if (!isSignedIn) {
      setReviewError("Please sign in to leave a review.");
      return;
    }
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError("Please select a star rating.");
      return;
    }
    if (reviewBody.trim().length < 10) {
      setReviewError("Please write at least 10 characters.");
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await fetch(`/api/companies/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          rating: reviewRating,
          title: reviewTitle.trim() || undefined,
          body: reviewBody.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReviewError(data.error || "Could not submit review.");
        return;
      }
      setReviewSuccess(true);
      setReviewTitle("");
      setReviewBody("");
      setReviewRating(0);
      if (data.rating_avg != null) setLiveAvg(data.rating_avg);
      if (data.reviews_count != null) setLiveCount(data.reviews_count);
      // Refresh list
      const listRes = await fetch(`/api/companies/${slug}/reviews`);
      if (listRes.ok) {
        const list = await listRes.json();
        if (list.reviews) setLiveReviews(list.reviews);
      } else if (data.review) {
        setLiveReviews((prev) => [data.review, ...(prev || company.reviews || [])]);
      }
    } catch {
      setReviewError("Network error. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "jobs", label: "Jobs", count: company.jobs_count },
    { id: "services", label: "Services", count: company.services?.length },
    { id: "about", label: "About" },
    { id: "locations", label: "Locations", count: company.locations?.length },
    { id: "updates", label: "Updates", count: company.updates?.length },
    { id: "reviews", label: "Reviews", count: company.reviews_count },
  ];

  return (
    <div className="min-h-screen">
      {/* Header banner */}
      <section className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-background pt-24 md:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 md:pb-10">
          <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-start">
            {/* Logo */}
            <div className="h-20 w-20 md:h-24 md:w-24 shrink-0 rounded-2xl bg-primary/10 border border-border flex items-center justify-center text-primary font-bold text-3xl shadow-sm">
              {company.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                  {company.name}
                </h1>
                {company.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
                {company.is_hiring && (
                  <span className="inline-flex items-center rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-0.5 text-xs font-medium">
                    🔥 Hiring Now
                  </span>
                )}
              </div>

              <p className="mt-1 text-muted-foreground">
                {company.industry?.join(" · ")}
                {company.company_type && ` · ${company.company_type}`}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {(company.headquarters_city || company.headquarters_country) && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {[company.headquarters_city, company.headquarters_country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
                {company.founded_year && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Founded {company.founded_year}
                  </span>
                )}
                {company.employee_count && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {company.employee_count} employees
                  </span>
                )}
                {company.rating_avg > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {company.rating_avg.toFixed(1)} ({company.reviews_count} reviews)
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">{company.jobs_count}</span>
                  <span className="text-muted-foreground">open jobs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">
                    {company.followers_count.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">followers</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button
                variant={following ? "outline" : "default"}
                className="gap-2"
                onClick={() => setFollowing(!following)}
              >
                {following ? (
                  <>
                    <Check className="h-4 w-4" /> Following
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Follow Company
                  </>
                )}
              </Button>
              {company.jobs_count > 0 && (
                <Button variant="outline" asChild>
                  <a href="#jobs" onClick={() => setTab("jobs")}>
                    View Jobs
                  </a>
                </Button>
              )}
              {company.website && (
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit website"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button variant="outline" size="icon" aria-label="Share">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-border sticky top-16 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto scrollbar-none py-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                  tab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
                {typeof t.count === "number" && t.count > 0 && (
                  <span className="ml-1.5 text-xs opacity-70">({t.count})</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {tab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-lg font-semibold mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {company.about}
                </p>
              </section>

              {company.open_jobs?.length > 0 && (
                <section id="jobs">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">Open Jobs</h2>
                    <button
                      onClick={() => setTab("jobs")}
                      className="text-sm text-primary hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  <div className="space-y-3">
                    {company.open_jobs.slice(0, 3).map((job: any) => (
                      <JobRow key={job.id} job={job} />
                    ))}
                  </div>
                </section>
              )}

              {company.updates?.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-3">Latest Updates</h2>
                  <div className="space-y-4">
                    {company.updates.slice(0, 2).map((u: any) => (
                      <div
                        key={u.id}
                        className="rounded-xl border border-border p-4"
                      >
                        <h3 className="font-medium">{u.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {u.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {u.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="rounded-xl border border-border p-5 space-y-3">
                <h3 className="font-semibold text-sm">Company Info</h3>
                {company.company_type && (
                  <InfoRow label="Type" value={company.company_type} />
                )}
                {company.business_size && (
                  <InfoRow label="Size" value={company.business_size} />
                )}
                {company.founded_year && (
                  <InfoRow label="Founded" value={String(company.founded_year)} />
                )}
                {company.employee_count && (
                  <InfoRow label="Employees" value={company.employee_count} />
                )}
                {company.website && (
                  <div className="flex items-start gap-2 text-sm">
                    <Globe className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      Website
                    </a>
                  </div>
                )}
                {company.public_email && (
                  <div className="flex items-start gap-2 text-sm">
                    <Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <a
                      href={`mailto:${company.public_email}`}
                      className="text-primary hover:underline break-all"
                    >
                      {company.public_email}
                    </a>
                  </div>
                )}
                {company.public_phone && (
                  <div className="flex items-start gap-2 text-sm">
                    <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span>{company.public_phone}</span>
                  </div>
                )}
              </div>

              {company.services?.length > 0 && (
                <div className="rounded-xl border border-border p-5">
                  <h3 className="font-semibold text-sm mb-3">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {company.services.map((s: string) => (
                      <span
                        key={s}
                        className="rounded-full bg-muted px-2.5 py-1 text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}

        {tab === "jobs" && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-lg font-semibold">
              Open Jobs ({company.jobs_count})
            </h2>
            {company.open_jobs?.length > 0 ? (
              company.open_jobs.map((job: any) => <JobRow key={job.id} job={job} />)
            ) : (
              <p className="text-muted-foreground">No open jobs at the moment.</p>
            )}
          </div>
        )}

        {tab === "services" && (
          <div className="max-w-3xl">
            <h2 className="text-lg font-semibold mb-4">Services</h2>
            {company.services?.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {company.services.map((s: string) => (
                  <div
                    key={s}
                    className="rounded-xl border border-border p-4 flex items-center gap-3"
                  >
                    <Building2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">{s}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No services listed yet.</p>
            )}
          </div>
        )}

        {tab === "about" && (
          <div className="max-w-3xl prose dark:prose-invert">
            <h2 className="text-lg font-semibold mb-3">About {company.name}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {company.description || company.about}
            </p>
          </div>
        )}

        {tab === "locations" && (
          <div className="max-w-3xl space-y-4">
            <h2 className="text-lg font-semibold">Locations</h2>
            {company.locations?.length > 0 ? (
              company.locations.map((loc: any, i: number) => (
                <div
                  key={i}
                  className="rounded-xl border border-border p-4 flex gap-3"
                >
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {loc.label}
                      {loc.is_headquarters && (
                        <span className="ml-2 text-xs text-primary">(HQ)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {[loc.address, loc.city, loc.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No locations listed.</p>
            )}
          </div>
        )}

        {tab === "updates" && (
          <div className="max-w-3xl space-y-4">
            <h2 className="text-lg font-semibold">Company Updates</h2>
            {company.updates?.length > 0 ? (
              company.updates.map((u: any) => (
                <article
                  key={u.id}
                  className="rounded-xl border border-border p-5"
                >
                  <h3 className="font-semibold">{u.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{u.content}</p>
                  <p className="text-xs text-muted-foreground mt-3">{u.date}</p>
                </article>
              ))
            ) : (
              <p className="text-muted-foreground">No updates yet.</p>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div className="max-w-3xl space-y-8">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold">
                  {(liveAvg ?? company.rating_avg).toFixed(1)}
                </div>
                <div className="flex justify-center mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "h-4 w-4",
                        s <= Math.round(liveAvg ?? company.rating_avg)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {liveCount ?? company.reviews_count} reviews
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-5 space-y-4">
              <h3 className="font-semibold text-base">Write a review</h3>
              {!authLoaded ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : !isSignedIn ? (
                <p className="text-sm text-muted-foreground">
                  <Link
                    href="/sign-in"
                    className="text-primary font-medium hover:underline"
                  >
                    Sign in
                  </Link>{" "}
                  to rate and review this company.
                </p>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Your rating
                    </p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onMouseEnter={() => setReviewHover(s)}
                          onMouseLeave={() => setReviewHover(0)}
                          onClick={() => setReviewRating(s)}
                          className="p-0.5"
                          aria-label={`${s} stars`}
                        >
                          <Star
                            className={cn(
                              "h-7 w-7 transition-colors",
                              s <= (reviewHover || reviewRating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Title (optional)
                    </label>
                    <input
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      maxLength={120}
                      placeholder="Summarize your experience"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Review
                    </label>
                    <textarea
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      maxLength={2000}
                      rows={4}
                      placeholder="What was it like working with or for this company?"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y min-h-[100px]"
                    />
                  </div>
                  {reviewError && (
                    <p className="text-sm text-destructive">{reviewError}</p>
                  )}
                  {reviewSuccess && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Thank you — your review was submitted.
                    </p>
                  )}
                  <Button
                    type="button"
                    disabled={reviewSubmitting}
                    onClick={submitReview}
                    className="rounded-xl"
                  >
                    {reviewSubmitting ? "Submitting…" : "Submit review"}
                  </Button>
                </>
              )}
            </div>

            {(liveReviews ?? company.reviews)?.length > 0 ? (
              <div className="space-y-4">
                {(liveReviews ?? company.reviews).map((r: any) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{r.author}</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              "h-3.5 w-3.5",
                              s <= r.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    {r.title && (
                      <p className="font-medium text-sm mt-2">{r.title}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {r.body}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {r.date ||
                        (r.created_at
                          ? new Date(r.created_at).toLocaleDateString()
                          : "")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No reviews yet. Be the first.
              </p>
            )}
          </div>
        )}      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function JobRow({ job }: { job: any }) {
  return (
    <Link
      href={`/jobs`}
      className="block rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-primary/5 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-medium text-foreground">{job.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {job.location} · {job.type}
          </p>
        </div>
        <div className="text-sm text-right">
          <p className="font-medium text-primary">{job.salary}</p>
          <p className="text-xs text-muted-foreground">{job.posted}</p>
        </div>
      </div>
    </Link>
  );
}
