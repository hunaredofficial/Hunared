"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { JOB_CATEGORIES, DURATIONS, SALARY_TYPES } from "@/lib/constants";
import type { OfficeLocation } from "@/components/jobs/OfficeLocationPicker";
import type { Job } from "@/types/database";
import Link from "next/link";

const OfficeLocationPicker = dynamic(
  () =>
    import("@/components/jobs/OfficeLocationPicker").then(
      (m) => m.OfficeLocationPicker
    ),
  { ssr: false }
);

interface JobForm {
  jobTitle: string;
  jobDescription: string;
  positions: string;
  location: string;
  duration: string;
  salaryType: string;
  salaryRate: string;
  category: string;
  subcategory: string;
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
}

function jobToForm(job: Job): JobForm {
  return {
    jobTitle: job.job_title,
    jobDescription: job.job_description,
    positions: job.positions != null ? String(job.positions) : "",
    location: job.location,
    duration: job.duration,
    salaryType: job.salary_type ?? "",
    salaryRate: job.salary_rate ?? "",
    category: job.category,
    subcategory: job.subcategory ?? "",
    companyName: job.company_name,
    companyPhone: job.company_phone ?? "",
    companyEmail: job.company_email ?? "",
    companyAddress: job.company_address ?? "",
  };
}

export function EditJobForm({ job }: { job: Job }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [officeLocation, setOfficeLocation] = useState<OfficeLocation | null>(
    job.office_lat != null && job.office_lng != null
      ? {
          lat: job.office_lat,
          lng: job.office_lng,
          address: job.office_address ?? "",
        }
      : null
  );

  const [form, setForm] = useState<JobForm>(jobToForm(job));

  const set = (field: keyof JobForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const salaryAmountRequired =
    form.salaryType === "Hourly" || form.salaryType === "Monthly";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.jobTitle.trim()) {
      toast.error("Job Title is required.");
      return;
    }
    if (!form.jobDescription.trim()) {
      toast.error("Job Description is required.");
      return;
    }
    if (!form.location) {
      toast.error("Location is required.");
      return;
    }
    if (!form.duration) {
      toast.error("Duration is required.");
      return;
    }
    if (!form.category) {
      toast.error("Category is required.");
      return;
    }
    if (!form.salaryType) {
      toast.error("Salary Type is required.");
      return;
    }
    if (salaryAmountRequired && !form.salaryRate.trim()) {
      toast.error("Salary / Rate amount is required for Hourly or Monthly type.");
      return;
    }
    if (!form.companyName.trim()) {
      toast.error("Company Name is required.");
      return;
    }

    // Check that at least one contact method is provided
    if (!form.companyPhone.trim() && !form.companyEmail.trim()) {
      toast.error("Please provide at least one contact method: Phone or Email.");
      return;
    }

    const positionsNum = form.positions.trim()
      ? parseInt(form.positions, 10)
      : null;
    if (positionsNum !== null && (isNaN(positionsNum) || positionsNum < 1)) {
      toast.error("Number of Positions must be at least 1.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: form.jobTitle.trim(),
          job_description: form.jobDescription.trim(),
          positions: positionsNum,
          location: form.location,
          duration: form.duration,
          salary_type: form.salaryType,
          salary_rate: salaryAmountRequired ? form.salaryRate.trim() : null,
          category: form.category,
          subcategory: form.subcategory.trim() || null,
          company_name: form.companyName.trim(),
          company_phone: form.companyPhone.trim() || null,
          company_email: form.companyEmail.trim() || null,
          company_address: form.companyAddress.trim() || null,
          office_lat:
            officeLocation && officeLocation.lat !== 0
              ? officeLocation.lat
              : null,
          office_lng:
            officeLocation && officeLocation.lng !== 0
              ? officeLocation.lng
              : null,
          office_address: officeLocation?.address ?? null,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to update job");
      }

      toast.success("Job updated. It will be reviewed before going live again.");
      router.push("/dashboard/jobs");
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/dashboard/jobs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Job</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Changes will be reviewed before going live again.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Job Details */}
        <Section title="Job Details">
          <Field label="Job Title *">
            <Input
              placeholder="e.g. Senior HSE Engineer"
              value={form.jobTitle}
              onChange={(e) => set("jobTitle", e.target.value)}
            />
          </Field>

          <Field label="Job Description *">
            <Textarea
              placeholder="Describe the role, responsibilities, requirements..."
              value={form.jobDescription}
              onChange={(e) => set("jobDescription", e.target.value)}
              className="min-h-32 resize-y"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category *">
              <Select
                value={form.category}
                onValueChange={(v: string | null) => {
                  if (v) set("category", v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Subcategory">
              <Input
                placeholder="e.g. NEBOSH, IOSH"
                value={form.subcategory}
                onChange={(e) => set("subcategory", e.target.value)}
              />
            </Field>

            <Field label="Location *">
              <Select
                value={form.location}
                onValueChange={(v: string | null) => {
                  if (v) set("location", v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                {/* <SelectContent>
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent> */}
              </Select>
            </Field>

            <Field label="Number of Positions (Optional)">
              <Input
                type="number"
                min="1"
                max="999"
                placeholder="e.g. 3"
                value={form.positions}
                onChange={(e) => set("positions", e.target.value)}
              />
            </Field>

            <Field label="Duration *">
              <Select
                value={form.duration}
                onValueChange={(v: string | null) => {
                  if (v) set("duration", v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Salary Type *">
              <Select
                value={form.salaryType}
                onValueChange={(v: string | null) => {
                  if (v) {
                    set("salaryType", v);
                    if (v === "After Interview") set("salaryRate", "");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {salaryAmountRequired && (
              <Field label={`Salary / Rate (${form.salaryType}) *`}>
                <Input
                  placeholder={
                    form.salaryType === "Hourly"
                      ? "e.g. $25 - $35/hr"
                      : "e.g. $6,000 - $9,000/mo"
                  }
                  value={form.salaryRate}
                  onChange={(e) => set("salaryRate", e.target.value)}
                />
              </Field>
            )}
          </div>
        </Section>

        {/* Company Details */}
        <Section title="Company Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name *" className="col-span-full">
              <Input
                placeholder="e.g. Aramco Projects Ltd."
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
              />
            </Field>

            <Field label="Company Phone" className="col-span-full sm:col-span-1">
              <Input
                type="tel"
                placeholder="+966 1x xxx xxxx"
                value={form.companyPhone}
                onChange={(e) => set("companyPhone", e.target.value)}
              />
            </Field>

            <Field label="Company Email" className="col-span-full sm:col-span-1">
              <Input
                type="email"
                placeholder="hr@company.com"
                value={form.companyEmail}
                onChange={(e) => set("companyEmail", e.target.value)}
              />
            </Field>

            <div className="col-span-full text-[10px] text-muted-foreground mt-1">
              At least one contact method (Phone or Email) is required.
            </div>

            <Field label="Company Address (Optional)" className="col-span-full">
              <Input
                placeholder="Street, City, Country"
                value={form.companyAddress}
                onChange={(e) => set("companyAddress", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        {/* Office Location */}
        <Section title="Office Location (Optional)">
          <OfficeLocationPicker
            value={officeLocation}
            onChange={setOfficeLocation}
            label="Paste Google Maps URL (Optional)"
          />
        </Section>

        <Button
          type="submit"
          className="h-11 w-full sm:w-auto cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Save Changes
        </Button>
      </form>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      {children}
    </div>
  );
}