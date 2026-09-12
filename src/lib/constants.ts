import { CURRENCIES } from "@/lib/currencies";

export const JOB_CATEGORIES = [
  "Accounting",
  "Administration",
  "Agriculture",
  "Aviation",
  "Architectural",
  "Automotive",
  "Automation",
  "Banking",
  "Business",
  "Chemical",
  "Civil",
  "Coating",
  "Community Services",
  "Construction",
  "Control",
  "Coordination",
  "Creative",
  "Customer Service",
  "Delivery",
  "Designing",
  "Digital Marketing",
  "Domestic Services",
  "Drafting",
  "Driving",
  "Education",
  "Electrical",
  "Electronics",
  "Emergency Services",
  "Energy",
  "Engineering",
  "Entertainment",
  "Environmental",
  "Facilities Management",
  "Fabrication",
  "Finance",
  "Foreman",
  "Freelance",
  "Government",
  "Healthcare",
  "Helper",
  "Hospitality",
  "HVAC",
  "Human Resources",
  "Environmental Health & Safety",
  "Industry",
  "Information Technology",
  "Inspection",
  "Instrumentation",
  "Inventory Management",
  "Landscaping",
  "Labor",
  "Laboratory",
  "Law & Legal",
  "Lifting",
  "Logistics",
  "Maintenance",
  "Management",
  "Manufacturing",
  "Marine",
  "Marketing",
  "Mechanical",
  "Medical",
  "Media",
  "Mining",
  "NGO",
  "Networking",
  "Office",
  "Offshore",
  "Oil & Gas",
  "Others",
  "Painting",
  "Petroleum",
  "Personal Care",
  "Piping",
  "Planning",
  "Plumbing",
  "Printing",
  "Process",
  "Procurement",
  "Production",
  "Professional Services",
  "Property",
  "Publishing",
  "Quality Assurance",
  "Quality Control",
  "Refrigeration",
  "Real Estate",
  "Remote Work",
  "Research Services",
  "Retail",
  "Rigging",
  "Sales",
  "Scaffolding",
  "Security",
  "Skilled Worker",
  "Structural",
  "Supply Chain",
  "Supervisor",
  "Technical Services",
  "Telecommunications",
  "Testing",
  "Textile",
  "Training",
  "Transportation",
  "Technician",
  "Utilities",
  "Warehouse",
  "Welding",
  "Work Permit",
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];

export const DURATIONS = [
  "1 Month",
  "2 Months",
  "3 Months",
  "4 Months",
  "5 Months",
  "6 Months",
  "1 Year",
  "Shutdown",
  "Long Term",
  "Permanent",
  "UnSpecified",
] as const;

/** Durations that map to Temporary employment type */
export const TEMPORARY_DURATIONS = [
  "1 Month",
  "2 Months",
  "3 Months",
  "4 Months",
  "5 Months",
  "6 Months",
  "1 Year",
  "Shutdown",
  "Long Term",
  "UnSpecified",
] as const;

export const SALARY_TYPES = ["Hourly", "Monthly", "Negotiable"] as const;
export type SalaryType = (typeof SALARY_TYPES)[number];

/** Job experience level options (optional on post form; filter uses same values) */
export const EXPERIENCE_LEVELS = [
  { value: "any", label: "Any" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
  { value: "master", label: "Master" },
] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]["value"];

