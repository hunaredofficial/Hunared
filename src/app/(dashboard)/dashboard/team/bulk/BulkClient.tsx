"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/**
 * Team / Admin bulk posting workspace.
 * Paste JSON arrays for jobs or marketplace listings.
 */
export default function BulkClient() {
  const [jobsJson, setJobsJson] = useState(
    JSON.stringify(
      [
        {
          jobTitle: "Example Technician",
          jobDescription: "Describe the role…",
          companyName: "Example Co",
          country: "SA",
          city: "Riyadh",
          location: "Riyadh",
          employmentType: "permanent",
          duration: "Permanent",
          category: "engineering",
        },
      ],
      null,
      2
    )
  );
  const [marketJson, setMarketJson] = useState(
    JSON.stringify(
      [
        {
          title: "Example listing",
          description: "Describe the item or service…",
          price: "100",
          currency: "SAR",
          category: "for_sale",
          city: "Riyadh",
          country: "SA",
        },
      ],
      null,
      2
    )
  );
  const [jobsLoading, setJobsLoading] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string>("");

  async function submitJobs() {
    setJobsLoading(true);
    setLastResult("");
    try {
      const parsed = JSON.parse(jobsJson) as unknown;
      const jobs = Array.isArray(parsed) ? parsed : (parsed as { jobs?: unknown[] }).jobs;
      if (!Array.isArray(jobs)) throw new Error("JSON must be an array of jobs");
      const res = await fetch("/api/team/bulk-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(`Created ${data.created} of ${data.total} jobs`);
      setLastResult(JSON.stringify(data, null, 2));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setJobsLoading(false);
    }
  }

  async function submitMarket() {
    setMarketLoading(true);
    setLastResult("");
    try {
      const parsed = JSON.parse(marketJson) as unknown;
      const listings = Array.isArray(parsed)
        ? parsed
        : (parsed as { listings?: unknown[] }).listings;
      if (!Array.isArray(listings)) throw new Error("JSON must be an array of listings");
      const res = await fetch("/api/team/bulk-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(`Created ${data.created} of ${data.total} listings`);
      setLastResult(JSON.stringify(data, null, 2));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setMarketLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team bulk post</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create up to 50 jobs or marketplace listings at once. Posts are auto-approved.
          Contact phone is optional for Team accounts.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="font-semibold text-sm">Bulk jobs (JSON array)</h2>
        <textarea
          value={jobsJson}
          onChange={(e) => setJobsJson(e.target.value)}
          rows={12}
          className="w-full font-mono text-xs rounded-md border border-input bg-background p-3"
          spellCheck={false}
        />
        <Button onClick={() => void submitJobs()} disabled={jobsLoading} className="gap-2">
          {jobsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Post jobs
        </Button>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="font-semibold text-sm">Bulk marketplace listings (JSON array)</h2>
        <textarea
          value={marketJson}
          onChange={(e) => setMarketJson(e.target.value)}
          rows={12}
          className="w-full font-mono text-xs rounded-md border border-input bg-background p-3"
          spellCheck={false}
        />
        <Button onClick={() => void submitMarket()} disabled={marketLoading} className="gap-2">
          {marketLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Post listings
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
