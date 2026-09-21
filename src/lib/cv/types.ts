export type CvTemplateId =
  | "classic"
  | "modern"
  | "professional"
  | "minimal"
  | "executive"
  | "tech";

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
  experience: CvExperience[];
  education: CvEducation[];
  template: CvTemplateId;
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
  experience: [EMPTY_EXPERIENCE()],
  education: [EMPTY_EDUCATION()],
  template: "professional",
});

export type CvTemplateMeta = {
  id: CvTemplateId;
  name: string;
  desc: string;
  accent: string;
};