export const PROFESSIONS = [
  "Accountant",
  "Accounting Officer",
  "Actuary",
  "Admin Assistant",
  "Administrator",
  "Advertising Specialist",
  "Agricultural Engineer",
  "Agricultural Technician",
  "Air Conditioning Technician",
  "Aircraft Engineer",
  "Aircraft Technician",
  "Airport Ground Staff",
  "Architect",
  "Architectural Engineer",
  "Architectural Technician",
  "Automation Engineer",
  "Automation Technician",
  "Bank Officer",
  "Bank Teller",
  "Biomedical Engineer",
  "Biomedical Technician",
  "Boiler Technician",
  "Bookkeeper",
  "Business Analyst",
  "Business Developer",
  "Business Development Manager",
  "Carpenter",
  "Cashier",
  "CCTV Technician",
  "Chemical Engineer",
  "Chemical Technician",
  "Chiller Technician",
  "Chief Accountant",
  "Chief Engineer",
  "Chief Executive Officer",
  "Chief Financial Officer",
  "Chef",
  "Claims Officer",
  "Clerk",
  "Commissioning Engineer",
  "Commissioning Technician",
  "Communications Officer",
  "Computer Technician",
  "Construction Manager",
  "Construction Supervisor",
  "Consultant",
  "Control Engineer",
  "Control Room Operator",
  "Control Technician",
  "Coordinator",
  "Cost Controller",
  "Crane Operator",
  "Crane Technician",
  "Customer Service",
  "Customer Service Representative",
  "Data Analyst",
  "Data Entry Operator",
  "Database Administrator",
  "Delivery Driver",
  "Design Engineer",
  "Designer",
  "Digital Marketing Specialist",
  "Document Controller",
  "Draftsman",
  "Driver",
  "E&I Engineer",
  "E&I Foreman",
  "E&I Inspector",
  "E&I Supervisor",
  "E&I Technician",
  "Electrical Engineer",
  "Electrical Foreman",
  "Electrical Inspector",
  "Electrical QC Inspector",
  "Electrical Supervisor",
  "Electrical Technician",
  "Electrician",
  "Electronics Engineer",
  "Electronics Technician",
  "Equipment Engineer",
  "Equipment Operator",
  "Equipment Supervisor",
  "Equipment Technician",
  "Estimator",
  "Executive Assistant",
  "Fabricator",
  "Facilities Manager",
  "Facilities Technician",
  "Field Engineer",
  "Field Operator",
  "Field Technician",
  "Finance Manager",
  "Finance Officer",
  "Financial Analyst",
  "Fire Alarm Technician",
  "Fire Fighter",
  "Fire Fighting Technician",
  "Fire Inspector",
  "Fire Watch",
  "Fire Watchman",
  "Fitter",
  "Fleet Manager",
  "Forklift Operator",
  "Foreman",
  "Freelancer",
  "GIS Technician",
  "Graphic Designer",
  "Groundskeeper",
  "Health & Safety Engineer",
  "Heavy Equipment Operator",
  "Heavy Equipment Technician",
  "Helper",
  "Housekeeping Staff",
  "HR Manager",
  "HR Officer",
  "HR Specialist",
  "HSE Engineer",
  "HSE Manager",
  "HSE Officer",
  "HVAC Engineer",
  "HVAC Foreman",
  "HVAC Supervisor",
  "HVAC Technician",
  "Industrial Electrician",
  "Industrial Engineer",
  "Industrial Technician",
  "Information Security Analyst",
  "Instrumentation Engineer",
  "Instrumentation Foreman",
  "Instrumentation Supervisor",
  "Instrumentation Technician",
  "Inspector",
  "Interior Designer",
  "Inventory Controller",
  "IT Administrator",
  "IT Engineer",
  "IT Manager",
  "IT Specialist",
  "IT Support Technician",
  "Laboratory Technician",
  "Lab Technician",
  "Land Surveyor",
  "Legal Advisor",
  "Legal Officer",
  "Lifting Engineer",
  "Lifting Supervisor",
  "Lineman",
  "Logistics Coordinator",
  "Logistics Manager",
  "Logistics Officer",
  "Machine Operator",
  "Maintenance Engineer",
  "Maintenance Manager",
  "Maintenance Supervisor",
  "Maintenance Technician",
  "Mason",
  "Material Controller",
  "Material Coordinator",
  "Material Inspector",
  "Mechanical Engineer",
  "Mechanical Fitter",
  "Mechanical Foreman",
  "Mechanical Inspector",
  "Mechanical QC Inspector",
  "Mechanical Supervisor",
  "Mechanical Technician",
  "Medical Assistant",
  "Medical Laboratory Technician",
  "Medical Officer",
  "Millwright Technician",
  "Mobile Crane Operator",
  "Multi Welder",
  "Network Administrator",
  "Network Engineer",
  "Network Technician",
  "NDT Inspector",
  "Nurse",
  "Office Assistant",
  "Office Manager",
  "Officer",
  "Operations Manager",
  "Operations Supervisor",
  "Operator",
  "Other",
  "Painter",
  "Painting Foreman",
  "Painting Inspector",
  "Painting Supervisor",
  "Panel Technician",
  "Payroll Officer",
  "Permit Receiver",
  "Petroleum Engineer",
  "Pharmacist",
  "Pipe Fabricator",
  "Pipe Fitter",
  "Piping Engineer",
  "Piping Foreman",
  "Piping Inspector",
  "Piping QC Inspector",
  "Piping Supervisor",
  "Piping Technician",
  "Planned Maintenance Engineer",
  "Planner",
  "Planner / Scheduler",
  "Planning Coordinator",
  "Planning Engineer",
  "Planning Manager",
  "Plant Operator",
  "Plumber",
  "Procurement Officer",
  "Procurement Specialist",
  "Production Engineer",
  "Production Manager",
  "Production Operator",
  "Project Coordinator",
  "Project Engineer",
  "Project Manager",
  "Project Planner",
  "Property Manager",
  "Public Relations Officer",
  "QA/QC Coordinator",
  "QA/QC Engineer",
  "QA/QC Inspector",
  "QA/QC Manager",
  "QA/QC Supervisor",
  "Quality Engineer",
  "Quality Inspector",
  "Quality Manager",
  "Quantity Surveyor",
  "Receptionist",
  "Recruiter",
  "Recruitment Officer",
  "Rigger",
  "Rigger I",
  "Rigger II",
  "Rigger III",
  "Rigging Foreman",
  "Rigging Supervisor",
  "Rotating Equipment Engineer",
  "Rotating Equipment Technician",
  "Safety Engineer",
  "Safety Inspector",
  "Safety Officer",
  "Safety Supervisor",
  "Sales Engineer",
  "Sales Executive",
  "Sales Manager",
  "Sales Representative",
  "Sand Blaster",
  "Scaffolder",
  "Scaffolding Foreman",
  "Scaffolding Supervisor",
  "Security Guard",
  "Service Engineer",
  "Service Technician",
  "Site Engineer",
  "Site Manager",
  "Site Supervisor",
  "Software Developer",
  "Software Engineer",
  "Solar Technician",
  "Stand By Man",
  "Static Equipment Engineer",
  "Static Equipment Technician",
  "Steel Fixer",
  "Steel Structure Fitter",
  "Steel Structure Foreman",
  "Storekeeper",
  "Store Manager",
  "Store Supervisor",
  "Structural Engineer",
  "Structural Fitter",
  "Structural Inspector",
  "Structural Supervisor",
  "Structural Welder",
  "Surveyor",
  "System Administrator",
  "Teacher",
  "Technical Clerk",
  "Technical Coordinator",
  "Technical Engineer",
  "Technical Manager",
  "Technician",
  "Telecom Engineer",
  "Telecom Technician",
  "Telecommunications Engineer",
  "Timekeeper",
  "Tool & Die Maker",
  "Transformer Technician",
  "Transport Coordinator",
  "Transport Manager",
  "Truck Driver",
  "Utility Operator",
  "Warehouse Assistant",
  "Warehouse Coordinator",
  "Warehouse Manager",
  "Warehouse Supervisor",
  "Warehouse Worker",
  "Welder",
  "Welding Engineer",
  "Welding Foreman",
  "Welding Inspector",
  "Welding QC Inspector",
  "Welding Supervisor",
  "Wind Turbine Technician",
  "WordPress Developer",
  "Yard Supervisor",
] as const;

export const CATEGORY_DISPLAY_LABELS: Record<string, string> = {
  "Environmental Health & Safety": "HSE",
};

export function getCategoryDisplayLabel(
  category: string | null | undefined
): string {
  if (!category) return "";
  return CATEGORY_DISPLAY_LABELS[category] ?? category;
}

