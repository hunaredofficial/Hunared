"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus, RefreshCw } from "lucide-react";

/**
 * Full profile creator for Team — same fields as real signup/profile,
 * without email/phone verification requirements.
 */

type Row = {
  id: string;
  full_name: string;
  role: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  profession: string | null;
  username?: string | null;
  created_at?: string;
};

const emptyForm = () => ({
  role: "seeker" as "seeker" | "employer" | "personal",
  full_name: "",
  username: "",
  email: "",
  phone: "",
  gender: "",
  country: "",
  city: "",
  location: "",
  profession: "",
  skill_level: "",
  job_interests: "" as string, // comma-separated
  available_for_hire: true,
  listed_publicly: true,
  // company
  company_name: "",
  company_cr: "",
  company_website: "",
  company_address: "",
  company_location: "",
  industries: "" as string, // comma-separated
  services: "" as string,
  company_about: "",
  short_description: "",
});

export function TeamProfilesClient() {
  const [list, setList] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const set = <K extends keyof ReturnType<typeof emptyForm>>(
    key: K,
    value: ReturnType<typeof emptyForm>[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team/create-profile");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setList(data.profiles || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create() {
    if (!form.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (form.role === "employer" && !form.company_name.trim()) {
      toast.error("Company name is required for Company profiles");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/team/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: form.role,
          full_name: form.full_name.trim(),
          username: form.username.trim() || undefined,
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          gender: form.gender || undefined,
          country: form.country.trim() || undefined,
          city: form.city.trim() || undefined,
          location: form.location.trim() || undefined,
          profession: form.profession.trim() || undefined,
          skill_level: form.skill_level || undefined,
          job_interests: form.job_interests
            ? form.job_interests.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
            : undefined,
          available_for_hire: form.role === "seeker" ? form.available_for_hire : false,
          listed_publicly: form.listed_publicly,
          company_name: form.company_name.trim() || undefined,
          company_cr: form.company_cr.trim() || undefined,
          company_website: form.company_website.trim() || undefined,
          company_address: form.company_address.trim() || undefined,
          company_location: form.company_location.trim() || undefined,
          industries: form.industries
            ? form.industries.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
            : undefined,
          services: form.services
            ? form.services.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
            : undefined,
          company_about: form.company_about.trim() || undefined,
          short_description: form.short_description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(
        form.role === "employer"
          ? "Full company profile created (no verification required)"
          : "Full candidate profile created (no verification required)"
      );
      setForm(emptyForm());
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full h-9 rounded-md border border-input bg-background px-2 text-sm";
  const labelCls = "text-xs space-y-1 block";
  const isCompany = form.role === "employer";
  const isSeeker = form.role === "seeker";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team profiles</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create complete candidate or company profiles with the same fields as normal signup —
          <strong className="text-foreground"> without email or phone verification</strong>.
          If a real user later signs up with the same email/phone, the team placeholder is removed automatically.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 space-y-5">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create full profile
        </h2>

        {/* Account type */}
        <div>
          <label className="text-sm font-medium block mb-1.5">Account type</label>
          <select
            className={inputCls}
            value={form.role}
            onChange={(e) =>
              set("role", e.target.value as "seeker" | "employer" | "personal")
            }
          >
            <option value="seeker">Seeker (candidate)</option>
            <option value="employer">Company</option>
            <option value="personal">Personal</option>
          </select>
        </div>

        {/* Personal info */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Personal info
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={`${labelCls} sm:col-span-2`}>
              <span className="text-muted-foreground">Full name *</span>
              <input
                className={inputCls}
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="Ahmed Al-Rashidi"
              />
            </label>
            <label className={labelCls}>
              <span className="text-muted-foreground">Username / handle (optional)</span>
              <input
                className={inputCls}
                value={form.username}
                onChange={(e) =>
                  set(
                    "username",
                    e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                  )
                }
                placeholder="ahmed_hse"
              />
            </label>
            <label className={labelCls}>
              <span className="text-muted-foreground">Gender</span>
              <select
                className={inputCls}
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
              >
                <option value="">—</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not">Prefer not to say</option>
              </select>
            </label>
            <label className={labelCls}>
              <span className="text-muted-foreground">Email (optional — no verification)</span>
              <input
                className={inputCls}
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="optional@email.com"
              />
            </label>
            <label className={labelCls}>
              <span className="text-muted-foreground">Phone (optional — no verification)</span>
              <input
                className={inputCls}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+966 5x xxx xxxx"
              />
            </label>
            <label className={labelCls}>
              <span className="text-muted-foreground">Country</span>
              <input
                className={inputCls}
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                placeholder="Saudi Arabia"
              />
            </label>
            <label className={labelCls}>
              <span className="text-muted-foreground">City</span>
              <input
                className={inputCls}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Riyadh"
              />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              <span className="text-muted-foreground">Location (display)</span>
              <input
                className={inputCls}
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Riyadh, Saudi Arabia"
              />
            </label>
          </div>
        </div>

        {/* Seeker career */}
        {isSeeker && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Career (Seeker)
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={`${labelCls} sm:col-span-2`}>
                <span className="text-muted-foreground">Profession / job title</span>
                <input
                  className={inputCls}
                  value={form.profession}
                  onChange={(e) => set("profession", e.target.value)}
                  placeholder="Fire Alarm Technician"
                />
              </label>
              <label className={labelCls}>
                <span className="text-muted-foreground">Skill level</span>
                <select
                  className={inputCls}
                  value={form.skill_level}
                  onChange={(e) => set("skill_level", e.target.value)}
                >
                  <option value="">—</option>
                  <option value="entry">Entry</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="experienced">Experienced</option>
                  <option value="expert">Expert / Senior</option>
                </select>
              </label>
              <label className={labelCls}>
                <span className="text-muted-foreground">Available for hire</span>
                <select
                  className={inputCls}
                  value={form.available_for_hire ? "yes" : "no"}
                  onChange={(e) => set("available_for_hire", e.target.value === "yes")}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
              <label className={`${labelCls} sm:col-span-2`}>
                <span className="text-muted-foreground">
                  Job interests (comma-separated categories)
                </span>
                <input
                  className={inputCls}
                  value={form.job_interests}
                  onChange={(e) => set("job_interests", e.target.value)}
                  placeholder="engineering, electrical, hse"
                />
              </label>
              <label className={labelCls}>
                <span className="text-muted-foreground">Listed publicly on Candidates</span>
                <select
                  className={inputCls}
                  value={form.listed_publicly ? "yes" : "no"}
                  onChange={(e) => set("listed_publicly", e.target.value === "yes")}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {/* Company */}
        {isCompany && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Company info
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={`${labelCls} sm:col-span-2`}>
                <span className="text-muted-foreground">Company name *</span>
                <input
                  className={inputCls}
                  value={form.company_name}
                  onChange={(e) => set("company_name", e.target.value)}
                  placeholder="Gulf Petro Services"
                />
              </label>
              <label className={labelCls}>
                <span className="text-muted-foreground">CR number</span>
                <input
                  className={inputCls}
                  value={form.company_cr}
                  onChange={(e) => set("company_cr", e.target.value)}
                />
              </label>
              <label className={labelCls}>
                <span className="text-muted-foreground">Website</span>
                <input
                  className={inputCls}
                  value={form.company_website}
                  onChange={(e) => set("company_website", e.target.value)}
                  placeholder="https://"
                />
              </label>
              <label className={`${labelCls} sm:col-span-2`}>
                <span className="text-muted-foreground">Company address</span>
                <input
                  className={inputCls}
                  value={form.company_address}
                  onChange={(e) => set("company_address", e.target.value)}
                />
              </label>
              <label className={`${labelCls} sm:col-span-2`}>
                <span className="text-muted-foreground">Google Maps location link</span>
                <input
                  className={inputCls}
                  value={form.company_location}
                  onChange={(e) => set("company_location", e.target.value)}
                  placeholder="https://maps.google.com/..."
                />
              </label>
              <label className={`${labelCls} sm:col-span-2`}>
                <span className="text-muted-foreground">Industries (comma-separated)</span>
                <input
                  className={inputCls}
                  value={form.industries}
                  onChange={(e) => set("industries", e.target.value)}
                  placeholder="Oil & Gas, Construction"
                />
              </label>
              <label className={`${labelCls} sm:col-span-2`}>
                <span className="text-muted-foreground">Services (comma-separated)</span>
                <input
                  className={inputCls}
                  value={form.services}
                  onChange={(e) => set("services", e.target.value)}
                  placeholder="Installation, Maintenance"
                />
              </label>
              <label className={`${labelCls} sm:col-span-2`}>
                <span className="text-muted-foreground">Short description</span>
                <input
                  className={inputCls}
                  value={form.short_description}
                  onChange={(e) => set("short_description", e.target.value)}
                />
              </label>
              <label className={`${labelCls} sm:col-span-2`}>
                <span className="text-muted-foreground">About company</span>
                <textarea
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                  value={form.company_about}
                  onChange={(e) => set("company_about", e.target.value)}
                />
              </label>
              <label className={labelCls}>
                <span className="text-muted-foreground">Listed in Companies directory</span>
                <select
                  className={inputCls}
                  value={form.listed_publicly ? "yes" : "no"}
                  onChange={(e) => set("listed_publicly", e.target.value === "yes")}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
          Team profiles skip email and phone verification. Optional contact fields are stored for matching when a real user signs up later.
        </div>

        <Button onClick={() => void create()} disabled={saving} className="gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Create full profile (no verification)
        </Button>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Team-managed profiles</h2>
          <Button variant="outline" size="sm" onClick={() => void load()} className="gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !list.length ? (
          <p className="text-sm text-muted-foreground">No team-managed profiles yet.</p>
        ) : (
          <div className="rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Profession</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Location</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{r.full_name}</td>
                    <td className="px-3 py-2">
                      {r.role === "seeker"
                        ? "Seeker"
                        : r.role === "employer"
                          ? "Company"
                          : r.role}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">
                      {r.profession || "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">
                      {r.email?.includes("@team-managed.") ? "—" : r.email}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">
                      {r.phone || "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">
                      {[r.city, r.country].filter(Boolean).join(", ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
