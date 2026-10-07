import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

/**
 * Lightweight: push key CV fields into the seeker's candidate profile.
 * Does not require the full /api/profile/save registration payload.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  let body: {
    fullName?: string;
    profession?: string;
    skills?: string[];
    phone?: string;
    location?: string;
    summary?: string;
    languages?: string[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: profile, error: fetchErr } = await supabase
    .from("profiles")
    .select("id, role, full_name, profession, skills, phone, city, country, bio, languages, job_interests")
    .eq("id", userId)
    .maybeSingle();

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!profile) {
    return NextResponse.json(
      { error: "Complete your Hunared profile first, then try again." },
      { status: 400 }
    );
  }
  if (profile.role !== "seeker") {
    return NextResponse.json(
      { error: "Add to profile is only available for Seeker accounts." },
      { status: 403 }
    );
  }

  const location = (body.location || "").trim();
  let city: string | undefined;
  let country: string | undefined;
  if (location) {
    const parts = location.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      city = parts[0];
      country = parts.slice(1).join(", ");
    } else if (parts.length === 1) {
      city = parts[0];
    }
  }

  const skills = Array.isArray(body.skills)
    ? body.skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 40)
    : undefined;
  const languages = Array.isArray(body.languages)
    ? body.languages.map((s) => String(s).trim()).filter(Boolean).slice(0, 20)
    : undefined;

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.fullName?.trim()) patch.full_name = body.fullName.trim();
  if (body.profession?.trim()) {
    patch.profession = body.profession.trim();
    // keep job_interests useful for talent filters
    const existing = Array.isArray(profile.job_interests)
      ? (profile.job_interests as string[])
      : [];
    if (!existing.includes(body.profession.trim())) {
      patch.job_interests = [body.profession.trim(), ...existing].slice(0, 8);
    }
  }
  if (skills?.length) patch.skills = skills;
  if (languages?.length) patch.languages = languages;
  if (body.phone?.trim()) patch.phone = body.phone.trim();
  if (city) patch.city = city;
  if (body.summary?.trim()) patch.bio = body.summary.trim().slice(0, 2000);

  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "Candidate profile updated from your CV.",
  });
}