// Colors for categories; anything not listed falls back to "Others"
export const CATEGORY_COLORS: Record<string, string> = {
  Accounting:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Administration:
    "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
  Agriculture:
    "bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300",
  Aviation:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  Architectural:
    "bg-stone-100 text-stone-700 dark:bg-stone-800/60 dark:text-stone-300",
  Automotive:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300",
  Automation:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  Banking:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Business:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Chemical:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Civil:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Coating:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Community Services":
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  Construction:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Control:
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  Coordination:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Creative:
    "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
  "Customer Service":
    "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  Delivery:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Designing:
    "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
  "Digital Marketing":
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "Domestic Services":
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  Drafting:
    "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
  Driving:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Education:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  Electrical:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Electronics:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  "Emergency Services":
    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Energy:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Engineering:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Entertainment:
    "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  Environmental:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "Facilities Management":
    "bg-stone-100 text-stone-700 dark:bg-stone-800/60 dark:text-stone-300",
  Fabrication:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300",
  Finance:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Foreman:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Freelance:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Government:
    "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
  Healthcare:
    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Helper:
    "bg-muted text-muted-foreground",
  Hospitality:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  HVAC:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "Human Resources":
    "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  "Environmental Health & Safety":
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Industry:
    "bg-stone-100 text-stone-700 dark:bg-stone-800/60 dark:text-stone-300",
  "Information Technology":
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Inspection:
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  Instrumentation:
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "Inventory Management":
    "bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300",
  Landscaping:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Labor:
    "bg-stone-100 text-stone-700 dark:bg-stone-800/60 dark:text-stone-300",
  Laboratory:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "Law & Legal":
    "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
  Lifting:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Logistics:
    "bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300",
  Maintenance:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300",
  Management:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Manufacturing:
    "bg-stone-100 text-stone-700 dark:bg-stone-800/60 dark:text-stone-300",
  Marketing:
    "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
  Mechanical:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  Medical:
    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Media:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Mining:
    "bg-stone-100 text-stone-800 dark:bg-stone-800/60 dark:text-stone-300",
  NGO:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  Networking:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Office:
    "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
  Offshore:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "Oil & Gas":
    "bg-stone-100 text-stone-700 dark:bg-stone-800/60 dark:text-stone-300",
  Others: "bg-muted text-muted-foreground",
  Painting:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Petroleum:
    "bg-stone-100 text-stone-700 dark:bg-stone-800/60 dark:text-stone-300",
  "Personal Care":
    "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  Piping:
    "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
  Planning:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Plumbing:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Printing:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300",
  Process:
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  Procurement:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Production:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Professional Services":
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Property:
    "bg-stone-100 text-stone-700 dark:bg-stone-800/60 dark:text-stone-300",
  Publishing:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "Quality Assurance":
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "Quality Control":
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  Refrigeration:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "Real Estate":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Remote Work":
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  "Research Services":
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Retail:
    "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  Rigging:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Sales:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Scaffolding:
  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Security:
    "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
  "Skilled Worker":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Structural:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "Supply Chain":
    "bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300",
  Supervisor:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Telecommunications:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Testing:
  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Textile:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  Training:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Transportation:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Technician:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  Utilities:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Warehouse:
    "bg-stone-100 text-stone-700 dark:bg-stone-800/60 dark:text-stone-300",
  Welding:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "Work Permit":
    "bg-muted text-muted-foreground",

  // Legacy aliases (old jobs may still use these names)
  "Safety & HSE":
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "Civil Engineering":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Electrical Engineering":
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  "Mechanical Engineering":
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  "Instrumentation Engineering":
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "Structural Engineering":
    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "Piping Engineering":
    "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
  "Project Management":
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  IT: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Other: "bg-muted text-muted-foreground",
  Design:
    "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
  Industrial:
    "bg-stone-100 text-stone-700 dark:bg-stone-800/60 dark:text-stone-300",
};

export const ARTICLE_CATEGORIES = [
  { value: "safety_hse", label: "Safety & HSE" },
  { value: "engineering", label: "Engineering" },
  { value: "career_tips", label: "Career Tips" },
  { value: "rights_responsibilities", label: "Rights & Responsibilities" },
] as const;

export type ArticleCategoryValue = (typeof ARTICLE_CATEGORIES)[number]["value"];

export const ARTICLE_CATEGORY_COLORS: Record<string, string> = {
  safety_hse:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  engineering:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  career_tips:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  rights_responsibilities:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
};

export const LISTING_CATEGORIES = [
  { value: "for_sale", label: "For Sale" },
  { value: "for_rent", label: "For Rent" },
  { value: "services", label: "Services" },
  { value: "accommodation", label: "Accommodation" },
  { value: "property", label: "Property" },
  { value: "vehicles", label: "Vehicles" },
  { value: "electronics", label: "Electronics" },
  { value: "home_furniture", label: "Home & Furniture" },
  { value: "personel_workwear", label: "Personal & Workwear" },
  { value: "mobiles_accessories", label: "Mobiles & Accessories" },
  { value: "tools_equipment", label: "Tools & Equipment" },
  { value: "industrial_materials", label: "Industrial & Materials" },
  { value: "pets_animals", label: "Pets & Animals" },
  { value: "sports_outdoors", label: "Sports & Outdoors" },
  { value: "kids_baby", label: "Kids & Baby" },
  { value: "food_agriculture", label: "Food & Agriculture" },
  { value: "health_medical", label: "Health & Medical" },
  { value: "wanted", label: "Wanted" },
  { value: "free_items", label: "Free Items" },
  { value: "lost_found", label: "Lost & Found" },
  { value: "events", label: "Events" },
  { value: "business_commercial", label: "Business & Commercial" },
  { value: "offers_deals", label: "Offers & Deals" },
  { value: "announcements", label: "Announcements" },
  { value: "donations", label: "Donations" },
  { value: "community", label: "Community" },
  { value: "education_training", label: "Education & Training" },
  { value: "wholesale", label: "Wholesale" },
  { value: "other", label: "Other" },
] as const;

export type ListingCategoryValue = (typeof LISTING_CATEGORIES)[number]["value"];

export const LISTING_TITLE_PLACEHOLDERS: Record<string, string> = {
  for_sale: "e.g. Samsung Galaxy S24 for Sale",
  for_rent: "e.g. Excavator for Rent – Daily Rate",
  services: "e.g. Electrical Maintenance in Riyadh",
  accommodation: "e.g. 2-bedroom apartment in Riyadh",
  property: "e.g. Villa for Sale in Jeddah",
  vehicles: "e.g. Toyota Camry 2022 – Excellent Condition",
  electronics: "e.g. MacBook Pro 14-inch M3",
  home_furniture: "e.g. Sofa Set – 7 Seater",
  personel_workwear: "e.g. Safety Boots Size 42 – New",
  mobiles_accessories: "e.g. iPhone 15 Pro Max 256GB",
  tools_equipment: "e.g. Bosch Drill Kit – Barely Used",
  industrial_materials: "e.g. Electrical Cables – Bulk Supply",
  pets_animals: "e.g. Persian Cat – Vaccinated",
  wanted: "e.g. Looking for 1BHK near Downtown",
  free_items: "e.g. Free Office Chair – Pickup Only",
  lost_found: "e.g. Lost iPhone near Riyadh Park",
  events: "e.g. Networking Meetup – Riyadh 15 Sep",
  business_commercial: "e.g. Shop Space for Lease – Al Khobar",
  offers_deals: "e.g. 50% Off Summer Collection",
  announcements: "e.g. Community Notice – Road Closure",
  donations: "e.g. Donating Winter Clothes – Good Condition",
  community: "e.g. Looking for Tennis Partner in Dammam",
  education_training: "e.g. NEBOSH Course – Weekend Batch",
  wholesale: "e.g. Wholesale LED Lights – Bulk Orders",
  other: "e.g. Describe your listing in a short title",
  sports_outdoors: "e.g. Professional Football Boots – Size 42",
  kids_baby: "e.g. Baby Stroller – Excellent Condition",
  food_agriculture: "e.g. Fresh Dates – Bulk Available",
  health_medical: "e.g. Blood Pressure Monitor – Digital",
};

