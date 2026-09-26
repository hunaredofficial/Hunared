/** Convert plain extracted CV text into editable HTML, preserving line structure. */
function looksLikePdfDump(s: string) {
  return /%PDF-|\/Type\s*\/Catalog|endobj/i.test(s.slice(0, 400));
}

export function textToDocumentHtml(text: string): string {
  if (looksLikePdfDump(text)) {
    // Never render PDF structure as the CV document
    return "<p><em>Could not read this PDF layout. Paste your CV text instead.</em></p>";
  }

  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/g, ""));

  const blocks: string[] = [];
  let listBuf: string[] = [];

  const flushList = () => {
    if (!listBuf.length) return;
    blocks.push("<ul>" + listBuf.map((li) => `<li>${esc(li)}</li>`).join("") + "</ul>");
    listBuf = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    // bullet-like
    if (/^([•\-\*▪►●]|\d+[.)])\s+/.test(trimmed)) {
      listBuf.push(trimmed.replace(/^([•\-\*▪►●]|\d+[.)])\s+/, ""));
      continue;
    }
    flushList();
    // ALL CAPS short line → heading
    if (
      trimmed.length < 60 &&
      trimmed === trimmed.toUpperCase() &&
      /[A-Z]/.test(trimmed) &&
      !/@/.test(trimmed)
    ) {
      blocks.push(`<h2>${esc(trimmed)}</h2>`);
      continue;
    }
    // Name-like first big line
    if (
      blocks.length === 0 &&
      trimmed.length < 50 &&
      /^[A-Z][a-zA-Z]+(\s+[A-Z][a-zA-Z.-]+){0,3}$/.test(trimmed)
    ) {
      blocks.push(`<h1>${esc(trimmed)}</h1>`);
      continue;
    }
    blocks.push(`<p>${esc(trimmed)}</p>`);
  }
  flushList();
  return blocks.join("") || "<p></p>";
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Best-effort: if content already looks like HTML, keep it. */
export function ensureDocumentHtml(input: string): string {
  const t = input.trim();
  if (!t) return "<p></p>";
  if (/<\/?(p|h1|h2|h3|ul|ol|li|div|br)\b/i.test(t)) return t;
  return textToDocumentHtml(t);
}
