/**
 * Company services catalog + industry → service recommendations.
 * Uses the full COMPANY_SERVICES list (same as companies section).
 */

import { COMPANY_SERVICES } from "@/lib/companyServices";

/** All services for multi-select (full catalog). */
export function allServices(): string[] {
  return [...COMPANY_SERVICES];
}

/**
 * Keyword groups mapped to services from COMPANY_SERVICES.
 * Used to recommend relevant services when industries are selected.
 */
const INDUSTRY_SERVICE_KEYWORDS: { match: RegExp; terms: string[] }[] = [
  {
    match: /oil\s*&\s*gas|petroleum|petrochemical|lng|upstream|downstream|refiner/i,
    terms: [
      "Oil & Gas Services",
      "Petroleum Services",
      "Turnaround & Shutdown",
      "Well Testing",
      "Non-Destructive Testing (NDT)",
      "Calibration",
      "Mechanical Engineering",
      "Mechanical Maintenance",
      "Electrical Engineering",
      "Electrical Installation",
      "Electrical Testing",
      "Automation & Control",
      "Industrial Automation",
      "Industrial Inspection",
      "Industrial Maintenance",
      "Engineering Services",
      "Process Engineering",
      "Project Management",
      "Health & Safety",
      "Safety Consulting",
      "Occupational Safety",
      "Workplace Safety",
      "Third-Party Inspection",
      "Technical Inspection",
      "Equipment Inspection",
      "Equipment Rental",
      "Scaffolding Services",
      "Welding",
      "Manpower Services",
      "Manpower Supply",
      "Recruitment",
      "Staffing Services",
      "Commissioning Services",
      "Quality Assurance",
      "Quality Control",
      "Logistics Services",
      "Procurement Services",
    ],
  },
  {
    match: /construction|infrastructure|building|civil|contract/i,
    terms: [
      "Construction Services",
      "General Contracting",
      "Civil Engineering",
      "Structural Engineering",
      "Architectural Services",
      "Project Management",
      "Site Management",
      "Quantity Surveying",
      "Building Inspection",
      "Scaffolding Services",
      "Electrical Installation",
      "HVAC Services",
      "Plumbing",
      "Painting & Coating",
      "Metal Fabrication",
      "Welding",
      "Heavy Equipment Services",
      "Equipment Rental",
      "Health & Safety",
      "Safety Consulting",
      "Manpower Services",
      "Manpower Supply",
      "Surveying & Mapping",
      "Geotechnical Engineering",
      "Interior Design",
      "Landscaping",
      "Road Services",
      "Infrastructure Services",
    ],
  },
  {
    match: /engineering|technical services|epc/i,
    terms: [
      "Engineering Services",
      "Civil Engineering",
      "Mechanical Engineering",
      "Electrical Engineering",
      "Process Engineering",
      "Industrial Engineering",
      "Structural Engineering",
      "Geotechnical Engineering",
      "Project Management",
      "Technical Consulting",
      "Technical Inspection",
      "Commissioning Services",
      "Automation & Control",
      "Industrial Automation",
      "Quality Assurance",
      "Quality Control",
    ],
  },
  {
    match: /information technology|software|it\b|digital|cyber|telecom/i,
    terms: [
      "IT Services",
      "IT Support",
      "IT Consulting",
      "Software Development",
      "Software Consulting",
      "Software Testing",
      "App Development",
      "Mobile App Development",
      "Web Development",
      "Web Design",
      "Web Hosting",
      "Cloud Services",
      "Cybersecurity",
      "Network Security",
      "Information Security",
      "Data Analytics",
      "Data Management",
      "Data Center Services",
      "Artificial Intelligence",
      "Machine Learning",
      "Digital Transformation",
      "Digital Solutions",
      "SAP & ERP Services",
      "System Integration",
      "Telecommunications",
      "Telecom Infrastructure",
      "UX/UI Design",
    ],
  },
  {
    match: /healthcare|medical|hospital|pharma|clinic/i,
    terms: [
      "Healthcare Services",
      "Medical Services",
      "Medical Equipment Services",
      "Laboratory Services",
      "Laboratory Testing",
      "Pharmaceutical Services",
      "Occupational Health",
      "Biomedical Services",
      "X-Ray & Imaging",
    ],
  },
  {
    match: /education|training|university|school|academy/i,
    terms: [
      "Professional Training",
      "Training & Development",
      "Training & Certification",
      "Vocational Training",
      "Technical Staffing",
    ],
  },
  {
    match: /logistics|transport|freight|shipping|warehouse|supply chain/i,
    terms: [
      "Logistics Services",
      "Freight Forwarding",
      "Cargo & Freight",
      "Air Freight",
      "Shipping Services",
      "Transportation",
      "Transport Management",
      "Ground Transportation",
      "Fleet Management",
      "Courier & Delivery",
      "Storage & Warehousing",
      "Warehouse Management",
      "Supply Chain Management",
      "Inventory Management",
      "Port Services",
      "Import Services",
      "Export Services",
      "International Trade",
    ],
  },
  {
    match: /real estate|property|facility management/i,
    terms: [
      "Real Estate Services",
      "Property Management",
      "Facility Management",
      "Building Maintenance",
      "Leasing Services",
      "Appraisal Services",
      "Valuation & Appraisal",
      "Cleaning Services",
      "Security Services",
      "Landscaping",
    ],
  },
  {
    match: /hospitality|hotel|tourism|restaurant|catering/i,
    terms: [
      "Hospitality Services",
      "Hotel Management",
      "Catering",
      "Food Catering",
      "Guest Services",
      "Event Management",
      "Travel Services",
      "Travel Management",
    ],
  },
  {
    match: /security|defense|guard/i,
    terms: [
      "Security Services",
      "Building Security",
      "Fire Safety",
      "Fire Protection",
      "Fire Alarm Services",
      "Loss Prevention",
      "Network Security",
      "Information Security",
      "Cybersecurity",
    ],
  },
  {
    match: /energy|power|renewable|solar|environment|water|waste/i,
    terms: [
      "Energy Management",
      "Energy Consulting",
      "Energy Auditing",
      "Renewable Energy",
      "Solar Energy",
      "Solar Installation",
      "Environmental Consulting",
      "Environmental Management",
      "Waste Management",
      "Waste Collection",
      "Wastewater Treatment",
      "Water Treatment",
      "Sustainability Consulting",
      "Sustainability Services",
      "Zero-Emission Services",
      "Utility Management",
    ],
  },
  {
    match: /manpower|recruitment|human resources|staffing|outsourcing/i,
    terms: [
      "Manpower Services",
      "Manpower Supply",
      "Recruitment",
      "Staffing Services",
      "Technical Staffing",
      "Human Resources",
      "Payroll Services",
      "Job Placement",
      "Executive Search",
      "Outsourcing Services",
      "Business Process Outsourcing",
      "Recruitment Process Outsourcing",
      "Workforce Management",
      "Visa & Immigration",
    ],
  },
  {
    match: /manufacturing|industrial|fabrication|production/i,
    terms: [
      "Industrial Services",
      "Industrial Maintenance",
      "Industrial Repair",
      "Industrial Inspection",
      "Industrial Automation",
      "Industrial Cleaning",
      "Industrial Design",
      "Industrial Engineering",
      "Metal Fabrication",
      "Welding",
      "Machinery Maintenance",
      "Quality Assurance",
      "Quality Control",
      "Process Engineering",
    ],
  },
  {
    match: /finance|bank|accounting|audit|legal|consult|insurance/i,
    terms: [
      "Accounting",
      "Audit & Assurance",
      "Tax Advisory",
      "Financial Advisory",
      "Financial Management",
      "Corporate Finance",
      "Banking Services",
      "Insurance Services",
      "Legal Services",
      "Compliance Services",
      "Risk Management",
      "Business Advisory",
      "Management Consulting",
      "Consulting Services",
      "Investment Advisory",
      "Investment Management",
    ],
  },
  {
    match: /inspection|ndt|certification|qa\/qc|testing|calibration/i,
    terms: [
      "Non-Destructive Testing (NDT)",
      "Third-Party Inspection",
      "Technical Inspection",
      "Equipment Inspection",
      "Industrial Inspection",
      "Building Inspection",
      "Calibration",
      "Certification",
      "Testing Services",
      "Materials Testing",
      "Laboratory Testing",
      "Quality Assurance",
      "Quality Control",
      "Verification & Validation",
    ],
  },
  {
    match: /mechanical|hvac|rotating|piping|welding/i,
    terms: [
      "Mechanical Engineering",
      "Mechanical Maintenance",
      "HVAC Services",
      "Welding",
      "Metal Fabrication",
      "Plumbing",
      "Repair & Maintenance",
      "Industrial Maintenance",
      "Machinery Maintenance",
    ],
  },
  {
    match: /electrical|power distribution|substation/i,
    terms: [
      "Electrical Engineering",
      "Electrical Installation",
      "Electrical Testing",
      "Electronics Services",
      "Automation & Control",
      "Industrial Automation",
      "Network Cabling",
      "Network Installation",
    ],
  },
  {
    match: /marketing|advertising|media|brand|digital marketing/i,
    terms: [
      "Marketing",
      "Digital Marketing",
      "Advertising",
      "Branding",
      "Public Relations",
      "Social Media Services",
      "Graphic Design",
      "Media Services",
      "Photography",
      "Video Production",
      "Search Engine Optimization",
    ],
  },
  {
    match: /mining|mineral|quarry/i,
    terms: [
      "Mining Services",
      "Engineering Services",
      "Heavy Equipment Services",
      "Equipment Rental",
      "Health & Safety",
      "Surveying & Mapping",
      "Geospatial Services",
    ],
  },
  {
    match: /marine|maritime|offshore|ship/i,
    terms: [
      "Marine Services",
      "Port Services",
      "Shipping Services",
      "Oil & Gas Services",
      "Engineering Services",
      "Welding",
      "Health & Safety",
    ],
  },
];

/**
 * Recommend services for selected industries using the full COMPANY_SERVICES catalog.
 * User remains in full control — nothing is auto-forced.
 */
export function recommendServicesForIndustries(
  industries: string[] | null | undefined
): string[] {
  if (!industries?.length) return [];

  const catalog = new Set<string>(COMPANY_SERVICES as unknown as string[]);
  const seen = new Set<string>();
  const out: string[] = [];

  for (const ind of industries) {
    for (const hint of INDUSTRY_SERVICE_KEYWORDS) {
      if (!hint.match.test(ind)) continue;
      for (const term of hint.terms) {
        if (catalog.has(term) && !seen.has(term)) {
          seen.add(term);
          out.push(term);
        }
      }
    }
  }

  // Fallback recommendations if industry did not match
  if (out.length === 0) {
    const fallback = [
      "Engineering Services",
      "Project Management",
      "Consulting Services",
      "Manpower Services",
      "Health & Safety",
      "Quality Control",
      "Logistics Services",
      "IT Services",
    ];
    for (const s of fallback) {
      if (catalog.has(s) && !seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
    }
  }

  return out;
}
