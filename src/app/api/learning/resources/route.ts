import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

const CATEGORIES = [
  "general",
  "safety_hse",
  "engineering",
  "career_tips",
  "rights_responsibilities",
  "templates",
  "certificates",
  "guides",
] as const;

/** GET — list approved learning resources (public) */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "";
  const q = (searchParams.get("q") ?? "").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(24, Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10)));
  const from = (page - 1) * limit;

  const supabase = createAdminClient();
  let query = supabase
    .from("learning_resources")
    .select(
      "id, title, description, category, file_name, file_type, file_size, download_count, created_at, uploaded_by",
      { count: "exact" }
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (category) query = query.eq("category", category);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,file_name.ilike.%${q}%`);

  const { data, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message, resources: [], total: 0 }, { status: 500 });
  }

  return NextResponse.json({ resources: data ?? [], total: count ?? 0, page, limit });
}

/** POST — create resource row after file uploaded (authenticated) */
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

  const category = CATEGORIES.includes(body.category as (typeof CATEGORIES)[number])
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
      status: "pending",
    })
    .select("id, title, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    resource: data,
    message: "Resource submitted for review. It will appear after approval.",
  });
}