export function getListingTitlePlaceholder(category: string | null | undefined): string {
  if (!category) return "e.g. Enter a clear title for your listing";
  return LISTING_TITLE_PLACEHOLDERS[category] ?? "e.g. Enter a clear title for your listing";
}

/** Condition options for For Sale (filter section only — not product subcategories). */
export const LISTING_CONDITION_OPTIONS = [
  "New",
  "Used",
  "Like New",
  "Refurbished",
  "Open Box",
  "Wholesale Lot",
] as const;

/** Rental period options for For Rent listings (separate from type subcategory). */
export const RENTAL_PERIOD_OPTIONS = [
  "Hourly",
  "Daily",
  "Weekly",
  "Monthly",
  "Yearly",
] as const;

/**
 * Subcategories for marketplace create form + browse filters.
 * Keys match LISTING_CATEGORIES values. Keep in sync across MarketFilter + new listing.
 */
export const LISTING_SUBCATEGORIES: Record<string, string[]> = {
  for_sale: [
    "Mobile Phones & Tablets",
    "Computers, Laptops & IT",
    "Electronics & Technology",
    "TV, Audio, Video",
    "Cameras & Photography",
    "Home Appliances",
    "Furniture & Home Decor",
    "Kitchen & Dining",
    "Garden, Outdoor & Patio",
    "Vehicles & Auto Parts",
    "Safety, PPE & Workwear",
    "Motorcycles, Bicycles & Accessories",
    "Clothing & Garments",
    "Shoes & Footwear",
    "Jewelry",
    "Bags, Luggage & Travel",
    "Watches & Accessories",
    "Beauty & Personal Care",
    "Baby, Kids & Maternity",
    "Toys, Games & Hobbies",
    "Sports, Fitness & Recreation",
    "Books, Education & Media",
    "Pet Supplies & Accessories",
    "Tools, Hardware & DIY",
    "Machinery & Equipment",
    "Construction & Building Materials",
    "Electrical & Instrumentation",
    "Mechanical Equipment & Parts",
    "Industrial & Commercial Equipment",
    "Oil & Gas Equipment & Supplies",
    "Agriculture, Farming & Gardening Equipment",
    "Business & Office Supplies",
    "Food, Grocery & Beverages",
    "Art, Antiques & Collectibles",
    "Handmade, Crafts & Custom Products",
    "Real Estate, Land & Property",
    "Tickets, Vouchers & Gift Cards",
    "Gifts & Special Items",
    "Wholesale & Bulk Lots",
    "Clearance, Overstock & Liquidation",
    "General Items",
    "Other",
  ],
  for_rent: [
    "Residential Properties",
    "Apartments",
    "Houses",
    "Rooms",
    "Bed Spaces",
    "Villas",
    "Townhouses",
    "Studios",
    "Shared Accommodation",
    "Serviced Apartments",
    "Commercial Properties",
    "Offices",
    "Shops & Retail Spaces",
    "Showrooms",
    "Warehouses",
    "Workshops",
    "Factories & Industrial Spaces",
    "Land",
    "Parking & Garages",
    "Vehicles",
    "Cars",
    "SUVs & 4x4",
    "Vans & Buses",
    "Trucks & Trailers",
    "Motorcycles & Scooters",
    "Bicycles & Electric Bikes",
    "Heavy Equipment",
    "Construction Equipment",
    "Agricultural Equipment",
    "Machinery",
    "Tools & Equipment",
    "Generators & Compressors",
    "Lifting & Material Handling Equipment",
    "Scaffolding & Access Equipment",
    "Event Equipment",
    "Furniture & Appliances",
    "Electronics & Technology",
    "Cameras & Audio Equipment",
    "Sports & Outdoor Equipment",
    "Boats & Marine Equipment",
    "Other Rentals",
  ],
  services: [
    "Electrical & Power Services",
    "Mechanical Services",
    "Plumbing & Water Services",
    "HVAC, Cooling & Refrigeration",
    "Construction & Civil Works",
    "Welding, Fabrication & Metalwork",
    "Carpentry & Woodwork",
    "Painting, Flooring & Finishing",
    "Building, Renovation & Interior Services",
    "Scaffolding & Access Services",
    "Tools, Machinery & Equipment Services",
    "Industrial Maintenance & Engineering",
    "Oil & Gas & Energy Services",
    "Instrumentation, Automation & Control",
    "Inspection, Testing & Certification",
    "HSE, Fire & Safety Services",
    "Security, CCTV & Access Control",
    "Automotive & Vehicle Services",
    "Transportation & Driving Services",
    "Logistics, Delivery & Moving",
    "Cleaning, Housekeeping & Facility Services",
    "Property & Real Estate Services",
    "Landscaping, Gardening & Agriculture",
    "IT, Computer & Technical Support",
    "Web, Software & App Development",
    "Digital Marketing, SEO & E-Commerce",
    "Graphic, UI/UX & Creative Design",
    "Photography, Video & Media",
    "Business, Management & Professional Consulting",
    "Accounting, Finance & Legal Services",
    "Recruitment, HR & Career Services",
    "Education, Tutoring & Professional Training",
    "Beauty, Personal Care & Wellness",
    "Events, Catering & Hospitality",
    "Home, Family, Pet & Personal Services",
    "Printing, Manufacturing & Custom Services",
    "Environmental, Waste & Recycling Services",
    "Travel, Tourism & Accommodation Services",
    "Rental & Hire Services",
    "Other Services",
  ],
  accommodation: [
    "Houses",
    "Apartments",
    "Studios",
    "Villas",
    "Townhouses",
    "Rooms",
    "Master Rooms",
    "Shared Rooms",
    "Bed Spaces",
    "Shared Housing",
    "Staff Accommodation",
    "Worker Accommodation",
    "Family Accommodation",
    "Bachelor Accommodation",
    "Student Accommodation",
    "Ladies Accommodation",
    "Compounds",
    "Serviced Apartments",
    "Hotels & Short Stays",
    "Holiday Homes",
    "Guest Houses",
    "Hostels",
    "Other Accommodation",
  ],
  property: [
    "Apartments",
    "Villas",
    "Houses",
    "Townhouses",
    "Penthouses",
    "Duplexes",
    "Studios",
    "Residential Buildings",
    "Residential Plots",
    "Commercial Buildings",
    "Office Buildings & Spaces",
    "Shops & Retail Spaces",
    "Showrooms",
    "Warehouses",
    "Factories",
    "Workshops",
    "Industrial Properties",
    "Hotels & Hospitality",
    "Schools & Educational Properties",
    "Hospitals & Medical Properties",
    "Mixed-Use Properties",
    "Farms & Agricultural Land",
    "Commercial Land",
    "Development Land",
    "Parking & Garages",
    "Other Property",
  ],
  vehicles: [
    "Cars",
    "SUVs & 4x4",
    "Pickup Trucks",
    "Trucks",
    "Light Commercial Vehicles",
    "Vans",
    "Buses & Minibuses",
    "Motorcycles",
    "Scooters",
    "Bicycles",
    "Electric Bikes",
    "Trailers",
    "Heavy Equipment",
    "Construction Equipment",
    "Agricultural Machinery",
    "Spare Parts",
    "Engines & Gearboxes",
    "Tires & Wheels",
    "Vehicle Accessories",
    "Vehicle Electronics",
    "Other Vehicles",
  ],
  electronics: [
    "Laptops",
    "Desktop Computers",
    "Workstations",
    "Tablets",
    "Monitors & Displays",
    "Televisions",
    "Cameras & Photography",
    "Audio & Speakers",
    "Headphones & Earphones",
    "Gaming PCs & Consoles",
    "Gaming Accessories",
    "Printers & Scanners",
    "Networking Equipment",
    "Servers & Data Center Equipment",
    "Smart Home Devices",
    "Security & CCTV Systems",
    "Drones",
    "GPS & Navigation",
    "Storage Devices",
    "Computer Components",
    "Memory & RAM",
    "Graphics Cards",
    "Keyboards & Mice",
    "Cables & Adapters",
    "Electronic Components",
    "Wearable Technology",
    "Other Electronics",
  ],
  home_furniture: [
    "Living Room Furniture",
    "Bedroom Furniture",
    "Beds & Mattresses",
    "Dining Furniture",
    "Chairs",
    "Office Furniture",
    "Desks",
    "Wardrobes & Storage",
    "Cabinets & Shelving",
    "Kitchen Furniture",
    "Home Appliances",
    "Refrigerators & Freezers",
    "Washing Machines & Dryers",
    "Dishwashers",
    "Ovens & Cookers",
    "Microwaves",
    "Air Conditioners",
    "Fans",
    "Vacuum Cleaners",
    "Lighting",
    "Carpets & Rugs",
    "Curtains & Blinds",
    "Mirrors",
    "Wall Decor",
    "Garden & Outdoor Furniture",
    "BBQ & Grills",
    "Home Accessories",
    "Other Home & Furniture",
  ],
  // Alias for older data that may use furniture_home
  furniture_home: [
    "Living Room Furniture",
    "Bedroom Furniture",
    "Beds & Mattresses",
    "Dining Furniture",
    "Chairs",
    "Office Furniture",
    "Desks",
    "Wardrobes & Storage",
    "Cabinets & Shelving",
    "Kitchen Furniture",
    "Home Appliances",
    "Refrigerators & Freezers",
    "Washing Machines & Dryers",
    "Dishwashers",
    "Ovens & Cookers",
    "Microwaves",
    "Air Conditioners",
    "Fans",
    "Vacuum Cleaners",
    "Lighting",
    "Carpets & Rugs",
    "Curtains & Blinds",
    "Mirrors",
    "Wall Decor",
    "Garden & Outdoor Furniture",
    "BBQ & Grills",
    "Home Accessories",
    "Other Home & Furniture",
  ],
  fashion_beauty: [
    "Men's Clothing",
    "Women's Clothing",
    "Kids Clothing",
    "Baby Clothing",
    "Traditional Clothing",
    "Formal & Wedding Wear",
    "Sportswear",
    "Workwear & Uniforms",
    "Safety Workwear",
    "Shoes & Footwear",
    "Sports Shoes",
    "Safety Shoes",
    "Bags & Handbags",
    "Luggage & Travel Bags",
    "Watches",
    "Jewelry",
    "Sunglasses & Eyewear",
    "Belts & Wallets",
    "Hats & Caps",
    "Fashion Accessories",
    "Traditional Accessories",
    "Other Fashion",
  ],
  personel_workwear: [
    "Men's Clothing",
    "Women's Clothing",
    "Kids Clothing",
    "Baby Clothing",
    "Traditional Clothing",
    "Formal & Wedding Wear",
    "Sportswear",
    "Workwear & Uniforms",
    "Safety Workwear",
    "Shoes & Footwear",
    "Sports Shoes",
    "Safety Shoes",
    "Bags & Handbags",
    "Luggage & Travel Bags",
    "Watches",
    "Jewelry",
    "Sunglasses & Eyewear",
    "Belts & Wallets",
    "Hats & Caps",
    "Fashion Accessories",
    "Traditional Accessories",
    "Other Fashion",
  ],
  mobiles_accessories: [
    "Smartphones",
    "Feature Phones",
    "Foldable Phones",
    "Tablets",
    "Smart Watches",
    "Phone Cases",
    "Screen Protectors",
    "Chargers",
    "Charging Cables",
    "Wireless Chargers",
    "Power Banks",
    "Headphones & Earbuds",
    "Speakers",
    "Phone Stands & Holders",
    "Car Phone Accessories",
    "Memory Cards",
    "USB Accessories",
    "SIM Cards & Numbers",
    "Repair Parts",
    "Replacement Screens",
    "Batteries",
    "Mobile Repair Tools",
    "Other Mobile Accessories",
  ],
  tools_equipment: [
    "Hand Tools",
    "Power Tools",
    "Cordless Tools",
    "Measuring Tools",
    "Testing Equipment",
    "Workshop Equipment",
    "Welding Equipment",
    "Cutting Equipment",
    "Drilling Equipment",
    "Compressors",
    "Generators",
    "Pumps",
    "Pressure Washers",
    "Ladders",
    "Scaffolding",
    "Lifting Equipment",
    "Material Handling Equipment",
    "Forklifts",
    "Cranes & Hoists",
    "Construction Equipment",
    "Earthmoving Equipment",
    "Agricultural Equipment",
    "Garden Equipment",
    "Surveying Equipment",
    "Calibration Equipment",
    "Industrial Equipment",
    "Workshop Machinery",
    "Machine Tools",
    "Equipment Spare Parts",
    "Other Tools & Equipment",
  ],
  industrial_materials: [
    "Building Materials",
    "Cement & Concrete",
    "Steel & Metal",
    "Aluminum",
    "Wood & Timber",
    "Pipes & Fittings",
    "Valves",
    "Flanges",
    "Electrical Materials",
    "Cables & Wires",
    "Switchgear",
    "Control Panels",
    "Instrumentation Materials",
    "Plumbing Materials",
    "Hardware & Fasteners",
    "Paints & Coatings",
    "Industrial Chemicals",
    "Insulation",
    "Waterproofing Materials",
    "Glass",
    "Tiles & Flooring",
    "Roofing Materials",
    "Packaging Materials",
    "Mechanical Parts",
    "Electrical Parts",
    "Oil & Gas Materials",
    "Pipelines & Accessories",
    "Warehouse Supplies",
    "Raw Materials",
    "Other Industrial Materials",
  ],
  pets_animals: [
    "Cats",
    "Dogs",
    "Birds",
    "Fish & Aquarium",
    "Rabbits",
    "Hamsters & Small Pets",
    "Reptiles",
    "Horses",
    "Camels",
    "Cattle",
    "Sheep & Goats",
    "Poultry",
    "Pet Food",
    "Livestock Feed",
    "Pet Accessories",
    "Aquarium Equipment",
    "Animal Cages & Housing",
    "Pet Grooming Supplies",
    "Pet Health Products",
    "Other Pets & Animals",
  ],
  sports_outdoors: [
    "Football & Soccer",
    "Basketball",
    "Cricket",
    "Tennis",
    "Golf",
    "Running",
    "Swimming",
    "Water Sports",
    "Fishing",
    "Camping",
    "Hiking",
    "Climbing",
    "Outdoor & Adventure Gear",
    "Sports Equipment",
    "Fitness Equipment",
    "Team Sports Equipment",
    "Martial Arts Equipment",
    "Travel & Adventure Gear",
    "Other Sports & Outdoors",
  ],
  kids_baby: [
    "Baby Gear",
    "Strollers",
    "Car Seats",
    "Baby Carriers",
    "Cribs & Cots",
    "Nursery Furniture",
    "Baby Care",
    "Kids Clothing",
    "Kids Shoes",
    "Toys",
    "Educational Toys",
    "Outdoor Toys",
    "Games",
    "Kids Electronics",
    "School Supplies",
    "School Bags",
    "Books & Learning",
    "Maternity Items",
    "Kids Furniture",
    "Kids Sports",
    "Other Kids & Baby",
  ],
  food_agriculture: [
    "Fresh Produce",
    "Fruits & Vegetables",
    "Grains & Cereals",
    "Rice & Flour",
    "Meat & Poultry",
    "Seafood",
    "Dairy Products",
    "Eggs",
    "Beverages",
    "Packaged Food",
    "Frozen Food",
    "Bakery Products",
    "Spices & Seasonings",
    "Dates & Nuts",
    "Organic Food",
    "Farm Produce",
    "Seeds",
    "Fertilizers",
    "Crop Care Supplies",
    "Livestock Feed",
    "Agricultural Machinery",
    "Irrigation Equipment",
    "Greenhouse Equipment",
    "Farming Tools",
    "Other Food & Agriculture",
  ],
  health_medical: [
    "Medical Equipment",
    "Diagnostic Equipment",
    "Laboratory Equipment",
    "Dental Equipment",
    "Physiotherapy Equipment",
    "Mobility Aids",
    "Wheelchairs",
    "Walking Aids",
    "Hospital Furniture",
    "First Aid Supplies",
    "Medical Supplies",
    "Health Monitoring Devices",
    "Thermometers",
    "Blood Pressure Monitors",
    "Healthcare Accessories",
    "Protective Medical Equipment",
    "Other Health & Medical",
  ],
  wanted: [
    "Items Wanted",
    "Vehicles Wanted",
    "Property Wanted",
    "Accommodation Wanted",
    "Furniture Wanted",
    "Electronics Wanted",
    "Mobile Phones Wanted",
    "Computers Wanted",
    "Tools & Equipment Wanted",
    "Machinery Wanted",
    "Construction Materials Wanted",
    "Industrial Materials Wanted",
    "Jobs & Contracts Wanted",
    "Services Wanted",
    "Business Opportunities Wanted",
    "Partners & Investors Wanted",
    "Wholesale Suppliers Wanted",
    "Pets & Animals Wanted",
    "Other Wanted",
  ],
  free_items: [
    "Furniture",
    "Home Appliances",
    "Electronics",
    "Mobile Phones",
    "Computers",
    "Clothing & Shoes",
    "Baby & Kids Items",
    "Toys",
    "Books",
    "Food",
    "Building Materials",
    "Tools & Equipment",
    "Office Equipment",
    "Garden Items",
    "Pet Supplies",
    "Plants",
    "Vehicles & Parts",
    "Other Free Items",
  ],
  lost_found: [
    "Mobile Phones",
    "Laptops & Tablets",
    "Electronics",
    "Documents",
    "IDs & Cards",
    "Keys",
    "Wallets",
    "Bags & Luggage",
    "Jewelry",
    "Watches",
    "Money & Cash",
    "Vehicles",
    "Motorcycles",
    "Bicycles",
    "Pets",
    "Personal Items",
    "Missing Persons",
    "Other Lost & Found",
  ],
  events: [
    "Workshops",
    "Training",
    "Seminars",
    "Conferences",
    "Exhibitions & Trade Shows",
    "Career Fairs",
    "Job Fairs",
    "Business Networking",
    "Community Events",
    "Charity Events",
    "Fundraising Events",
    "Concerts & Shows",
    "Sports Events",
    "Festivals",
    "Religious Events",
    "Educational Events",
    "Online Events",
    "Other Events",
  ],
  business_commercial: [
    "Businesses for Sale",
    "Franchises",
    "Business Opportunities",
    "Startup Opportunities",
    "Partnership Opportunities",
    "Investment Opportunities",
    "Business Equipment",
    "Office Furniture",
    "POS & Retail Systems",
    "Commercial Vehicles",
    "Inventory & Stock",
    "Restaurant & Cafe Businesses",
    "Service Businesses",
    "Import & Export Businesses",
    "Distribution Businesses",
    "Manufacturing Businesses",
    "Other Business",
  ],
  offers_deals: [
    "Discounts",
    "Bundle Deals",
    "Clearance",
    "Overstock",
    "Liquidation",
    "Buy 1 Get 1",
    "Buy More & Save",
    "Seasonal Offers",
    "Flash Sales",
    "Limited-Time Offers",
    "Package Deals",
    "Wholesale Deals",
    "Member Offers",
    "New Customer Offers",
    "Business Deals",
    "Free Delivery Offers",
    "Other Deals",
  ],
  announcements: [
    "Public Notices",
    "Community Notices",
    "Company Announcements",
    "Business Announcements",
    "Government Notices",
    "Event Announcements",
    "Job Fair Announcements",
    "Property Announcements",
    "Service Announcements",
    "Product Announcements",
    "Lost & Found Notices",
    "Important Notices",
    "Other Announcements",
  ],
  donations: [
    "Food",
    "Clothing",
    "Furniture",
    "Electronics",
    "Mobile Phones",
    "Computers",
    "Medical Supplies",
    "Mobility Equipment",
    "Books & School Items",
    "Baby & Kids Items",
    "Vehicles & Parts",
    "Building Materials",
    "Tools & Equipment",
    "Pet Supplies",
    "Farm Supplies",
    "Financial Assistance",
    "Charity Campaigns",
    "Community Support",
    "Blood Donation Information",
    "Other Donations",
  ],
  community: [
    "Help Requests",
    "Volunteer Opportunities",
    "Local Groups",
    "Community Groups",
    "Neighborhood News",
    "Skill Sharing",
    "Knowledge Sharing",
    "Ride Sharing",
    "Carpooling",
    "Local Services",
    "Community Events",
    "Charity & Welfare",
    "Donation Requests",
    "Accommodation Help",
    "Job & Employment Help",
    "Newcomer Support",
    "Other Community",
  ],
  education_training: [
    "Courses",
    "Training Programs",
    "Professional Training",
    "Vocational Training",
    "Technical Training",
    "HSE & Safety Training",
    "Engineering Training",
    "IT & Computer Training",
    "Business Training",
    "Language Learning",
    "Tutoring",
    "Certifications",
    "Diploma Programs",
    "Workshops",
    "Seminars",
    "Exam Preparation",
    "Career Development",
    "Professional Development",
    "Online Classes",
    "Study Materials",
    "Educational Books",
    "Internship Programs",
    "Scholarship Opportunities",
    "Other Education & Training",
  ],
  wholesale: [
    "Bulk Goods",
    "Trade Supplies",
    "Importer & Exporter",
    "Distributor Stock",
    "Manufacturer Stock",
    "Retailer Stock",
    "Raw Materials",
    "Packaged Goods",
    "Food Wholesale",
    "Clothing Wholesale",
    "Electronics Wholesale",
    "Mobile Accessories Wholesale",
    "Furniture Wholesale",
    "Construction Materials Wholesale",
    "Industrial Materials Wholesale",
    "Tools & Equipment Wholesale",
    "Auto Parts Wholesale",
    "Beauty Products Wholesale",
    "Office Supplies Wholesale",
    "Agricultural Products Wholesale",
    "Clearance Wholesale",
    "Liquidation Stock",
    "Other Wholesale",
  ],
  other: [
    "General Items",
    "Miscellaneous",
    "Uncategorized",
    "Other",
  ],
  fashion_garments: [
    "Men's Clothing",
    "Women's Clothing",
    "Kids Clothing",
    "Baby Clothing",
    "Traditional Clothing",
    "Formal & Wedding Wear",
    "Sportswear",
    "Workwear & Uniforms",
    "Safety Workwear",
    "Shoes & Footwear",
    "Sports Shoes",
    "Safety Shoes",
    "Bags & Handbags",
    "Luggage & Travel Bags",
    "Watches",
    "Jewelry",
    "Sunglasses & Eyewear",
    "Belts & Wallets",
    "Hats & Caps",
    "Fashion Accessories",
    "Traditional Accessories",
    "Other Fashion",
  ],
};

