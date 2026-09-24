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

function edu(
  school: string,
  degree: string,
  field: string,
  end: string
) {
  return { ...EMPTY_EDUCATION(), school, degree, field, end };
}

function sample(
  profession: string,
  category: string,
  template: CvTemplateId,
  blurb: string,
  data: Partial<CvData>
): { meta: SampleCvMeta; data: CvData } {
  const id = profession
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return {
    meta: { id, profession, category, template, blurb },
    data: {
      ...DEFAULT_CV(),
      ...data,
      title: data.title || profession,
      template,
      experience: data.experience?.length ? data.experience : [EMPTY_EXPERIENCE()],
      education: data.education?.length ? data.education : [EMPTY_EDUCATION()],
    },
  };
}

/** Full professional sample CVs — placeholder names; users replace with their own. */
const RAW = [
  sample("Instrument Technician", "Engineering", "engineering", "Calibration & field instrumentation (O&G)", {
    fullName: "Alex Rahman",
    email: "alex.rahman@email.com",
    phone: "+966 50 100 2000",
    location: "Jubail, Saudi Arabia",
    summary:
      "Instrument Technician with hands-on experience in calibration, loop checking, and maintenance of field instruments in oil & gas facilities. Skilled in HART communicators, control valves, and permit-to-work systems.",
    skills: "Calibration, HART, Loop checking, Control valves, PLC basics, PTW, Troubleshooting, DCS awareness",
    certifications: "NEBOSH IGC, CompEx awareness, Basic Fire Fighting",
    languages: "English, Arabic, Urdu",
    experience: [
      exp("Instrument Technician", "Gulf Petro Services", "Jubail, Saudi Arabia", "2019", "", true, [
        "Performed preventive and corrective calibration of pressure, temperature, and flow transmitters",
        "Supported plant shutdowns with loop checks and instrument replacement",
        "Maintained calibration records in line with site quality procedures",
      ]),
      exp("Junior Instrument Technician", "Industrial Services Co.", "Dammam, Saudi Arabia", "2016", "2019", false, [
        "Assisted senior technicians with field instrument maintenance",
        "Prepared tools and spare parts for daily work permits",
      ]),
    ],
    education: [edu("Technical Training Institute", "Diploma", "Instrumentation & Control", "2016")],
  }),
  sample("Electrical Engineer", "Engineering", "engineering", "Power systems & project delivery", {
    fullName: "Omar Hassan",
    email: "omar.hassan@email.com",
    phone: "+966 55 200 3000",
    location: "Riyadh, Saudi Arabia",
    summary: "Electrical Engineer experienced in LV/MV systems, load studies, and site supervision for industrial and commercial projects.",
    skills: "AutoCAD Electrical, ETAP basics, LV/MV design, Cable sizing, Site supervision, QA/QC",
    certifications: "PE candidate coursework, OSHA 30 awareness",
    languages: "English, Arabic",
    experience: [
      exp("Electrical Engineer", "National Engineering Co.", "Riyadh, Saudi Arabia", "2018", "", true, [
        "Prepared electrical drawings and material take-offs for industrial buildings",
        "Coordinated with contractors on cable routing and panel installation",
        "Supported commissioning of distribution boards and lighting systems",
      ]),
    ],
    education: [edu("King Saud University", "B.Sc.", "Electrical Engineering", "2017")],
  }),
  sample("Mechanical Engineer", "Engineering", "engineering", "Rotating equipment & maintenance", {
    fullName: "Yusuf Ali",
    email: "yusuf.ali@email.com",
    phone: "+971 50 400 5000",
    location: "Dubai, UAE",
    summary: "Mechanical Engineer focused on rotating equipment reliability, preventive maintenance planning, and vendor coordination.",
    skills: "Rotating equipment, CMMS, Vibration awareness, P&ID reading, Root cause analysis",
    languages: "English, Arabic, Hindi",
    experience: [
      exp("Mechanical Engineer", "Desert Maintenance LLC", "Dubai, UAE", "2017", "", true, [
        "Planned preventive maintenance for pumps, compressors, and fans",
        "Supported turnaround activities and spare-parts forecasting",
      ]),
    ],
    education: [edu("University of Sharjah", "B.Sc.", "Mechanical Engineering", "2016")],
  }),
  sample("HSE Officer", "HSE", "hse", "Site safety compliance & PTW", {
    fullName: "Sara Khan",
    email: "sara.khan@email.com",
    phone: "+966 54 600 7000",
    location: "Khobar, Saudi Arabia",
    summary: "HSE Officer with site experience enforcing PTW, conducting toolbox talks, and supporting incident reporting in construction and industrial environments.",
    skills: "PTW, Risk assessment, Toolbox talks, Incident reporting, Hot work control, Scaffolding inspection awareness",
    certifications: "NEBOSH IGC, IOSH Managing Safely, First Aid",
    languages: "English, Urdu, Arabic (basic)",
    experience: [
      exp("HSE Officer", "SafeBuild Contracting", "Eastern Province, Saudi Arabia", "2020", "", true, [
        "Monitored site compliance with PTW and client HSE procedures",
        "Delivered daily toolbox talks and tracked corrective actions",
        "Supported incident investigation and near-miss reporting",
      ]),
    ],
    education: [edu("College of Technology", "Diploma", "Occupational Health & Safety", "2019")],
  }),
  sample("HSE Engineer", "HSE", "hse", "Systems, audits & continuous improvement", {
    fullName: "Noura Al-Farsi",
    email: "noura.alfarsi@email.com",
    phone: "+968 9000 1000",
    location: "Muscat, Oman",
    summary: "HSE Engineer experienced in developing procedures, supporting audits, and driving safety performance KPIs across multi-site operations.",
    skills: "HSEMS, Auditing, HAZID awareness, KPI reporting, Training coordination",
    certifications: "NEBOSH IGC, ISO 45001 awareness",
    languages: "English, Arabic",
    experience: [
      exp("HSE Engineer", "Gulf Energy Operations", "Muscat, Oman", "2018", "", true, [
        "Supported HSE management system documentation and site audits",
        "Analyzed leading and lagging indicators for management review",
      ]),
    ],
    education: [edu("Sultan Qaboos University", "B.Sc.", "Environmental Science", "2017")],
  }),
  sample("Safety Officer", "HSE", "hse", "Construction site safety control", {
    fullName: "James Okonkwo",
    email: "james.okonkwo@email.com",
    phone: "+234 800 100 2000",
    location: "Lagos, Nigeria",
    summary: "Safety Officer ensuring safe work practices on construction sites through inspections, training, and enforcement of PPE and access control.",
    skills: "Site inspection, PPE compliance, Emergency response, Scaffolding safety awareness",
    certifications: "NEBOSH IGC, Fire Safety",
    languages: "English",
    experience: [
      exp("Safety Officer", "Horizon Construction", "Lagos, Nigeria", "2019", "", true, [
        "Conducted daily site walkdowns and closed safety observations",
        "Coordinated emergency drills with site management",
      ]),
    ],
    education: [edu("Federal Polytechnic", "HND", "Environmental Health", "2018")],
  }),
  sample("Welder", "Oil & Gas / Trades", "oilgas", "Structural & pipe welding", {
    fullName: "Ravi Patel",
    email: "ravi.patel@email.com",
    phone: "+91 98000 10000",
    location: "Mumbai, India",
    summary: "Certified Welder experienced in SMAW/GTAW on structural steel and process piping under strict WPS and quality inspection.",
    skills: "SMAW, GTAW, Blueprint reading, Fit-up, Welding gauges, Safety",
    certifications: "6G SMAW, GTAW certification, Confined space awareness",
    languages: "English, Hindi",
    experience: [
      exp("Welder", "Marine Fabrication Yard", "Mumbai, India", "2017", "", true, [
        "Executed pipe and structural welds per approved WPS",
        "Supported NDT readiness and weld map documentation",
      ]),
    ],
    education: [edu("ITI", "Trade Certificate", "Welding", "2016")],
    template: "trades" as CvTemplateId,
  }),
  sample("Electrician", "Oil & Gas / Trades", "trades", "Industrial electrical maintenance", {
    fullName: "Peter Mensah",
    email: "peter.mensah@email.com",
    phone: "+233 20 100 2000",
    location: "Accra, Ghana",
    summary: "Industrial Electrician skilled in installation, troubleshooting, and maintenance of LV systems, motors, and control circuits.",
    skills: "LV systems, Motor control, Cable termination, Troubleshooting, PTW",
    certifications: "Electrical trade certificate, First Aid",
    languages: "English",
    experience: [
      exp("Electrician", "Plant Services Ltd", "Tema, Ghana", "2018", "", true, [
        "Installed and maintained lighting, power circuits, and motor starters",
        "Diagnosed electrical faults and restored equipment safely under PTW",
      ]),
    ],
    education: [edu("Technical Institute", "Certificate", "Electrical Installation", "2017")],
  }),
  sample("Software Developer", "Technology", "software", "Full application development", {
    fullName: "Maya Chen",
    email: "maya.chen@email.com",
    phone: "+1 415 555 0100",
    location: "Remote / Singapore",
    summary: "Software Developer building reliable web applications with modern JavaScript frameworks, APIs, and clean engineering practices.",
    skills: "TypeScript, React, Node.js, REST APIs, PostgreSQL, Git, Testing",
    languages: "English, Mandarin",
    experience: [
      exp("Software Developer", "Nimbus Digital", "Singapore", "2020", "", true, [
        "Developed and maintained React/TypeScript front-ends for B2B products",
        "Implemented REST APIs and improved page performance by reducing bundle size",
        "Collaborated in Agile sprints with code review and automated tests",
      ]),
    ],
    education: [edu("National University", "B.Sc.", "Computer Science", "2019")],
  }),
  sample("Full-Stack Developer", "Technology", "software", "End-to-end product delivery", {
    fullName: "Daniel Costa",
    email: "daniel.costa@email.com",
    phone: "+351 910 000 000",
    location: "Lisbon, Portugal",
    summary: "Full-Stack Developer delivering features across UI, API, and database layers with a focus on maintainability and user experience.",
    skills: "React, Next.js, Node.js, SQL, Docker basics, CI/CD awareness",
    languages: "English, Portuguese",
    experience: [
      exp("Full-Stack Developer", "Iberia Apps", "Lisbon, Portugal", "2019", "", true, [
        "Owned features from design handoff to production deployment",
        "Improved API response times and added monitoring for critical paths",
      ]),
    ],
    education: [edu("University of Lisbon", "B.Sc.", "Informatics", "2018")],
  }),
  sample("IT Support", "Technology", "tech", "End-user & infrastructure support", {
    fullName: "Hannah Brooks",
    email: "hannah.brooks@email.com",
    phone: "+44 7700 900123",
    location: "London, UK",
    summary: "IT Support professional providing Tier-1/2 assistance, endpoint management, and reliable incident resolution for office environments.",
    skills: "Windows, Microsoft 365, Active Directory basics, Ticketing, Hardware troubleshooting",
    certifications: "CompTIA A+, ITIL Foundation awareness",
    languages: "English",
    experience: [
      exp("IT Support Specialist", "City Services Ltd", "London, UK", "2020", "", true, [
        "Resolved hardware/software incidents via ticketing SLA",
        "Onboarded users with M365 accounts and device setup",
      ]),
    ],
    education: [edu("City College", "Diploma", "IT Support", "2019")],
  }),
  sample("Network Engineer", "Technology", "tech", "Routing, switching & security", {
    fullName: "Karim Nasser",
    email: "karim.nasser@email.com",
    phone: "+961 70 000 000",
    location: "Beirut, Lebanon",
    summary: "Network Engineer experienced in enterprise LAN/WAN, firewall policies, and network monitoring for high-availability environments.",
    skills: "Cisco routing/switching, Firewall policy, VPN, Wi-Fi, Monitoring",
    certifications: "CCNA",
    languages: "English, Arabic, French",
    experience: [
      exp("Network Engineer", "Levant Telecom Solutions", "Beirut, Lebanon", "2018", "", true, [
        "Designed and supported branch connectivity and VPN access",
        "Tuned firewall rules and documented network changes",
      ]),
    ],
    education: [edu("American University", "B.Sc.", "Computer Engineering", "2017")],
  }),
  sample("Data Analyst", "Technology", "software", "Reporting & insights", {
    fullName: "Elena Petrova",
    email: "elena.petrova@email.com",
    phone: "+7 900 000 0000",
    location: "Remote",
    summary: "Data Analyst translating business questions into dashboards, SQL analysis, and clear recommendations for stakeholders.",
    skills: "SQL, Excel, Power BI, Python basics, Data visualization",
    languages: "English, Russian",
    experience: [
      exp("Data Analyst", "Insight Retail Group", "Remote", "2021", "", true, [
        "Built Power BI dashboards for sales and inventory KPIs",
        "Wrote SQL queries to validate data quality and investigate anomalies",
      ]),
    ],
    education: [edu("State University", "B.Sc.", "Applied Mathematics", "2020")],
  }),
  sample("Accountant", "Business", "finance", "Financial reporting & controls", {
    fullName: "Fatima Al-Sayed",
    email: "fatima.alsayed@email.com",
    phone: "+973 3000 0000",
    location: "Manama, Bahrain",
    summary: "Accountant experienced in month-end close, AP/AR, and management reporting for multi-entity operations.",
    skills: "Month-end close, AP/AR, Excel, IFRS awareness, Reconciliation",
    certifications: "ACCA (part-qualified)",
    languages: "English, Arabic",
    experience: [
      exp("Accountant", "Gulf Holdings", "Manama, Bahrain", "2019", "", true, [
        "Prepared monthly reconciliations and supported external audit schedules",
        "Improved invoice processing turnaround with clearer approval workflows",
      ]),
    ],
    education: [edu("University of Bahrain", "B.Sc.", "Accounting", "2018")],
  }),
  sample("HR Officer", "Business", "professional", "Recruitment & employee services", {
    fullName: "Lina Mahmoud",
    email: "lina.mahmoud@email.com",
    phone: "+20 100 000 0000",
    location: "Cairo, Egypt",
    summary: "HR Officer supporting recruitment, onboarding, and employee relations for growing teams.",
    skills: "Recruitment, Onboarding, HRIS basics, Employee relations, Contracts",
    languages: "English, Arabic",
    experience: [
      exp("HR Officer", "Nile Services", "Cairo, Egypt", "2020", "", true, [
        "Managed end-to-end recruitment for technical and admin roles",
        "Coordinated onboarding and maintained employee records",
      ]),
    ],
    education: [edu("Cairo University", "B.A.", "Business Administration", "2019")],
  }),
  sample("Project Manager", "Business", "executive", "Delivery & stakeholder management", {
    fullName: "Michael Brown",
    email: "michael.brown@email.com",
    phone: "+1 212 555 0199",
    location: "New York, USA",
    summary: "Project Manager delivering cross-functional initiatives on time and budget with clear governance and risk control.",
    skills: "Project planning, Risk management, Stakeholder communication, Agile/Waterfall, Budget tracking",
    certifications: "PMP",
    languages: "English",
    experience: [
      exp("Project Manager", "Harbor Consulting", "New York, USA", "2017", "", true, [
        "Led multi-workstream projects with schedules, RAID logs, and executive reporting",
        "Improved delivery predictability through weekly risk reviews",
      ]),
    ],
    education: [edu("State University", "B.Sc.", "Business", "2014")],
  }),
  sample("Sales Executive", "Business", "sales", "B2B sales & account growth", {
    fullName: "Sofia Martins",
    email: "sofia.martins@email.com",
    phone: "+55 11 90000 0000",
    location: "São Paulo, Brazil",
    summary: "Sales Executive focused on B2B pipeline generation, consultative selling, and long-term client relationships.",
    skills: "CRM, Pipeline management, Negotiation, Presentation, Prospecting",
    languages: "English, Portuguese, Spanish",
    experience: [
      exp("Sales Executive", "LatAm Solutions", "São Paulo, Brazil", "2019", "", true, [
        "Exceeded quarterly targets through structured prospecting and demos",
        "Managed key accounts and expanded upsell opportunities",
      ]),
    ],
    education: [edu("University of São Paulo", "B.A.", "Marketing", "2018")],
  }),
  sample("Nurse", "Healthcare", "healthcare", "Clinical care & patient safety", {
    fullName: "Grace Mwangi",
    email: "grace.mwangi@email.com",
    phone: "+254 700 000000",
    location: "Nairobi, Kenya",
    summary: "Registered Nurse providing safe, compassionate bedside care with strong medication administration and documentation practices.",
    skills: "Patient care, Medication administration, Vital signs, Infection control, EMR documentation",
    certifications: "RN license, BLS",
    languages: "English, Swahili",
    experience: [
      exp("Staff Nurse", "City Medical Center", "Nairobi, Kenya", "2019", "", true, [
        "Delivered bedside care for medical-surgical patients",
        "Administered medications and maintained accurate clinical records",
      ]),
    ],
    education: [edu("Nursing College", "Diploma", "Nursing", "2018")],
  }),
  sample("Teacher", "Education", "academic", "Classroom instruction & assessment", {
    fullName: "Amina Yusuf",
    email: "amina.yusuf@email.com",
    phone: "+252 61 0000000",
    location: "Hargeisa",
    summary: "Teacher experienced in lesson planning, classroom management, and student assessment for secondary learners.",
    skills: "Lesson planning, Classroom management, Assessment, Parent communication",
    languages: "English, Somali",
    experience: [
      exp("Secondary Teacher", "Horizon Academy", "Hargeisa", "2018", "", true, [
        "Planned and delivered lessons aligned to curriculum standards",
        "Tracked student progress and provided targeted support",
      ]),
    ],
    education: [edu("National University", "B.Ed.", "Education", "2017")],
  }),
  sample("Warehouse Supervisor", "Logistics", "logistics", "Inventory & team leadership", {
    fullName: "Tom Nguyen",
    email: "tom.nguyen@email.com",
    phone: "+84 90 000 0000",
    location: "Ho Chi Minh City, Vietnam",
    summary: "Warehouse Supervisor ensuring accurate inventory control, safe operations, and on-time order fulfillment.",
    skills: "Inventory control, WMS, Team leadership, Safety, Shift planning",
    languages: "English, Vietnamese",
    experience: [
      exp("Warehouse Supervisor", "Delta Logistics", "HCMC, Vietnam", "2018", "", true, [
        "Supervised shift teams for inbound/outbound operations",
        "Reduced picking errors through checklist and training routines",
      ]),
    ],
    education: [edu("Technical College", "Diploma", "Logistics", "2017")],
  }),
  sample("Hotel Receptionist", "Hospitality", "hospitality", "Guest services & front desk", {
    fullName: "Maria Lopez",
    email: "maria.lopez@email.com",
    phone: "+34 600 000 000",
    location: "Barcelona, Spain",
    summary: "Hotel Receptionist delivering professional guest check-in/out, reservations support, and high service standards.",
    skills: "Front desk systems, Reservations, Guest relations, Cash handling, Multilingual service",
    languages: "English, Spanish, French",
    experience: [
      exp("Receptionist", "Coastal Hotel", "Barcelona, Spain", "2020", "", true, [
        "Managed check-in/out and resolved guest requests promptly",
        "Coordinated with housekeeping and reservations for smooth occupancy",
      ]),
    ],
    education: [edu("Hospitality School", "Certificate", "Hotel Operations", "2019")],
  }),
  sample("Administrative Assistant", "Administration", "professional", "Office coordination", {
    fullName: "Emily Wright",
    email: "emily.wright@email.com",
    phone: "+1 312 555 0142",
    location: "Chicago, USA",
    summary: "Administrative Assistant supporting executives with scheduling, correspondence, and organized office operations.",
    skills: "Microsoft Office, Scheduling, Travel coordination, Filing, Confidentiality",
    languages: "English",
    experience: [
      exp("Administrative Assistant", "Midwest Partners", "Chicago, USA", "2019", "", true, [
        "Managed calendars, meetings, and travel arrangements",
        "Prepared correspondence and maintained confidential records",
      ]),
    ],
    education: [edu("Community College", "Associate", "Office Administration", "2018")],
  }),
  sample("Customer Service Representative", "Customer Service", "professional", "Support & retention", {
    fullName: "Noah Williams",
    email: "noah.williams@email.com",
    phone: "+1 647 555 0101",
    location: "Toronto, Canada",
    summary: "Customer Service Representative resolving inquiries across phone and chat channels with empathy and accuracy.",
    skills: "CRM, Call handling, Problem solving, De-escalation, Product knowledge",
    languages: "English, French (basic)",
    experience: [
      exp("Customer Service Representative", "NorthStar Support", "Toronto, Canada", "2021", "", true, [
        "Handled high-volume inquiries while meeting quality scores",
        "Documented cases accurately and escalated complex issues",
      ]),
    ],
    education: [edu("College Diploma", "Certificate", "Business Communications", "2020")],
  }),
  sample("Civil Engineer", "Engineering", "construction", "Site & structural coordination", {
    fullName: "Hassan Ibrahim",
    email: "hassan.ibrahim@email.com",
    phone: "+249 90 000 0000",
    location: "Khartoum",
    summary: "Civil Engineer experienced in site supervision, quantity take-offs, and coordination with consultants on building projects.",
    skills: "AutoCAD, Site supervision, BOQ, Concrete works awareness, Quality checks",
    languages: "English, Arabic",
    experience: [
      exp("Civil Engineer", "Nile Construction", "Khartoum", "2018", "", true, [
        "Supervised structural works and coordinated subcontractors",
        "Tracked materials and supported inspection requests",
      ]),
    ],
    education: [edu("University of Khartoum", "B.Sc.", "Civil Engineering", "2017")],
  }),
  sample("Pipe Fitter", "Oil & Gas / Trades", "oilgas", "Process piping fabrication", {
    fullName: "Andre Silva",
    email: "andre.silva@email.com",
    phone: "+55 21 90000 0000",
    location: "Rio de Janeiro, Brazil",
    summary: "Pipe Fitter experienced in fabrication, fit-up, and installation of process piping according to isometrics and safety rules.",
    skills: "Isometrics, Fit-up, Cutting/beveling, Flange management, PTW",
    languages: "English, Portuguese",
    experience: [
      exp("Pipe Fitter", "Atlantic Fabricators", "Rio de Janeiro, Brazil", "2017", "", true, [
        "Fabricated and installed piping spools per isometric drawings",
        "Supported hydrotest preparation and punch-list closure",
      ]),
    ],
    education: [edu("Trade School", "Certificate", "Piping", "2016")],
    template: "trades" as CvTemplateId,
  }),
  sample("Graduate Engineer", "Entry-Level", "graduate", "Early-career engineering", {
    fullName: "Aisha Noor",
    email: "aisha.noor@email.com",
    phone: "+966 53 000 0000",
    location: "Jeddah, Saudi Arabia",
    summary: "Graduate Engineer with strong academic foundations and internship experience seeking to contribute to engineering project teams.",
    skills: "AutoCAD, MS Office, Teamwork, Report writing, Basic project coordination",
    languages: "English, Arabic",
    experience: [
      exp("Engineering Intern", "Red Sea Projects", "Jeddah, Saudi Arabia", "2024", "2024", false, [
        "Assisted engineers with drawing updates and site documentation",
        "Prepared progress summaries for weekly meetings",
      ]),
    ],
    education: [edu("King Abdulaziz University", "B.Sc.", "Engineering", "2025")],
  }),
];

export const CV_SAMPLES: { meta: SampleCvMeta; data: CvData }[] = RAW;

export function listSampleCategories(): string[] {
  return [...new Set(CV_SAMPLES.map((s) => s.meta.category))].sort();
}

export function getSampleById(id: string) {
  return CV_SAMPLES.find((s) => s.meta.id === id) || null;
}
