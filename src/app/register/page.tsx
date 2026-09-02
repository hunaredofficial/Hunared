"use client";

/**
 * Hunared Registration / Onboarding
 *
 * Single authoritative flow:
 *   LOADING → GOAL → ACCOUNT (Clerk SignUp) → SESSION_CONFIRMED → PROFILE → DONE
 *
 * Goal is persisted in:
 *   1. URL ?goal=
 *   2. sessionStorage + localStorage (fallback)
 *   3. Clerk unsafeMetadata after session exists
 *
 * Never treat "email exists" as "currently signed in".
 * Never redirect to dashboard until profile upsert succeeds.
 */

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SignUp, useAuth, useClerk, useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  User,
  UserRound,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { HunaredLogo } from "@/components/brand/HunaredLogo";
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
import { COUNTRIES } from "@/lib/countries";
import { getCitiesForCountry } from "@/lib/cities";
import { JOB_CATEGORIES } from "@/lib/constants";
import { INDUSTRIES } from "@/lib/companyConstants";
import { buildUsernameSuggestions } from "@/lib/usernameSuggest";
import { MultiSelectChips } from "@/components/shared/MultiSelectChips";
import { recommendServicesForIndustries, allServices } from "@/lib/industryServiceRecommendations";
import { useGeoOptional } from "@/components/providers/GeoProvider";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert", "Master"] as const;
const ALL_SERVICES = allServices();

type Goal = "seeker" | "employer" | "personal";
type Step = "goal" | "account" | "profile" | "done";

const GOAL_KEY = "hunared_goal";
const VALID_GOALS: Goal[] = ["seeker", "employer", "personal"];

function isGoal(v: unknown): v is Goal {
  return typeof v === "string" && VALID_GOALS.includes(v as Goal);
}

function saveGoalLocal(g: Goal) {
  try {
    sessionStorage.setItem(GOAL_KEY, g);
    localStorage.setItem(GOAL_KEY, g);
  } catch {
    /* private mode etc. */
  }
}

function loadGoalLocal(): Goal | null {
  try {
    const s =
      sessionStorage.getItem(GOAL_KEY) || localStorage.getItem(GOAL_KEY);
    return isGoal(s) ? s : null;
  } catch {
    return null;
  }
}

function clearGoalLocal() {
  try {
    sessionStorage.removeItem(GOAL_KEY);
    localStorage.removeItem(GOAL_KEY);
  } catch {
    /* ignore */
  }
}

function RegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded: authLoaded, isSignedIn, getToken, userId } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { session } = useClerk();

  const urlGoal = searchParams.get("goal");
  const mode = searchParams.get("mode"); // "complete" after verification

  const initialGoal = useMemo((): Goal | null => {
    if (isGoal(urlGoal)) return urlGoal;
    return loadGoalLocal();
  }, [urlGoal]);

  const [goal, setGoal] = useState<Goal | null>(initialGoal);
  const [step, setStep] = useState<Step>(() => {
    if (mode === "complete") return "profile";
    return "goal";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionAttempts, setSessionAttempts] = useState(0);
  const submittingRef = useRef(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [locationTouched, setLocationTouched] = useState(false);
  // Seeker
  const [jobInterests, setJobInterests] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState("");
  const [availableForHire, setAvailableForHire] = useState<boolean | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  // Employer
  const [companyCr, setCompanyCr] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [industries, setIndustries] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [mapLocation, setMapLocation] = useState("");
  const geo = useGeoOptional();

  const authReady = authLoaded && userLoaded;
  const sessionConfirmed = authReady && isSignedIn && !!userId && !!user;

  // Resolve goal from Clerk metadata if local storage lost it (e.g. new tab after verify)
  useEffect(() => {
    if (!sessionConfirmed || goal) return;
    const metaGoal = user?.unsafeMetadata?.hunared_goal;
    if (isGoal(metaGoal)) {
      setGoal(metaGoal);
      saveGoalLocal(metaGoal);
    } else {
      const local = loadGoalLocal();
      if (local) setGoal(local);
    }
  }, [sessionConfirmed, user, goal]);

  // Prefill name from Clerk
  useEffect(() => {
    if (!sessionConfirmed || !user) return;
    if (!fullName && user.fullName) setFullName(user.fullName);
  }, [sessionConfirmed, user, fullName]);

  // After verification / when signed in → land on profile step
  useEffect(() => {
    if (!authReady) return;

    if (sessionConfirmed) {
      // Already has session → complete profile (never show SignUp again)
      if (step === "account" || mode === "complete" || step === "profile") {
        setStep("profile");
      }
      return;
    }

    // Waiting for session after email verification redirect
    if ((mode === "complete" || step === "profile") && sessionAttempts < 12) {
      const t = setTimeout(async () => {
        try {
          await session?.reload?.();
        } catch {
          /* ignore */
        }
        setSessionAttempts((n) => n + 1);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [
    authReady,
    sessionConfirmed,
    mode,
    step,
    sessionAttempts,
    session,
  ]);

  // Persist goal into Clerk unsafeMetadata once we have a session
  useEffect(() => {
    if (!sessionConfirmed || !user || !goal) return;
    const current = user.unsafeMetadata?.hunared_goal;
    if (current === goal) return;
    user
      .update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          hunared_goal: goal,
        },
      })
      .catch(() => {
        /* non-fatal */
      });
  }, [sessionConfirmed, user, goal]);
  // Auto country/city from geo — COMPANY only (seeker selects manually)
  useEffect(() => {
    if (goal === "seeker") return; // Job seekers pick country/city themselves
    if (!geo || geo.loading || geo.error || locationTouched) return;
    if (geo.countryCode) {
      setCountry((prev) => prev || geo.countryCode!);
    }
    if (geo.city) {
      setCity((prev) => prev || geo.city!);
    }
  }, [goal, geo?.loading, geo?.countryCode, geo?.city, geo?.error, locationTouched]);

  // Username suggestions from name (do not overwrite manual edit)
  useEffect(() => {
    if (usernameTouched || !fullName.trim()) return;
    const suggestions = buildUsernameSuggestions(fullName);
    if (suggestions[0]) setUsername(suggestions[0]);
  }, [fullName, usernameTouched]);

  // Live username availability
  useEffect(() => {
    const u = username.trim().toLowerCase();
    if (u.length < 3) {
      setUsernameStatus(u.length === 0 ? "idle" : "invalid");
      return;
    }
    if (!/^[a-z][a-z0-9_]{2,29}$/.test(u)) {
      setUsernameStatus("invalid");
      return;
    }
    setUsernameStatus("checking");
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/profile/check-username?u=${encodeURIComponent(u)}`);
        const data = (await res.json()) as { available?: boolean };
        setUsernameStatus(data.available ? "ok" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [username]);

  const recommendedServices = useMemo(
    () => recommendServicesForIndustries(industries),
    [industries]
  );

  const cityOptions = useMemo(
    () => getCitiesForCountry(country || null),
    [country]
  );


  const selectGoal = (g: Goal) => {
    setGoal(g);
    saveGoalLocal(g);
    setError("");
  };

  const saveProfile = useCallback(async () => {
    if (submittingRef.current) return;
    setError("");

    const activeGoal =
      goal ||
      loadGoalLocal() ||
      (isGoal(user?.unsafeMetadata?.hunared_goal)
        ? (user?.unsafeMetadata?.hunared_goal as Goal)
        : null);

    if (!activeGoal) {
      setError("Please select an account type.");
      setStep("goal");
      return;
    }
    if (!fullName.trim()) {
      setError(
        activeGoal === "employer"
          ? "Company name is required."
          : "Full name is required."
      );
      return;
    }
    const handle = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!handle || handle.length < 3) {
      setError("Username is required (min 3 characters).");
      return;
    }
    if (usernameStatus === "taken") {
      setError("Username is already taken. Choose another.");
      return;
    }
    // Phone optional for seeker; if provided, must look valid
    if (phone.trim() && phone.replace(/\D/g, "").length < 7) {
      setError("Please enter a valid phone number or leave it empty.");
      return;
    }
    if (!country) {
      setError("Country is required.");
      return;
    }
    // City optional (seeker & company)
    if (activeGoal === "seeker") {
      if (jobInterests.length === 0) {
        setError("Select at least one profession category.");
        return;
      }
      if (!skillLevel) {
        setError("Skill level is required.");
        return;
      }
      if (availableForHire === null) {
        setError("Please select your availability.");
        return;
      }
      // Profile image optional
    }
    if (activeGoal === "employer") {
      if (!phone.trim() || phone.replace(/\D/g, "").length < 7) {
        setError("Company phone is required.");
        return;
      }
      if (!avatarFile && !avatarPreview) {
        setError("Company logo / profile photo is required.");
        return;
      }
      if (industries.length === 0) {
        setError("Select at least one industry.");
        return;
      }
      if (services.length === 0) {
        setError("Select at least one service.");
        return;
      }
    }

    if (!sessionConfirmed || !userId) {
      setError(
        "Your session is still loading. Please wait a moment and try again."
      );
      try {
        await session?.reload?.();
      } catch {
        /* ignore */
      }
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      const role =
        activeGoal === "employer"
          ? "employer"
          : activeGoal === "seeker"
            ? "seeker"
            : "personal";

      let avatarUrl: string | null = null;
      let avatarPublicId: string | null = null;
      if (avatarFile) {
        try {
          const up = await uploadToCloudinary(avatarFile, "avatars");
          avatarUrl = up.url;
          avatarPublicId = up.publicId;
        } catch {
          setError("Failed to upload profile image. Try another file.");
          submittingRef.current = false;
          setLoading(false);
          return;
        }
      }

      const payload: Record<string, unknown> = {
        role,
        fullName: fullName.trim(),
        username: handle,
        phone: phone.trim(),
        country,
        city: city.trim(),
        location: [
          city.trim(),
          COUNTRIES.find((c) => c.code === country)?.name || "",
        ]
          .filter(Boolean)
          .join(", "),
        avatarUrl,
        avatarPublicId,
        companyCr: activeGoal === "employer" ? companyCr || null : null,
        companyWebsite:
          activeGoal === "employer" ? companyWebsite || null : null,
        companyAddress:
          activeGoal === "employer" ? companyAddress || null : null,
      };

      if (activeGoal === "seeker") {
        payload.jobInterests = jobInterests;
        payload.profession = jobInterests[0] ?? null;
        payload.skillLevel = skillLevel;
        payload.availableForHire = availableForHire === true;
      }
      if (activeGoal === "employer") {
        payload.industries = industries;
        payload.services = services;
        payload.mapLocation = mapLocation.trim() || null;
        payload.companyAddress = companyAddress.trim() || mapLocation.trim() || null;
      }

      let lastError = "Could not save profile";

      for (let attempt = 1; attempt <= 5; attempt++) {
        const token = await getToken({ template: undefined }).catch(() => null);
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch("/api/profile/save", {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          // Mark onboarding complete in Clerk metadata
          try {
            await user?.update({
              unsafeMetadata: {
                ...user.unsafeMetadata,
                hunared_goal: activeGoal,
                onboarding_complete: true,
              },
            });
          } catch {
            /* non-fatal */
          }
          clearGoalLocal();
          toast.success("Welcome to Hunared!");
          setStep("done");
          window.location.replace(
            activeGoal === "employer" ? "/dashboard/jobs/new" : "/dashboard"
          );
          return;
        }

        const data = await res.json().catch(() => ({}));
        lastError = data.error || `Error ${res.status}`;

        if ((res.status === 401 || res.status === 403) && attempt < 5) {
          await session?.reload?.().catch(() => null);
          await new Promise((r) => setTimeout(r, 600 * attempt));
          continue;
        }
        break;
      }

      setError(lastError);
      toast.error(lastError);
    } catch (e) {
      console.error("[register] saveProfile", e);
      setError("Network error while saving profile. Please try again.");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  }, [
    goal,
    fullName,
    username,
    usernameStatus,
    phone,
    country,
    city,
    jobInterests,
    skillLevel,
    availableForHire,
    avatarFile,
    avatarPreview,
    companyCr,
    companyWebsite,
    companyAddress,
    industries,
    services,
    sessionConfirmed,
    userId,
    getToken,
    session,
    user,
  ]);

  const goalCards: {
    id: Goal;
    title: string;
    desc: string;
    icon: typeof User;
  }[] = [
    {
      id: "personal",
      title: "Personal",
      desc: "Browse jobs, market & learning",
      icon: UserRound,
    },
    {
      id: "seeker",
      title: "Job Seeker",
      desc: "Find your next opportunity",
      icon: User,
    },
    {
      id: "employer",
      title: "Company",
      desc: "Post jobs & hire talent",
      icon: Building2,
    },
  ];

  const waitingSession =
    (mode === "complete" || step === "profile") &&
    authReady &&
    !sessionConfirmed &&
    sessionAttempts < 12;

  // ── Loading gate ────────────────────────────────────────────
  if (!authReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  // Already signed in + opened /register without mode=complete → guide to profile or dashboard
  // (handled by step state below)

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-[var(--brand-from)] opacity-[0.12] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-[var(--brand-via)] opacity-[0.08] blur-3xl" />
      </div>

      <div className="w-full max-w-lg space-y-6">
        <div className="flex justify-center">
          <HunaredLogo size="lg" href="/" />
        </div>

        {/* Session establishing after email verification */}
        {waitingSession && (
          <div className="rounded-2xl border border-border bg-card/80 p-8 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <h2 className="text-lg font-semibold">Confirming your session…</h2>
            <p className="text-sm text-muted-foreground">
              Email verified. Setting up your secure session. This usually takes
              a second.
            </p>
          </div>
        )}

        {/* GOAL */}
        {!waitingSession && step === "goal" && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold gradient-text">
                What&apos;s your goal?
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {sessionConfirmed
                  ? "Choose your account type to finish setup"
                  : "Tell us how you’ll use Hunared"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {goalCards.map((g) => {
                const Icon = g.icon;
                const selected = goal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => selectGoal(g.id)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-all",
                      selected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/25"
                        : "border-border bg-card/60 hover:border-primary/40"
                    )}
                  >
                    <Icon className="h-6 w-6 text-primary mb-2" />
                    <div className="font-semibold text-sm">{g.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {g.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              className="w-full h-11 rounded-xl"
              disabled={!goal}
              onClick={() => {
                if (!goal) {
                  setError("Please select an option.");
                  return;
                }
                saveGoalLocal(goal);
                if (sessionConfirmed) {
                  setStep("profile");
                } else {
                  setStep("account");
                }
              }}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* ACCOUNT — Clerk SignUp (only when not signed in) */}
        {!waitingSession && step === "account" && !sessionConfirmed && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setStep("goal")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold gradient-text">
                Create your account
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {goal === "employer"
                  ? "Register your company"
                  : goal === "seeker"
                    ? "Start your job search"
                    : "Join Hunared"}
              </p>
            </div>

            <div className="flex justify-center">
              <SignUp
                routing="hash"
                signInUrl="/sign-in"
                forceRedirectUrl={`/register?mode=complete${goal ? `&goal=${goal}` : ""}`}
                fallbackRedirectUrl={`/register?mode=complete${goal ? `&goal=${goal}` : ""}`}
                appearance={{
                  variables: {
                    colorPrimary: "#3b82f6",
                    colorBackground: "transparent",
                    colorInputBackground: "hsl(var(--background))",
                    colorInputText: "hsl(var(--foreground))",
                    colorText: "hsl(var(--foreground))",
                    colorTextSecondary: "hsl(var(--muted-foreground))",
                    borderRadius: "0.75rem",
                  },
                  elements: {
                    rootBox: "w-full mx-auto",
                    card: "w-full shadow-none border border-border rounded-2xl bg-card/80 backdrop-blur-sm",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton:
                      "border border-border bg-background hover:bg-muted text-foreground",
                    formButtonPrimary:
                      "bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-xl font-medium",
                    formFieldInput:
                      "h-11 rounded-xl border-border bg-background text-foreground",
                    footerActionLink: "text-primary hover:underline",
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* If somehow on account step but already signed in */}
        {!waitingSession && step === "account" && sessionConfirmed && (
          <div className="rounded-2xl border border-border bg-card/80 p-6 text-center space-y-4">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
            <h2 className="text-lg font-semibold">You&apos;re signed in</h2>
            <p className="text-sm text-muted-foreground">
              Complete your profile to finish registration.
            </p>
            <Button
              className="w-full h-11 rounded-xl"
              onClick={() => setStep("profile")}
            >
              Continue to profile
            </Button>
          </div>
        )}

        {/* PROFILE / ONBOARDING FORM */}
        {!waitingSession && step === "profile" && sessionConfirmed && (
          <div className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold gradient-text">
                {goal === "employer"
                  ? "Company details"
                  : "Complete your profile"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Almost done — tell us a bit about{" "}
                {goal === "employer" ? "your company" : "yourself"}
              </p>
            </div>

            {!goal && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-center">
                Account type missing.{" "}
                <button
                  type="button"
                  className="text-primary font-medium underline"
                  onClick={() => setStep("goal")}
                >
                  Choose one
                </button>
              </div>
            )}

            <div className="space-y-4 rounded-2xl border border-border bg-card/60 p-5">
              {/* Profile image — top of form for both seeker & company */}
              {(goal === "seeker" || goal === "employer") && (
                <div className="space-y-2">
                  <Label>
                    {goal === "employer" ? "Company logo / profile image *" : "Profile image"}
                  </Label>
                  <div className="flex items-center gap-3">
                    {avatarPreview ? (
                      <div
                        className={
                          goal === "employer"
                            ? "relative h-16 w-16 overflow-hidden rounded-xl border"
                            : "relative h-16 w-16 overflow-hidden rounded-full border"
                        }
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={avatarPreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-white"
                          onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview("");
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className={
                          goal === "employer"
                            ? "flex h-16 w-16 items-center justify-center rounded-xl border border-dashed bg-muted/30"
                            : "flex h-16 w-16 items-center justify-center rounded-full border border-dashed bg-muted/30"
                        }
                      >
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <label className="cursor-pointer">
                      <span className="inline-flex h-10 items-center rounded-xl border px-3 text-sm hover:bg-muted/50">
                        {goal === "employer"
                          ? avatarPreview
                            ? "Change image"
                            : "Upload image"
                          : avatarPreview
                            ? "Change photo"
                            : "Upload photo"}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          if (f.size > 10 * 1024 * 1024) {
                            toast.error("Image must be under 10MB");
                            return;
                          }
                          setAvatarFile(f);
                          setAvatarPreview(URL.createObjectURL(f));
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {goal === "employer"
                      ? "Optional · JPG, PNG or WebP · max 10MB"
                      : "JPG, PNG or WebP · max 10MB"}
                  </p>
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  {goal === "employer" ? "Company name *" : "Full name *"}
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={
                    goal === "employer" ? "Acme Engineering LLC" : "Your full name"
                  }
                  className="h-11 rounded-xl"
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username / Handle *</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsernameTouched(true);
                    setUsername(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                    );
                  }}
                  placeholder="your_handle"
                  className="h-11 rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  {usernameStatus === "checking" && "Checking availability…"}
                  {usernameStatus === "ok" && (
                    <span className="text-emerald-600">Username is available</span>
                  )}
                  {usernameStatus === "taken" && (
                    <span className="text-destructive">Username is taken</span>
                  )}
                  {usernameStatus === "invalid" && username.length > 0 && (
                    <span className="text-destructive">
                      Use letters, numbers, underscore (min 3, start with a letter)
                    </span>
                  )}
                  {usernameStatus === "idle" &&
                    "Unique handle. Letters, numbers, underscore."}
                </p>
                {fullName.trim().length >= 2 && (
                  <div className="flex flex-wrap gap-1.5">
                    {buildUsernameSuggestions(fullName)
                      .slice(0, 5)
                      .map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="text-xs rounded-full border px-2 py-0.5 hover:bg-accent"
                          onClick={() => {
                            setUsernameTouched(true);
                            setUsername(s);
                          }}
                        >
                          @{s}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {goal === "employer" ? "Company phone *" : "Phone number"}
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966 5X XXX XXXX"
                  className="h-11 rounded-xl"
                />
              </div>

              {/* Country / City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Select
                    value={country}
                    onValueChange={(v) => {
                      if (v) {
                        setLocationTouched(true);
                        setCountry(v);
                        setCity("");
                      }
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {goal !== "seeker" && geo?.countryCode && !locationTouched && (
                    <p className="text-xs text-muted-foreground">
                      Detected location — you can change it.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  {cityOptions.length > 0 ? (
                    <Select
                      value={city}
                      onValueChange={(v) => {
                        if (v) {
                          setLocationTouched(true);
                          setCity(v);
                        }
                      }}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {cityOptions.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={city}
                      onChange={(e) => {
                        setLocationTouched(true);
                        setCity(e.target.value);
                      }}
                      placeholder="Your city"
                      className="h-11 rounded-xl"
                    />
                  )}
                </div>
              </div>

              {/* ── SEEKER FIELDS ── */}
              {goal === "seeker" && (
                <>
                  <div className="space-y-2">
                    <Label>Profession categories *</Label>
                    <MultiSelectChips
                      options={JOB_CATEGORIES}
                      value={jobInterests}
                      onChange={setJobInterests}
                      placeholder="Select one or more professions"
                      searchPlaceholder="Search professions…"
                      label="Professions"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Experience / Skill level *</Label>
                    <Select value={skillLevel} onValueChange={(v) => v && setSkillLevel(v)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {SKILL_LEVELS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Availability *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAvailableForHire(true)}
                        className={cn(
                          "h-11 rounded-xl border text-sm font-medium transition",
                          availableForHire === true
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        Available for Hire
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailableForHire(false)}
                        className={cn(
                          "h-11 rounded-xl border text-sm font-medium transition",
                          availableForHire === false
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        Unavailable
                      </button>
                    </div>
                  </div>

                </>
              )}

              {/* ── EMPLOYER / COMPANY FIELDS ── */}
              {goal === "employer" && (
                <>
                  <div className="space-y-2">
                    <Label>Industry *</Label>
                    <MultiSelectChips
                      options={INDUSTRIES}
                      value={industries}
                      onChange={setIndustries}
                      placeholder="Select industry"
                      searchPlaceholder="Search industries…"
                      label="Industries"
                    />
                  </div>

                  {recommendedServices.length > 0 && (
                    <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
                      <Label className="text-primary">Recommended services</Label>
                      <p className="text-xs text-muted-foreground">
                        Based on your industry. Tap to add — nothing is forced.
                      </p>
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                        {recommendedServices.slice(0, 24).map((s) => {
                          const on = services.includes(s);
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                setServices((prev) =>
                                  on
                                    ? prev.filter((x) => x !== s)
                                    : [...prev, s]
                                );
                              }}
                              className={cn(
                                "text-xs rounded-full border px-2 py-0.5 transition",
                                on
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border hover:bg-accent"
                              )}
                            >
                              {on ? "✓ " : ""}
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Services *</Label>
                    <MultiSelectChips
                      options={ALL_SERVICES}
                      value={services}
                      onChange={setServices}
                      placeholder="Select services you offer"
                      searchPlaceholder="Search services…"
                      label="Services"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mapLocation">Company Location</Label>
                    <Input
                      id="mapLocation"
                      value={mapLocation}
                      onChange={(e) => setMapLocation(e.target.value)}
                      placeholder="https://maps.google.com/... or Google Maps share link"
                      className="h-11 rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional. Paste a Google Maps (or similar) link to share your office location.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite">Website (optional)</Label>
                    <Input
                      id="companyWebsite"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="https://"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyCr">CR / License (optional)</Label>
                    <Input
                      id="companyCr"
                      value={companyCr}
                      onChange={(e) => setCompanyCr(e.target.value)}
                      placeholder="Commercial registration"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyAddress">Address (optional)</Label>
                    <Input
                      id="companyAddress"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="Business address"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              className="w-full h-11 rounded-xl"
              disabled={loading}
              onClick={saveProfile}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  Complete registration
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Profile step but session never arrived */}
        {!waitingSession &&
          step === "profile" &&
          !sessionConfirmed &&
          sessionAttempts >= 12 && (
            <div className="rounded-2xl border border-border bg-card/80 p-6 text-center space-y-4">
              <h2 className="text-lg font-semibold">Session not ready</h2>
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t confirm your login session after email
                verification. Please sign in to continue.
              </p>
              <Button asChild className="w-full h-11 rounded-xl">
                <Link href="/sign-in">Go to sign in</Link>
              </Button>
            </div>
          )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Loading…
        </div>
      }
    >
      <RegisterInner />
    </Suspense>
  );
}
