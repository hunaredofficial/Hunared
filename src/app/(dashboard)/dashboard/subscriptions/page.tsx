"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Briefcase,
  ShoppingBag,
  Plus,
  Trash2,
  ExternalLink,
  BellRing,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JOB_CATEGORIES, LISTING_CATEGORIES } from "@/lib/constants";
import { formatMoney } from "@/lib/currencies";
import { cn } from "@/lib/utils";

type JobSub = { id: string; category: string; created_at: string };
type MktSub = { id: string; category: string; created_at: string };

type MatchingJob = {
  id: string;
  job_title: string;
  company_name: string;
  location: string;
  category: string;
  salary_rate: string | null;
  currency: string | null;
  salary_type: string | null;
  employment_type: string;
  created_at: string;
};

type MatchingListing = {
  id: string;
  title: string;
  price: string;
  currency: string;
  location: string | null;
  image_url: string | null;
  category: string;
  created_at: string;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function listingLabel(value: string) {
  return LISTING_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export default function SubscriptionsPage() {
  const [jobSubs, setJobSubs] = useState<JobSub[]>([]);
  const [mktSubs, setMktSubs] = useState<MktSub[]>([]);
  const [matchingJobs, setMatchingJobs] = useState<MatchingJob[]>([]);
  const [matchingListings, setMatchingListings] = useState<MatchingListing[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [addingJob, setAddingJob] = useState(false);
  const [addingMkt, setAddingMkt] = useState(false);
  const [selectedJobCat, setSelectedJobCat] = useState("");
  const [selectedMktCat, setSelectedMktCat] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [jobRes, mktRes] = await Promise.all([
        fetch("/api/subscriptions/jobs"),
        fetch("/api/subscriptions/market"),
      ]);
      const jobData = await jobRes.json();
      const mktData = await mktRes.json();
      if (!jobRes.ok) throw new Error(jobData.error || "Failed to load job subs");
      if (!mktRes.ok) throw new Error(mktData.error || "Failed to load market subs");

      setJobSubs(jobData.subscriptions ?? []);
      setMatchingJobs(jobData.matchingJobs ?? []);
      setMktSubs(mktData.subscriptions ?? []);
      setMatchingListings(mktData.matchingListings ?? []);
    } catch (e: any) {
      toast.error(e.message || "Could not load subscriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const subscribedJobCats = useMemo(
    () => new Set(jobSubs.map((s) => s.category)),
    [jobSubs]
  );
  const subscribedMktCats = useMemo(
    () => new Set(mktSubs.map((s) => s.category)),
    [mktSubs]
  );

  async function subscribeJob() {
    if (!selectedJobCat) return;
    setAddingJob(true);
    try {
      const res = await fetch("/api/subscriptions/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedJobCat }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Subscribed to ${selectedJobCat}`);
      setSelectedJobCat("");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Could not subscribe");
    } finally {
      setAddingJob(false);
    }
  }

  async function unsubscribeJob(category: string) {
    try {
      const res = await fetch("/api/subscriptions/jobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Unsubscribed from ${category}`);
      await load();
    } catch (e: any) {
      toast.error(e.message || "Could not unsubscribe");
    }
  }

  async function subscribeMkt() {
    if (!selectedMktCat) return;
    setAddingMkt(true);
    try {
      const res = await fetch("/api/subscriptions/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedMktCat }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Subscribed to ${listingLabel(selectedMktCat)}`);
      setSelectedMktCat("");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Could not subscribe");
    } finally {
      setAddingMkt(false);
    }
  }

  async function unsubscribeMkt(category: string) {
    try {
      const res = await fetch("/api/subscriptions/market", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Unsubscribed from ${listingLabel(category)}`);
      await load();
    } catch (e: any) {
      toast.error(e.message || "Could not unsubscribe");
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-muted-foreground">
        Loading subscriptions…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BellRing className="h-6 w-6 text-primary" />
          My Subscriptions
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Follow job categories and marketplace types. New matching items appear
          here and as in-dashboard notifications.
        </p>
      </div>

      {/* Job Category Subscriptions */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Categories
            {jobSubs.length > 0 && (
              <Badge variant="secondary">{jobSubs.length}</Badge>
            )}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-1 block">
              Subscribe to a job category
            </label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={selectedJobCat}
              onChange={(e) => setSelectedJobCat(e.target.value)}
            >
              <option value="">Select category…</option>
              {JOB_CATEGORIES.filter((c) => !subscribedJobCats.has(c)).map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                )
              )}
            </select>
          </div>
          <Button
            onClick={subscribeJob}
            disabled={!selectedJobCat || addingJob}
            size="sm"
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Subscribe
          </Button>
        </div>

        {jobSubs.length === 0 ? (
          <p className="text-sm text-muted-foreground border rounded-lg p-4">
            You are not subscribed to any job categories yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {jobSubs.map((s) => (
              <div
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1.5 text-sm"
              >
                <span>{s.category}</span>
                <button
                  type="button"
                  onClick={() => unsubscribeJob(s.category)}
                  className="text-muted-foreground hover:text-destructive"
                  title="Unsubscribe"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Matching jobs */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Matching jobs ({matchingJobs.length})
          </h3>
          {matchingJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No approved jobs match your subscriptions yet.
            </p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {matchingJobs.map((job) => (
                <li
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 hover:bg-muted/30"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{job.job_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.company_name} · {job.location} · {job.category}
                      {job.salary_rate &&
                        ` · ${formatMoney(job.salary_rate, job.currency)}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Posted {formatDate(job.created_at)}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <Link href={`/jobs/${job.id}`}>
                      View <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Marketplace Category Subscriptions */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Marketplace Categories
            {mktSubs.length > 0 && (
              <Badge variant="secondary">{mktSubs.length}</Badge>
            )}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-1 block">
              Subscribe to a marketplace category
            </label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={selectedMktCat}
              onChange={(e) => setSelectedMktCat(e.target.value)}
            >
              <option value="">Select category…</option>
              {LISTING_CATEGORIES.filter(
                (c) => !subscribedMktCats.has(c.value)
              ).map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={subscribeMkt}
            disabled={!selectedMktCat || addingMkt}
            size="sm"
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Subscribe
          </Button>
        </div>

        {mktSubs.length === 0 ? (
          <p className="text-sm text-muted-foreground border rounded-lg p-4">
            You are not subscribed to any marketplace categories yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {mktSubs.map((s) => (
              <div
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1.5 text-sm"
              >
                <span>{listingLabel(s.category)}</span>
                <button
                  type="button"
                  onClick={() => unsubscribeMkt(s.category)}
                  className="text-muted-foreground hover:text-destructive"
                  title="Unsubscribe"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Matching listings ({matchingListings.length})
          </h3>
          {matchingListings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No approved listings match your subscriptions yet.
            </p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {matchingListings.map((listing) => (
                <li
                  key={listing.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {listing.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.image_url}
                        alt=""
                        className="h-12 w-12 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatMoney(listing.price, listing.currency)} ·{" "}
                        {listingLabel(listing.category)}
                        {listing.location && ` · ${listing.location}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Posted {formatDate(listing.created_at)}
                      </p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <Link href={`/market/${listing.id}`}>
                      View <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Quick link to notifications */}
      <section className="rounded-lg border bg-muted/20 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Bell className="h-4 w-4 text-primary" />
          <span>
            New matching jobs and listings also create{" "}
            <strong>in-dashboard notifications</strong>. Email notifications are
            optional and controlled in your profile.
          </span>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href="/dashboard/notifications">
            <Check className="h-4 w-4" />
            View notifications
          </Link>
        </Button>
      </section>
    </div>
  );
}