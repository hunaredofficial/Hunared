import { NextRequest, NextResponse } from "next/server";
import { importCvFromText } from "@/lib/cv/ai-fill";
import type { CvData } from "@/lib/cv/types";

/**
 * Accepts JSON { text, current? } — client extracts text from files.
 * Does not invent facts. PDF binary parsing is client-assisted (paste/extract).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = String((body as { text?: string }).text || "").slice(0, 100000);
    const current = (body as { current?: Partial<CvData> }).current;
    if (!text.trim()) {
      return NextResponse.json({ error: "text required" }, { status: 400 });
    }
    const cv = importCvFromText(text, current);
    return NextResponse.json({ cv, chars: text.length });
  } catch (e) {
    console.error("[cv/parse]", e);
    return NextResponse.json({ error: "Parse failed" }, { status: 500 });
  }
}
