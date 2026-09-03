import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAndSendOtp, type VerifyChannel } from "@/lib/verification";

export async function POST(req: NextRequest) {
  let body: { channel?: string; destination?: string; purpose?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const channel = body.channel as VerifyChannel;
  if (channel !== "email" && channel !== "phone") {
    return NextResponse.json({ error: "Invalid channel" }, { status: 400 });
  }
  const destination = String(body.destination || "").trim();
  if (!destination) {
    return NextResponse.json({ error: "Destination required" }, { status: 400 });
  }
  const purpose = String(body.purpose || "generic").trim() || "generic";

  const { userId } = await auth();
  const result = await createAndSendOtp({
    channel,
    destination,
    purpose,
    userId: userId ?? null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
