import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import type { Database } from "@/types/database";

type JobUpdate = Database["public"]["Tables"]["jobs"]["Update"];

/* ── GET: single job (public) ─────────────────────────────── */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  return NextResponse.json(data);
}

/* ── PATCH: update job (employer/admin) ──────────────────── */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  // Confirm ownership or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const { data: job } = await supabase
    .from("jobs")
    .select("employer_id")
    .eq("id", id)
    .single();

  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (profile?.role !== "admin" && job.employer_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as Record<string, unknown>;

  // Only allow updating these fields (whitelist)
  const allowed: (keyof JobUpdate)[] = [
    "job_title", "job_description", "positions", "location",
    "country", "city",
    "employment_type", "duration", "salary_rate", "salary_type", "category", "subcategory",
    "company_name", "company_phone", "company_email", "company_address", "show_profile_contact",
    "office_lat", "office_lng", "office_address",
    "work_location", "office_location_link",
    "status",
  ];
  const updateData: JobUpdate = {};
  for (const key of allowed) {
    if (key in body) (updateData as Record<string, unknown>)[key] = body[key as string];
  }

  // Admin can change status freely; employers can only set 'closed'
  if (profile?.role !== "admin") {
    if ("status" in updateData && updateData.status !== "closed") {
      delete updateData["status"];
    }
    // When employer edits actual job fields, reset status based on auto-approve
    const hasFieldEdits = Object.keys(updateData).some((k) => k !== "status");
    if (hasFieldEdits) {
      const { data: settings } = await supabase
        .from("site_settings")
        .select("auto_approve_jobs")
        .single();
      updateData.status = settings?.auto_approve_jobs ? "approved" : "pending";
    }
  }

  const { error } = await supabase
    .from("jobs")
    .update(updateData)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

/* ── DELETE: soft-delete job ─────────────────────────────── */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const { data: job } = await supabase
    .from("jobs")
    .select("employer_id")
    .eq("id", id)
    .single();

  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (profile?.role !== "admin" && job.employer_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await supabase.from("saved_items").delete().eq("item_type", "job").eq("item_id", id);
  } catch {
    /* ignore */
  }
  try {
    await supabase.from("saved_jobs").delete().eq("job_id", id);
  } catch {
    /* ignore */
  }
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