/**
 * Shared currency codes for Jobs + Marketplace.
 * Prefer importing CURRENCIES from @/lib/currencies and mapping .code
 * in new forms. This export stays for backward compatibility.
 */
export const LISTING_CURRENCIES = CURRENCIES.map((c) => c.code);

export const LISTING_CATEGORY_COLORS: Record<string, string> = {
  for_sale:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  for_rent:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  services:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  accommodation:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  property:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  vehicles:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  electronics:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  home_furniture:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  furniture_home:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  fashion_beauty:
    "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  mobiles_accessories:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  tools_equipment:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300",
  industrial_materials:
    "bg-stone-100 text-stone-700 dark:bg-stone-800/60 dark:text-stone-300",
  pets_animals:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  sports_outdoors:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  kids_baby:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  food_agriculture:
    "bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300",
  health_medical:
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  wanted:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  free_items:
    "bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300",
  lost_found:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  events:
    "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  business_commercial:
    "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
  offers_deals:
    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  announcements:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  donations:
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  community:
    "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
  education_training:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  wholesale:
    "bg-stone-100 text-stone-700 dark:bg-stone-800/60 dark:text-stone-300",
  other: "bg-muted text-muted-foreground",
};

/**
 * Default cover images when a listing is posted without photos.
 * Category-themed stock images (Unsplash). Overridden when the user uploads.
 */
