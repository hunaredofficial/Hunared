import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { Job } from "@/types/database";
import { JobRowActions } from "@/components/jobs/JobRowActions";

export const dynamic = "force-dynamic";

export default async function MyJobsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (!profile || profile.role !== "employer") redirect("/dashboard");

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("employer_id", userId)
    .order("created_at", { ascending: false });

  const allJobs = (jobs ?? []) as Job[];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Job Posts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {allJobs.length} post{allJobs.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/jobs/new">
            <Plus className="h-4 w-4 mr-1.5" /> Post a Job
          </Link>
        </Button>
      </div>

      {allJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <h2 className="text-lg font-semibold">No job posts yet</h2>
            <p className="text-muted-foreground text-sm mt-1 mb-5">
              Post your first job to start hiring professionals.
            </p>
            <Button asChild>
              <Link href="/dashboard/jobs/new">
                <Plus className="h-4 w-4 mr-1.5" /> Post a Job
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {allJobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

function JobRow({ job }: { job: Job }) {
  const statusStyles: Record<string, string> = {
    approved:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    rejected:
      "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    closed:
      "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400",
    draft:
      "bg-muted text-muted-foreground",
  };

  const createdAt = new Date(job.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardContent className="flex items-center gap-4 py-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/jobs/${job.id}`}
              className="text-sm font-semibold hover:text-primary transition-colors"
            >
              {job.job_title}
            </Link>
            <Badge
              className={cn(
                "text-xs",
                statusStyles[job.status] ?? statusStyles.draft
              )}
            >
              {job.status}
            </Badge>
            {job.category && (
              <Badge
                className={cn(
                  "text-xs hidden sm:inline-flex",
                  CATEGORY_COLORS[job.category] ?? CATEGORY_COLORS["Other"]
                )}
              >
                {job.category}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {job.location}
            {job.positions != null ? ` · ${job.positions} position${job.positions !== 1 ? "s" : ""}` : ""}
            {" · Posted "}{createdAt}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/jobs/${job.id}`} aria-label="View job">
              <Briefcase className="h-4 w-4" />
            </Link>
          </Button>
          <JobRowActions jobId={job.id} jobStatus={job.status} />
        </div>
      </CardContent>
    </Card>
  );
}
