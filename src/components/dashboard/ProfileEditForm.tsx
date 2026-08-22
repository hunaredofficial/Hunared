"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Upload, X, Loader2, Save, Trash2 } from "lucide-react";
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
import { PROFESSIONS } from "@/lib/constants";
import { COUNTRIES } from "@/lib/countries";
import type { Profile } from "@/types/database";

export function ProfileEditForm({
  initialProfile,
}: {
  initialProfile: Profile;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Account type (role)
  const [role, setRole] = useState<"seeker" | "employer">(
    initialProfile.role === "employer" ? "employer" : "seeker"
  );

  // Basic info
  const [fullName, setFullName] = useState(initialProfile.full_name ?? "");
  const [username, setUsername] = useState(initialProfile.username ?? "");
  const [phone, setPhone] = useState(initialProfile.phone ?? "");
  const [gender, setGender] = useState(initialProfile.gender ?? "");

  // Email (read-only), country, city
  const [email] = useState(initialProfile.email ?? "");
  const [country, setCountry] = useState(initialProfile.country ?? "");
  const [city, setCity] = useState(initialProfile.city ?? "");
  const [skillLevel, setSkillLevel] = useState(initialProfile.skill_level ?? "");

  // Seeker fields
  const [profession, setProfession] = useState(
    initialProfile.profession ?? ""
  );
  const [availableForHire, setAvailableForHire] = useState(
    initialProfile.available_for_hire !== false
  );

  // Employer fields
  const [companyCr, setCompanyCr] = useState(
    initialProfile.company_cr ?? ""
  );
  const [companyWebsite, setCompanyWebsite] = useState(
    initialProfile.company_website ?? ""
  );
  const [companyAddress, setCompanyAddress] = useState(
    initialProfile.company_address ?? ""
  );

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState(
    initialProfile.avatar_url ?? ""
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // CV
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [existingCvUrl, setExistingCvUrl] = useState(
    initialProfile.cv_url ?? ""
  );
  const cvInputRef = useRef<HTMLInputElement>(null);

  const isSeeker = role === "seeker";

  function handleDeleteCv() {
    setExistingCvUrl("");
    setCvFile(null);
  }

  async function handleSave() {
    if (!fullName.trim()) {
      toast.error("Full name is required.");
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
          role,
          fullName: fullName.trim(),
          username: username.trim() || null,
          phone: phone.trim() || null,
          gender: gender || null,
          country: country || null,
          city: city.trim() || null,
          profession: isSeeker ? profession || null : null,
          skill_level: isSeeker ? skillLevel || null : null, // ← added
          availableForHire: isSeeker ? availableForHire : undefined,
          avatarUrl,
          avatarPublicId,
          cvUrl: cvUrl || null,
          companyCr: !isSeeker ? companyCr.trim() || null : null,
          companyWebsite: !isSeeker ? companyWebsite.trim() || null : null,
          companyAddress: !isSeeker ? companyAddress.trim() || null : null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? "Failed to save profile");
      }

      toast.success("Profile updated. Refreshing…");
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {isSeeker ? "My Profile" : "Company Profile"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Keep your information up to date to improve visibility.
        </p>
      </div>

      {/* Account type */}
      <div className="w-full p-5 rounded-xl border border-border bg-card">
        <label className="text-sm font-medium block mb-1.5">Account type</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "seeker" | "employer")}
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="seeker">Job Seeker / Personal</option>
          <option value="employer">Employer</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          You can change this anytime. Seeker = find jobs. Employer = post jobs.
        </p>
      </div>

      {/* Avatar */}
      <div className="w-full flex items-center gap-5 p-5 rounded-xl border border-border bg-card">
        <div className="relative shrink-0">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview}
              alt="Avatar"
              className="h-20 w-20 rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
              <User className="h-8 w-8 text-muted-foreground" />
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
              className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center cursor-pointer"
              aria-label="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Profile Photo</p>
          <p className="text-xs text-muted-foreground mb-2">
            JPG, PNG or WebP, max 5MB
          </p>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setAvatarFile(f);
              setAvatarPreview(URL.createObjectURL(f));
              setAvatarRemoved(false);
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => avatarInputRef.current?.click()}
            className="cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Photo
          </Button>
        </div>
      </div>

      {/* Personal Info */}
      <div className="w-full p-5 rounded-xl border border-border bg-card space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Personal Info
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name" className="col-span-full">
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ahmed Al-Rashidi"
            />
          </Field>

          <Field label="Email address" className="col-span-full">
            <Input
              value={email}
              readOnly
              className="bg-muted/50 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your login email cannot be changed here.
            </p>
          </Field>

          <Field label="Username">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ahmed_hse"
            />
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
      </div>

      {/* Seeker: Professional Info */}
      {isSeeker && (
        <div className="w-full p-5 rounded-xl border border-border bg-card space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Professional Info
          </h2>

          <Field label="Profession">
            <Select
              value={profession || undefined}
              onValueChange={(v) => {
                if (v) setProfession(v);
              }}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Your profession" />
              </SelectTrigger>
              <SelectContent>
                {PROFESSIONS.map((p) => (
                  <SelectItem key={p} value={p} className="cursor-pointer">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Skill Level – added */}
          <Field label="Skill Level">
            <Select
              value={skillLevel || undefined}
              onValueChange={(v) => setSkillLevel(v)}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner" className="cursor-pointer">
                  Beginner
                </SelectItem>
                <SelectItem value="Intermediate" className="cursor-pointer">
                  Intermediate
                </SelectItem>
                <SelectItem value="Advanced" className="cursor-pointer">
                  Advanced
                </SelectItem>
                <SelectItem value="Expert" className="cursor-pointer">
                  Expert
                </SelectItem>
                <SelectItem value="Master" className="cursor-pointer">
                  Master
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Job hiring status */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <p className="text-sm font-medium">Job hiring status</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="availableForHire"
                  checked={availableForHire === true}
                  onChange={() => setAvailableForHire(true)}
                  className="h-4 w-4"
                />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Available for hire
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="availableForHire"
                  checked={availableForHire === false}
                  onChange={() => setAvailableForHire(false)}
                  className="h-4 w-4"
                />
                <span className="text-muted-foreground font-medium">
                  Unavailable
                </span>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Employers see this on your public candidate profile.
            </p>
          </div>

          <Field label="CV / Resume">
            <div className="space-y-2">
              {existingCvUrl && !cvFile && (
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <span className="text-sm text-muted-foreground truncate max-w-[70%]">
                    CV uploaded
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive/80"
                    onClick={handleDeleteCv}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}

              <label
                className={cn(
                  "flex items-center gap-3 h-11 px-3 rounded-lg border border-dashed cursor-pointer transition-colors",
                  "border-border hover:border-primary/50 hover:bg-primary/5",
                  cvFile && "border-primary/40 bg-primary/5"
                )}
              >
                <input
                  ref={cvInputRef}
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setCvFile(f);
                      setExistingCvUrl("");
                    }
                  }}
                />
                <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground truncate">
                  {cvFile
                    ? cvFile.name
                    : existingCvUrl
                      ? "Click to replace current CV"
                      : "Upload CV (PDF, max 10MB)"}
                </span>
                {cvFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCvFile(null);
                      if (initialProfile.cv_url) {
                        setExistingCvUrl(initialProfile.cv_url);
                      }
                    }}
                    className="ml-auto"
                    aria-label="Remove new CV file"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                )}
              </label>
            </div>
          </Field>
        </div>
      )}

      {/* Employer: Company details */}
      {!isSeeker && (
        <div className="w-full p-5 rounded-xl border border-border bg-card space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Company Info
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Company CR Number" className="col-span-full">
              <Input
                value={companyCr}
                onChange={(e) => setCompanyCr(e.target.value)}
                placeholder="e.g. 1010123456"
              />
            </Field>
            <Field label="Company Website" className="col-span-full">
              <Input
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="https://company.com"
              />
            </Field>
            <Field label="Company Address" className="col-span-full">
              <Input
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="Street, City, Country"
              />
            </Field>
          </div>
        </div>
      )}

      <Button
        size="lg"
        className="h-11"
        disabled={isLoading}
        onClick={handleSave}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Save Changes
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