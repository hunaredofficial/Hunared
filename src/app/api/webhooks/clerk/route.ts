import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { deleteCv } from "@/lib/storage";
import type { UserRole, Database } from "@/types/database";

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Webhook] CLERK_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
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

  switch (event.type) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name, unsafe_metadata } = event.data;
      const email = email_addresses[0]?.email_address ?? "";
      const fullName = [first_name, last_name].filter(Boolean).join(" ") || "New User";
      const role = (event.data.public_metadata?.role as UserRole) ?? "seeker";

      const { error } = await supabase.from("profiles").upsert({
        id,
        role,
        full_name: fullName,
        email,
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
      const role = (public_metadata?.role as UserRole) ?? undefined;

      const updatePayload: Database["public"]["Tables"]["profiles"]["Update"] = { email };
      if (fullName) updatePayload.full_name = fullName;
      if (role) updatePayload.role = role;

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
      const { id } = event.data;
      if (!id) break;

      const { data: profile } = await supabase
        .from("profiles")
        .select("cv_url")
        .eq("id", id)
        .maybeSingle();

      if (profile?.cv_url) {
        try {
          await deleteCv(profile.cv_url);
        } catch (e) {
          console.error("[Webhook] CV cleanup failed:", e);
        }
      }

      // Permanent delete frees email for re-registration
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) {
        console.error("[Webhook] user.deleted profile delete failed:", error.message);
        return NextResponse.json({ error: "DB delete failed" }, { status: 500 });
      }

      console.log("[Webhook] user.deleted — profile permanently removed:", id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
