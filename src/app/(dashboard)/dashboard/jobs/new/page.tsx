"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { JOB_CATEGORIES, DURATIONS, TEMPORARY_DURATIONS, SALARY_TYPES } from "@/lib/constants";
import { COUNTRIES } from "@/lib/countries";
import {
  CURRENCIES,
  currencyForCountry,
  currencyOptionLabel,
} from "@/lib/currencies";
import { useGeo } from "@/components/providers/GeoProvider";
import Link from "next/link";
import {
  parseJobText,
  hasSuggestions,
  inferEmploymentType,
  type SmartJobParseResult,
} from "@/lib/smartJobParser";
import {
  SmartJobFillPanel,
  type SmartFillFieldKey,
} from "@/components/jobs/SmartJobFill";
import { MultiSelectChips } from "@/components/shared/MultiSelectChips";
import {
  EXPIRATION_OPTIONS,
  type ExpirationOptionValue,
} from "@/lib/expiration";

interface JobForm {
  jobTitle: string;
  jobDescription: string;
  positions: string;
  country: string;
  city: string;
  employmentType: string;
  duration: string;
  salaryType: string;
  salaryRate: string;
  currency: string;
  category: string;
  categories: string[];
  subcategory: string;
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
  mapLocation: string;
  workLocation: string;
  showProfileContact: boolean;
  expiration: ExpirationOptionValue;
}

