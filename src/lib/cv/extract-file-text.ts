/**
 * Extract readable text from uploaded CV files in the browser.
 * PDFs: pull text from content streams (not raw binary dump).
 * DOCX: read word/document.xml from the zip package.
 * TXT/MD: plain text.
 */

/** Strip PDF structural noise that looks like "%PDF-1.4 /Type /Catalog" */
function isPdfJunkLine(line: string): boolean {
  const t = line.trim();
  if (!t) return true;
  if (/^%PDF/i.test(t)) return true;
  if (/^endobj$/i.test(t)) return true;
  if (/^xref$/i.test(t)) return true;
  if (/^trailer$/i.test(t)) return true;
  if (/^startxref$/i.test(t)) return true;
  if (/^\d+\s+\d+\s+obj$/i.test(t)) return true;
  if (/^<<$/.test(t) || /^>>$/.test(t)) return true;
  if (/^\/[A-Za-z]/.test(t) && t.length < 80 && !/\s{2,}/.test(t)) {
    // PDF name tokens like /Type /Catalog /Pages
    if (/^\/(Type|Pages|Page|Catalog|Metadata|StructTreeRoot|MarkInfo|Lang|ViewerPreferences|Outlines|OutputIntents|Title|Creator|Producer|CreationDate|ModDate|Keywords|Author|Subject|Filter|Length|Font|MediaBox|Parent|Kids|Count|Resources|Contents|ProcSet|ExtGState|XObject|ColorSpace|Pattern|Shading|FontDescriptor|BaseFont|Encoding|ToUnicode|Widths|FirstChar|LastChar|Subtype|Name|Root|Info|Size|ID|Prev|Encrypt)/i.test(t)) {
      return true;
    }
  }
  // High ratio of / and numbers → PDF dict junk
  const slash = (t.match(/\//g) || []).length;
  if (slash >= 3 && t.length < 120) return true;
  if (/stream\s*$/i.test(t) || /^endstream$/i.test(t)) return true;
  return false;
}

/**
 * Extract text operators from a PDF content stream string.
 * Handles (literal strings) and <hex strings> used by Tj / TJ / ' / "
 */
function extractFromContentStream(stream: string): string[] {
  const parts: string[] = [];
  // Literal strings: (....) with basic escape support
  const lit = /\((?:\\.|[^\\)])*\)\s*Tj/g;
  let m: RegExpExecArray | null;
  while ((m = lit.exec(stream))) {
    const raw = m[0].slice(1, m[0].lastIndexOf(")"));
    const unescaped = raw
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "")
      .replace(/\\t/g, "\t")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\")
      .replace(/\\(\d{1,3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)));
    if (unescaped.trim()) parts.push(unescaped);
  }
  // TJ arrays: [(Hello) -10 (World)] TJ
  const tjArr = /\[([^\]]*)\]\s*TJ/g;
  while ((m = tjArr.exec(stream))) {
    const inner = m[1];
    const bits = inner.match(/\((?:\\.|[^\\)])*\)/g) || [];
    const joined = bits
      .map((b) =>
        b
          .slice(1, -1)
          .replace(/\\n/g, "\n")
          .replace(/\\\(/g, "(")
          .replace(/\\\)/g, ")")
          .replace(/\\\\/g, "\\")
      )
      .join("");
    if (joined.trim()) parts.push(joined);
  }
  // Hex strings <48454C4C4F> Tj
  const hex = /<([0-9A-Fa-f]+)>\s*Tj/g;
  while ((m = hex.exec(stream))) {
    const hexStr = m[1];
    let s = "";
    for (let i = 0; i + 1 < hexStr.length; i += 2) {
      s += String.fromCharCode(parseInt(hexStr.slice(i, i + 2), 16));
    }
    if (s.trim()) parts.push(s);
  }
  return parts;
}

export async function extractTextFromFile(file: File): Promise<{ text: string; method: string }> {
  const name = file.name.toLowerCase();

  if (
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    name.endsWith(".rtf") ||
    file.type.startsWith("text/")
  ) {
    return { text: await file.text(), method: "text" };
  }

  if (name.endsWith(".docx")) {
    try {
      const buf = await file.arrayBuffer();
      const text = await extractDocxText(buf);
      if (text.trim().length > 40) return { text, method: "docx" };
    } catch {
      /* fall through */
    }
  }

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const buf = await file.arrayBuffer();
    // Try pdf.js (CDN) for compressed Canva/modern PDFs
    try {
      const fromPdfJs = await extractWithPdfJs(buf);
      if (fromPdfJs.trim().length > 40) return { text: fromPdfJs, method: "pdfjs" };
    } catch {
      /* offline / blocked CDN */
    }
    const text = extractPdfText(buf);
    if (text.trim().length > 40) return { text, method: "pdf" };
  }

  // Last resort: filtered latin decode (never return raw %PDF dump to UI)
  const buf = await file.arrayBuffer();
  const decoded = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  const lines = decoded
    .replace(/\u0000/g, "\n")
    .split(/\r?\n/)
    .map((l) => l.replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u024F]/g, "").trim())
    .filter((l) => l.length > 1 && !isPdfJunkLine(l));
  const text = lines.join("\n");
  return { text: text.slice(0, 60000), method: "fallback" };
}


