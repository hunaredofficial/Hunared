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
import { COUNTRIES } from "@/lib/countries";
import { getCitiesForCountry } from "@/lib/cities";
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
  country: string;
  city: string;
  duration: string;
  salaryType: string;
  salaryRate: string;
  category: string;
  subcategory: string;
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  showProfileContact: boolean;
  companyAddress: string;
  workLocation: string;
  officeLocationLink: string;
}

function jobToForm(job: Job): JobForm {
  const j = job as Job & { country?: string | null; city?: string | null };
  let country = j.country ?? "";
  let city = j.city ?? "";
  // Fallback: parse "City, Country Name" from location display string
  if (!country && job.location) {
    const parts = job.location.split(",").map((s) => s.trim());
    if (parts.length >= 2) {
      city = city || parts[0];
      const countryName = parts.slice(1).join(", ");
      const match = COUNTRIES.find(
        (c) => c.name.toLowerCase() === countryName.toLowerCase()
      );
      if (match) country = match.code;
    } else {
      const match = COUNTRIES.find(
        (c) => c.name.toLowerCase() === job.location.toLowerCase()
      );
      if (match) country = match.code;
    }
  }
  return {
    jobTitle: job.job_title,
    jobDescription: job.job_description,
    positions: job.positions != null ? String(job.positions) : "",
    country,
    city: city || "",
    duration: job.duration,
    salaryType: job.salary_type ?? "",
    salaryRate: job.salary_rate ?? "",
    category: job.category,
    subcategory: job.subcategory ?? "",
    companyName: job.company_name,
    companyPhone: job.company_phone ?? "",
    companyEmail: job.company_email ?? "",
    showProfileContact: Boolean(
      (job as { show_profile_contact?: boolean }).show_profile_contact
    ),
    companyAddress: job.company_address ?? "",
    workLocation:
      (job as { work_location?: string | null }).work_location ??
      job.office_address ??
      "",
    officeLocationLink:
      (job as { office_location_link?: string | null }).office_location_link ?? "",
  };
}

