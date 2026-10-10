"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Settings,
  User,
  Palette,
  Globe2,
  Sparkles,
  Bell,
  Shield,
  Loader2,
  Check,
  ExternalLink,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/lib/countries";
import { TIMEZONES } from "@/lib/timezones";

type SettingsState = {
  username: string | null;
  full_name: string | null;
  email: string | null;
  role: string | null;
  preferred_theme: "system" | "light" | "dark";
  preferred_timezone: string;
  preferred_country: string | null;
  ai_enabled: boolean;
  ai_personalization: boolean;
  ai_cv_analysis: boolean;
  ai_notifications: boolean;
  email_job_alerts: boolean;
  email_messages: boolean;
  show_online_status: boolean;
  compact_mode: boolean;
  migrationRequired?: boolean;
};

const SECTIONS = [
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "region", label: "Region & time", icon: Globe2 },
  { id: "ai", label: "AI & agent", icon: Sparkles },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
] as const;

export function SettingsClient() {
  const { setTheme, theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [active, setActive] = useState<string>("account");
  const [s, setS] = useState<SettingsState | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile/settings");
      const j = (await res.json()) as SettingsState;
      setS(j);
      if (j.preferred_theme) {
        setTheme(j.preferred_theme);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "hunared_ai_enabled",
          j.ai_enabled === false ? "0" : "1"
        );
        if (j.preferred_country) {
          localStorage.setItem("hunared_preferred_country", j.preferred_country);
        }
        if (j.preferred_timezone) {
          localStorage.setItem("hunared_preferred_timezone", j.preferred_timezone);
        }
        localStorage.setItem(
          "hunared_compact_mode",
          j.compact_mode ? "1" : "0"
        );
      }
    } catch {
      toast.error("Could not load settings");
    } finally {
      setLoading(false);
    }
  }, [setTheme]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(patch: Partial<SettingsState>) {
    if (!s) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const j = await res.json();
      if (!res.ok) {
        toast.error(j.error || "Could not save");
        return;
      }
      const next = (j.settings as SettingsState) || { ...s, ...patch };
      setS(next);
      if (patch.preferred_theme) setTheme(patch.preferred_theme);
      if (typeof patch.ai_enabled === "boolean") {
        localStorage.setItem(
          "hunared_ai_enabled",
          patch.ai_enabled ? "1" : "0"
        );
      }
      if (patch.preferred_country !== undefined) {
        if (patch.preferred_country) {
          localStorage.setItem(
            "hunared_preferred_country",
            patch.preferred_country
          );
        } else {
          localStorage.removeItem("hunared_preferred_country");
        }
      }
      if (patch.preferred_timezone) {
        localStorage.setItem(
          "hunared_preferred_timezone",
          patch.preferred_timezone
        );
      }
      if (typeof patch.compact_mode === "boolean") {
        localStorage.setItem(
          "hunared_compact_mode",
          patch.compact_mode ? "1" : "0"
        );
        document.documentElement.classList.toggle(
          "compact-ui",
          patch.compact_mode
        );
      }
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
      toast.success("Settings saved");
    } catch {
      toast.error("Network error while saving");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !s) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading settings…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-7 w-7 text-primary" />
            Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
            Control how Hunared looks and works for you — appearance, region,
            AI assistant, notifications and privacy.
          </p>
        </div>
        {savedFlash && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-500 font-medium">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
      </div>

      {s.migrationRequired && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Some preference columns may be missing. Ask your admin to run{" "}
          <code className="text-xs">supabase/015_user_settings.sql</code> in
          Supabase.
        </div>
      )}

      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-6 items-start">
        {/* Side nav */}
        <nav className="lg:sticky lg:top-24 space-y-1 rounded-xl border border-border bg-card p-2">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActive(id);
                document
                  .getElementById(`settings-${id}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={cn(
                "w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left",
                active === id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {/* Account */}
          <Section id="account" title="Account" desc="Your Hunared identity">
            <div className="rounded-xl border border-border bg-background/50 p-4 sm:p-5 space-y-4">
              <Row label="Display name" value={s.full_name || "—"} />
              <Row
                label="Username"
                value={s.username ? `@${s.username}` : "Not set"}
              />
              <Row label="Email" value={s.email || "—"} />
              <Row
                label="Account type"
                value={
                  s.role === "seeker"
                    ? "Seeker"
                    : s.role === "employer"
                      ? "Company"
                      : s.role || "—"
                }
              />
              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/profile">Edit profile</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="gap-1">
                  <Link href="/candidates">
                    Browse talent <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </Section>

          {/* Appearance */}
          <Section
            id="appearance"
            title="Appearance"
            desc="Theme and layout density"
          >
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">Theme</p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {(
                  [
                    { id: "light", label: "Light", icon: Sun },
                    { id: "dark", label: "Dark", icon: Moon },
                    { id: "system", label: "System", icon: Monitor },
                  ] as const
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    disabled={saving}
                    onClick={() => void save({ preferred_theme: id })}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all",
                      (s.preferred_theme || theme) === id
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/40"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>
              <Toggle
                label="Compact mode"
                desc="Slightly denser spacing on dashboard lists and cards"
                checked={s.compact_mode}
                disabled={saving}
                onChange={(v) => void save({ compact_mode: v })}
              />
            </div>
          </Section>

          {/* Region */}
          <Section
            id="region"
            title="Region & time"
            desc="Defaults for search, times and location-aware features"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Preferred country
                </label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={s.preferred_country || ""}
                  disabled={saving}
                  onChange={(e) =>
                    void save({
                      preferred_country: e.target.value || null,
                    })
                  }
                >
                  <option value="">Use browser / profile country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Time zone
                </label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={s.preferred_timezone}
                  disabled={saving}
                  onChange={(e) =>
                    void save({ preferred_timezone: e.target.value })
                  }
                >
                  {TIMEZONES.map((z) => (
                    <option key={z.value} value={z.value}>
                      {z.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              Country preference helps pre-fill search and posting forms. Time
              zone is stored for future scheduling and activity times.
            </p>
          </Section>

          {/* AI */}
          <Section
            id="ai"
            title="AI & Hunared Agent"
            desc="Control the assistant on the site"
          >
            <div className="space-y-1">
              <Toggle
                label="Show Hunared Agent"
                desc="Floating AI assistant on public pages (homepage, jobs, market…)"
                checked={s.ai_enabled}
                disabled={saving}
                onChange={(v) => void save({ ai_enabled: v })}
              />
              <Toggle
                label="Personalization"
                desc="Rank jobs and listings using your profile interests when signed in"
                checked={s.ai_personalization}
                disabled={saving}
                onChange={(v) => void save({ ai_personalization: v })}
              />
              <Toggle
                label="CV AI analysis"
                desc="Allow AI features inside CV Builder (improve, ATS, tailor)"
                checked={s.ai_cv_analysis}
                disabled={saving}
                onChange={(v) => void save({ ai_cv_analysis: v })}
              />
              <Toggle
                label="AI-related notices"
                desc="Occasional tips about new AI capabilities"
                checked={s.ai_notifications}
                disabled={saving}
                onChange={(v) => void save({ ai_notifications: v })}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              Turning off the agent hides the chat button site-wide for this
              account. Guests can still use public AI settings if enabled.
            </p>
          </Section>

          {/* Notifications */}
          <Section
            id="notifications"
            title="Notifications"
            desc="Email alerts (when email delivery is configured)"
          >
            <div className="space-y-1">
              <Toggle
                label="Job & listing alerts"
                desc="Updates about jobs or marketplace activity related to you"
                checked={s.email_job_alerts}
                disabled={saving}
                onChange={(v) => void save({ email_job_alerts: v })}
              />
              <Toggle
                label="Message emails"
                desc="Email when you receive a new Hunared Message"
                checked={s.email_messages}
                disabled={saving}
                onChange={(v) => void save({ email_messages: v })}
              />
            </div>
          </Section>

          {/* Privacy */}
          <Section
            id="privacy"
            title="Privacy"
            desc="Visibility and presence"
          >
            <div className="space-y-1">
              <Toggle
                label="Show online status"
                desc="Let others see when you are active in Messages"
                checked={s.show_online_status}
                disabled={saving}
                onChange={(v) => void save({ show_online_status: v })}
              />
            </div>
            <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground leading-relaxed">
              Profile visibility (listed publicly / available for hire) is
              managed on{" "}
              <Link
                href="/dashboard/profile"
                className="text-primary hover:underline"
              >
                My Profile
              </Link>
              . Account deletion is also available there under Danger Zone.
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  desc,
  children,
}: {
  id: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={`settings-${id}`}
      className="rounded-2xl border border-border bg-card p-5 sm:p-6 scroll-mt-24"
    >
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground mt-0.5 mb-4">{desc}</p>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 text-sm">
      <span className="text-muted-foreground sm:w-36 shrink-0">{label}</span>
      <span className="font-medium text-foreground break-all">{value}</span>
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "w-full flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
        checked
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-background/40 hover:bg-muted/40",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "mt-0.5 relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted-foreground/30"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
            checked ? "left-4" : "left-0.5"
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">
          {label}
        </span>
        <span className="block text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {desc}
        </span>
      </span>
    </button>
  );
}
