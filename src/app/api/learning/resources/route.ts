import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export const RESOURCE_CATEGORIES = [
  "general",
  "safety_hse",
  "engineering",
  "career_tips",
  "rights_responsibilities",
  "soft_skills",
  "industry_news",
  "templates",
  "guides",
  "certificates",
  "checklists",
  "forms",
  "training_materials",
  "procedures",
] as const;

/** GET — approved resources; signed-in users also see their own pending */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "";
  const q = (searchParams.get("q") ?? "").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(24, Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10)));
  const from = (page - 1) * limit;

  const mine = searchParams.get("mine") === "1" || searchParams.get("mine") === "true";
  const { userId } = await auth();
  const supabase = createAdminClient();

  let query = supabase
    .from("learning_resources")
    .select(
      "id, title, description, category, file_name, file_type, file_size, download_count, created_at, uploaded_by, status",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (mine) {
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", resources: [], total: 0 }, { status: 401 });
    }
    query = query.eq("uploaded_by", userId);
  } else if (userId) {
    query = query.or(`status.eq.approved,uploaded_by.eq.${userId}`);
  } else {
    query = query.eq("status", "approved");
  }

  if (category) query = query.eq("category", category);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,file_name.ilike.%${q}%`);

  const { data, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message, resources: [], total: 0 }, { status: 500 });
  }

  return NextResponse.json({ resources: data ?? [], total: count ?? 0, page, limit });
}

/** POST — create resource after file upload (visible immediately as approved) */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    title?: string;
    description?: string;
    category?: string;
    file_path?: string;
    file_name?: string;
    file_type?: string;
    file_size?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const file_path = (body.file_path ?? "").trim();
  const file_name = (body.file_name ?? "").trim();
  if (!title || !file_path || !file_name) {
    return NextResponse.json(
      { error: "title, file_path and file_name are required" },
      { status: 400 }
    );
  }

  const category = (RESOURCE_CATEGORIES as readonly string[]).includes(body.category ?? "")
    ? (body.category as string)
    : "general";

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("learning_resources")
    .insert({
      title,
      description: (body.description ?? "").trim() || null,
      category,
      file_path,
      file_name,
      file_type: body.file_type || null,
      file_size: body.file_size ?? 0,
      uploaded_by: userId,
      status: "approved",
    })
    .select("id, title, status, category, file_name, file_size, download_count, created_at, description, file_type, uploaded_by")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    resource: data,
    message: "Resource published to the Learning library.",
  });
}
