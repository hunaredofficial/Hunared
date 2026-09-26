import { NextRequest, NextResponse } from "next/server";
import { understandCv } from "@/lib/cv/understand-cv";
import type { CvData } from "@/lib/cv/types";

/**
 * Deep-parse uploaded/pasted CV text into structured fields + document HTML.
 * Does not invent employers, dates, or credentials.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = String((body as { text?: string }).text || "").slice(0, 200000);
    const current = (body as { current?: Partial<CvData> }).current;
    if (!text.trim()) {
      return NextResponse.json({ error: "text required" }, { status: 400 });
    }
    const understood = understandCv(text, current);
    return NextResponse.json({
      cv: understood.data,
      documentHtml: understood.documentHtml,
      sectionsFound: understood.sectionsFound,
      experienceCount: understood.experienceCount,
      chars: text.length,
    });
  } catch (e) {
    console.error("[cv/parse]", e);
    return NextResponse.json({ error: "Parse failed" }, { status: 500 });
  }
}
