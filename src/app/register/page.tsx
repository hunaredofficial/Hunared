"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HunaredLogo } from "@/components/brand/HunaredLogo";
import { useSignUp } from "@clerk/nextjs";
import {
  Briefcase,
  User,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Upload,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { COUNTRIES } from "@/lib/countries";
import { JOB_CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";
import Image from "next/image";

type GoalType = "seeker" | "employer" | "personal" | null;
type Step = "goal" | "account" | "profile" | "verify";

interface FormData {
  email: string;
  password: string;
  fullName: string;
  username: string;
  phone: string;
  gender: string;
  location: string;
  country: string;
  city: string;
  profession: string;
  jobInterests: string[];
  avatarFile: File | null;
  avatarPreview: string;
  cvFile: File | null;
  companyCr: string;
  companyWebsite: string;
  companyAddress: string;
  code: string;
}

export const PROFESSIONS = [
  "Accountant",
  "Accounting Officer",
  "Actuary",
  "Admin Assistant",
  "Administrator",
  "Advertising Specialist",
  "Agricultural Engineer",
  "Agricultural Technician",
  "Air Conditioning Technician",
  "Aircraft Engineer",
  "Aircraft Technician",
  "Airport Ground Staff",
  "Architect",
  "Architectural Engineer",
  "Architectural Technician",
  "Automation Engineer",
  "Automation Technician",
  "Bank Officer",
  "Bank Teller",
  "Biomedical Engineer",
  "Biomedical Technician",
  "Boiler Technician",
  "Bookkeeper",
  "Business Analyst",
  "Business Developer",
  "Business Development Manager",
  "Carpenter",
  "Cashier",
  "CCTV Technician",
  "Chemical Engineer",
  "Chemical Technician",
  "Chiller Technician",
  "Chief Accountant",
  "Chief Engineer",
  "Chief Executive Officer",
  "Chief Financial Officer",
  "Chef",
  "Claims Officer",
  "Clerk",
  "Commissioning Engineer",
  "Commissioning Technician",
  "Communications Officer",
  "Computer Technician",
  "Construction Manager",
  "Construction Supervisor",
  "Consultant",
  "Control Engineer",
  "Control Room Operator",
  "Control Technician",
  "Coordinator",
  "Cost Controller",
  "Crane Operator",
  "Crane Technician",
  "Customer Service",
  "Customer Service Representative",
  "Data Analyst",
  "Data Entry Operator",
  "Database Administrator",
  "Delivery Driver",
  "Design Engineer",
  "Designer",
  "Digital Marketing Specialist",
  "Document Controller",
  "Draftsman",
  "Driver",
  "E&I Engineer",
  "E&I Foreman",
  "E&I Inspector",
  "E&I Supervisor",
  "E&I Technician",
  "Electrical Engineer",
  "Electrical Foreman",
  "Electrical Inspector",
  "Electrical QC Inspector",
  "Electrical Supervisor",
  "Electrical Technician",
  "Electrician",
  "Electronics Engineer",
  "Electronics Technician",
  "Equipment Engineer",
  "Equipment Operator",
  "Equipment Supervisor",
  "Equipment Technician",
  "Estimator",
  "Executive Assistant",
  "Fabricator",
  "Facilities Manager",
  "Facilities Technician",
  "Field Engineer",
  "Field Operator",
  "Field Technician",
  "Finance Manager",
  "Finance Officer",
  "Financial Analyst",
  "Fire Alarm Technician",
  "Fire Fighter",
  "Fire Fighting Technician",
  "Fire Inspector",
  "Fire Watch",
  "Fire Watchman",
  "Fitter",
  "Fleet Manager",
  "Forklift Operator",
  "Foreman",
  "Freelancer",
  "GIS Technician",
  "Graphic Designer",
  "Groundskeeper",
  "Health & Safety Engineer",
  "Heavy Equipment Operator",
  "Heavy Equipment Technician",
  "Helper",
  "Housekeeping Staff",
  "HR Manager",
  "HR Officer",
  "HR Specialist",
  "HSE Engineer",
  "HSE Manager",
  "HSE Officer",
  "HVAC Engineer",
  "HVAC Foreman",
  "HVAC Supervisor",
  "HVAC Technician",
  "Industrial Electrician",
  "Industrial Engineer",
  "Industrial Technician",
  "Information Security Analyst",
  "Instrumentation Engineer",
  "Instrumentation Foreman",
  "Instrumentation Supervisor",
  "Instrumentation Technician",
  "Inspector",
  "Interior Designer",
  "Inventory Controller",
  "IT Administrator",
  "IT Engineer",
  "IT Manager",
  "IT Specialist",
  "IT Support Technician",
  "Laboratory Technician",
  "Lab Technician",
  "Land Surveyor",
  "Legal Advisor",
  "Legal Officer",
  "Lifting Engineer",
  "Lifting Supervisor",
  "Lineman",
  "Logistics Coordinator",
  "Logistics Manager",
  "Logistics Officer",
  "Machine Operator",
  "Maintenance Engineer",
  "Maintenance Manager",
  "Maintenance Supervisor",
  "Maintenance Technician",
  "Mason",
  "Material Controller",
  "Material Coordinator",
  "Material Inspector",
  "Mechanical Engineer",
  "Mechanical Fitter",
  "Mechanical Foreman",
  "Mechanical Inspector",
  "Mechanical QC Inspector",
  "Mechanical Supervisor",
  "Mechanical Technician",
  "Medical Assistant",
  "Medical Laboratory Technician",
  "Medical Officer",
  "Millwright Technician",
  "Mobile Crane Operator",
  "Multi Welder",
  "Network Administrator",
  "Network Engineer",
  "Network Technician",
  "NDT Inspector",
  "Nurse",
  "Office Assistant",
  "Office Manager",
  "Officer",
  "Operations Manager",
  "Operations Supervisor",
  "Operator",
  "Other",
  "Painter",
  "Painting Foreman",
  "Painting Inspector",
  "Painting Supervisor",
  "Panel Technician",
  "Payroll Officer",
  "Permit Receiver",
  "Petroleum Engineer",
  "Pharmacist",
  "Pipe Fabricator",
  "Pipe Fitter",
  "Piping Engineer",
  "Piping Foreman",
  "Piping Inspector",
  "Piping QC Inspector",
  "Piping Supervisor",
  "Piping Technician",
  "Planned Maintenance Engineer",
  "Planner",
  "Planner / Scheduler",
  "Planning Coordinator",
  "Planning Engineer",
  "Planning Manager",
  "Plant Operator",
  "Plumber",
  "Procurement Officer",
  "Procurement Specialist",
  "Production Engineer",
  "Production Manager",
  "Production Operator",
  "Project Coordinator",
  "Project Engineer",
  "Project Manager",
  "Project Planner",
  "Property Manager",
  "Public Relations Officer",
  "QA/QC Coordinator",
  "QA/QC Engineer",
  "QA/QC Inspector",
  "QA/QC Manager",
  "QA/QC Supervisor",
  "Quality Engineer",
  "Quality Inspector",
  "Quality Manager",
  "Quantity Surveyor",
  "Receptionist",
  "Recruiter",
  "Recruitment Officer",
  "Rigger",
  "Rigger I",
  "Rigger II",
  "Rigger III",
  "Rigging Foreman",
  "Rigging Supervisor",
  "Rotating Equipment Engineer",
  "Rotating Equipment Technician",
  "Safety Engineer",
  "Safety Inspector",
  "Safety Officer",
  "Safety Supervisor",
  "Sales Engineer",
  "Sales Executive",
  "Sales Manager",
  "Sales Representative",
  "Sand Blaster",
  "Scaffolder",
  "Scaffolding Foreman",
  "Scaffolding Supervisor",
  "Security Guard",
  "Service Engineer",
  "Service Technician",
  "Site Engineer",
  "Site Manager",
  "Site Supervisor",
  "Software Developer",
  "Software Engineer",
  "Solar Technician",
  "Stand By Man",
  "Static Equipment Engineer",
  "Static Equipment Technician",
  "Steel Fixer",
  "Steel Structure Fitter",
  "Steel Structure Foreman",
  "Storekeeper",
  "Store Manager",
  "Store Supervisor",
  "Structural Engineer",
  "Structural Fitter",
  "Structural Inspector",
  "Structural Supervisor",
  "Structural Welder",
  "Surveyor",
  "System Administrator",
  "Teacher",
  "Technical Clerk",
  "Technical Coordinator",
  "Technical Engineer",
  "Technical Manager",
  "Technician",
  "Telecom Engineer",
  "Telecom Technician",
  "Telecommunications Engineer",
  "Timekeeper",
  "Tool & Die Maker",
  "Transformer Technician",
  "Transport Coordinator",
  "Transport Manager",
  "Truck Driver",
  "Utility Operator",
  "Warehouse Assistant",
  "Warehouse Coordinator",
  "Warehouse Manager",
  "Warehouse Supervisor",
  "Warehouse Worker",
  "Welder",
  "Welding Engineer",
  "Welding Foreman",
  "Welding Inspector",
  "Welding QC Inspector",
  "Welding Supervisor",
  "Wind Turbine Technician",
  "WordPress Developer",
  "Yard Supervisor",
];

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useSignUp();

  const [goal, setGoal] = useState<GoalType>(null);
  const [step, setStep] = useState<Step>("goal");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState<FormData>({
    email: "",
    password: "",
    fullName: "",
    username: "",
    phone: "",
    gender: "",
    location: "",
    country: "",
    city: "",
    profession: "",
    jobInterests: [],
    avatarFile: null,
    avatarPreview: "",
    cvFile: null,
    companyCr: "",
    companyWebsite: "",
    companyAddress: "",
    code: "",
  });

  const set = (field: keyof FormData, value: string | File | null | string[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleJobInterest = (category: string) => {
    setForm((prev) => {
      const exists = prev.jobInterests.includes(category);
      return {
        ...prev,
        jobInterests: exists
          ? prev.jobInterests.filter((c) => c !== category)
          : [...prev.jobInterests, category],
      };
    });
  };

  async function handleCreateAccount() {
    if (!goal) return;
    setIsLoading(true);
    try {
      const { error: createErr } = await signUp.create({
        emailAddress: form.email,
        password: form.password,
        unsafeMetadata: { role: goal },
      });
      if (createErr) {
        toast.error(
          createErr.longMessage ?? createErr.message ?? "Account creation failed."
        );
        return;
      }
      const { error: emailErr } = await signUp.verifications.sendEmailCode();
      if (emailErr) {
        toast.error(
          emailErr.longMessage ??
            emailErr.message ??
            "Could not send verification code."
        );
        return;
      }
      setStep("verify");
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "Account creation failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify() {
    setIsLoading(true);
    try {
      const { error: verifyErr } = await signUp.verifications.verifyEmailCode({
        code: form.code,
      });
      if (verifyErr) {
        toast.error(
          verifyErr.longMessage ?? verifyErr.message ?? "Verification failed."
        );
        return;
      }
      if (signUp.status === "complete") {
        const { error: finalizeErr } = await signUp.finalize();
        if (finalizeErr) {
          toast.error(
            finalizeErr.longMessage ??
              finalizeErr.message ??
              "Sign-up could not be finalized."
          );
          return;
        }
        setStep("profile");
      }
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "Verification failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveProfile() {
    setIsLoading(true);
    try {
      let avatarUrl: string | null = null;
      let avatarPublicId: string | null = null;
      let cvStoragePath: string | null = null;

      if (form.avatarFile) {
        const { url, publicId } = await uploadToCloudinary(
          form.avatarFile,
          "hunared/avatars"
        );
        avatarUrl = url;
        avatarPublicId = publicId;
      }

      if (form.cvFile && goal === "seeker") {
        const { url } = await uploadToCloudinary(form.cvFile, "hunared/cvs", {
          preset: process.env.NEXT_PUBLIC_CLOUDINARY_DOCS_PRESET,
          resourceType: "auto",
        });
        cvStoragePath = url;
      }

      // Map personal → personal (or change to "seeker" if your DB only supports seeker/employer)
      const roleToSave = goal === "personal" ? "personal" : goal;

      const res = await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roleToSave,
          fullName: form.fullName,
          username: form.username,
          phone: form.phone,
          gender: form.gender,
          location: [
            form.city.trim(),
            COUNTRIES.find((c) => c.code === form.country)?.name ?? "",
          ]
            .filter(Boolean)
            .join(", "),
          country: form.country || null,
          city: form.city.trim() || null,
          profession: goal === "seeker" ? form.profession : null,
          jobInterests: goal === "seeker" ? form.jobInterests : null,
          avatarUrl,
          avatarPublicId,
          cvUrl: cvStoragePath,
          companyCr: goal === "employer" ? form.companyCr : null,
          companyWebsite: goal === "employer" ? form.companyWebsite : null,
          companyAddress: goal === "employer" ? form.companyAddress : null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? "Profile save failed");
      }

      toast.success("Profile created! Welcome to Hunared.");
      if (goal === "seeker") router.push("/candidates");
      else if (goal === "employer") router.push("/jobs");
      else router.push("/dashboard");
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      {/* Background blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 -right-20 h-[500px] w-[500px] rounded-full bg-[var(--brand-from)] opacity-[0.07] blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-[400px] w-[400px] rounded-full bg-[var(--brand-via)] opacity-[0.06] blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        {/* Logo – centered */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <HunaredLogo size="lg" href="/" />
        </div>

        {/* ── STEP: Goal ── */}
        {step === "goal" && (
          <div className="space-y-6 text-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                What&apos;s your goal?
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Choose how you want to use Hunared
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <GoalCard
                icon={<User className="h-7 w-7" />}
                title="Personal"
                description="Browse jobs, marketplace & learning"
                selected={goal === "personal"}
                onClick={() => setGoal("personal")}
              />
              <GoalCard
                icon={<User className="h-7 w-7" />}
                title="Job Seeker"
                description="Find your next opportunity abroad"
                selected={goal === "seeker"}
                onClick={() => setGoal("seeker")}
              />
              <GoalCard
                icon={<Briefcase className="h-7 w-7" />}
                title="Employer"
                description="Post jobs & find top talent"
                selected={goal === "employer"}
                onClick={() => setGoal("employer")}
              />
            </div>
            <Button
              size="lg"
              className="w-full h-11"
              disabled={!goal}
              onClick={() => setStep("account")}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* ── STEP: Account ── */}
        {step === "account" && (
          <FormCard
            title="Create your account"
            subtitle={`Registering as a ${
              goal === "seeker"
                ? "Job Seeker"
                : goal === "employer"
                ? "Employer"
                : "Personal user"
            }`}
            onBack={() => setStep("goal")}
          >
            <div className="space-y-4">
              <Field label="Email address">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                />
              </Field>
              <Field label="Password">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>
              <div id="clerk-captcha" />
              <Button
                className="w-full h-11"
                disabled={!form.email || !form.password || isLoading}
                onClick={handleCreateAccount}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Create Account
              </Button>

              {/* Google note */}
              <p className="text-sm text-muted-foreground text-center">
                Prefer Google?{" "}
                <Link
                  href="/sign-in"
                  className="text-primary hover:underline"
                >
                  Sign in with Google
                </Link>
                , then set your role in Dashboard → Profile.
              </p>
            </div>
          </FormCard>
        )}

        {/* ── STEP: Verify ── */}
        {step === "verify" && (
          <FormCard
            title="Check your email"
            subtitle={`We sent a 6-digit code to ${form.email}`}
            onBack={() => setStep("account")}
          >
            <div className="space-y-4">
              <Field label="Verification code">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  className="text-center text-xl tracking-[0.4em] font-mono h-14"
                  value={form.code}
                  onChange={(e) =>
                    set("code", e.target.value.replace(/\D/g, ""))
                  }
                />
              </Field>
              <Button
                className="w-full h-11"
                disabled={form.code.length !== 6 || isLoading}
                onClick={handleVerify}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Verify & Continue
              </Button>
            </div>
          </FormCard>
        )}

        {/* ── STEP: Profile – SEEKER ── */}
        {step === "profile" && goal === "seeker" && (
          <FormCard
            title="Complete your profile"
            subtitle="This information will appear on your public candidate card"
          >
            <div className="space-y-4">
              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-20 w-20">
                  {form.avatarPreview ? (
                    <img
                      src={form.avatarPreview}
                      alt="Avatar preview"
                      className="h-20 w-20 rounded-full object-cover border-2 border-primary/30"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {form.avatarPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        set("avatarFile", null);
                        set("avatarPreview", "");
                      }}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"
                      aria-label="Remove photo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      set("avatarFile", f);
                      set("avatarPreview", URL.createObjectURL(f));
                    }}
                  />
                  <span className="text-xs text-primary hover:underline flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5" /> Upload Photo
                  </span>
                </label>
              </div>

              <Field label="Email address">
                <Input
                  value={signUp?.emailAddress ?? form.email}
                  readOnly
                  className="bg-muted/50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your verified login email
                </p>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name" className="col-span-2">
                  <Input
                    placeholder="Ahmed Al-Rashidi"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    required
                  />
                </Field>
                <Field label="Username">
                  <Input
                    placeholder="ahmed_hse"
                    value={form.username}
                    onChange={(e) => set("username", e.target.value)}
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    placeholder="+966 5x xxx xxxx"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </Field>
                <Field label="Gender">
                  <Select
                    onValueChange={(v: string | null) => {
                      if (v) set("gender", v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="prefer_not_to_say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Country">
                  <Select
                    onValueChange={(v: string | null) => {
                      if (v) set("country", v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Country" />
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
                <Field label="City">
                  <Input
                    placeholder="e.g. Dubai"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </Field>
                <Field label="Profession" className="col-span-2">
                  <Select
                    onValueChange={(v: string | null) => {
                      if (v) set("profession", v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Your profession" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFESSIONS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {/* Job Interests */}
              <Field label="Job Interests (select all that apply)">
                <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-3 grid grid-cols-2 gap-2 text-sm">
                  {JOB_CATEGORIES.map((cat) => {
                    const selected = form.jobInterests.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleJobInterest(cat)}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors",
                          selected
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted text-muted-foreground"
                        )}
                      >
                        <div
                          className={cn(
                            "h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40"
                          )}
                        >
                          {selected && <Check className="h-3 w-3" />}
                        </div>
                        <span className="truncate">{cat}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  We’ll match you with jobs in these categories
                </p>
              </Field>

              {/* CV Upload */}
              <Field label="CV / Resume (PDF only)">
                <label
                  className={cn(
                    "flex items-center gap-3 h-11 px-3 rounded-lg border border-dashed cursor-pointer transition-colors",
                    "border-border hover:border-primary/50 hover:bg-primary/5",
                    form.cvFile && "border-primary/40 bg-primary/5"
                  )}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) set("cvFile", f);
                    }}
                  />
                  <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">
                    {form.cvFile
                      ? form.cvFile.name
                      : "Click to upload your CV (PDF, max 10MB)"}
                  </span>
                  {form.cvFile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        set("cvFile", null);
                      }}
                      className="ml-auto shrink-0"
                      aria-label="Remove CV"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  )}
                </label>
              </Field>

              <Button
                className="w-full h-11 mt-2"
                disabled={!form.fullName || isLoading}
                onClick={handleSaveProfile}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Complete Registration
              </Button>
            </div>
          </FormCard>
        )}

        {/* ── STEP: Profile – EMPLOYER ── */}
        {step === "profile" && goal === "employer" && (
          <FormCard
            title="Company details"
            subtitle="Tell us about the company you're hiring for"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name" className="col-span-2">
                  <Input
                    placeholder="John Smith"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    required
                  />
                </Field>
                <Field label="Username">
                  <Input
                    placeholder="johnsmith"
                    value={form.username}
                    onChange={(e) => set("username", e.target.value)}
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    placeholder="+966 1x xxx xxxx"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </Field>
                <Field label="Gender">
                  <Select
                    onValueChange={(v: string | null) => {
                      if (v) set("gender", v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="prefer_not_to_say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Country">
                  <Select
                    onValueChange={(v: string | null) => {
                      if (v) set("country", v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Country" />
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
                <Field label="City">
                  <Input
                    placeholder="e.g. Dubai"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </Field>
                <Field label="Company CR Number" className="col-span-2">
                  <Input
                    placeholder="e.g. 1010123456"
                    value={form.companyCr}
                    onChange={(e) => set("companyCr", e.target.value)}
                  />
                </Field>
                <Field label="Company Website" className="col-span-2">
                  <Input
                    placeholder="https://company.com"
                    type="url"
                    value={form.companyWebsite}
                    onChange={(e) => set("companyWebsite", e.target.value)}
                  />
                </Field>
                <Field label="Company Address" className="col-span-2">
                  <Input
                    placeholder="Street, City, Country"
                    value={form.companyAddress}
                    onChange={(e) => set("companyAddress", e.target.value)}
                  />
                </Field>
              </div>
              <Button
                className="w-full h-11 mt-2"
                disabled={!form.fullName || isLoading}
                onClick={handleSaveProfile}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Complete Registration
              </Button>
            </div>
          </FormCard>
        )}

        {/* ── STEP: Profile – PERSONAL ── */}
        {step === "profile" && goal === "personal" && (
          <FormCard
            title="Your profile"
            subtitle="A few details to get started on Hunared"
          >
            <div className="space-y-4">
              <Field label="Full Name">
                <Input
                  placeholder="Your full name"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  required
                />
              </Field>
              <Field label="Username">
                <Input
                  placeholder="username"
                  value={form.username}
                  onChange={(e) => set("username", e.target.value)}
                />
              </Field>
              <Field label="Phone">
                <Input
                  placeholder="+966 ..."
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </Field>
              <Field label="Country">
                <Select
                  onValueChange={(v: string | null) => {
                    if (v) set("country", v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Country" />
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
              <Field label="City">
                <Input
                  placeholder="e.g. Dubai"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </Field>

              <Button
                className="w-full h-11 mt-2"
                disabled={!form.fullName || isLoading}
                onClick={handleSaveProfile}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Complete Registration
              </Button>
            </div>
          </FormCard>
        )}
      </div>

      {/* Animated shimmer keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 5s linear infinite;
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function GoalCard({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition-all duration-200",
        selected
          ? "border-primary bg-primary/8 shadow-sm"
          : "border-border hover:border-primary/40 hover:bg-muted/50"
      )}
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-200",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {icon}
      </div>
      <div>
        <p
          className={cn(
            "font-semibold",
            selected ? "text-primary" : "text-foreground"
          )}
        >
          {title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </button>
  );
}

function FormCard({
  title,
  subtitle,
  onBack,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
      <div className="space-y-1">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
        )}
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
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
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {children}
    </div>
  );
}