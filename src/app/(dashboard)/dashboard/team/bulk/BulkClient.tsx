"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

type JobRow = {
  jobTitle: string;
  jobDescription: string;
  companyName: string;
  companyPhone: string;
  country: string;
  city: string;
  location: string;
  employmentType: string;
  duration: string;
  category: string;
};

type MarketRow = {
  title: string;
  description: string;
  price: string;
  currency: string;
  category: string;
  country: string;
  city: string;
  contact_phone: string;
};

const emptyJob = (): JobRow => ({
  jobTitle: "",
  jobDescription: "",
  companyName: "",
  companyPhone: "",
  country: "SA",
  city: "",
  location: "",
  employmentType: "permanent",
  duration: "Permanent",
  category: "engineering",
});

const emptyMarket = (): MarketRow => ({
  title: "",
  description: "",
  price: "",
  currency: "SAR",
  category: "for_sale",
  country: "SA",
  city: "",
  contact_phone: "",
});

export default function BulkClient() {
  const [jobs, setJobs] = useState<JobRow[]>([emptyJob()]);
  const [listings, setListings] = useState<MarketRow[]>([emptyMarket()]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [lastResult, setLastResult] = useState("");

  async function submitJobs() {
    const payload = jobs.filter((j) => j.jobTitle.trim() && j.jobDescription.trim());
    if (!payload.length) {
      toast.error("Add at least one job with title and description");
      return;
    }
    setJobsLoading(true);
    setLastResult("");
    try {
      const res = await fetch("/api/team/bulk-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(
        `Created ${data.created}/${data.total} jobs` +
          (data.linked ? ` · ${data.linked} linked to team companies` : "")
      );
      setLastResult(JSON.stringify(data, null, 2));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setJobsLoading(false);
    }
  }

  async function submitMarket() {
    const payload = listings.filter((l) => l.title.trim() && l.description.trim());
    if (!payload.length) {
      toast.error("Add at least one listing with title and description");
      return;
    }
    setMarketLoading(true);
    setLastResult("");
    try {
      const res = await fetch("/api/team/bulk-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listings: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(`Created ${data.created}/${data.total} listings`);
      setLastResult(JSON.stringify(data, null, 2));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setMarketLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team bulk post</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add multiple jobs or marketplace listings. Jobs auto-link to{" "}
          <strong>team-created company profiles</strong> when the company name matches exactly.
          Max 50 per submit. Posts are auto-approved.
        </p>
      </div>

      {/* JOBS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold">Jobs</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setJobs((j) => [...j, emptyJob()])}
          >
            <Plus className="h-3.5 w-3.5" /> Add job row
          </Button>
        </div>
        {jobs.map((row, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-card p-3 grid gap-2 sm:grid-cols-2 relative">
            <button
              type="button"
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
              onClick={() => setJobs((j) => j.filter((_, i) => i !== idx))}
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <input
              placeholder="Job title *"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={row.jobTitle}
              onChange={(e) =>
                setJobs((j) => j.map((r, i) => (i === idx ? { ...r, jobTitle: e.target.value } : r)))
              }
            />
            <input
              placeholder="Company name (links if team company matches)"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={row.companyName}
              onChange={(e) =>
                setJobs((j) => j.map((r, i) => (i === idx ? { ...r, companyName: e.target.value } : r)))
              }
            />
            <textarea
              placeholder="Job description *"
              rows={2}
              className="sm:col-span-2 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              value={row.jobDescription}
              onChange={(e) =>
                setJobs((j) =>
                  j.map((r, i) => (i === idx ? { ...r, jobDescription: e.target.value } : r))
                )
              }
            />
            <input
              placeholder="City"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={row.city}
              onChange={(e) =>
                setJobs((j) => j.map((r, i) => (i === idx ? { ...r, city: e.target.value } : r)))
              }
            />
            <input
              placeholder="Country code (e.g. SA)"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={row.country}
              onChange={(e) =>
                setJobs((j) => j.map((r, i) => (i === idx ? { ...r, country: e.target.value } : r)))
              }
            />
            <input
              placeholder="Category (e.g. engineering)"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={row.category}
              onChange={(e) =>
                setJobs((j) => j.map((r, i) => (i === idx ? { ...r, category: e.target.value } : r)))
              }
            />
            <input
              placeholder="Phone (optional for Team)"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={row.companyPhone}
              onChange={(e) =>
                setJobs((j) =>
                  j.map((r, i) => (i === idx ? { ...r, companyPhone: e.target.value } : r))
                )
              }
            />
          </div>
        ))}
        <Button onClick={() => void submitJobs()} disabled={jobsLoading} className="gap-2">
          {jobsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Post all jobs
        </Button>
      </section>

      {/* MARKET */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold">Marketplace listings</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setListings((l) => [...l, emptyMarket()])}
          >
            <Plus className="h-3.5 w-3.5" /> Add listing row
          </Button>
        </div>
        {listings.map((row, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-card p-3 grid gap-2 sm:grid-cols-2 relative">
            <button
              type="button"
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
              onClick={() => setListings((l) => l.filter((_, i) => i !== idx))}
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <input
              placeholder="Title *"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={row.title}
              onChange={(e) =>
                setListings((l) => l.map((r, i) => (i === idx ? { ...r, title: e.target.value } : r)))
              }
            />
            <input
              placeholder="Category (e.g. for_sale)"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={row.category}
              onChange={(e) =>
                setListings((l) =>
                  l.map((r, i) => (i === idx ? { ...r, category: e.target.value } : r))
                )
              }
            />
            <textarea
              placeholder="Description *"
              rows={2}
              className="sm:col-span-2 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              value={row.description}
              onChange={(e) =>
                setListings((l) =>
                  l.map((r, i) => (i === idx ? { ...r, description: e.target.value } : r))
                )
              }
            />
            <input
              placeholder="Price"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={row.price}
              onChange={(e) =>
                setListings((l) => l.map((r, i) => (i === idx ? { ...r, price: e.target.value } : r)))
              }
            />
            <input
              placeholder="City"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={row.city}
              onChange={(e) =>
                setListings((l) => l.map((r, i) => (i === idx ? { ...r, city: e.target.value } : r)))
              }
            />
          </div>
        ))}
        <Button onClick={() => void submitMarket()} disabled={marketLoading} className="gap-2">
          {marketLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Post all listings
        </Button>
      </section>

      {lastResult && (
        <pre className="text-xs rounded-md border border-border bg-muted/40 p-3 overflow-auto max-h-64">
          {lastResult}
        </pre>
      )}
    </div>
  );
}
