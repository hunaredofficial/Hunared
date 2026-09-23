export type CvTemplateId =
  | "classic"
  | "modern"
  | "professional"
  | "minimal"
  | "executive"
  | "tech"
  | "ats"
  | "engineering"
  | "hse"
  | "graduate";

export type CvExperience = {
  id: string;
  title: string;
  company: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  bullets: string;
};

export type CvEducation = {
  id: string;
  school: string;
  degree: string;
  field: string;
  start: string;
  end: string;
  details: string;
};

export type CvProject = {
  id: string;
  name: string;
  role: string;
  start: string;
  end: string;
  description: string;
};

export type CvSectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "languages"
  | "projects"
  | "achievements"
  | "custom";

export type CvData = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  skills: string;
  languages: string;
  certifications: string;
  achievements: string;
  customSectionTitle: string;
  customSectionBody: string;
  experience: CvExperience[];
  education: CvEducation[];
  projects: CvProject[];
  template: CvTemplateId;
  /** section order for preview */
  sectionOrder: CvSectionKey[];
};

export type CvDocumentMeta = {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
  template: CvTemplateId;
  targetRole?: string;
  version: number;
};

export type CvDocument = CvDocumentMeta & {
  data: CvData;
};

export const EMPTY_EXPERIENCE = (): CvExperience => ({
  id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: "",
  company: "",
  location: "",
  start: "",
  end: "",
  current: false,
  bullets: "",
});

export const EMPTY_EDUCATION = (): CvEducation => ({
  id: `edu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  school: "",
  degree: "",
  field: "",
  start: "",
  end: "",
  details: "",
});

export const EMPTY_PROJECT = (): CvProject => ({
  id: `prj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: "",
  role: "",
  start: "",
  end: "",
  description: "",
});

export const DEFAULT_SECTION_ORDER: CvSectionKey[] = [
  "summary",
  "experience",
  "education",
  "skills",
  "certifications",
  "languages",
  "projects",
  "achievements",
  "custom",
];

export const DEFAULT_CV = (): CvData => ({
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  summary: "",
  skills: "",
  languages: "",
  certifications: "",
  achievements: "",
  customSectionTitle: "",
  customSectionBody: "",
  experience: [EMPTY_EXPERIENCE()],
  education: [EMPTY_EDUCATION()],
  projects: [],
  template: "professional",
  sectionOrder: [...DEFAULT_SECTION_ORDER],
});

export type CvTemplateMeta = {
  id: CvTemplateId;
  name: string;
  desc: string;
  accent: string;
  category: string;
};

export type ProfileSeed = {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  profession?: string | null;
  country?: string | null;
  city?: string | null;
  skills?: string | null;
  languages?: string | null;
};