export default function PostJobPage() {
  const router = useRouter();
  const geo = useGeo();
  const [isLoading, setIsLoading] = useState(false);
  const [currencyTouched, setCurrencyTouched] = useState(false);
  /** Fields the user edited manually — parser must not overwrite these */
  const [touched, setTouched] = useState<Partial<Record<keyof JobForm, boolean>>>({});
  const [smartStatus, setSmartStatus] = useState<"idle" | "analyzing" | "found" | "empty">("idle");
  const [smartResult, setSmartResult] = useState<SmartJobParseResult | null>(null);
  const [smartDismissed, setSmartDismissed] = useState(false);
  const parseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const parseGen = useRef(0);

  const markTouched = (field: keyof JobForm) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const [form, setForm] = useState<JobForm>({
    jobTitle: "",
    jobDescription: "",
    positions: "",
    country: "SA",
    city: "",
    employmentType: "",
    duration: "",
    salaryType: "",
    salaryRate: "",
    currency: "SAR",
    category: "",
    categories: [],
    subcategory: "",
    companyName: "",
    companyPhone: "",
    companyEmail: "",
    companyAddress: "",
    mapLocation: "",
    workLocation: "",
    showProfileContact: false,
    expiration: "never",
  });

  // Auto country/city from geo (user can always override)
  useEffect(() => {
    if (geo.loading || geo.isManual) return;
    if (geo.countryCode && !touched.country) {
      setForm((prev) => ({ ...prev, country: geo.countryCode! }));
    }
    if (geo.city && !touched.city) {
      setForm((prev) => ({ ...prev, city: geo.city! }));
    }
  }, [geo.loading, geo.countryCode, geo.city, geo.isManual, touched.country, touched.city]);

  // Keep Employment Type in sync with Duration
  // Any fixed-term duration → temporary; Permanent → permanent
  useEffect(() => {
    if (!form.duration) return;
    if (form.duration === "Permanent") {
      if (form.employmentType !== "permanent") {
        setForm((prev) => ({ ...prev, employmentType: "permanent" }));
      }
      return;
    }
    // Any other duration (1 Month, 2 Months, … UnSpecified) → Temporary
    if (form.employmentType !== "temporary") {
      setForm((prev) => ({ ...prev, employmentType: "temporary" }));
    }
  }, [form.duration]);

  // Auto-set currency from geo until the user manually changes it
  useEffect(() => {
    if (currencyTouched) return;
    if (geo.loading) return;
    if (!geo.countryCode) return;
    set("currency", currencyForCountry(geo.countryCode));
  }, [geo.loading, geo.countryCode, currencyTouched]);

  const set = (field: keyof JobForm, value: string | boolean, fromUser = false) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fromUser) markTouched(field);
  };

  const runSmartParse = useCallback((title: string, description: string) => {
    parseGen.current += 1;
    const gen = parseGen.current;
    setSmartStatus("analyzing");
    setSmartDismissed(false);

    // Allow UI to paint "analyzing" briefly
    window.setTimeout(() => {
      if (gen !== parseGen.current) return;
      const result = parseJobText(title, description);
      if (gen !== parseGen.current) return;
      setSmartResult(result);
      setSmartStatus(hasSuggestions(result) ? "found" : "empty");
    }, 120);
  }, []);

  const scheduleSmartParse = useCallback(
    (title: string, description: string) => {
      if (parseTimer.current) clearTimeout(parseTimer.current);
      if (title.trim().length < 4 && description.trim().length < 20) {
        setSmartStatus("idle");
        setSmartResult(null);
        return;
      }
      parseTimer.current = setTimeout(() => {
        runSmartParse(title, description);
      }, 700);
    },
    [runSmartParse]
  );

  const applySmartField = useCallback(
    (key: SmartFillFieldKey, result: SmartJobParseResult) => {
      const field = result[key];
      if (!field) return;
      if (key === "country") {
        setForm((prev) => ({
          ...prev,
          country: field.value as string,
          currency: touched.currency
            ? prev.currency
            : (result.currency?.value ?? prev.currency),
        }));
        markTouched("country");
        return;
      }
      if (key === "currency") {
        set("currency", field.value as string, true);
        setCurrencyTouched(true);
        return;
      }
      if (key === "categories") {
        const cats = field.value as string[];
        setForm((prev) => ({
          ...prev,
          categories: cats,
          category: cats[0] ?? prev.category,
        }));
        markTouched("category");
        return;
      }
      if (key === "category") {
        const cat = field.value as string;
        setForm((prev) => {
          const cats = prev.categories.includes(cat)
            ? prev.categories
            : [...prev.categories, cat];
          return { ...prev, category: cat, categories: cats };
        });
        markTouched("category");
        return;
      }
      if (key === "duration") {
        const dur = String(field.value);
        setForm((prev) => ({
          ...prev,
          duration: dur,
          employmentType:
            dur === "Permanent"
              ? "permanent"
              : prev.employmentType || "temporary",
        }));
        markTouched("duration");
        return;
      }
      if (key === "employmentType") {
        const emp = String(field.value);
        setForm((prev) => ({
          ...prev,
          employmentType: emp,
          duration:
            emp === "permanent" ? "Permanent" : prev.duration === "Permanent" ? "" : prev.duration,
        }));
        markTouched("employmentType");
        return;
      }
      set(key as keyof JobForm, field.value as string, true);
    },
    [touched.currency]
  );

  const applyAllSmart = useCallback(() => {
    if (!smartResult) return;
    // Apply every extracted field in one update so labeled paste fills the whole form.
    // High-confidence fields always apply (structured paste). Others skip if user already typed.
    setForm((prev) => {
      const next = { ...prev };
      const shouldApply = (key: keyof JobForm, conf?: string) => {
        if (conf === "high") return true;
        return !touched[key];
      };

      if (smartResult.jobTitle && shouldApply("jobTitle", smartResult.jobTitle.confidence)) {
        next.jobTitle = String(smartResult.jobTitle.value);
      }
      if (smartResult.jobDescription && shouldApply("jobDescription", smartResult.jobDescription.confidence)) {
        next.jobDescription = String(smartResult.jobDescription.value);
      }
      if (smartResult.categories?.value?.length) {
        if (shouldApply("category", smartResult.categories.confidence)) {
          next.categories = smartResult.categories.value;
          next.category = smartResult.categories.value[0] ?? next.category;
        }
      } else if (smartResult.category && shouldApply("category", smartResult.category.confidence)) {
        const cat = String(smartResult.category.value);
        next.category = cat;
        if (!next.categories.includes(cat)) {
          next.categories = [...next.categories, cat];
        }
      }
      if (smartResult.country && shouldApply("country", smartResult.country.confidence)) {
        next.country = String(smartResult.country.value);
      }
      if (smartResult.city && shouldApply("city", smartResult.city.confidence)) {
        next.city = String(smartResult.city.value);
      }
      if (smartResult.workLocation && shouldApply("workLocation", smartResult.workLocation.confidence)) {
        next.workLocation = String(smartResult.workLocation.value);
      }
      if (smartResult.currency && shouldApply("currency", smartResult.currency.confidence)) {
        next.currency = String(smartResult.currency.value);
      }
      if (smartResult.salaryRate && shouldApply("salaryRate", smartResult.salaryRate.confidence)) {
        next.salaryRate = String(smartResult.salaryRate.value);
      }
      if (smartResult.salaryType && shouldApply("salaryType", smartResult.salaryType.confidence)) {
        next.salaryType = String(smartResult.salaryType.value);
      }
      if (smartResult.duration && shouldApply("duration", smartResult.duration.confidence)) {
        next.duration = String(smartResult.duration.value);
      }
      if (smartResult.employmentType && shouldApply("employmentType", smartResult.employmentType.confidence)) {
        next.employmentType = String(smartResult.employmentType.value);
      }
      // Duration drives employment type when duration was filled
      if (next.duration === "Permanent") {
        next.employmentType = "permanent";
      } else if (next.duration && next.duration !== "Permanent") {
        // Fixed-term durations → temporary
        if (!next.employmentType || next.employmentType === "permanent") {
          next.employmentType = "temporary";
        }
      }
      if (smartResult.positions && shouldApply("positions", smartResult.positions.confidence)) {
        next.positions = String(smartResult.positions.value);
      }
      if (smartResult.companyName && shouldApply("companyName", smartResult.companyName.confidence)) {
        next.companyName = String(smartResult.companyName.value);
      }
      if (smartResult.companyPhone && shouldApply("companyPhone", smartResult.companyPhone.confidence)) {
        next.companyPhone = String(smartResult.companyPhone.value);
      }
      if (smartResult.companyEmail && shouldApply("companyEmail", smartResult.companyEmail.confidence)) {
        next.companyEmail = String(smartResult.companyEmail.value);
      }
      if (smartResult.companyAddress && shouldApply("companyAddress", smartResult.companyAddress.confidence)) {
        next.companyAddress = String(smartResult.companyAddress.value);
      }
      if (smartResult.mapLocation && shouldApply("mapLocation", smartResult.mapLocation.confidence)) {
        next.mapLocation = String(smartResult.mapLocation.value);
      }
      return next;
    });
    if (smartResult.currency) {
      setCurrencyTouched(true);
    }
    setSmartDismissed(true);
    toast.success("Smart Fill applied — review fields before submitting");
  }, [smartResult, touched]);


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
    if (!form.duration) {
      toast.error("Duration is required.");
      return;
    }
    if (!form.employmentType || !["permanent", "temporary"].includes(form.employmentType)) {
      toast.error("Employment Type is required (Temporary or Permanent).");
      return;
    }
    const cats =
      form.categories.length > 0
        ? form.categories
        : form.category
          ? [form.category]
          : [];
    if (cats.length === 0) {
      toast.error("Select at least one job category.");
      return;
    }
    if (!form.salaryType) {
      toast.error("Salary Type is required.");
      return;
    }
    if (!form.currency) {
      toast.error("Currency is required.");
      return;
    }
    if (salaryAmountRequired && !form.salaryRate.trim()) {
      toast.error(
        "Salary / Rate amount is required for Hourly or Monthly type."
      );
      return;
    }
    if (!form.companyName.trim()) {
      toast.error("Company Name is required.");
      return;
    }

    if (!form.companyPhone.trim() && !form.companyEmail.trim()) {
      toast.error(
        "Please provide at least one contact method: Phone or Email."
      );
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
      const countryName =
        COUNTRIES.find((c) => c.code === form.country)?.name ?? form.country;

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: form.jobTitle.trim(),
          jobDescription: form.jobDescription.trim(),
          positions: positionsNum,
          location: form.city.trim()
            ? `${form.city.trim()}, ${countryName}`
            : countryName,
          country: form.country,
          city: form.city.trim() || null,
          employmentType: form.employmentType,
          duration: form.duration,
          salaryType: form.salaryType,
          // Always save rate when provided so cards can show the amount
          salaryRate: form.salaryRate.trim() || null,
          currency: form.currency,
          category: cats[0],
          categories: cats,
          subcategory: form.subcategory.trim() || null,
          companyName: form.companyName.trim(),
          companyPhone: form.companyPhone.trim() || null,
          companyEmail: form.companyEmail.trim() || null,
          companyAddress: form.companyAddress.trim() || null,
          workLocation: form.workLocation.trim() || null,
          mapLocation: form.mapLocation.trim() || null,
          // API expects officeLocationLink for the maps link field
          officeLocationLink: form.mapLocation.trim() || null,
          showProfileContact: form.showProfileContact,
          expiration: form.expiration,
        }),
      });

      if (res.status === 401) {
        toast.error("Your session expired. Please sign in again, then retry posting.");
        router.push("/sign-in?redirect_url=/dashboard/jobs/new");
        return;
      }
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to post job");
      }

      toast.success(
        "Job submitted for review! It will appear publicly once approved."
      );
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
          <h1 className="text-2xl font-bold">Post a Job</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Your post will be reviewed before going live.
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
              onChange={(e) => {
                const v = e.target.value;
                set("jobTitle", v, true);
                scheduleSmartParse(v, form.jobDescription);
              }}
            />
          </Field>

          <Field label="Job Description *">
            <Textarea
              placeholder="Describe the role, responsibilities, requirements..."
              value={form.jobDescription}
              onChange={(e) => {
                const v = e.target.value;
                set("jobDescription", v, true);
                scheduleSmartParse(form.jobTitle, v);
              }}
              className="min-h-32 resize-y"
            />
          </Field>

          <SmartJobFillPanel
            status={smartStatus}
            result={smartResult}
            dismissed={smartDismissed}
            onApplyAll={applyAllSmart}
            onApplyOne={(key) => {
              if (smartResult) applySmartField(key, smartResult);
            }}
            onDismiss={() => setSmartDismissed(true)}
            onRefresh={() => {
              setSmartDismissed(false);
              runSmartParse(form.jobTitle, form.jobDescription);
            }}
          />

          <div className="space-y-4">
            <Field label="Job Categories *">
              <MultiSelectChips
                options={JOB_CATEGORIES}
                value={form.categories}
                onChange={(next) => {
                  setForm((prev) => ({
                    ...prev,
                    categories: next,
                    category: next[0] ?? "",
                  }));
                  markTouched("categories" as keyof JobForm);
                  markTouched("category");
                }}
                placeholder="Select one or more categories"
                searchPlaceholder="Search categories…"
                label="Job categories"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Jobs appear in search for every selected category.
              </p>
            </Field>

            <Field label="Subcategory">
              <Input
                placeholder="e.g. NEBOSH, IOSH"
                value={form.subcategory}
                onChange={(e) => set("subcategory", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Field label="Country *">
              <Select
                value={form.country}
                onValueChange={(v: string | null) => {
                  if (v) {
                    set("country", v, true);
                    // Keep currency in sync with country until user overrides currency
                    if (!currencyTouched) {
                      set("currency", currencyForCountry(v));
                    }
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
              <Input
                placeholder="e.g. Dubai"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </Field>


            <Field label="Work Location (Optional)" className="sm:col-span-2">
              <Input
                placeholder="e.g. Project site, plant name, or area"
                value={form.workLocation}
                onChange={(e) => set("workLocation", e.target.value, true)}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Work site name or area (shown in Quick Details on the job page). Separate from company location.
              </p>
            </Field>

            <Field label="Employment Type *">
              <Select
                value={form.employmentType || undefined}
                onValueChange={(v: string | null) => {
                  if (!v) return;
                  set("employmentType", v, true);
                  // Auto-select Duration when Employment Type is Permanent
                  if (v === "permanent") {
                    set("duration", "Permanent", false);
                  } else if (form.duration === "Permanent") {
                    // Clear Permanent duration when switching to Temporary so user picks a term
                    set("duration", "", false);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Temporary or Permanent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">
                Temporary = fixed term. Permanent = ongoing role (Duration auto-fills).
              </p>
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
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to show &quot;Not Specified&quot; on the job listing.
              </p>
            </Field>

            <Field label="Duration *">
              <Select
                value={form.duration || undefined}
                onValueChange={(v: string | null) => {
                  if (!v) return;
                  // Single state update: duration + employment type together
                  // Any duration except "Permanent" → Employment Type = Temporary
                  // "Permanent" duration → Employment Type = Permanent
                  const nextEmp =
                    v === "Permanent" ? "permanent" : "temporary";
                  setForm((prev) => ({
                    ...prev,
                    duration: v,
                    employmentType: nextEmp,
                  }));
                  markTouched("duration");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {/* Permanent employment → locked to Permanent only.
                      Temporary / empty → full duration list (all options). */}
                  {(form.employmentType === "permanent"
                    ? (["Permanent"] as const)
                    : (DURATIONS as readonly string[])
                  ).map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">
                {form.employmentType === "permanent"
                  ? "Locked to Permanent while Employment Type is Permanent."
                  : "Selecting any duration sets Employment Type to Temporary (Permanent duration → Permanent)."}
              </p>
            </Field>

            <Field label="Close Listing Automatically">
              <Select
                value={form.expiration}
                onValueChange={(v: string | null) => {
                  if (v)
                    set(
                      "expiration",
                      v as ExpirationOptionValue,
                      true
                    );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Never / Keep Open" />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Optional. Leave as Never to keep the post open until you close it.
              </p>
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

            <Field label="Currency *">
              <Select
                value={form.currency}
                onValueChange={(v: string | null) => {
                  if (!v) return;
                  setCurrencyTouched(true);
                  set("currency", v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {currencyOptionLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label={
                salaryAmountRequired
                  ? `Salary / Rate (${form.salaryType}) *`
                  : "Salary / Rate (Optional)"
              }
            >
              <Input
                placeholder={
                  form.salaryType === "Hourly"
                    ? "e.g. 25 - 35"
                    : form.salaryType === "Monthly"
                      ? "e.g. 6000 - 9000"
                      : "Optional amount if known"
                }
                value={form.salaryRate}
                onChange={(e) => set("salaryRate", e.target.value)}
              />
            </Field>
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

            <Field
              label="Company Phone"
              className="col-span-full sm:col-span-1"
            >
              <Input
                type="tel"
                placeholder="+966 1x xxx xxxx"
                value={form.companyPhone}
                onChange={(e) => set("companyPhone", e.target.value)}
              />
            </Field>

            <Field
              label="Company Email"
              className="col-span-full sm:col-span-1"
            >
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

            <Field label="Company Location Link (Optional)" className="col-span-full">
              <Input
                placeholder="https://maps.google.com/... or Google Maps share link"
                value={form.mapLocation}
                onChange={(e) => set("mapLocation", e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Company office map link (shown under Company Contact on the job page). Different from Work Location.
              </p>
            </Field>
          </div>
        </Section>

        {/* Bottom of form: profile contact visibility */}
        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
          <input
            id="showProfileContact"
            type="checkbox"
            checked={form.showProfileContact}
            onChange={(e) => set("showProfileContact", e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-input"
          />
          <label
            htmlFor="showProfileContact"
            className="text-sm leading-snug cursor-pointer"
          >
            <span className="font-medium text-foreground">
              Show my profile phone &amp; email on this job
            </span>
            <span className="block text-xs text-muted-foreground mt-0.5">
              Uses the same contact details from your signup profile. If
              unchecked, only your name appears under “Posted by”.
            </span>
          </label>
        </div>

        <Button
          type="submit"
          className="h-11 w-full sm:w-auto cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Submit for Review
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