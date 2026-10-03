"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus, RefreshCw, User, X, Pencil } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

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
  avatar_url?: string | null;
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
  job_interests: "",
  available_for_hire: true,
  listed_publicly: true,
  company_name: "",
  company_cr: "",
  company_website: "",
  company_address: "",
  company_location: "",
  industries: "",
  services: "",
  company_about: "",
  short_description: "",
});

export function TeamProfilesClient() {
  const [list, setList] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

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

  function onPickPhoto(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB.");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function clearPhoto() {
    setAvatarFile(null);
    setAvatarPreview("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function resetForm() {
    setEditId(null);
    setForm(emptyForm());
    clearPhoto();
  }

  async function startEdit(id: string) {
    setLoadingEdit(true);
    try {
      const res = await fetch(`/api/team/create-profile?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load profile");
      const p = data.profile;
      const co = data.company;
      setEditId(id);
      setForm({
        role: (p.role as "seeker" | "employer" | "personal") || "seeker",
        full_name: p.full_name || "",
        username: p.username || "",
        email: p.email?.includes("@team-managed.") ? "" : p.email || "",
        phone: p.phone || "",
        gender: p.gender || "",
        country: p.country || "",
        city: p.city || "",
        location: p.location || "",
        profession: p.profession || "",
        skill_level: p.skill_level || "",
        job_interests: Array.isArray(p.job_interests)
          ? p.job_interests.join(", ")
          : "",
        available_for_hire: p.available_for_hire !== false,
        listed_publicly: p.listed_publicly !== false,
        company_name: co?.name || "",
        company_cr: p.company_cr || "",
        company_website: p.company_website || co?.website || "",
        company_address: p.company_address || "",
        company_location: p.company_location || "",
        industries: Array.isArray(co?.industry) ? co.industry.join(", ") : "",
        services: Array.isArray(co?.services) ? co.services.join(", ") : "",
        company_about: co?.about || "",
        short_description: co?.short_description || "",
      });
      setAvatarFile(null);
      setAvatarPreview(p.avatar_url || co?.logo_url || "");
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      toast.message("Editing profile — update fields then save");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoadingEdit(false);
    }
  }

  async function save() {
    if (!form.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (form.role === "employer" && !form.company_name.trim() && !editId) {
      toast.error("Company name is required for Company profiles");
      return;
    }
    setSaving(true);
    try {
      let avatarUrl: string | undefined;
      let avatarPublicId: string | undefined;
      if (avatarFile) {
        try {
          const up = await uploadToCloudinary(avatarFile, "hunared/avatars");
          avatarUrl = up.url;
          avatarPublicId = up.publicId;
        } catch (e) {
          toast.error(
            e instanceof Error
              ? e.message
              : "Photo upload failed — check Cloudinary env vars"
          );
          setSaving(false);
          return;
        }
      }

      const payload: Record<string, unknown> = {
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
        available_for_hire:
          form.role === "seeker" ? form.available_for_hire : false,
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
      };
      if (avatarUrl) {
        payload.avatar_url = avatarUrl;
        payload.avatar_public_id = avatarPublicId;
      }

      const isEdit = Boolean(editId);
      if (isEdit) payload.id = editId;

      const res = await fetch("/api/team/create-profile", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(isEdit ? "Profile updated" : "Profile created (no verification)");
      resetForm();
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full h-10 rounded-md border border-input bg-background px-3 text-sm";
  const labelCls = "text-xs space-y-1 block";
  const isCompany = form.role === "employer";
  const isSeeker = form.role === "seeker";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team profiles</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create and <strong className="text-foreground">edit</strong> full candidate/company
          profiles without email or phone verification.
        </p>
      </div>

      <section
        ref={formTopRef}
        className="rounded-xl border border-border bg-card p-5 space-y-6"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            {editId ? (
              <>
                <Pencil className="h-4 w-4" /> Edit profile
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Create full profile
              </>
            )}
          </h2>
          {editId && (
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              Cancel edit
            </Button>
          )}
        </div>

        {/* Account type — locked while editing */}
        <div>
          <label className="text-sm font-medium block mb-1.5">Account type</label>
          <select
            className={inputCls}
            value={form.role}
            disabled={Boolean(editId)}
            onChange={(e) =>
              set("role", e.target.value as "seeker" | "employer" | "personal")
            }
          >
            <option value="seeker">Seeker (candidate)</option>
            <option value="employer">Company</option>
            <option value="personal">Personal</option>
          </select>
          {editId && (
            <p className="text-xs text-muted-foreground mt-1">
              Account type cannot be changed while editing.
            </p>
          )}
        </div>

        {/* Photo */}
        <div className="flex items-center gap-5 p-4 rounded-xl border border-border bg-background/50">
          <div className="relative shrink-0">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="Preview"
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
                onClick={clearPhoto}
                className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"
                aria-label="Remove photo"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium mb-1">
              {isCompany ? "Company logo / profile photo" : "Profile photo"}
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Optional · max 10MB · {editId ? "upload a new file to replace" : "no verification"}
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              className="hidden"
              onChange={(e) => onPickPhoto(e.target.files?.[0] || null)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              {editId ? "Change photo" : "Upload photo"}
            </Button>
          </div>
        </div>

        {/* Personal */}
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
              />
            </label>
            <label className={labelCls}>
              <span className="text-muted-foreground">Username / handle</span>
              <input
                className={inputCls}
                value={form.username}
                onChange={(e) =>
                  set(
                    "username",
                    e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                  )
                }
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
              <span className="text-muted-foreground">Email (optional · not verified)</span>
              <input
                className={inputCls}
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </label>
            <label className={labelCls}>
              <span className="text-muted-foreground">Phone (optional · not verified)</span>
              <input
                className={inputCls}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </label>
            <label className={labelCls}>
              <span className="text-muted-foreground">Country</span>
              <input
                className={inputCls}
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
              />
            </label>
            <label className={labelCls}>
              <span className="text-muted-foreground">City</span>
              <input
                className={inputCls}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              <span className="text-muted-foreground">Location (display text)</span>
              <input
                className={inputCls}
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </label>
          </div>
        </div>

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
                <span className="text-muted-foreground">Job interests (comma-separated)</span>
                <input
                  className={inputCls}
                  value={form.job_interests}
                  onChange={(e) => set("job_interests", e.target.value)}
                />
              </label>
              <label className={labelCls}>
                <span className="text-muted-foreground">Show on Candidates</span>
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
                <span className="text-muted-foreground">Google Maps link</span>
                <input
                  className={inputCls}
                  value={form.company_location}
                  onChange={(e) => set("company_location", e.target.value)}
                />
              </label>
              <label className={`${labelCls} sm:col-span-2`}>
                <span className="text-muted-foreground">Industries (comma-separated)</span>
                <input
                  className={inputCls}
                  value={form.industries}
                  onChange={(e) => set("industries", e.target.value)}
                />
              </label>
              <label className={`${labelCls} sm:col-span-2`}>
                <span className="text-muted-foreground">Services (comma-separated)</span>
                <input
                  className={inputCls}
                  value={form.services}
                  onChange={(e) => set("services", e.target.value)}
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
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.company_about}
                  onChange={(e) => set("company_about", e.target.value)}
                />
              </label>
              <label className={labelCls}>
                <span className="text-muted-foreground">Show in Companies directory</span>
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

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void save()} disabled={saving || loadingEdit} className="gap-2">
            {(saving || loadingEdit) && <Loader2 className="h-4 w-4 animate-spin" />}
            {editId ? "Save changes" : "Create full profile (no verification)"}
          </Button>
          {editId && (
            <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
              Cancel
            </Button>
          )}
        </div>
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
                  <th className="px-3 py-2">Photo</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Profession</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr
                    key={r.id}
                    className={`border-t border-border ${editId === r.id ? "bg-primary/5" : ""}`}
                  >
                    <td className="px-3 py-2">
                      {r.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.avatar_url}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted" />
                      )}
                    </td>
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
                      {[r.city, r.country].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1 h-8"
                        disabled={loadingEdit}
                        onClick={() => void startEdit(r.id)}
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
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
