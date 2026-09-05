"use server";

import { SaveButton } from "@/components/shared/SaveButton";
import Link from "next/link";
import { MapPin, Clock, DollarSign, ArrowRight, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase";
import { formatJobSalary } from "@/lib/currencies";

const CATEGORY_COLORS: Record<string, string> = {
 Accounting: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Agriculture: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Aviation: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  Architectural: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Automotive: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Automation: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  Banking: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Business: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Chemical: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
  Civil: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Coating: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Community Services": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  Construction: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Control: "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
  Creative: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  "Customer Service": "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  Delivery: "bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300",
  Driving: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Design: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "Digital Marketing": "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
  "Domestic Services": "bg-stone-100 text-stone-700 dark:bg-stone-900/40 dark:text-stone-300",
  Drafting: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  Education: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Electronics: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  "Emergency Services": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Energy: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Entertainment: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Environmental: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "Facilities Management": "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300",
  Fabrication: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Finance: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Freelance: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Government: "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
  Healthcare: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  Hospitality: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  HVAC: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "Human Resources": "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Industrial: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300",
  Inspection: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Instrumentation: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  Inventory: "bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300",
  Landscaping: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Labor: "bg-stone-100 text-stone-700 dark:bg-stone-900/40 dark:text-stone-300",
  Laboratory: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
  "Law & Legal": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Lifting: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Logistics: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Maintenance: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  Manufacturing: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300",
  Marine: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  Marketing: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  Mechanical: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Medical: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  Media: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Mining: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  NGO: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Networking: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  Office: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300",
  Offshore: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Others: "bg-neutral-100 text-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-300",
  Painting: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Petroleum: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "Personal Care": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  Piping: "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
  Planning: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Plumbing: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  Printing: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
  Process: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  Procurement: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Production: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300",
  "Professional Services": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Property: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Publishing: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "Quality Assurance": "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "Quality Control": "bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300",
  Refrigeration: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  "Real Estate": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Remote Work": "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "Research Services": "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Retail: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  Rigging: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Sales: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Scaffolding: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Security: "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
  "Skilled Worker": "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  Structural: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Supply Chain": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Telecommunications: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  Testing: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Textile: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
  Training: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Transportation: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  Utilities: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Warehouse: "bg-stone-100 text-stone-700 dark:bg-stone-900/40 dark:text-stone-300",
  Welding: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "Work Permit": "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300",
};

export async function FeaturedJobsSection() {
  const supabase = createAdminClient();
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, job_title, company_name, location, salary_rate, salary_type, currency, duration, category")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <section className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Opportunities</p>
          <h2 className="text-3xl sm:text-4xl font-bold">
            <span className="gradient-text">Featured Jobs</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Top-reviewed opportunities handpicked for expat professionals this week.
          </p>
        </div>

        {/* Job Grid */}
        {jobs && jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <Card
                key={job.id}
                className="group border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Category */}
                  <span
                    className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                      CATEGORY_COLORS[job.category] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {job.category}
                  </span>

                  {/* Title + Company */}
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                      {job.job_title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {job.company_name}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                      {formatJobSalary(job.salary_rate, job.currency, job.salary_type) || job.salary_rate || 'To Be Discuss'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                      {job.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
  <SaveButton itemType="job" itemId={job.id} size="sm" />
  <Button
    variant="outline"
    size="sm"
    className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
    asChild
  >
    <Link href={`/jobs/${job.id}`}>
      View Details
      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
    </Link>
  </Button>
</div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-base py-12">
            More opportunities coming soon!
          </div>
        )}

        {/* View All */}
        <div className="mt-10 text-center">
          <Button variant="outline" size="lg" className="border-primary/30 hover:border-primary" asChild>
            <Link href="/jobs">
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