export const LISTING_CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  // Rule: product / place / object only — never people (no women, girls, or any person).
  for_sale:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  for_rent:
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
  services:
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
  accommodation:
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  property:
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
  vehicles:
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80",
  electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80",
  home_furniture:
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  furniture_home:
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  personel_workwear:
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  fashion_beauty:
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  mobiles_accessories:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
  tools_equipment:
    "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80",
  industrial_materials:
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
  pets_animals:
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
  sports_outdoors:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=800&q=80",
  kids_baby:
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4f3?auto=format&fit=crop&w=800&q=80",
  food_agriculture:
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80",
  health_medical:
    "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80",
  wanted:
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
  free_items:
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80",
  lost_found:
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  events:
    "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=80",
  business_commercial:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
  offers_deals:
    "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80",
  announcements:
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
  donations:
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80",
  community:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  education_training:
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
  wholesale:
    "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80",
  other:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
};


/**
 * Curated object/place/product Unsplash images — no people.
 * Used when seller does not upload a photo.
 */
const KEYWORD_DEFAULT_IMAGES: { keys: string[];

/** Lost & Found status (Lost / Found) — stored with item type in subcategory as "Type · Status". */
export const LOST_FOUND_STATUS_OPTIONS = [
  "Lost",
  "Found",
] as const;
 url: string }[] = [
  // Phones & mobiles
  {
    keys: ["iphone", "samsung", "smartphone", "mobile phone", "phone", "mobile", "android phone"],
    url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["tablet", "ipad"],
    url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["charger", "power bank", "cable", "earbud", "earphone", "headphone", "airpod"],
    url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
  },
  // Computers
  {
    keys: ["laptop", "macbook", "notebook"],
    url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["desktop", "pc", "computer", "workstation", "monitor", "keyboard", "mouse", "ram", "graphics card"],
    url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["printer", "scanner", "server", "router", "networking"],
    url: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80",
  },
  // Cameras & AV
  {
    keys: ["camera", "photography", "dslr", "lens", "drone"],
    url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["tv", "television", "speaker", "audio", "soundbar"],
    url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["gaming", "console", "playstation", "xbox", "nintendo"],
    url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80",
  },
  // Vehicles
  {
    keys: ["suv", "4x4", "pickup", "truck", "lorry", "van", "bus"],
    url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["car", "sedan", "toyota", "honda", "bmw", "mercedes", "vehicle"],
    url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["motorcycle", "bike", "scooter", "bicycle", "ebike"],
    url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["tire", "tyre", "wheel", "spare part", "engine", "gearbox"],
    url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["boat", "marine", "yacht"],
    url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
  },
  // Furniture & home
  {
    keys: ["sofa", "couch", "living room"],
    url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["bed", "mattress", "bedroom", "wardrobe"],
    url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["table", "desk", "chair", "dining", "office furniture"],
    url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["refrigerator", "fridge", "freezer", "washing machine", "dryer", "dishwasher", "oven", "microwave", "appliance"],
    url: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["air conditioner", "ac ", "fan", "vacuum"],
    url: "https://images.unsplash.com/photo-1631545806609-35e6d4f0f5b5?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["garden", "outdoor furniture", "bbq", "grill", "patio"],
    url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
  },
  // Fashion / workwear (objects only — clothes on rack / flat lay style images)
  {
    keys: ["shoe", "boot", "footwear", "sneaker"],
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["bag", "luggage", "handbag", "backpack"],
    url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["watch", "jewelry", "jewellery", "ring", "necklace"],
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["clothing", "garment", "uniform", "workwear", "ppe", "helmet", "safety"],
    url: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80",
  },
  // Tools & industrial
  {
    keys: ["drill", "tool", "hammer", "wrench", "power tool"],
    url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["generator", "compressor", "pump", "welder", "welding", "scaffold", "ladder", "forklift", "crane"],
    url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["cement", "steel", "pipe", "cable", "wire", "building material", "construction material", "industrial"],
    url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
  },
  // Property / accommodation (empty interiors / exteriors — avoid crowds)
  {
    keys: ["apartment", "flat", "studio", "villa", "house", "room", "bed space", "accommodation"],
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  },
  {
    keys: ["office", "shop", "warehouse", "factory", "land", "plot", "property", "building"],
    url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
  },
  // Pets (animals only, no people)
  {
    keys: ["cat", "dog", "bird", "fish", "pet", "rabbit", "horse", "camel", "sheep", "goat", "poultry"],
    url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
  },
  // Sports
  {
    keys: ["football", "soccer", "basketball", "cricket", "tennis", "golf", "fitness", "gym", "sport", "camping", "hiking"],
    url: "https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=800&q=80",
  },
  // Kids / baby gear (objects)
  {
    keys: ["stroller", "crib", "toy", "baby", "kids", "nursery", "car seat"],
    url: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4f3?auto=format&fit=crop&w=800&q=80",
  },
  // Food / agriculture
  {
    keys: ["fruit", "vegetable", "food", "grocery", "rice", "date", "spice", "farm", "seed", "fertilizer"],
    url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80",
  },
  // Health / medical equipment
  {
    keys: ["medical", "hospital", "wheelchair", "thermometer", "blood pressure", "lab", "dental", "first aid"],
    url: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80",
  },
  // Services / tools of trade
  {
    keys: ["electrical", "plumbing", "hvac", "hse", "security", "cctv", "cleaning", "consulting", "service"],
    url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
  },
  // Books / education
  {
    keys: ["book", "course", "training", "education", "certification", "study"],
    url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
  },
  // Documents / lost found
  {
    keys: ["document", "passport", "id ", "wallet", "key", "lost", "found"],
    url: "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80",
  },
  // Business / wholesale
  {
    keys: ["wholesale", "bulk", "warehouse stock", "inventory", "business"],
    url: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80",
  },
];

/**
 * Resolve a default image from title + category + subcategory.
 * Always returns a product / place / object image — never people.
 */
export function getListingDefaultImage(
  category: string,
  subcategory?: string | null,
  title?: string | null
): string {
  const haystack = [title || "", subcategory || "", category || ""]
    .join(" ")
    .toLowerCase();

  // Prefer longer / more specific keyword matches first
  let bestUrl: string | null = null;
  let bestLen = 0;
  for (const entry of KEYWORD_DEFAULT_IMAGES) {
    for (const key of entry.keys) {
      if (haystack.includes(key) && key.length > bestLen) {
        bestLen = key.length;
        bestUrl = entry.url;
      }
    }
  }
  if (bestUrl) return bestUrl;

  // Category-level curated images (no people)
  return (
    LISTING_CATEGORY_DEFAULT_IMAGES[category] ??
    LISTING_CATEGORY_DEFAULT_IMAGES.other
  );
}
