"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase";
import type { AdType } from "@/types/database";

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireAdmin(): Promise<
  | { ok: true; supabase: ReturnType<typeof createAdminClient> }
  | { ok: false; error: string }
> {
  try {
    const { userId } = await auth();
    if (!userId) return { ok: false, error: "You must be signed in." };

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) return { ok: false, error: error.message };
    if (data?.role !== "admin") return { ok: false, error: "Admin access required." };

    return { ok: true, supabase };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Authorization failed.",
    };
  }
}

export async function upsertAdPlacement(formData: {
  id?: string;
  slot_name: string;
  is_active: boolean;
  ad_type: AdType;
  custom_image_url: string;
  custom_redirect_url: string;
  adsense_slot_id: string;
}): Promise<ActionResult> {
  const authResult = await requireAdmin();
  if (!authResult.ok) return authResult;

  const { supabase } = authResult;
  const slotName = (formData.slot_name ?? "").trim().toLowerCase().replace(/\s+/g, "_");

  if (!slotName) {
    return { ok: false, error: "Slot name is required." };
  }
  if (!/^[a-z0-9_]+$/.test(slotName)) {
    return {
      ok: false,
      error: "Slot name must be lowercase letters, numbers, and underscores only.",
    };
  }

  const payload = {
    slot_name: slotName,
    is_active: !!formData.is_active,
    ad_type: formData.ad_type === "custom" ? "custom" : "adsense",
    custom_image_url: (formData.custom_image_url ?? "").trim() || null,
    custom_redirect_url: (formData.custom_redirect_url ?? "").trim() || null,
    adsense_slot_id: (formData.adsense_slot_id ?? "").trim() || null,
  };

  try {
    if (formData.id) {
      const { error } = await supabase
        .from("ad_placements")
        .update(payload)
        .eq("id", formData.id);
      if (error) {
        if (error.code === "23505") {
          return { ok: false, error: `Slot name "${slotName}" already exists.` };
        }
        return { ok: false, error: error.message };
      }
    } else {
      // Prevent duplicate before insert for clearer UX
      const { data: existing } = await supabase
        .from("ad_placements")
        .select("id")
        .eq("slot_name", slotName)
        .maybeSingle();

      if (existing) {
        return {
          ok: false,
          error: `Slot "${slotName}" already exists. Edit the existing slot instead.`,
        };
      }

      const { error } = await supabase.from("ad_placements").insert(payload);
      if (error) {
        if (error.code === "23505") {
          return { ok: false, error: `Slot name "${slotName}" already exists.` };
        }
        return { ok: false, error: error.message };
      }
    }

    revalidatePath("/dashboard/admin/ads");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to save ad slot.",
    };
  }
}

export async function deleteAdPlacement(id: string): Promise<ActionResult> {
  const authResult = await requireAdmin();
  if (!authResult.ok) return authResult;

  try {
    const { error } = await authResult.supabase
      .from("ad_placements")
      .delete()
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/dashboard/admin/ads");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to delete ad slot.",
    };
  }
}
