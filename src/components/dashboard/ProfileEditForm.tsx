"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Upload,
  X,
  Loader2,
  Save,
  Briefcase,
  Building2,
  UserCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import { JOB_CATEGORIES } from "@/lib/constants";
import { MultiSelectChips } from "@/components/shared/MultiSelectChips";
import { buildUsernameSuggestions } from "@/lib/usernameSuggest";
import { COUNTRIES } from "@/lib/countries";
import type { Profile, UserRole } from "@/types/database";

const SKILL_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
  "Master",
] as const;

type AccountRole = "personal" | "seeker" | "employer";

const ROLE_CARDS: {
  id: AccountRole;
  title: string;
  description: string;
  icon: typeof User;
}[] = [
  {
    id: "personal",
    title: "Personal",
    description: "Marketplace, articles & community — not listed as a job candidate",
    icon: UserCircle2,
  },
  {
    id: "seeker",
    title: "Job Seeker",
    description: "Find jobs, appear in Candidates, upload CV & set availability",
    icon: Briefcase,
  },
  {
    id: "employer",
    title: "Company",
    description: "Post jobs, company profile, hire candidates",
    icon: Building2,
  },
];

function normalizeRole(role: string | null | undefined): AccountRole {
  if (role === "employer") return "employer";
  if (role === "personal") return "personal";
  return "seeker";
}

