import {
  DEFAULT_CV,
  EMPTY_EDUCATION,
  EMPTY_EXPERIENCE,
  type CvData,
  type CvTemplateId,
  type SampleCvMeta,
} from "./types";

function exp(
  title: string,
  company: string,
  location: string,
  start: string,
  end: string,
  current: boolean,
  bullets: string[]
) {
  return {
    ...EMPTY_EXPERIENCE(),
    title,
    company,
    location,
    start,
    end,
    current,
    bullets: bullets.join("\n"),
  };
}

function edu(school: string, degree: string, field: string, end: string) {
  return { ...EMPTY_EDUCATION(), school, degree, field, end };
}

type Spec = {
  profession: string;
  category: string;
  template: CvTemplateId;
  blurb: string;
  summary: string;
  skills: string;
  certifications?: string;
  languages?: string;
  experience: ReturnType<typeof exp>[];
  education: ReturnType<typeof edu>[];
  name?: string;
  location?: string;
};

function build(s: Spec): { meta: SampleCvMeta; data: CvData } {
  const id = s.profession
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return {
    meta: {
      id,
      profession: s.profession,
      category: s.category,
      template: s.template,
      blurb: s.blurb,
    },
    data: {
      ...DEFAULT_CV(),
      fullName: s.name || "Alex Candidate",
      title: s.profession,
      email: "candidate@email.com",
      phone: "+966 50 000 0000",
      location: s.location || "Saudi Arabia / GCC",
      summary: s.summary,
      skills: s.skills,
      certifications: s.certifications || "",
      languages: s.languages || "English",
      experience: s.experience,
      education: s.education,
      template: s.template,
    },
  };
}