async function extractWithPdfJs(buf: ArrayBuffer): Promise<string> {
  // Load pdf.js from CDN only when needed (no package.json change)
  const w = window as unknown as {
    pdfjsLib?: {
      getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str?: string }[] }> }> }> };
      GlobalWorkerOptions: { workerSrc: string };
    };
  };
  if (!w.pdfjsLib) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("pdf.js load failed"));
      document.head.appendChild(s);
    });
  }
  const pdfjsLib = (window as unknown as { pdfjsLib: NonNullable<typeof w.pdfjsLib> }).pdfjsLib;
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const pdf = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
  const pageTexts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    type Item = { str?: string; transform?: number[] };
    const items = content.items as Item[];
    // Group by approximate Y (transform[5]) so CV lines stay intact
    const rows = new Map<number, { x: number; s: string }[]>();
    for (const it of items) {
      const s = typeof it.str === "string" ? it.str : "";
      if (!s) continue;
      const y = it.transform ? Math.round(it.transform[5]) : 0;
      const x = it.transform ? it.transform[4] : 0;
      const key = Math.round(y / 2) * 2;
      if (!rows.has(key)) rows.set(key, []);
      rows.get(key)!.push({ x, s });
    }
    const ys = [...rows.keys()].sort((a, b) => b - a);
    const lines: string[] = [];
    for (const y of ys) {
      const row = rows.get(y)!.sort((a, b) => a.x - b.x);
      lines.push(row.map((r) => r.s).join(" ").replace(/\s+/g, " ").trim());
    }
    pageTexts.push(lines.filter(Boolean).join("\n"));
  }
  return pageTexts.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

