import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { COUNTRIES } from "@/lib/countries";
import { JOB_CATEGORIES } from "@/lib/constants";
import type { UserRole } from "@/types/database";

const SKILL_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
  "Master",
] as const;

interface SaveProfileBody {
  role: UserRole;
  fullName: string;
  username?: string | null;
  phone?: string | null;
  gender?: string | null;
  location?: string | null;
  country?: string | null;
  city?: string | null;
  profession?: string | null;
  jobInterests?: string[] | null;
  skillLevel?: string | null;
  skill_level?: string | null;
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
  cvUrl?: string | null;
  companyCr?: string | null;
  companyWebsite?: string | null;
  companyAddress?: string | null;
  availableForHire?: boolean;
  industries?: string[] | null;
  services?: string[] | null;
  mapLocation?: string | null;
}

function normalizeUsername(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const u = raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  return u.length >= 3 ? u : null;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      {
        error:
          "Unauthorized. Please sign in again. If you just verified email, wait 2 seconds and click Complete Registration again.",
      },
      { status: 401 }
    );
  }

  let body: SaveProfileBody;
  try {
    body = (await req.json()) as SaveProfileBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.fullName?.trim() || !body.role) {
    return NextResponse.json(
      { error: "fullName and role are required" },
      { status: 400 }
    );
  }

  const validRoles: UserRole[] = ["seeker", "employer", "personal", "admin"];
  if (!validRoles.includes(body.role) || body.role === "admin") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (body.country && !COUNTRIES.some((c) => c.code === body.country)) {
    return NextResponse.json({ error: "Invalid country" }, { status: 400 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  const username = normalizeUsername(body.username);
  if (!username) {
    return NextResponse.json(
      { error: "Username / handle is required (min 3 characters)." },
      { status: 400 }
    );
  }

  const phone = body.phone?.trim() ?? "";
  const isSeeker = body.role === "seeker";
  const isEmployer = body.role === "employer";

  // Phone required for employers; optional for seekers
  if (isEmployer && (!phone || phone.replace(/\D/g, "").length < 7)) {
    return NextResponse.json(
      { error: "A valid company phone number is required." },
      { status: 400 }
    );
  }
  if (phone && phone.replace(/\D/g, "").length < 7) {
    return NextResponse.json(
      { error: "Please enter a valid phone number or leave it empty." },
      { status: 400 }
    );
  }

  if (!body.country) {
    return NextResponse.json({ error: "Country is required." }, { status: 400 });
  }
  // City optional

  
  let jobInterests: string[] = Array.isArray(body.jobInterests)
    ? [
        ...new Set(
          body.jobInterests
            .map((c) => String(c).trim())
            .filter((c) => (JOB_CATEGORIES as readonly string[]).includes(c))
        ),
      ]
    : [];

  if (isSeeker && jobInterests.length === 0 && body.profession) {
    const p = body.profession.trim();
    if ((JOB_CATEGORIES as readonly string[]).includes(p)) {
      jobInterests = [p];
    }
  }

  if (isSeeker && jobInterests.length === 0) {
    return NextResponse.json(
      { error: "Select at least one profession / job category." },
      { status: 400 }
    );
  }

  const skillLevel =
    body.skillLevel?.trim() || body.skill_level?.trim() || null;
  if (isSeeker) {
    if (!skillLevel || !(SKILL_LEVELS as readonly string[]).includes(skillLevel)) {
      return NextResponse.json(
        { error: "Skill level is required (Beginner–Master)." },
        { status: 400 }
      );
    }
  }

  if (isSeeker && typeof body.availableForHire !== "boolean") {
    return NextResponse.json(
      { error: "Availability (for hire / unavailable) is required." },
      { status: 400 }
    );
  }

  if (isEmployer) {
    const industries = Array.isArray(body.industries) ? body.industries : [];
    const services = Array.isArray(body.services) ? body.services : [];
    if (industries.length === 0) {
      return NextResponse.json(
        { error: "Select at least one industry." },
        { status: 400 }
      );
    }
    if (services.length === 0) {
      return NextResponse.json(
        { error: "Select at least one service." },
        { status: 400 }
      );
    }
  }

  const supabase = createAdminClient();

  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .neq("id", userId)
    .limit(1);

  if (existingUser && existingUser.length > 0) {
    return NextResponse.json(
      { error: "Username is already taken. Please choose another." },
      { status: 409 }
    );
  }

  const location = [
    body.city?.trim() || "",
    COUNTRIES.find((c) => c.code === body.country)?.name || "",
  ]
    .filter(Boolean)
    .join(", ");

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      role: body.role,
      full_name: body.fullName.trim(),
      email,
      username,
      phone,
      gender: body.gender ?? null,
      location: body.location?.trim() || location,
      country: body.country,
      city: body.city?.trim() || null,
      profession: isSeeker
        ? jobInterests[0] ?? body.profession ?? null
        : body.profession ?? null,
      job_interests: isSeeker ? jobInterests : [],
      skill_level: isSeeker ? skillLevel : null,
      avatar_url: body.avatarUrl ?? null,
      avatar_public_id: body.avatarPublicId ?? null,
      cv_url: body.cvUrl ?? null,
      company_cr: body.companyCr ?? null,
      company_website: body.companyWebsite ?? null,
      company_address: body.companyAddress ?? null,
      available_for_hire: isSeeker
        ? Boolean(body.availableForHire)
        : true,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("[profile/save] Supabase error:", error);

    if (error.code === "23505") {
      if (error.message?.includes("email")) {
        return NextResponse.json(
          {
            error:
              "This email is already registered. Please sign in instead.",
          },
          { status: 409 }
        );
      }
      if (error.message?.includes("username")) {
        return NextResponse.json(
          { error: "Username is already taken. Please choose another." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "A profile with this information already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to save profile. Please try again." },
      { status: 500 }
    );
  }

  if (isEmployer) {
    const industries = Array.isArray(body.industries)
      ? [...new Set(body.industries.map((s) => String(s).trim()).filter(Boolean))]
      : [];
    const services = Array.isArray(body.services)
      ? [...new Set(body.services.map((s) => String(s).trim()).filter(Boolean))]
      : [];

    const slugBase =
      username ||
      body.fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const countryName =
      COUNTRIES.find((c) => c.code === body.country)?.name ?? body.country;

    try {
      const { data: existingCo } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", userId)
        .limit(1);

      if (existingCo && existingCo.length > 0) {
        await supabase
          .from("companies")
          .update({
            name: body.fullName.trim(),
            industry: industries,
            services,
            services_count: services.length,
            headquarters_country: countryName,
            headquarters_country_code: body.country,
            headquarters_city: body.city?.trim() || null,
            phone: phone || null,
            email: email || null,
            website: body.companyWebsite || null,
            logo_url: body.avatarUrl || null,
            logo_public_id: body.avatarPublicId || null,
            headquarters_address: body.mapLocation || body.companyAddress || null,
            updated_at: new Date().toISOString(),
          })
          .eq("owner_id", userId);
      } else {
        await supabase.from("companies").insert({
          owner_id: userId,
          name: body.fullName.trim(),
          slug: `${slugBase}-${userId.slice(-6)}`.slice(0, 60),
          industry: industries,
          services,
          services_count: services.length,
          headquarters_country: countryName,
          headquarters_country_code: body.country,
          headquarters_city: body.city?.trim() || null,
          phone: phone || null,
          email: email || null,
          website: body.companyWebsite || null,
          logo_url: body.avatarUrl || null,
          logo_public_id: body.avatarPublicId || null,
          headquarters_address: body.mapLocation || body.companyAddress || null,
          status: "active",
        });
      }
    } catch (e) {
      console.error("[profile/save] company upsert non-fatal:", e);
    }
  }

  return NextResponse.json({ success: true });
}