/** Professional sample CVs aligned to Hunared job categories & common Gulf roles */
const SPECS: Spec[] = [
  // Engineering / Instrumentation / Oil & Gas
  {
    profession: "Instrumentation Technician",
    category: "Instrumentation",
    template: "engineering",
    blurb: "Field instruments, calibration, loop checks",
    summary:
      "Instrumentation Technician with practical experience calibrating and maintaining field instruments in industrial and oil & gas facilities. Skilled in HART communicators, control valves, and permit-to-work systems.",
    skills: "Calibration, HART, Loop checking, Control valves, PLC basics, PTW, Troubleshooting",
    certifications: "NEBOSH IGC, CompEx awareness",
    languages: "English, Arabic, Urdu",
    location: "Jubail, Saudi Arabia",
    experience: [
      exp("Instrumentation Technician", "Gulf Petro Services", "Jubail", "2019", "", true, [
        "Performed preventive and corrective calibration of transmitters and switches",
        "Supported shutdowns with loop checks and instrument replacement",
        "Maintained calibration records per site quality procedures",
      ]),
    ],
    education: [edu("Technical Institute", "Diploma", "Instrumentation & Control", "2018")],
  },
  {
    profession: "Instrumentation Engineer",
    category: "Instrumentation",
    template: "engineering",
    blurb: "I&C design support and site engineering",
    summary:
      "Instrumentation Engineer supporting design packages, material selection, and site supervision for process instrumentation systems.",
    skills: "P&ID, Instrument datasheets, Loop diagrams, HAZOP awareness, Vendor coordination",
    certifications: "NEBOSH IGC",
    experience: [
      exp("Instrumentation Engineer", "Process Engineering Co.", "Dammam", "2018", "", true, [
        "Prepared instrument index and datasheets from P&IDs",
        "Coordinated vendor packages and site installation queries",
      ]),
    ],
    education: [edu("King Fahd University", "B.Sc.", "Instrumentation Engineering", "2017")],
  },
  {
    profession: "Electrical Engineer",
    category: "Electrical",
    template: "engineering",
    blurb: "LV/MV systems and project delivery",
    summary:
      "Electrical Engineer experienced in LV/MV design support, cable sizing, and site supervision for industrial projects.",
    skills: "AutoCAD Electrical, Cable sizing, Load schedules, Site supervision, QA/QC",
    experience: [
      exp("Electrical Engineer", "National Engineering", "Riyadh", "2018", "", true, [
        "Prepared electrical drawings and material take-offs",
        "Supported commissioning of distribution boards and lighting",
      ]),
    ],
    education: [edu("King Saud University", "B.Sc.", "Electrical Engineering", "2017")],
  },
  {
    profession: "Mechanical Engineer",
    category: "Mechanical",
    template: "engineering",
    blurb: "Rotating equipment and maintenance engineering",
    summary:
      "Mechanical Engineer focused on rotating equipment reliability, preventive maintenance planning, and vendor coordination.",
    skills: "Rotating equipment, CMMS, P&ID, Root cause analysis, Spare parts planning",
    experience: [
      exp("Mechanical Engineer", "Desert Maintenance", "Dubai", "2017", "", true, [
        "Planned preventive maintenance for pumps and compressors",
        "Supported turnaround activities and reliability improvements",
      ]),
    ],
    education: [edu("University of Sharjah", "B.Sc.", "Mechanical Engineering", "2016")],
  },
  {
    profession: "Civil Engineer",
    category: "Civil",
    template: "construction",
    blurb: "Site supervision and structural coordination",
    summary:
      "Civil Engineer experienced in site supervision, quantity tracking, and coordination with consultants on building and infrastructure works.",
    skills: "AutoCAD, Site supervision, BOQ, Concrete works, Quality checks",
    experience: [
      exp("Civil Engineer", "BuildRight Contracting", "Jeddah", "2018", "", true, [
        "Supervised structural works and coordinated subcontractors",
        "Tracked materials and supported inspection requests",
      ]),
    ],
    education: [edu("King Abdulaziz University", "B.Sc.", "Civil Engineering", "2017")],
  },
  {
    profession: "Process Engineer",
    category: "Process",
    template: "oilgas",
    blurb: "Process operations support and optimization",
    summary:
      "Process Engineer supporting plant operations, troubleshooting process deviations, and contributing to continuous improvement initiatives.",
    skills: "Mass balance, P&ID, Process troubleshooting, Operating procedures, HAZOP awareness",
    experience: [
      exp("Process Engineer", "Refinery Services", "Yanbu", "2019", "", true, [
        "Monitored process parameters and investigated deviations",
        "Updated operating procedures and supported MOC documentation",
      ]),
    ],
    education: [edu("KFUPM", "B.Sc.", "Chemical Engineering", "2018")],
  },
  {
    profession: "QA/QC Inspector",
    category: "Quality Control",
    template: "engineering",
    blurb: "Inspection and quality documentation",
    summary:
      "QA/QC Inspector experienced in material receiving, welding inspection support, and quality documentation for industrial projects.",
    skills: "ITPs, Material inspection, Welding inspection awareness, NCR, Documentation",
    certifications: "CSWIP 3.1 (or equivalent awareness)",
    experience: [
      exp("QA/QC Inspector", "Quality Partners", "Jubail", "2018", "", true, [
        "Performed receiving inspections against ITPs and specs",
        "Raised NCRs and tracked corrective actions to closure",
      ]),
    ],
    education: [edu("Technical College", "Diploma", "Mechanical", "2017")],
  },
  // HSE
  {
    profession: "HSE Officer",
    category: "Environmental Health & Safety",
    template: "hse",
    blurb: "Site safety, PTW, toolbox talks",
    summary:
      "HSE Officer with site experience enforcing permit-to-work, conducting toolbox talks, and supporting incident reporting in construction and industrial environments.",
    skills: "PTW, Risk assessment, Toolbox talks, Incident reporting, Hot work control",
    certifications: "NEBOSH IGC, IOSH Managing Safely, First Aid",
    languages: "English, Urdu, Arabic (basic)",
    location: "Eastern Province, Saudi Arabia",
    experience: [
      exp("HSE Officer", "SafeBuild Contracting", "Eastern Province", "2020", "", true, [
        "Monitored site compliance with PTW and client HSE procedures",
        "Delivered daily toolbox talks and tracked corrective actions",
      ]),
    ],
    education: [edu("College of Technology", "Diploma", "Occupational Health & Safety", "2019")],
  },
  {
    profession: "HSE Engineer",
    category: "Environmental Health & Safety",
    template: "hse",
    blurb: "HSE systems, audits, KPIs",
    summary:
      "HSE Engineer experienced in procedures, audits, and safety performance reporting across multi-site operations.",
    skills: "HSEMS, Auditing, HAZID awareness, KPI reporting, Training coordination",
    certifications: "NEBOSH IGC, ISO 45001 awareness",
    experience: [
      exp("HSE Engineer", "Gulf Energy Operations", "Khobar", "2018", "", true, [
        "Supported HSE management system documentation and site audits",
        "Analyzed leading and lagging indicators for management review",
      ]),
    ],
    education: [edu("University", "B.Sc.", "Environmental Science", "2017")],
  },
  {
    profession: "Safety Officer",
    category: "Environmental Health & Safety",
    template: "hse",
    blurb: "Construction site safety control",
    summary:
      "Safety Officer ensuring safe work practices through inspections, training, and PPE/access control on construction sites.",
    skills: "Site inspection, PPE compliance, Emergency response, Scaffolding safety awareness",
    certifications: "NEBOSH IGC, Fire Safety",
    experience: [
      exp("Safety Officer", "Horizon Construction", "Riyadh", "2019", "", true, [
        "Conducted daily site walkdowns and closed safety observations",
        "Coordinated emergency drills with site management",
      ]),
    ],
    education: [edu("Polytechnic", "Diploma", "Safety", "2018")],
  },
  {
    profession: "Fire Watch",
    category: "Environmental Health & Safety",
    template: "hse",
    blurb: "Hot work fire watch duties",
    summary:
      "Fire Watch professional experienced in monitoring hot work areas, maintaining extinguishers readiness, and following PTW requirements.",
    skills: "Hot work monitoring, Fire extinguisher use, PTW, Emergency response, Observation reporting",
    certifications: "Basic Fire Fighting, PTW awareness",
    experience: [
      exp("Fire Watch", "Industrial Support Co.", "Jubail", "2021", "", true, [
        "Monitored hot work zones and maintained clear fire watch logs",
        "Reported hazards immediately to supervision",
      ]),
    ],
    education: [edu("Training Center", "Certificate", "Fire Safety", "2020")],
  },
  // Trades / Oil & Gas
  {
    profession: "Welder",
    category: "Welding",
    template: "trades",
    blurb: "SMAW/GTAW structural and pipe welding",
    summary:
      "Certified Welder experienced in SMAW/GTAW on structural steel and process piping under approved WPS and quality inspection.",
    skills: "SMAW, GTAW, Blueprint reading, Fit-up, Welding gauges, Safety",
    certifications: "6G SMAW, GTAW, Confined space awareness",
    experience: [
      exp("Welder", "Fabrication Yard", "Dammam", "2017", "", true, [
        "Executed pipe and structural welds per approved WPS",
        "Supported NDT readiness and weld map documentation",
      ]),
    ],
    education: [edu("ITI", "Trade Certificate", "Welding", "2016")],
  },
  {
    profession: "Pipe Fitter",
    category: "Piping",
    template: "oilgas",
    blurb: "Process piping fabrication and installation",
    summary:
      "Pipe Fitter experienced in fabrication, fit-up, and installation of process piping according to isometrics and safety rules.",
    skills: "Isometrics, Fit-up, Cutting/beveling, Flange management, PTW",
    experience: [
      exp("Pipe Fitter", "Piping Solutions", "Jubail", "2017", "", true, [
        "Fabricated and installed piping spools per isometric drawings",
        "Supported hydrotest preparation and punch-list closure",
      ]),
    ],
    education: [edu("Trade School", "Certificate", "Piping", "2016")],
  },
  {
    profession: "Electrician",
    category: "Electrical",
    template: "trades",
    blurb: "Industrial LV installation and maintenance",
    summary:
      "Industrial Electrician skilled in installation, troubleshooting, and maintenance of LV systems, motors, and control circuits.",
    skills: "LV systems, Motor control, Cable termination, Troubleshooting, PTW",
    certifications: "Electrical trade certificate",
    experience: [
      exp("Electrician", "Plant Services", "Yanbu", "2018", "", true, [
        "Installed and maintained power circuits and motor starters",
        "Diagnosed electrical faults under permit-to-work",
      ]),
    ],
    education: [edu("Technical Institute", "Certificate", "Electrical Installation", "2017")],
  },
  {
    profession: "Scaffolding Supervisor",
    category: "Scaffolding",
    template: "construction",
    blurb: "Scaffold planning and inspection",
    summary:
      "Scaffolding Supervisor experienced in planning, inspection, and safe erection/dismantling of scaffolds on industrial sites.",
    skills: "Scaffold design awareness, Inspection tags, Team supervision, PTW, Load ratings",
    certifications: "CISRS or equivalent awareness, Safety induction",
    experience: [
      exp("Scaffolding Supervisor", "Access Solutions", "Eastern Province", "2016", "", true, [
        "Supervised scaffold crews and verified inspection tags",
        "Coordinated with client HSE on access requirements",
      ]),
    ],
    education: [edu("Trade Center", "Certificate", "Scaffolding", "2015")],
  },
  {
    profession: "Rigger",
    category: "Rigging",
    template: "trades",
    blurb: "Lifting and rigging operations",
    summary:
      "Rigger experienced in preparing lifts, inspecting lifting gear, and supporting safe crane operations under lift plans.",
    skills: "Rigging, Sling inspection, Lift plans awareness, Hand signals, PTW",
    certifications: "Rigger certificate, Basic fire fighting",
    experience: [
      exp("Rigger", "Heavy Lift Co.", "Jubail", "2018", "", true, [
        "Prepared and inspected lifting gear before operations",
        "Supported critical lifts following approved lift plans",
      ]),
    ],
    education: [edu("Training Institute", "Certificate", "Rigging", "2017")],
  },
  {
    profession: "HVAC Technician",
    category: "HVAC",
    template: "trades",
    blurb: "HVAC installation and service",
    summary:
      "HVAC Technician experienced in installation, troubleshooting, and maintenance of commercial air-conditioning systems.",
    skills: "Split/package units, Refrigerant handling, Ductwork awareness, Troubleshooting",
    certifications: "HVAC trade certificate",
    experience: [
      exp("HVAC Technician", "Climate Services", "Riyadh", "2019", "", true, [
        "Installed and serviced commercial HVAC units",
        "Diagnosed cooling issues and replaced components safely",
      ]),
    ],
    education: [edu("Technical College", "Diploma", "HVAC", "2018")],
  },
  {
    profession: "Maintenance Technician",
    category: "Maintenance",
    template: "trades",
    blurb: "Plant and facility maintenance",
    summary:
      "Maintenance Technician supporting preventive and corrective maintenance for plant equipment and facilities.",
    skills: "Preventive maintenance, Troubleshooting, Hand tools, CMMS basics, Safety",
    experience: [
      exp("Maintenance Technician", "Facility Ops", "Dammam", "2018", "", true, [
        "Executed PM schedules and logged work orders",
        "Responded to breakdowns and restored equipment to service",
      ]),
    ],
    education: [edu("Technical Institute", "Diploma", "Industrial Maintenance", "2017")],
  },
  // IT / Tech
  {
    profession: "Software Developer",
    category: "Information Technology",
    template: "software",
    blurb: "Web applications and APIs",
    summary:
      "Software Developer building reliable web applications with modern JavaScript frameworks, APIs, and clean engineering practices.",
    skills: "TypeScript, React, Node.js, REST APIs, PostgreSQL, Git",
    languages: "English",
    experience: [
      exp("Software Developer", "Digital Products Co.", "Remote / GCC", "2020", "", true, [
        "Developed React/TypeScript front-ends for business products",
        "Implemented REST APIs and improved performance",
      ]),
    ],
    education: [edu("University", "B.Sc.", "Computer Science", "2019")],
  },
  {
    profession: "IT Support Technician",
    category: "Information Technology",
    template: "tech",
    blurb: "End-user and endpoint support",
    summary:
      "IT Support Technician providing Tier-1/2 assistance, endpoint management, and reliable incident resolution.",
    skills: "Windows, Microsoft 365, Active Directory basics, Ticketing, Hardware",
    certifications: "CompTIA A+",
    experience: [
      exp("IT Support Technician", "City Services", "Riyadh", "2020", "", true, [
        "Resolved hardware/software incidents within SLA",
        "Onboarded users with M365 accounts and devices",
      ]),
    ],
    education: [edu("College", "Diploma", "IT Support", "2019")],
  },
  {
    profession: "Network Engineer",
    category: "Networking",
    template: "tech",
    blurb: "Enterprise LAN/WAN and security",
    summary:
      "Network Engineer experienced in enterprise LAN/WAN, firewall policies, and network monitoring.",
    skills: "Routing/switching, Firewall policy, VPN, Wi-Fi, Monitoring",
    certifications: "CCNA",
    experience: [
      exp("Network Engineer", "Telecom Solutions", "Khobar", "2018", "", true, [
        "Supported branch connectivity and VPN access",
        "Tuned firewall rules and documented network changes",
      ]),
    ],
    education: [edu("University", "B.Sc.", "Computer Engineering", "2017")],
  },
  {
    profession: "Data Analyst",
    category: "Information Technology",
    template: "software",
    blurb: "Dashboards and business insights",
    summary:
      "Data Analyst translating business questions into SQL analysis, dashboards, and clear recommendations.",
    skills: "SQL, Excel, Power BI, Python basics, Data visualization",
    experience: [
      exp("Data Analyst", "Insight Group", "Remote", "2021", "", true, [
        "Built Power BI dashboards for operational KPIs",
        "Wrote SQL queries to validate data quality",
      ]),
    ],
    education: [edu("University", "B.Sc.", "Statistics", "2020")],
  },
  // Business
  {
    profession: "Accountant",
    category: "Accounting",
    template: "finance",
    blurb: "Month-end close and reporting",
    summary:
      "Accountant experienced in month-end close, AP/AR, and management reporting for multi-entity operations.",
    skills: "Month-end close, AP/AR, Excel, IFRS awareness, Reconciliation",
    certifications: "ACCA (part-qualified)",
    languages: "English, Arabic",
    experience: [
      exp("Accountant", "Gulf Holdings", "Manama", "2019", "", true, [
        "Prepared monthly reconciliations and audit schedules",
        "Improved invoice processing turnaround",
      ]),
    ],
    education: [edu("University", "B.Sc.", "Accounting", "2018")],
  },
  {
    profession: "HR Officer",
    category: "Human Resources",
    template: "professional",
    blurb: "Recruitment and employee services",
    summary:
      "HR Officer supporting recruitment, onboarding, and employee relations for growing teams.",
    skills: "Recruitment, Onboarding, HRIS basics, Employee relations, Contracts",
    languages: "English, Arabic",
    experience: [
      exp("HR Officer", "Services Co.", "Riyadh", "2020", "", true, [
        "Managed recruitment for technical and admin roles",
        "Coordinated onboarding and employee records",
      ]),
    ],
    education: [edu("University", "B.A.", "Business Administration", "2019")],
  },
  {
    profession: "Project Manager",
    category: "Management",
    template: "executive",
    blurb: "Delivery and stakeholder management",
    summary:
      "Project Manager delivering cross-functional initiatives on time and budget with clear governance and risk control.",
    skills: "Project planning, Risk management, Stakeholder communication, Budget tracking",
    certifications: "PMP",
    experience: [
      exp("Project Manager", "Consulting Partners", "Dubai", "2017", "", true, [
        "Led multi-workstream projects with RAID logs and executive reporting",
        "Improved delivery predictability through weekly risk reviews",
      ]),
    ],
    education: [edu("University", "B.Sc.", "Business", "2014")],
  },
  {
    profession: "Sales Executive",
    category: "Sales",
    template: "sales",
    blurb: "B2B sales and account growth",
    summary:
      "Sales Executive focused on B2B pipeline generation, consultative selling, and long-term client relationships.",
    skills: "CRM, Pipeline management, Negotiation, Presentation, Prospecting",
    experience: [
      exp("Sales Executive", "Commercial Solutions", "Jeddah", "2019", "", true, [
        "Exceeded quarterly targets through structured prospecting",
        "Managed key accounts and expanded upsell opportunities",
      ]),
    ],
    education: [edu("University", "B.A.", "Marketing", "2018")],
  },
  {
    profession: "Procurement Officer",
    category: "Procurement",
    template: "professional",
    blurb: "Sourcing and vendor management",
    summary:
      "Procurement Officer experienced in RFQs, vendor evaluation, and purchase order management for industrial projects.",
    skills: "RFQ, Vendor evaluation, PO management, Negotiation, ERP basics",
    experience: [
      exp("Procurement Officer", "Project Supply Co.", "Dammam", "2018", "", true, [
        "Issued RFQs and evaluated commercial proposals",
        "Expedited critical materials to meet project schedules",
      ]),
    ],
    education: [edu("University", "B.Sc.", "Supply Chain", "2017")],
  },
  {
    profession: "Document Controller",
    category: "Administration",
    template: "professional",
    blurb: "EDMS and project documentation",
    summary:
      "Document Controller experienced in EDMS, transmittals, and controlled document distribution for engineering projects.",
    skills: "EDMS, Transmittals, Document numbering, Revision control, MS Office",
    experience: [
      exp("Document Controller", "Engineering PMC", "Khobar", "2019", "", true, [
        "Managed document registers and transmittals",
        "Ensured correct revision control across disciplines",
      ]),
    ],
    education: [edu("College", "Diploma", "Business Administration", "2018")],
  },
  {
    profession: "Administrative Assistant",
    category: "Administration",
    template: "professional",
    blurb: "Office coordination and scheduling",
    summary:
      "Administrative Assistant supporting executives with scheduling, correspondence, and organized office operations.",
    skills: "Microsoft Office, Scheduling, Travel coordination, Filing, Confidentiality",
    experience: [
      exp("Administrative Assistant", "Corporate Office", "Riyadh", "2019", "", true, [
        "Managed calendars, meetings, and travel arrangements",
        "Prepared correspondence and maintained confidential records",
      ]),
    ],
    education: [edu("College", "Diploma", "Office Administration", "2018")],
  },
  // Logistics / Warehouse
  {
    profession: "Warehouse Supervisor",
    category: "Warehouse",
    template: "logistics",
    blurb: "Inventory and team leadership",
    summary:
      "Warehouse Supervisor ensuring accurate inventory control, safe operations, and on-time order fulfillment.",
    skills: "Inventory control, WMS, Team leadership, Safety, Shift planning",
    experience: [
      exp("Warehouse Supervisor", "Logistics Hub", "Dammam", "2018", "", true, [
        "Supervised shift teams for inbound/outbound operations",
        "Reduced picking errors through training and checklists",
      ]),
    ],
    education: [edu("College", "Diploma", "Logistics", "2017")],
  },
  {
    profession: "Logistics Coordinator",
    category: "Logistics",
    template: "logistics",
    blurb: "Freight and delivery coordination",
    summary:
      "Logistics Coordinator arranging shipments, tracking deliveries, and coordinating with carriers and warehouses.",
    skills: "Freight booking, Tracking, Customs awareness, Excel, Vendor coordination",
    experience: [
      exp("Logistics Coordinator", "Supply Chain Co.", "Jeddah", "2019", "", true, [
        "Booked freight and monitored delivery performance",
        "Resolved shipment exceptions with carriers",
      ]),
    ],
    education: [edu("University", "B.A.", "Business", "2018")],
  },
  {
    profession: "Heavy Equipment Operator",
    category: "Construction",
    template: "construction",
    blurb: "Plant equipment operation",
    summary:
      "Heavy Equipment Operator experienced in safe operation of site equipment following site rules and daily inspections.",
    skills: "Equipment operation, Pre-use inspection, Safety, Hand signals, Reporting",
    certifications: "Operator license, Safety induction",
    experience: [
      exp("Heavy Equipment Operator", "Civil Contractor", "Riyadh", "2017", "", true, [
        "Operated equipment per site instructions and safety rules",
        "Completed daily inspections and reported defects",
      ]),
    ],
    education: [edu("Training Center", "Certificate", "Equipment Operation", "2016")],
  },
  // Healthcare / Hospitality / Education
  {
    profession: "Nurse",
    category: "Healthcare",
    template: "healthcare",
    blurb: "Clinical care and patient safety",
    summary:
      "Registered Nurse providing safe bedside care with strong medication administration and documentation practices.",
    skills: "Patient care, Medication administration, Vital signs, Infection control, EMR",
    certifications: "RN license, BLS",
    experience: [
      exp("Staff Nurse", "Medical Center", "Riyadh", "2019", "", true, [
        "Delivered bedside care for assigned patients",
        "Administered medications and maintained accurate records",
      ]),
    ],
    education: [edu("Nursing College", "Diploma", "Nursing", "2018")],
  },
  {
    profession: "Teacher",
    category: "Education",
    template: "academic",
    blurb: "Classroom instruction and assessment",
    summary:
      "Teacher experienced in lesson planning, classroom management, and student assessment.",
    skills: "Lesson planning, Classroom management, Assessment, Parent communication",
    experience: [
      exp("Teacher", "International School", "Jeddah", "2018", "", true, [
        "Planned and delivered lessons aligned to curriculum",
        "Tracked student progress and provided support",
      ]),
    ],
    education: [edu("University", "B.Ed.", "Education", "2017")],
  },
  {
    profession: "Hotel Receptionist",
    category: "Hospitality",
    template: "hospitality",
    blurb: "Front desk and guest services",
    summary:
      "Hotel Receptionist delivering professional check-in/out, reservations support, and high service standards.",
    skills: "Front desk systems, Reservations, Guest relations, Cash handling",
    languages: "English, Arabic",
    experience: [
      exp("Receptionist", "City Hotel", "Riyadh", "2020", "", true, [
        "Managed check-in/out and resolved guest requests",
        "Coordinated with housekeeping and reservations",
      ]),
    ],
    education: [edu("Hospitality School", "Certificate", "Hotel Operations", "2019")],
  },
  {
    profession: "Customer Service Representative",
    category: "Customer Service",
    template: "professional",
    blurb: "Support and client retention",
    summary:
      "Customer Service Representative resolving inquiries across phone and chat with empathy and accuracy.",
    skills: "CRM, Call handling, Problem solving, De-escalation",
    experience: [
      exp("Customer Service Representative", "Support Center", "Riyadh", "2021", "", true, [
        "Handled high-volume inquiries while meeting quality scores",
        "Documented cases and escalated complex issues",
      ]),
    ],
    education: [edu("College", "Certificate", "Business Communications", "2020")],
  },
  {
    profession: "Security Officer",
    category: "Security",
    template: "professional",
    blurb: "Site security and access control",
    summary:
      "Security Officer experienced in access control, patrols, and incident reporting for commercial facilities.",
    skills: "Access control, Patrol, CCTV awareness, Incident reporting, Emergency response",
    certifications: "Security license, First Aid",
    experience: [
      exp("Security Officer", "Facility Security", "Dammam", "2019", "", true, [
        "Controlled site access and maintained visitor logs",
        "Reported incidents and supported emergency procedures",
      ]),
    ],
    education: [edu("Training Center", "Certificate", "Security", "2018")],
  },
  {
    profession: "Driver",
    category: "Driving",
    template: "trades",
    blurb: "Light/heavy vehicle driving",
    summary:
      "Professional Driver with a clean record, experienced in safe transport of personnel and materials.",
    skills: "Safe driving, Route planning, Vehicle inspection, Defensive driving",
    certifications: "Valid driving license",
    experience: [
      exp("Driver", "Transport Services", "Riyadh", "2018", "", true, [
        "Transported staff and materials following company routes",
        "Completed daily vehicle inspections and reported issues",
      ]),
    ],
    education: [edu("Secondary School", "Certificate", "General", "2015")],
  },
  {
    profession: "Graduate Engineer",
    category: "Engineering",
    template: "graduate",
    blurb: "Early-career engineering",
    summary:
      "Graduate Engineer with strong academic foundations and internship experience seeking to contribute to engineering project teams.",
    skills: "AutoCAD, MS Office, Teamwork, Report writing",
    languages: "English, Arabic",
    experience: [
      exp("Engineering Intern", "Projects Co.", "Jeddah", "2024", "2024", false, [
        "Assisted engineers with drawing updates and documentation",
        "Prepared progress summaries for weekly meetings",
      ]),
    ],
    education: [edu("King Abdulaziz University", "B.Sc.", "Engineering", "2025")],
  },
  {
    profession: "Marketing Specialist",
    category: "Marketing",
    template: "sales",
    blurb: "Digital campaigns and content",
    summary:
      "Marketing Specialist experienced in digital campaigns, content coordination, and performance reporting.",
    skills: "Social media, Content planning, Google Analytics basics, Campaign reporting",
    experience: [
      exp("Marketing Specialist", "Brand Agency", "Dubai", "2020", "", true, [
        "Planned and executed digital campaigns",
        "Reported KPIs and optimized content performance",
      ]),
    ],
    education: [edu("University", "B.A.", "Marketing", "2019")],
  },
  {
    profession: "Laboratory Technician",
    category: "Laboratory",
    template: "healthcare",
    blurb: "Sample testing and lab safety",
    summary:
      "Laboratory Technician experienced in sample preparation, routine testing, and laboratory safety procedures.",
    skills: "Sample prep, Lab equipment, Safety, Documentation, Quality checks",
    experience: [
      exp("Laboratory Technician", "Testing Lab", "Dammam", "2019", "", true, [
        "Prepared samples and performed routine tests",
        "Maintained equipment logs and safety compliance",
      ]),
    ],
    education: [edu("College", "Diploma", "Laboratory Science", "2018")],
  },
  {
    profession: "Foreman",
    category: "Foreman",
    template: "construction",
    blurb: "Crew leadership on site",
    summary:
      "Foreman experienced in leading site crews, coordinating daily work, and enforcing safety and quality standards.",
    skills: "Crew leadership, Work planning, Safety enforcement, Progress reporting",
    experience: [
      exp("Foreman", "Construction Co.", "Jubail", "2016", "", true, [
        "Led daily crew activities and reported progress to supervision",
        "Enforced PPE and PTW requirements on the work front",
      ]),
    ],
    education: [edu("Technical Institute", "Diploma", "Construction", "2014")],
  },
];

export const CV_SAMPLES: { meta: SampleCvMeta; data: CvData }[] = SPECS.map(build);

export function listSampleCategories(): string[] {
  return [...new Set(CV_SAMPLES.map((s) => s.meta.category))].sort();
}

export function getSampleById(id: string) {
  return CV_SAMPLES.find((s) => s.meta.id === id) || null;
}
