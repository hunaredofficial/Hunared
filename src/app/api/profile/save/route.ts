import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { COUNTRIES } from "@/lib/countries";
import type { UserRole } from "@/types/database";

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
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
  cvUrl?: string | null;
  companyCr?: string | null;
  companyWebsite?: string | null;
  companyAddress?: string | null;
  availableForHire?: boolean;
}

export async function POST(req: Request) {
  console.log("==== SAVE PROFILE API CALLED ====");

  const { userId } = await auth();
  console.log("User ID:", userId);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  // Validate role
  const validRoles: UserRole[] = ["seeker", "employer", "personal", "admin"];
  if (!validRoles.includes(body.role) || body.role === "admin") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Country is optional, but if provided it must be a valid ISO code
  if (body.country && !COUNTRIES.some((c) => c.code === body.country)) {
    return NextResponse.json({ error: "Invalid country" }, { status: 400 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  const supabase = createAdminClient();

  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    role: body.role,
    full_name: body.fullName.trim(),
    email,
    username: body.username?.trim() ?? null,
    phone: body.phone?.trim() ?? null,
    gender: body.gender ?? null,
    location: body.location ?? null,
    country: body.country ?? null,
    city: body.city?.trim() ?? null,
    profession: body.profession ?? null,
    job_interests: body.jobInterests ?? [],
    avatar_url: body.avatarUrl ?? null,
    avatar_public_id: body.avatarPublicId ?? null,
    cv_url: body.cvUrl ?? null,
    company_cr: body.companyCr ?? null,
    company_website: body.companyWebsite ?? null,
    company_address: body.companyAddress ?? null,
    available_for_hire:
      typeof body.availableForHire === "boolean"
        ? body.availableForHire
        : true,
  });

  if (error) {
    console.error("[profile/save] Supabase error:", error);

    // Detect duplicate email (PostgreSQL unique violation code 23505)
    if (
      error.code === "23505" &&
      error.message.includes("profiles_email_key")
    ) {
      return NextResponse.json(
        {
          error:
            "This email is already registered. Please sign in instead.",
        },
        { status: 409 }
      );
    }

    // Other errors
    return NextResponse.json(
      { error: "Failed to save profile. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}