export function ProfileEditForm({
  initialProfile,
}: {
  initialProfile: Profile;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [role, setRole] = useState<AccountRole>(
    normalizeRole(initialProfile.role)
  );

  const [fullName, setFullName] = useState(initialProfile.full_name ?? "");
  const [username, setUsername] = useState(initialProfile.username ?? "");
  const [phone, setPhone] = useState(initialProfile.phone ?? "");
  const [gender, setGender] = useState(initialProfile.gender ?? "");
  const [email] = useState(initialProfile.email ?? "");
  const [country, setCountry] = useState(initialProfile.country ?? "");
  const [city, setCity] = useState(initialProfile.city ?? "");
  const [skillLevel, setSkillLevel] = useState(initialProfile.skill_level ?? "");

  const [jobInterests, setJobInterests] = useState<string[]>(
    Array.isArray(initialProfile.job_interests) &&
      initialProfile.job_interests.length
      ? initialProfile.job_interests
      : initialProfile.profession
        ? [initialProfile.profession]
        : []
  );
  const [availableForHire, setAvailableForHire] = useState(
    initialProfile.available_for_hire !== false
  );

  const [companyCr, setCompanyCr] = useState(initialProfile.company_cr ?? "");
  const [companyWebsite, setCompanyWebsite] = useState(
    initialProfile.company_website ?? ""
  );
  const [companyAddress, setCompanyAddress] = useState(
    initialProfile.company_address ?? ""
  );

  const [avatarPreview, setAvatarPreview] = useState(
    initialProfile.avatar_url ?? ""
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [existingCvUrl, setExistingCvUrl] = useState(
    initialProfile.cv_url ?? ""
  );
  const cvInputRef = useRef<HTMLInputElement>(null);

  const isSeeker = role === "seeker";
  const isEmployer = role === "employer";
  const isPersonal = role === "personal";

  const usernameSuggestions = buildUsernameSuggestions(
    fullName || initialProfile.full_name || "user"
  );

  async function handleSave() {
    if (!fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }
    if (!username.trim()) {
      toast.error("Username / handle is required.");
      return;
    }
    const handle = username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");
    if (handle.length < 3) {
      toast.error(
        "Username must be at least 3 characters (letters, numbers, underscore)."
      );
      return;
    }
    if (isSeeker && jobInterests.length === 0) {
      toast.error("Select at least one profession / job category.");
      return;
    }
    if (isSeeker && !skillLevel) {
      toast.error("Skill level is required for Job Seeker.");
      return;
    }

    setIsLoading(true);
    try {
      let avatarUrl: string | null = initialProfile.avatar_url;
      let avatarPublicId: string | null = initialProfile.avatar_public_id;

      if (avatarFile) {
        const { url, publicId } = await uploadToCloudinary(
          avatarFile,
          "hunared/avatars"
        );
        avatarUrl = url;
        avatarPublicId = publicId;
      } else if (avatarRemoved) {
        avatarUrl = null;
        avatarPublicId = null;
      }

      let cvUrl = existingCvUrl;
      if (cvFile) {
        const fd = new FormData();
        fd.append("cv", cvFile);
        const res = await fetch("/api/profile/upload-cv", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) throw new Error("CV upload failed");
        const data = (await res.json()) as { path: string };
        cvUrl = data.path;
      }

      const res = await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: role as UserRole,
          fullName: fullName.trim(),
          username: handle,
          jobInterests: isSeeker ? jobInterests : [],
          phone: phone.trim() || null,
          gender: gender || null,
          country: country || null,
          city: city.trim() || null,
          profession: isSeeker ? jobInterests[0] || null : null,
          skillLevel: isSeeker ? skillLevel || null : null,
          availableForHire: isSeeker ? availableForHire : true,
          avatarUrl,
          avatarPublicId,
          cvUrl: isSeeker ? cvUrl || null : null,
          companyCr: isEmployer ? companyCr.trim() || null : null,
          companyWebsite: isEmployer ? companyWebsite.trim() || null : null,
          companyAddress: isEmployer ? companyAddress.trim() || null : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      toast.success("Profile saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      {/* Account type — 3 separate cards */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">Account type</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Choose one. You can change this later.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ROLE_CARDS.map((card) => {
            const Icon = card.icon;
            const selected = role === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setRole(card.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  selected
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                    : "border-border bg-background/50 hover:border-primary/40 hover:bg-muted/40"
                )}
              >
                <div
                  className={cn(
                    "mb-2 flex h-9 w-9 items-center justify-center rounded-lg",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold">{card.title}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-snug">
                  {card.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Photo */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative shrink-0">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="Avatar"
                className="h-24 w-24 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                <User className="h-9 w-9 text-muted-foreground" />
              </div>
            )}
            {avatarPreview && (
              <button
                type="button"
                onClick={() => {
                  setAvatarPreview("");
                  setAvatarFile(null);
                  setAvatarRemoved(true);
                }}
                className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center"
                aria-label="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Profile photo</p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">
              JPG, PNG or WebP · max 5MB
            </p>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > 5 * 1024 * 1024) {
                  toast.error("Image must be under 5MB");
                  return;
                }
                setAvatarFile(f);
                setAvatarRemoved(false);
                setAvatarPreview(URL.createObjectURL(f));
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => avatarInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload photo
            </Button>
          </div>
        </div>
      </section>

      {/* Personal info */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Personal info
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full name *">
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </Field>
          <Field label="Email">
            <Input value={email} disabled className="opacity-70" />
            <p className="text-[11px] text-muted-foreground mt-1">
              Login email cannot be changed here.
            </p>
          </Field>
          <Field label="Username / handle *" className="md:col-span-2">
            <Input
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                )
              }
              placeholder="your_handle"
            />
            {usernameSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {usernameSuggestions.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setUsername(s)}
                    className="text-xs px-2 py-0.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/10"
                  >
                    @{s}
                  </button>
                ))}
              </div>
            )}
          </Field>
          <Field label="Phone">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+966 5x xxx xxxx"
            />
          </Field>
          <Field label="Gender">
            <Select
              value={gender || undefined}
              onValueChange={(v) => {
                if (v) setGender(v);
              }}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male" className="cursor-pointer">
                  Male
                </SelectItem>
                <SelectItem value="female" className="cursor-pointer">
                  Female
                </SelectItem>
                <SelectItem value="prefer_not_to_say" className="cursor-pointer">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Country">
            <Select
              value={country || undefined}
              onValueChange={(v) => {
                if (v) setCountry(v);
              }}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem
                    key={c.code}
                    value={c.code}
                    className="cursor-pointer"
                  >
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="City">
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Riyadh"
            />
          </Field>
        </div>
      </section>

      {/* Job Seeker fields */}
      {isSeeker && (
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Job seeker details
          </h2>
          <Field label="Professions / job categories *">
            <MultiSelectChips
              options={[...JOB_CATEGORIES]}
              value={jobInterests}
              onChange={setJobInterests}
              placeholder="Select one or more"
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Experience / skill level *">
              <Select
                value={skillLevel || undefined}
                onValueChange={(v) => {
                  if (v) setSkillLevel(v);
                }}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map((l) => (
                    <SelectItem key={l} value={l} className="cursor-pointer">
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Availability *">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={availableForHire ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setAvailableForHire(true)}
                >
                  Available for hire
                </Button>
                <Button
                  type="button"
                  variant={!availableForHire ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setAvailableForHire(false)}
                >
                  Unavailable
                </Button>
              </div>
            </Field>
          </div>
          <Field label="CV (PDF)">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={cvInputRef}
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setCvFile(f);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => cvInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                {cvFile ? cvFile.name : existingCvUrl ? "Replace CV" : "Upload CV"}
              </Button>
              {(cvFile || existingCvUrl) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCvFile(null);
                    setExistingCvUrl("");
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          </Field>
        </section>
      )}

      {/* Company fields */}
      {isEmployer && (
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Company info
          </h2>
          <Field label="CR / License">
            <Input
              value={companyCr}
              onChange={(e) => setCompanyCr(e.target.value)}
              placeholder="Commercial registration"
            />
          </Field>
          <Field label="Website">
            <Input
              type="url"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              placeholder="https://"
            />
          </Field>
          <Field label="Address">
            <Input
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              placeholder="Business address"
            />
          </Field>
        </section>
      )}

      {isPersonal && (
        <p className="text-sm text-muted-foreground px-1">
          Personal accounts use the marketplace and community features. Switch
          to <strong>Job Seeker</strong> to appear in Candidates and apply for
          jobs, or <strong>Company</strong> to post jobs.
        </p>
      )}

      <Button
        size="lg"
        className="h-11 w-full sm:w-auto min-w-[180px]"
        disabled={isLoading}
        onClick={handleSave}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Save changes
      </Button>
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
