import {
  DEFAULT_CV,
  EMPTY_EDUCATION,
  EMPTY_EXPERIENCE,
  type CvData,
  type CvExperience,
  type CvEducation,
} from "./types";

/** Convert structured CV → continuous document HTML for contentEditable canvas */
export function cvToDocumentHtml(data: CvData): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");

  const parts: string[] = [];
  parts.push(`<h1 data-field="fullName">${esc(data.fullName || "Your Name")}</h1>`);
  parts.push(
    `<p data-field="title" class="cv-title"><strong>${esc(data.title || "Professional Title")}</strong></p>`
  );
  const contact = [data.email, data.phone, data.location, data.website]
    .filter(Boolean)
    .join(" · ");
  parts.push(`<p data-field="contact" class="cv-contact">${esc(contact)}</p>`);
  parts.push(`<hr/>`);

  if (data.summary.trim()) {
    parts.push(`<h2>Professional Summary</h2>`);
    parts.push(`<p data-field="summary">${esc(data.summary)}</p>`);
  }

  const exps = data.experience.filter((e) => e.title.trim() || e.company.trim());
  if (exps.length) {
    parts.push(`<h2>Work Experience</h2>`);
    for (const e of exps) {
      const dates = [e.start, e.current ? "Present" : e.end].filter(Boolean).join(" – ");
      parts.push(
        `<h3 data-exp="${e.id}">${esc(e.title)}${e.company ? " — " + esc(e.company) : ""}</h3>`
      );
      parts.push(
        `<p class="cv-meta">${esc([e.location, dates].filter(Boolean).join(" · "))}</p>`
      );
      const bullets = e.bullets
        .split(/\n/)
        .map((b) => b.trim())
        .filter(Boolean);
      if (bullets.length) {
        parts.push("<ul>");
        for (const b of bullets) parts.push(`<li>${esc(b)}</li>`);
        parts.push("</ul>");
      }
    }
  }

  const edus = data.education.filter((e) => e.school.trim() || e.degree.trim());
  if (edus.length) {
    parts.push(`<h2>Education</h2>`);
    for (const e of edus) {
      parts.push(
        `<p><strong>${esc(e.degree)}${e.field ? " in " + esc(e.field) : ""}</strong> — ${esc(e.school)}${e.end ? " (" + esc(e.end) + ")" : ""}</p>`
      );
      if (e.details.trim()) parts.push(`<p>${esc(e.details)}</p>`);
    }
  }

  if (data.skills.trim()) {
    parts.push(`<h2>Skills</h2>`);
    parts.push(`<p data-field="skills">${esc(data.skills)}</p>`);
  }
  if (data.certifications.trim()) {
    parts.push(`<h2>Certifications</h2>`);
    parts.push(`<p data-field="certifications">${esc(data.certifications)}</p>`);
  }
  if (data.languages.trim()) {
    parts.push(`<h2>Languages</h2>`);
    parts.push(`<p data-field="languages">${esc(data.languages)}</p>`);
  }
  if (data.achievements.trim()) {
    parts.push(`<h2>Achievements</h2>`);
    parts.push(`<p data-field="achievements">${esc(data.achievements)}</p>`);
  }
  if (data.customSectionTitle.trim() || data.customSectionBody.trim()) {
    parts.push(`<h2>${esc(data.customSectionTitle || "Additional")}</h2>`);
    parts.push(`<p>${esc(data.customSectionBody)}</p>`);
  }

  return parts.join("\n");
}

/** Best-effort HTML → structured CvData (preserves what user typed in the document) */
export function documentHtmlToCv(html: string, base?: Partial<CvData>): CvData {
  const cv = { ...DEFAULT_CV(), ...base };
  const div =
    typeof document !== "undefined"
      ? document.createElement("div")
      : null;

  // Server-safe: strip tags simply
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (div) {
    div.innerHTML = html;
    const h1 = div.querySelector("h1");
    if (h1?.textContent?.trim()) cv.fullName = h1.textContent.trim();
    const titleEl = div.querySelector("[data-field=title], .cv-title");
    if (titleEl?.textContent?.trim())
      cv.title = titleEl.textContent.replace(/^Professional Title$/i, "").trim() || cv.title;
    const sum = div.querySelector("[data-field=summary]");
    if (sum?.textContent?.trim()) cv.summary = sum.textContent.trim();
    const skills = div.querySelector("[data-field=skills]");
    if (skills?.textContent?.trim()) cv.skills = skills.textContent.trim();
    const certs = div.querySelector("[data-field=certifications]");
    if (certs?.textContent?.trim()) cv.certifications = certs.textContent.trim();
    const langs = div.querySelector("[data-field=languages]");
    if (langs?.textContent?.trim()) cv.languages = langs.textContent.trim();

    // Experience: h3 + following ul
    const h3s = Array.from(div.querySelectorAll("h3"));
    const experience: CvExperience[] = [];
    for (const h3 of h3s) {
      const raw = h3.textContent || "";
      const [titlePart, companyPart] = raw.split("—").map((s) => s.trim());
      let bullets = "";
      let el: Element | null = h3.nextElementSibling;
      while (el && el.tagName !== "H2" && el.tagName !== "H3") {
        if (el.tagName === "UL") {
          bullets = Array.from(el.querySelectorAll("li"))
            .map((li) => li.textContent?.trim() || "")
            .filter(Boolean)
            .join("\n");
        }
        el = el.nextElementSibling;
      }
      experience.push({
        ...EMPTY_EXPERIENCE(),
        title: titlePart || "",
        company: companyPart || "",
        bullets,
      });
    }
    if (experience.length) cv.experience = experience;

    // Education heuristic from H2 Education section paragraphs
    const allH2 = Array.from(div.querySelectorAll("h2"));
    for (const h2 of allH2) {
      if (/education/i.test(h2.textContent || "")) {
        const education: CvEducation[] = [];
        let el: Element | null = h2.nextElementSibling;
        while (el && el.tagName !== "H2") {
          if (el.tagName === "P") {
            const t = el.textContent?.trim() || "";
            if (t) {
              education.push({
                ...EMPTY_EDUCATION(),
                degree: t.split("—")[0]?.trim() || t,
                school: t.split("—")[1]?.replace(/\(.*\)/, "").trim() || "",
              });
            }
          }
          el = el.nextElementSibling;
        }
        if (education.length) cv.education = education;
      }
    }
  } else {
    // fallback: first line as name
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines[0]) cv.fullName = lines[0].slice(0, 80);
  }

  return cv;
}
