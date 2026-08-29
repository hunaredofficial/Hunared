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
  "Security",
  "Skilled Worker",
  "Structural",
  "Supply Chain",
  "Supervisor",
  "Telecommunications",
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
  "2 Month",
  "3 Months",
  "4 Month",
  "5 Month",
  "6 Months",
  "1 Year",
  "Shutdown",
  "Long Term",
  "Permanent",
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

export type JobCategory = (typeof JOB_CATEGORIES)[number];

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
  furniture_home:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
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