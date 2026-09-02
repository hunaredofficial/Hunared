import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { deleteCv } from "@/lib/storage";
import type { UserRole, Database } from "@/types/database";
import { isOfficialAdminEmail } from "@/lib/adminEmails";

// This route MUST remain public in the Clerk middleware.
// It syncs Clerk user lifecycle events to the Supabase `profiles` table.

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Webhook] CLERK_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // ── Verify signature ────────────────────────────────────────
  const headerPayload = await headers();
  const svixId        = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();
  let event: WebhookEvent;

  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // ── Handle events ───────────────────────────────────────────
  switch (event.type) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name, unsafe_metadata } = event.data;
      const email = email_addresses[0]?.email_address ?? "";
      const fullName = [first_name, last_name].filter(Boolean).join(" ") || "New User";
      // Role from metadata; official admin email always becomes admin
      let role = (event.data.public_metadata?.role as UserRole) ?? "seeker";
      if (isOfficialAdminEmail(email)) {
        role = "admin";
      }

      const { error } = await supabase.from("profiles").upsert({
        id,
        role,
        full_name: fullName,
        email,
        // username may be set during onboarding; not available at creation yet
        username: (unsafe_metadata?.username as string) ?? null,
      });

      if (error) {
        console.error("[Webhook] user.created insert failed:", error.message);
        return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
      }
      break;
    }

    case "user.updated": {
      const { id, email_addresses, first_name, last_name, public_metadata } = event.data;
      const email = email_addresses[0]?.email_address ?? "";
      const fullName = [first_name, last_name].filter(Boolean).join(" ");
      let role = (public_metadata?.role as UserRole) ?? undefined;
      if (isOfficialAdminEmail(email)) {
        role = "admin";
      }

      const updatePayload: Database["public"]["Tables"]["profiles"]["Update"] = { email };
      if (fullName) updatePayload.full_name = fullName;
      if (role)     updatePayload.role = role;

      const { error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", id);

      if (error) {
        console.error("[Webhook] user.updated failed:", error.message);
      }
      break;
    }

    case "user.deleted": {
      // Clerk has deleted the user (e.g. from Clerk dashboard directly).
      // Clean up Supabase profile row. CV cleanup should have happened
      // via the admin "permanent delete" flow, but we do a safety cleanup here.
      const { id } = event.data;
      if (!id) break;

      // Fetch any CV path before deleting
      const { data: profile } = await supabase
        .from("profiles")
        .select("cv_url")
        .eq("id", id)
        .single();

      if (profile?.cv_url) {
        // cv_url stores the storage path (not the signed URL)
        try {
          await deleteCv(profile.cv_url);
        } catch (e) {
          console.error("[Webhook] CV cleanup failed:", e);
        }
      }

      await supabase.from("profiles").delete().eq("id", id);
      break;
    }

    default:
      // Unhandled event type — acknowledge and ignore
      break;
  }

  return NextResponse.json({ received: true });
}
