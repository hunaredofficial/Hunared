import {
  DEFAULT_CV,
  type CvData,
  type CvDocument,
  type CvTemplateId,
} from "./types";

const LIBRARY_KEY = "hunared_cv_library_v2";
const LEGACY_KEY = "hunared_cv_builder_v1";

function uid() {
  return `cv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeData(raw: Partial<CvData> | null | undefined): CvData {
  const base = DEFAULT_CV();
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    experience: Array.isArray(raw.experience) && raw.experience.length
      ? raw.experience
      : base.experience,
    education: Array.isArray(raw.education) && raw.education.length
      ? raw.education
      : base.education,
    projects: Array.isArray(raw.projects) ? raw.projects : [],
    sectionOrder: Array.isArray(raw.sectionOrder) && raw.sectionOrder.length
      ? raw.sectionOrder
      : base.sectionOrder,
    documentHtml: typeof raw.documentHtml === "string" ? raw.documentHtml : "",
    sourceFileName: typeof raw.sourceFileName === "string" ? raw.sourceFileName : "",
    editMode: raw.editMode === "own" ? "own" : "template",
  };
}

export function loadLibrary(): CvDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (raw) {
      const list = JSON.parse(raw) as CvDocument[];
      if (Array.isArray(list)) {
        return list.map((d) => ({
          ...d,
          data: normalizeData(d.data),
        }));
      }
    }
    // migrate legacy single CV
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const data = normalizeData(JSON.parse(legacy) as CvData);
      const doc: CvDocument = {
        id: uid(),
        name: data.fullName
          ? `${data.fullName} CV`
          : data.title
            ? `${data.title} CV`
            : "My CV",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        template: data.template,
        version: 1,
        data,
      };
      saveLibrary([doc]);
      return [doc];
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function saveLibrary(docs: CvDocument[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(docs));
}

export function createDocument(
  name: string,
  data?: Partial<CvData>,
  targetRole?: string
): CvDocument {
  const d = normalizeData(data);
  const now = new Date().toISOString();
  return {
    id: uid(),
    name: name || "Untitled CV",
    createdAt: now,
    updatedAt: now,
    template: d.template,
    targetRole,
    version: 1,
    data: d,
  };
}

export function duplicateDocument(doc: CvDocument): CvDocument {
  const now = new Date().toISOString();
  return {
    ...doc,
    id: uid(),
    name: `${doc.name} (copy)`,
    createdAt: now,
    updatedAt: now,
    version: 1,
    data: normalizeData(JSON.parse(JSON.stringify(doc.data))),
  };
}

export function updateDocument(
  docs: CvDocument[],
  id: string,
  patch: Partial<CvDocument> & { data?: CvData }
): CvDocument[] {
  return docs.map((d) =>
    d.id === id
      ? {
          ...d,
          ...patch,
          data: patch.data ? normalizeData(patch.data) : d.data,
          template: (patch.data?.template ?? patch.template ?? d.template) as CvTemplateId,
          updatedAt: new Date().toISOString(),
        }
      : d
  );
}

export function deleteDocument(docs: CvDocument[], id: string): CvDocument[] {
  return docs.filter((d) => d.id !== id);
}