export function EditJobForm({ job }: { job: Job }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<JobForm>(() => jobToForm(job));
  const [officeLocation, setOfficeLocation] = useState<OfficeLocation | null>(
    job.office_lat != null && job.office_lng != null
      ? {
          lat: job.office_lat,
          lng: job.office_lng,
          address: job.office_address ?? "",
        }
      : null
  );

  function set<K extends keyof JobForm>(key: K, value: JobForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

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
    if (!form.country) {
      toast.error("Country is required.");
      return;
    }
    if (!form.city.trim()) {
      toast.error("City is required.");
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
    if (!form.companyPhone.trim() && !form.companyEmail.trim()) {
      toast.error("Please provide at least one contact method: Phone or Email.");
      return;
    }

    const positionsNum = form.positions.trim()
      ? parseInt(form.positions, 10)
      : null;
    if (positionsNum !== null && (isNaN(positionsNum) || positionsNum < 1)) {
      toast.error("Number of Positions must be at least 1 if provided.");
      return;
    }

    const countryName =
      COUNTRIES.find((c) => c.code === form.country)?.name ?? form.country;
    const location = form.city.trim()
      ? `${form.city.trim()}, ${countryName}`
      : countryName;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: form.jobTitle.trim(),
          job_description: form.jobDescription.trim(),
          positions: positionsNum,
          location,
          country: form.country,
          city: form.city.trim(),
          duration: form.duration,
          salary_type: form.salaryType,
          salary_rate: salaryAmountRequired ? form.salaryRate.trim() : null,
          category: form.category,
          subcategory: form.subcategory.trim() || null,
          company_name: form.companyName.trim(),
          company_phone: form.companyPhone.trim() || null,
          company_email: form.companyEmail.trim() || null,
          show_profile_contact: form.showProfileContact,
          company_address: form.companyAddress.trim() || null,
          office_lat:
            officeLocation && officeLocation.lat !== 0
              ? officeLocation.lat
              : null,
          office_lng:
            officeLocation && officeLocation.lng !== 0
              ? officeLocation.lng
              : null,
          office_address: form.workLocation.trim() || officeLocation?.address?.trim() || null,
          work_location: form.workLocation.trim() || officeLocation?.address?.trim() || null,
          office_location_link: form.officeLocationLink.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update job");
      toast.success("Job updated successfully.");
      router.push("/dashboard/jobs");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/jobs">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Edit Job</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="Job Details">
          <Field label="Job Title *">
            <Input
              value={form.jobTitle}
              onChange={(e) => set("jobTitle", e.target.value)}
            />
          </Field>
          <Field label="Job Description *">
            <Textarea
              rows={6}
              value={form.jobDescription}
              onChange={(e) => set("jobDescription", e.target.value)}
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

            <Field label="Country *">
              <Select
                value={form.country}
                onValueChange={(v: string | null) => {
                  if (v) {
                    set("country", v);
                    set("city", "");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="City *">
              <Select
                value={form.city || undefined}
                onValueChange={(v: string | null) => {
                  if (v) set("city", v);
                }}
                disabled={!form.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder={form.country ? "Select city" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {(form.city && !getCitiesForCountry(form.country).includes(form.city)
                    ? [form.city, ...getCitiesForCountry(form.country)]
                    : getCitiesForCountry(form.country)
                  ).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Number of Positions (Optional)">
              <Input
                type="number"
                min="1"
                max="999"
                placeholder="Leave empty for Not Specified"
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
                  if (v) set("salaryType", v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select salary type" />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_TYPES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {salaryAmountRequired && (
              <Field label="Salary / Rate *">
                <Input
                  value={form.salaryRate}
                  onChange={(e) => set("salaryRate", e.target.value)}
                />
              </Field>
            )}
          </div>

          </Section>

        <Section title="Company Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name *" className="col-span-full">
              <Input
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
              />
            </Field>
            <Field label="Company Phone">
              <Input
                type="tel"
                value={form.companyPhone}
                onChange={(e) => set("companyPhone", e.target.value)}
              />
            </Field>
            <Field label="Company Email">
              <Input
                type="email"
                value={form.companyEmail}
                onChange={(e) => set("companyEmail", e.target.value)}
              />
            </Field>
            <Field label="Company Address (Optional)" className="col-span-full">
              <Input
                value={form.companyAddress}
                onChange={(e) => set("companyAddress", e.target.value)}
              />
            </Field>
            <Field label="Office Location Link (Optional)" className="col-span-full">
              <Input
                placeholder="https://maps.google.com/... or Google Maps share link"
                value={form.officeLocationLink}
                onChange={(e) => set("officeLocationLink", e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Company office map link — different from Work Location.
              </p>
            </Field>
          </div>
        </Section>

        <Section title="Work Location (Optional)">
          <p className="text-xs text-muted-foreground -mt-1">
            Job site / workplace map — separate from City and from Office Location in company details.
          </p>
          <Field label="Work Location">
            <Input
              placeholder="e.g. Building, area, or Google Maps link"
              value={form.workLocation}
              onChange={(e) => set("workLocation", e.target.value)}
            />
          </Field>
          <OfficeLocationPicker
            value={officeLocation}
            onChange={(v) => {
              setOfficeLocation(v);
              if (v?.address) set("workLocation", v.address);
            }}
            label="Or paste Google Maps URL for work site"
          />
        </Section>

        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              id="showProfileContact"
              type="checkbox"
              checked={form.showProfileContact}
              onChange={(e) => set("showProfileContact", e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="text-sm font-medium block">
                Show my profile phone &amp; email on this job
              </span>
              <span className="text-xs text-muted-foreground">
                Uses contact details from your signup profile. If unchecked, only
                your name appears under “Posted by”.
              </span>
            </span>
          </label>
        </div>

        <Button
          type="submit"
          className="h-11 w-full sm:w-auto cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
