"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus, RefreshCw } from "lucide-react";

type Row = {
  id: string;
  full_name: string;
  role: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  profession: string | null;
  created_at?: string;
};

export function TeamProfilesClient() {
  const [list, setList] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    role: "seeker",
    full_name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    profession: "",
    company_name: "",
    company_website: "",
    company_about: "",
  });

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
      toast.error("Name is required");
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
          full_name: form.full_name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          country: form.country || undefined,
          city: form.city || undefined,
          profession: form.profession || undefined,
          company_name: form.company_name || undefined,
          company_website: form.company_website || undefined,
          company_about: form.company_about || undefined,
          listed_publicly: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(
        form.role === "employer"
          ? "Company profile created (team-managed, no verification)"
          : "Candidate profile created (team-managed, no verification)"
      );
      setForm({
        role: "seeker",
        full_name: "",
        email: "",
        phone: "",
        country: "",
        city: "",
        profession: "",
        company_name: "",
        company_website: "",
        company_about: "",
      });
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team profiles</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create candidate or company profiles without email/phone verification.
          When a real user signs up with the same email or phone, the team placeholder is removed automatically.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create profile
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">Type</span>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="seeker">Seeker (candidate)</option>
              <option value="employer">Company</option>
              <option value="personal">Personal</option>
            </select>
          </label>
          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">Full name *</span>
            <input
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            />
          </label>
          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">Email (optional)</span>
            <input
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Optional — used later if real user signs up"
            />
          </label>
          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">Phone (optional)</span>
            <input
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </label>
          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">Country</span>
            <input
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            />
          </label>
          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">City</span>
            <input
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </label>
          <label className="text-xs space-y-1 sm:col-span-2">
            <span className="text-muted-foreground">Profession / title</span>
            <input
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={form.profession}
              onChange={(e) => setForm((f) => ({ ...f, profession: e.target.value }))}
            />
          </label>
          {form.role === "employer" && (
            <>
              <label className="text-xs space-y-1 sm:col-span-2">
                <span className="text-muted-foreground">Company name *</span>
                <input
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={form.company_name}
                  onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                />
              </label>
              <label className="text-xs space-y-1">
                <span className="text-muted-foreground">Website</span>
                <input
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={form.company_website}
                  onChange={(e) => setForm((f) => ({ ...f, company_website: e.target.value }))}
                />
              </label>
              <label className="text-xs space-y-1">
                <span className="text-muted-foreground">About</span>
                <input
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={form.company_about}
                  onChange={(e) => setForm((f) => ({ ...f, company_about: e.target.value }))}
                />
              </label>
            </>
          )}
        </div>
        <Button onClick={() => void create()} disabled={saving} className="gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Create without verification
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
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Location</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{r.full_name}</td>
                    <td className="px-3 py-2 capitalize">{r.role === "seeker" ? "Seeker" : r.role === "employer" ? "Company" : r.role}</td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">
                      {r.email?.includes("@team-managed.") ? "—" : r.email}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">{r.phone || "—"}</td>
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