function extractPdfText(buf: ArrayBuffer): string {
  // Work with binary string for stream slicing
  const bytes = new Uint8Array(buf);
  let raw = "";
  // Prefer latin1-like mapping for binary PDF
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, Math.min(i + chunk, bytes.length));
    raw += String.fromCharCode.apply(null, Array.from(slice) as unknown as number[]);
  }

  const collected: string[] = [];

  // 1) Uncompressed streams: stream ... endstream
  const streamRe = /stream\r?\n([\s\S]*?)endstream/g;
  let sm: RegExpExecArray | null;
  while ((sm = streamRe.exec(raw))) {
    const body = sm[1];
    // Skip clearly compressed binary (high non-printable ratio)
    const sample = body.slice(0, 200);
    const nonPrint = (sample.match(/[^\x09\x0A\x0D\x20-\x7E]/g) || []).length;
    if (nonPrint > sample.length * 0.3) continue;
    collected.push(...extractFromContentStream(body));
  }

  // 2) Also scan whole file for Tj / TJ (some PDFs inline)
  if (collected.length < 5) {
    collected.push(...extractFromContentStream(raw));
  }

  // 3) Parentheses strings that look like words (Canva sometimes embeds differently)
  if (collected.join(" ").length < 80) {
    const paren = /\(([^)\\]{3,120})\)/g;
    let pm: RegExpExecArray | null;
    while ((pm = paren.exec(raw))) {
      const s = pm[1].trim();
      if (/^[A-Za-z0-9][A-Za-z0-9@.,\-\s:+/#&']+$/.test(s) && !isPdfJunkLine(s)) {
        collected.push(s);
      }
    }
  }

  // Join with newlines when a token looks like a section header / short line
  const lines: string[] = [];
  for (const part of collected) {
    const cleaned = part.replace(/\s+/g, " ").trim();
    if (!cleaned || isPdfJunkLine(cleaned)) continue;
    if (
      cleaned === cleaned.toUpperCase() &&
      cleaned.length < 48 &&
      /[A-Z]/.test(cleaned)
    ) {
      lines.push("");
      lines.push(cleaned);
    } else {
      lines.push(cleaned);
    }
  }

  // Dedupe consecutive duplicates
  const deduped: string[] = [];
  for (const l of lines) {
    if (deduped.length && deduped[deduped.length - 1] === l) continue;
    deduped.push(l);
  }

  return deduped.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function extractDocxText(buf: ArrayBuffer): Promise<string> {
  // DOCX is a zip; use DecompressionStream if available, else minimal PK scan
  // Prefer browser native unzip via fflate-less approach: parse XML if we can find it
  // Use dynamic import of JSZip is not available — implement lightweight ZIP local-file reader
  const files = await unzipLocalFiles(buf);
  const docXml =
    files["word/document.xml"] ||
    files["word\\document.xml"] ||
    Object.entries(files).find(([k]) => /document\.xml$/i.test(k))?.[1];
  if (!docXml) return "";
  // Strip tags, keep paragraph breaks
  return docXml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:br\/>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Minimal ZIP reader for uncompressed + deflate entries (DOCX) */
async function unzipLocalFiles(buf: ArrayBuffer): Promise<Record<string, string>> {
  const bytes = new Uint8Array(buf);
  const view = new DataView(buf);
  const out: Record<string, string> = {};
  // Find end of central directory
  let eocd = -1;
  for (let i = bytes.length - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return out;
  const entries = view.getUint16(eocd + 10, true);
  let cdOff = view.getUint32(eocd + 16, true);
  for (let e = 0; e < entries; e++) {
    if (view.getUint32(cdOff, true) !== 0x02014b50) break;
    const method = view.getUint16(cdOff + 10, true);
    const compSize = view.getUint32(cdOff + 20, true);
    const nameLen = view.getUint16(cdOff + 28, true);
    const extraLen = view.getUint16(cdOff + 30, true);
    const commentLen = view.getUint16(cdOff + 32, true);
    const localOff = view.getUint32(cdOff + 42, true);
    const nameBytes = bytes.subarray(cdOff + 46, cdOff + 46 + nameLen);
    const name = new TextDecoder("utf-8").decode(nameBytes);
    // local header
    const lh = localOff;
    if (view.getUint32(lh, true) !== 0x04034b50) {
      cdOff += 46 + nameLen + extraLen + commentLen;
      continue;
    }
    const lhNameLen = view.getUint16(lh + 26, true);
    const lhExtraLen = view.getUint16(lh + 28, true);
    const dataStart = lh + 30 + lhNameLen + lhExtraLen;
    const compressed = bytes.subarray(dataStart, dataStart + compSize);
    let plain: Uint8Array;
    if (method === 0) {
      plain = compressed;
    } else if (method === 8 && typeof DecompressionStream !== "undefined") {
      const ds = new DecompressionStream("deflate-raw");
      const stream = new Blob([compressed]).stream().pipeThrough(ds);
      plain = new Uint8Array(await new Response(stream).arrayBuffer());
    } else {
      cdOff += 46 + nameLen + extraLen + commentLen;
      continue;
    }
    out[name] = new TextDecoder("utf-8", { fatal: false }).decode(plain);
    cdOff += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

/**
 * Build editable HTML that mirrors a traditional CV layout from plain text.
 * Preserves section headers, bullets, and paragraph order — does NOT invent content.
 */
export function textToCvDocumentHtml(text: string): string {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/g, ""));

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const blocks: string[] = [];
  let listBuf: string[] = [];
  let i = 0;

  const flushList = () => {
    if (!listBuf.length) return;
    blocks.push("<ul>" + listBuf.map((li) => `<li>${esc(li)}</li>`).join("") + "</ul>");
    listBuf = [];
  };

  // First non-empty lines often: Name, Title, contact
  while (i < lines.length && !lines[i].trim()) i++;
  if (i < lines.length) {
    const name = lines[i].trim();
    if (name.length < 60 && !/:$/.test(name)) {
      blocks.push(`<h1>${esc(name)}</h1>`);
      i++;
    }
  }
  // Subtitle / title
  while (i < lines.length && !lines[i].trim()) i++;
  if (i < lines.length) {
    const title = lines[i].trim();
    if (
      title.length < 80 &&
      !/:$/.test(title) &&
      !/^[\u2022\-\*]/.test(title) &&
      title === title.replace(/^\d/, title) // not starting weird
    ) {
      // Could be title or contact line
      if (!/@/.test(title) && !/^\+?\d/.test(title) && !/Iqama|Mobile|Email/i.test(title)) {
        blocks.push(`<p><strong>${esc(title)}</strong></p>`);
        i++;
      }
    }
  }

  for (; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    if (isPdfJunkLine(trimmed)) continue;

    // Bullet
    if (/^([•\-\*\u2022\u25CF\u25AA]|\d+[.)])\s+/.test(trimmed)) {
      listBuf.push(trimmed.replace(/^([•\-\*\u2022\u25CF\u25AA]|\d+[.)])\s+/, ""));
      continue;
    }
    flushList();

    // Section header: ALL CAPS or ends with :
    const isHeader =
      (trimmed === trimmed.toUpperCase() &&
        /[A-Z]/.test(trimmed) &&
        trimmed.length < 56 &&
        !/@/.test(trimmed)) ||
      (/^[A-Z][A-Za-z0-9\s\/&-]{2,50}:$/.test(trimmed));

    if (isHeader) {
      const label = trimmed.replace(/:$/, "");
      blocks.push(`<h2>${esc(label)}</h2>`);
      continue;
    }

    // Contact-ish single lines
    if (/^(Email|Mobile|Phone|Iqama|Tel|Address)\s*[:.]/i.test(trimmed)) {
      blocks.push(`<p>${esc(trimmed)}</p>`);
      continue;
    }

    blocks.push(`<p>${esc(trimmed)}</p>`);
  }
  flushList();

  return blocks.join("\n") || "<p></p>";
}
