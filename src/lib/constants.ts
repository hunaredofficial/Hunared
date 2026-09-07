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
  { value: "fashion_beauty", label: "Fashion & Beauty" },
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
    "New",
    "Used",
    "Like New",
    "Refurbished",
    "Open Box",
    "Wholesale Lot",
  ],
  for_rent: [
    "Tools",
    "Machinery",
    "Land Rental",
    "Space Rental",
    "Vehicle Rental",
    "Equipment Rental",
    "Industrial Equipment",
    "Construction Equipment",
    "Warehouses / Storage",
    "Other Rental",
  ],

  services: [
    "Electrical",
    "Mechanical",
    "Plumbing",
    "HVAC / AC",
    "Carpentry",
    "Painting",
    "Welding / Fabrication",
    "Masonry / Construction",
    "IT Support",
    "Web Development",
    "Mobile App Development",
    "Graphic Design",
    "Digital Marketing",
    "Cleaning",
    "Housekeeping",
    "Security",
    "CCTV / Access Control",
    "Logistics / Delivery",
    "Transportation / Driver",
    "Moving / Packing",
    "Consulting",
    "Accounting / Bookkeeping",
    "Legal Services",
    "Translation",
    "Photography / Videography",
    "Event Planning",
    "Catering",
    "Beauty / Salon",
    "Tutoring",
    "Maintenance / Repair",
    "Pest Control",
    "Landscaping / Gardening",
    "Other Services",
  ],
  accommodation: [
    "Houses for Rent",
    "Apartments",
    "Studios",
    "Villas",
    "Rooms",
    "Bed Spaces",
    "Shared Housing",
    "Staff Accommodation",
    "Hotel / Short Stay",
    "Commercial Property",
    "Offices",
    "Shops",
    "Warehouses",
    "Land",
    "Compounds",
  ],
  property: [
    "Apartment for Sale",
    "Villa for Sale",
    "Townhouse",
    "Land / Plot",
    "Commercial Building",
    "Office Space",
    "Shop / Retail",
    "Warehouse",
    "Farm / Agricultural Land",
    "Building / Tower",
    "Investment Property",
    "Under Construction",
  ],
  vehicles: [
    "Cars",
    "SUVs / 4x4",
    "Pickup Trucks",
    "Trucks / Lorries",
    "Buses / Vans",
    "Motorcycles",
    "Scooters",
    "Heavy Equipment",
    "Trailers",
    "Boats / Marine",
    "Spare Parts",
    "Tires & Wheels",
    "Car Accessories",
    "Number Plates",
  ],
  electronics: [
    "Laptops",
    "Desktop Computers",
    "Tablets",
    "Monitors / Displays",
    "TVs",
    "Cameras",
    "Audio / Speakers",
    "Headphones / Earphones",
    "Gaming Consoles",
    "Printers / Scanners",
    "Networking / Routers",
    "Smart Home Devices",
    "Power Banks / Chargers",
    "Storage / Hard Drives",
    "Other Electronics",
  ],
  home_furniture: [
    "Sofas / Living Room",
    "Beds / Bedroom",
    "Tables / Dining",
    "Office Furniture",
    "Wardrobes / Storage",
    "Home Appliances",
    "Kitchen Appliances",
    "Refrigerators",
    "Washing Machines",
    "Air Conditioners",
    "Decor / Lighting",
    "Carpets / Rugs",
    "Curtains / Blinds",
    "Garden / Outdoor",
    "Home Accessories",
  ],
  // Alias for older data that may use furniture_home
  furniture_home: [
    "Sofas / Living Room",
    "Beds / Bedroom",
    "Tables / Dining",
    "Office Furniture",
    "Wardrobes / Storage",
    "Home Appliances",
    "Kitchen Appliances",
    "Decor / Lighting",
    "Home Accessories",
  ],
  fashion_beauty: [
    "Men's Clothing",
    "Women's Clothing",
    "Kids Clothing",
    "Shoes",
    "Bags / Luggage",
    "Watches",
    "Jewelry",
    "Sunglasses / Eyewear",
    "Cosmetics / Makeup",
    "Skincare / Perfume",
    "Hair Care",
    "Uniforms / Workwear",
  ],
  mobiles_accessories: [
    "Smartphones",
    "Feature Phones",
    "Phone Cases",
    "Screen Protectors",
    "Chargers / Cables",
    "Power Banks",
    "Bluetooth / Headphones",
    "Smart Watches",
    "SIM / Numbers",
    "Repair Parts",
    "Other Accessories",
  ],
  tools_equipment: [
    "Hand Tools",
    "Power Tools",
    "Measuring Tools",
    "Safety Equipment",
    "Ladders / Scaffolding",
    "Welding Equipment",
    "Generators",
    "Compressors",
    "Pumps",
    "Workshop Equipment",
    "Garden Tools",
    "Other Tools",
  ],
  industrial_materials: [
    "Building Materials",
    "Steel / Metal",
    "Pipes / Fittings",
    "Electrical Materials",
    "Plumbing Materials",
    "Paint / Chemicals",
    "Insulation",
    "Hardware / Fasteners",
    "Industrial Machinery",
    "Spare Parts (Industrial)",
    "Packaging Materials",
    "Other Materials",
  ],
  pets_animals: [
    "Dogs",
    "Cats",
    "Birds",
    "Fish / Aquarium",
    "Livestock",
    "Pet Food",
    "Pet Accessories",
    "Pet Services",
    "Adoption",
    "Other Animals",
  ],
  sports_outdoors: [
    "Gym / Fitness",
    "Football / Team Sports",
    "Cycling",
    "Camping / Hiking",
    "Water Sports",
    "Fishing",
    "Hunting",
    "Sportswear",
    "Bicycles",
    "Outdoor Gear",
    "Other Sports",
  ],
  kids_baby: [
    "Baby Gear",
    "Strollers / Car Seats",
    "Toys",
    "Kids Furniture",
    "Kids Clothing",
    "School Supplies",
    "Nursery",
    "Other Kids Items",
  ],
  food_agriculture: [
    "Fresh Produce",
    "Grocery / Packaged",
    "Meat / Seafood",
    "Dairy",
    "Beverages",
    "Restaurant Equipment",
    "Farm Produce",
    "Seeds / Fertilizer",
    "Livestock Feed",
    "Catering Supplies",
    "Other Food",
  ],
  health_medical: [
    "Medical Equipment",
    "Mobility Aids",
    "First Aid",
    "Supplements / Vitamins",
    "Personal Care",
    "Lab / Diagnostic",
    "Pharmacy Items",
    "Other Health",
  ],
  wanted: [
    "Item Wanted",
    "Service Wanted",
    "Property Wanted",
    "Vehicle Wanted",
    "Job / Contract Wanted",
    "Roommate Wanted",
    "Other Wanted",
  ],
  free_items: [
    "Furniture",
    "Electronics",
    "Clothes",
    "Appliances",
    "Kids Items",
    "Books",
    "Building Materials",
    "Other Free Items",
  ],
  lost_found: [
    "Mobile Phones",
    "Laptops / Tablets",
    "Electronics",
    "Documents",
    "Passport",
    "ID / Cards",
    "Keys",
    "Wallets",
    "Bags / Luggage",
    "Jewelry",
    "Watches",
    "Vehicles",
    "Motorcycles",
    "Bicycles",
    "Pets",
    "Personal Items",
    "Missing Persons",
    "Other",
  ],
  events: [
    "Workshop",
    "Meetup",
    "Conference",
    "Exhibition / Trade Show",
    "Concert / Show",
    "Sports Event",
    "Charity Event",
    "Networking",
    "Online Event",
    "Other Event",
  ],
  business_commercial: [
    "Office Space",
    "Shop / Retail Space",
    "Warehouse / Storage",
    "Business for Sale",
    "Franchise",
    "Equipment / Machinery",
    "Office Furniture",
    "POS / Retail Systems",
    "Inventory Lot",
    "Partnership Opportunity",
    "Other Business",
  ],
  offers_deals: [
    "Discount",
    "Bundle Deal",
    "Clearance",
    "Buy 1 Get 1",
    "Seasonal Offer",
    "Flash Sale",
    "Package Deal",
  ],
  announcements: [
    "Public Notice",
    "Community Notice",
    "Company Announcement",
    "Government Notice",
    "Lost Document Notice",
    "Other Announcement",
  ],
  donations: [
    "Clothes",
    "Food",
    "Furniture",
    "Electronics",
    "Medical Supplies",
    "Books / School Items",
    "Equipment",
    "Blood / Organ Drive Info",
    "Charity Campaign",
    "Other Donation",
  ],
  community: [
    "Help Request",
    "Volunteer Opportunity",
    "Local Group",
    "Neighborhood News",
    "Skill Share",
    "Ride Share",
    "Other Community",
  ],
  education_training: [
    "Course",
    "Training Program",
    "Tutoring",
    "Certification",
    "Workshop",
    "Language Learning",
    "Professional Development",
    "Online Class",
    "Study Materials",
    "Other Education",
  ],
  wholesale: [
    "Bulk Items",
    "Trade Supply",
    "Importer / Exporter",
    "Distributor Stock",
    "Raw Materials",
    "Packaged Goods",
    "Other Wholesale",
  ],
  other: [
    "Furniture",
    "Home Appliances",
    "Kitchen Equipment",
    "Decor",
    "Tools",
    "Machinery",
    "Safety Equipment",
    "Construction Equipment",
    "Collectibles",
    "Antiques",
    "Books / Media",
    "Miscellaneous",
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
  for_sale:
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80",
  for_rent:
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
  services:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
  accommodation:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
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
    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80",
  fashion_beauty:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
  mobiles_accessories:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
  tools_equipment:
    "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80",
  industrial_materials:
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
  pets_animals:
    "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=80",
  sports_outdoors:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=800&q=80",
  kids_baby:
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4f3?auto=format&fit=crop&w=800&q=80",
  food_agriculture:
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80",
  health_medical:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  wanted:
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
  free_items:
    "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=800&q=80",
  lost_found:
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  events:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
  business_commercial:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
  offers_deals:
    "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80",
  announcements:
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
  donations:
    "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=800&q=80",
  community:
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
  education_training:
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
  wholesale:
    "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80",
  other:
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80",
};

/** Resolve a category (and optional subcategory) default image URL. */
export function getListingDefaultImage(
  category: string,
  subcategory?: string | null
): string {
  const sub = (subcategory || "").toLowerCase();
  if (
    sub.includes("phone") ||
    sub.includes("mobile") ||
    sub.includes("smartphone") ||
    sub.includes("tablet")
  ) {
    return LISTING_CATEGORY_DEFAULT_IMAGES.mobiles_accessories;
  }
  if (sub.includes("laptop") || sub.includes("computer")) {
    return LISTING_CATEGORY_DEFAULT_IMAGES.electronics;
  }
  if (sub.includes("car") || sub.includes("truck") || sub.includes("motorcycle")) {
    return LISTING_CATEGORY_DEFAULT_IMAGES.vehicles;
  }
  return (
    LISTING_CATEGORY_DEFAULT_IMAGES[category] ??
    LISTING_CATEGORY_DEFAULT_IMAGES.other
  );
}
