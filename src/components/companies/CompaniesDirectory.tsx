"use client";

/**
 * Hunared Company Directory
 * Matches Jobs / Marketplace page pattern:
 * gradient hero · icon + gradient title · horizontal filter bar · results grid
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  MapPin,
  Briefcase,
  Star,
  Users,
  SlidersHorizontal,
  X,
  BadgeCheck,
  Flame,
  Globe2,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  INDUSTRIES,
  COMPANY_TYPES,
  BUSINESS_SIZES,
} from "@/lib/companyConstants";
import { COUNTRIES } from "@/lib/countries";
import { VoiceSearchButton } from "@/components/shared/VoiceSearchButton";
import { CityCombobox } from "@/components/shared/CityCombobox";
import { useGeo } from "@/components/providers/GeoProvider";

interface CompanyRecord {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  industry: string[];
  services: string[];
  company_type: string;
  business_size: string;
  headquarters_city: string;
  headquarters_country: string;
  country_code: string;
  is_verified: boolean;
  is_featured: boolean;
  is_hiring: boolean;
  is_premium: boolean;
  followers_count: number;
  jobs_count: number;
  rating_avg: number;
  reviews_count: number;
  services_count: number;
  founded_year: number | null;
  employee_range: string;
  about: string;
  updated_at: string;
}

type SortOption =
  | "relevant"
  | "az"
  | "za"
  | "newest"
  | "most_jobs"
  | "highest_rated"
  | "most_followed"
  | "hiring";

const COMMON_SERVICES = [
  "Accounting",
  "Actuarial Services",
  "Administration",
  "Advertising",
  "Advertising Technology",
  "Aerospace Services",
  "Agricultural Services",
  "Air Freight",
  "Airport Services",
  "App Development",
  "Appraisal Services",
  "Architectural Services",
  "Artificial Intelligence",
  "Asset Management",
  "Audit & Assurance",
  "Automation & Control",
  "Automotive Services",
  "Aviation Services",
  "Banking Services",
  "Banking Technology",
  "Beauty & Personal Care",
  "Benefits Administration",
  "Bioinformatics",
  "Biomedical Services",
  "Blockchain Services",
  "Branding",
  "Brokerage",
  "Building Inspection",
  "Building Maintenance",
  "Building Security",
  "Business Advisory",
  "Business Development",
  "Business Intelligence",
  "Business Process Outsourcing",
  "Business Support",
  "Budgeting & Financial Planning",
  "Calibration",
  "Capital Management",
  "Cargo & Freight",
  "Catering",
  "Certification",
  "Chemical Services",
  "Civil Engineering",
  "Cleaning Services",
  "Cloud Services",
  "Commercial Cleaning",
  "Commissioning Services",
  "Compliance Services",
  "Construction Services",
  "Consulting Services",
  "Contract Management",
  "Corporate Finance",
  "Corporate Services",
  "Courier & Delivery",
  "Cybersecurity",
  "Data Analytics",
  "Data Center Services",
  "Data Management",
  "Disaster Recovery",
  "Digital Marketing",
  "Digital Solutions",
  "Digital Transformation",
  "Document Management",
  "Drone Services",
  "Driving Services",
  "Due Diligence",
  "E-Commerce Services",
  "Electrical Engineering",
  "Electrical Installation",
  "Electrical Testing",
  "Electronics Services",
  "Emergency Response",
  "Employee Benefits",
  "Energy Auditing",
  "Energy Consulting",
  "Energy Management",
  "Engineering Services",
  "Environmental Consulting",
  "Environmental Management",
  "Equipment Inspection",
  "Equipment Rental",
  "Event Management",
  "Exhibition Services",
  "Executive Search",
  "Export Services",
  "Facility Cleaning",
  "Facility Management",
  "Fashion Services",
  "Financial Advisory",
  "Financial Management",
  "Financial Technology",
  "Fire Alarm Services",
  "Fire Protection",
  "Fire Safety",
  "Firefighting Services",
  "Fleet Management",
  "Food Catering",
  "Food Processing",
  "Food Safety",
  "Forensic Services",
  "Freight Forwarding",
  "Fund Management",
  "Furniture Services",
  "General Contracting",
  "Geospatial Services",
  "Geotechnical Engineering",
  "Government Contracting",
  "Government Relations",
  "Graphic Design",
  "Ground Transportation",
  "Guest Services",
  "Hazardous Materials Services",
  "Health & Safety",
  "Healthcare Services",
  "Heavy Equipment Services",
  "Hospitality Services",
  "Hotel Management",
  "Human Resources",
  "HVAC Services",
  "Import Services",
  "Industrial Automation",
  "Industrial Cleaning",
  "Industrial Design",
  "Industrial Engineering",
  "Industrial Inspection",
  "Industrial Maintenance",
  "Industrial Repair",
  "Industrial Services",
  "Information Security",
  "Infrastructure Services",
  "Installation Services",
  "Instrumentation Services",
  "Intellectual Property Services",
  "Interior Design",
  "International Trade",
  "Inventory Management",
  "Investment Advisory",
  "Investment Management",
  "IT Consulting",
  "IT Services",
  "IT Support",
  "Janitorial Services",
  "Job Placement",
  "Joint Venture Services",
  "Knowledge Management",
  "Kitchen Services",
  "Laboratory Services",
  "Laboratory Testing",
  "Landscaping",
  "Legal Services",
  "Leasing Services",
  "Logistics Services",
  "Loss Prevention",
  "Machine Learning",
  "Machinery Maintenance",
  "Maintenance Services",
  "Manpower Supply",
  "Management Consulting",
  "Marine Services",
  "Market Research",
  "Marketing",
  "Materials Testing",
  "Mechanical Engineering",
  "Mechanical Maintenance",
  "Media Services",
  "Medical Equipment Services",
  "Medical Services",
  "Metal Fabrication",
  "Metering Services",
  "Mining Services",
  "Mobile App Development",
  "Moving & Relocation",
  "Multimedia Production",
  "Network Cabling",
  "Network Installation",
  "Network Management",
  "Network Security",
  "Non-Destructive Testing (NDT)",
  "Notary Services",
  "Occupational Health",
  "Occupational Safety",
  "Oil & Gas Services",
  "Operations Management",
  "Outsourcing Services",
  "Painting & Coating",
  "Payroll Services",
  "Pest Control",
  "Pest Management",
  "Petroleum Services",
  "Pharmaceutical Services",
  "Photography",
  "Plumbing",
  "Port Services",
  "Procurement Services",
  "Process Engineering",
  "Product Design",
  "Product Development",
  "Professional Training",
  "Project Management",
  "Property Management",
  "Public Relations",
  "Publishing Services",
  "Quality Assurance",
  "Quality Control",
  "Quantity Surveying",
  "Real Estate Services",
  "Recruitment",
  "Recruitment Process Outsourcing",
  "Recycling",
  "Regulatory Affairs",
  "Renewable Energy",
  "Repair & Maintenance",
  "Research Services",
  "Residential Services",
  "Risk Management",
  "Road Services",
  "Robotics Services",
  "SAP & ERP Services",
  "Safety Consulting",
  "Scaffolding Services",
  "Search Engine Optimization (SEO)",
  "Security Services",
  "Shipping Services",
  "Site Management",
  "Social Media Services",
  "Software Consulting",
  "Software Development",
  "Software Testing",
  "Solar Energy",
  "Solar Installation",
  "Staffing Services",
  "Storage & Warehousing",
  "Strategic Consulting",
  "Structural Engineering",
  "Supply Chain Management",
  "Surveying & Mapping",
  "Sustainability Consulting",
  "Sustainability Services",
  "System Integration",
  "Tax Advisory",
  "Technical Consulting",
  "Technical Inspection",
  "Technical Staffing",
  "Telecom Infrastructure",
  "Telecommunications",
  "Testing Services",
  "Third-Party Inspection",
  "Training & Certification",
  "Training & Development",
  "Translation & Interpretation",
  "Transport Management",
  "Transportation",
  "Travel Management",
  "Travel Services",
  "Turnaround & Shutdown",
  "Utility Management",
  "Underwriting",
  "Urban Planning",
  "UX/UI Design",
  "Valuation & Appraisal",
  "Vehicle Rental",
  "Vehicle Repair",
  "Verification & Validation",
  "Video Production",
  "Virtual Assistant",
  "Visa & Immigration",
  "Vocational Training",
  "Warehouse Management",
  "Waste Collection",
  "Waste Management",
  "Wastewater Treatment",
  "Water Treatment",
  "Web Design",
  "Web Development",
  "Web Hosting",
  "Welding",
  "Well Testing",
  "Workplace Safety",
  "Workforce Management",
  "X-Ray & Imaging",
  "Yacht Charter",
  "Yacht Management",
  "Zero-Emission Services",
  "Zoning & Land Planning",
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevant", label: "Recommended" },
  { value: "hiring", label: "Hiring now" },
  { value: "az", label: "A–Z" },
  { value: "za", label: "Z–A" },
  { value: "newest", label: "Newest" },
  { value: "most_followed", label: "Most followed" },
  { value: "highest_rated", label: "Highest rated" },
  { value: "most_jobs", label: "Most jobs" },
];

const MOCK_COMPANIES: CompanyRecord[] = [
  {
    id: "1",
    slug: "abc-engineering",
    name: "ABC Engineering",
    logo_url: null,
    industry: ["Engineering", "Construction"],
    services: ["Engineering Services", "Project Management", "Inspection"],
    company_type: "Private Company",
    business_size: "Medium Enterprise",
    headquarters_city: "Riyadh",
    headquarters_country: "Saudi Arabia",
    country_code: "SA",
    is_verified: true,
    is_featured: true,
    is_hiring: true,
    is_premium: true,
    followers_count: 1280,
    jobs_count: 18,
    rating_avg: 4.6,
    reviews_count: 42,
    services_count: 12,
    founded_year: 2008,
    employee_range: "201–500",
    about:
      "Leading engineering and construction company specializing in industrial projects across the GCC.",
    updated_at: "2026-08-20T10:00:00Z",
  },
  {
    id: "2",
    slug: "gulf-manpower",
    name: "Gulf Manpower Solutions",
    logo_url: null,
    industry: ["Human Resources & Recruitment"],
    services: ["Recruitment", "Manpower Supply", "Training"],
    company_type: "Private Company",
    business_size: "Large Enterprise",
    headquarters_city: "Dubai",
    headquarters_country: "United Arab Emirates",
    country_code: "AE",
    is_verified: true,
    is_featured: false,
    is_hiring: true,
    is_premium: false,
    followers_count: 890,
    jobs_count: 34,
    rating_avg: 4.3,
    reviews_count: 67,
    services_count: 8,
    founded_year: 2012,
    employee_range: "501–1,000",
    about:
      "Trusted manpower supply and recruitment agency serving oil & gas and construction sectors.",
    updated_at: "2026-08-18T10:00:00Z",
  },
  {
    id: "3",
    slug: "technova-solutions",
    name: "TechNova Solutions",
    logo_url: null,
    industry: ["Information Technology", "Software & Technology"],
    services: ["Software Development", "IT Services"],
    company_type: "Startup",
    business_size: "Small Enterprise",
    headquarters_city: "Doha",
    headquarters_country: "Qatar",
    country_code: "QA",
    is_verified: false,
    is_featured: true,
    is_hiring: false,
    is_premium: false,
    followers_count: 320,
    jobs_count: 5,
    rating_avg: 4.8,
    reviews_count: 12,
    services_count: 6,
    founded_year: 2021,
    employee_range: "11–50",
    about:
      "Innovative software and digital transformation company focused on enterprise solutions.",
    updated_at: "2026-08-22T10:00:00Z",
  },
  {
    id: "4",
    slug: "desert-logistics",
    name: "Desert Logistics",
    logo_url: null,
    industry: ["Logistics & Supply Chain", "Transportation"],
    services: ["Logistics", "Transportation", "Procurement"],
    company_type: "Private Company",
    business_size: "Medium Enterprise",
    headquarters_city: "Jeddah",
    headquarters_country: "Saudi Arabia",
    country_code: "SA",
    is_verified: true,
    is_featured: false,
    is_hiring: true,
    is_premium: false,
    followers_count: 540,
    jobs_count: 9,
    rating_avg: 4.1,
    reviews_count: 28,
    services_count: 7,
    founded_year: 2015,
    employee_range: "51–200",
    about:
      "End-to-end logistics, freight forwarding and warehousing services across the Kingdom.",
    updated_at: "2026-08-15T10:00:00Z",
  },
  {
    id: "5",
    slug: "safe-hse-consultants",
    name: "SafeHSE Consultants",
    logo_url: null,
    industry: ["Consulting", "Oil & Gas"],
    services: ["Consulting", "Training", "Inspection", "Certification"],
    company_type: "Private Company",
    business_size: "Small Enterprise",
    headquarters_city: "Al Khobar",
    headquarters_country: "Saudi Arabia",
    country_code: "SA",
    is_verified: true,
    is_featured: false,
    is_hiring: false,
    is_premium: false,
    followers_count: 210,
    jobs_count: 2,
    rating_avg: 4.7,
    reviews_count: 19,
    services_count: 9,
    founded_year: 2010,
    employee_range: "11–50",
    about:
      "Specialist HSE consultancy providing risk assessment, training and compliance services.",
    updated_at: "2026-08-10T10:00:00Z",
  },
  {
    id: "6",
    slug: "horizon-construction",
    name: "Horizon Construction Group",
    logo_url: null,
    industry: ["Construction", "Engineering"],
    services: [
      "Construction Services",
      "Project Management",
      "Engineering Services",
    ],
    company_type: "Private Company",
    business_size: "Large Enterprise",
    headquarters_city: "Abu Dhabi",
    headquarters_country: "United Arab Emirates",
    country_code: "AE",
    is_verified: true,
    is_featured: true,
    is_hiring: true,
    is_premium: true,
    followers_count: 2100,
    jobs_count: 27,
    rating_avg: 4.4,
    reviews_count: 85,
    services_count: 15,
    founded_year: 2001,
    employee_range: "1,001–5,000",
    about:
      "Major main contractor delivering infrastructure, industrial and commercial projects.",
    updated_at: "2026-08-24T10:00:00Z",
  },
  {
    id: "7",
    slug: "jubail-inspection",
    name: "Jubail Industrial Inspection",
    logo_url: null,
    industry: ["Oil & Gas", "Petrochemical"],
    services: ["Inspection", "Testing", "Maintenance", "Certification"],
    company_type: "Private Company",
    business_size: "Medium Enterprise",
    headquarters_city: "Jubail",
    headquarters_country: "Saudi Arabia",
    country_code: "SA",
    is_verified: true,
    is_featured: false,
    is_hiring: true,
    is_premium: false,
    followers_count: 450,
    jobs_count: 11,
    rating_avg: 4.5,
    reviews_count: 31,
    services_count: 10,
    founded_year: 2009,
    employee_range: "51–200",
    about:
      "NDT, inspection and integrity services for oil & gas and petrochemical facilities in Jubail and Yanbu.",
    updated_at: "2026-08-21T10:00:00Z",
  },
];

const fieldClass =
  "[color-scheme:dark] h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

export function CompaniesDirectory() {
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [service, setService] = useState("");
  const [size, setSize] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [hiringOnly, setHiringOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("relevant");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [geoApplied, setGeoApplied] = useState(false);
  const pageSize = 12;
  const geo = useGeo();

  useEffect(() => setMounted(true), []);

  // Auto-detect country only (same as Jobs / Marketplace). City stays optional.
  useEffect(() => {
    if (geo.loading || geoApplied) return;
    if (!geo.countryCode) return;
    setCountry(geo.countryCode);
    setCity("");
    setGeoApplied(true);
  }, [geo.loading, geo.countryCode, geoApplied]);

  const applySearch = useCallback(() => {
    setAppliedSearch(search.trim());
    setPage(1);
  }, [search]);

  const clearAll = useCallback(() => {
    setSearch("");
    setAppliedSearch("");
    setIndustry("");
    setCompanyType("");
    setService("");
    setSize("");
    setCountry("");
    setCity("");
    setVerifiedOnly(false);
    setFeaturedOnly(false);
    setHiringOnly(false);
    setSort("relevant");
    setPage(1);
    setSheetOpen(false);
  }, []);

  const advancedCount = [
    companyType,
    service,
    size,
    verifiedOnly && "v",
    featuredOnly && "f",
    hiringOnly && "h",
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    let list = [...MOCK_COMPANIES];
    const q = appliedSearch.toLowerCase();
    if (q) {
      const tokens = q.split(/\s+/).filter(Boolean);
      list = list.filter((c) => {
        const hay = [
          c.name,
          c.about,
          c.company_type,
          c.headquarters_city,
          c.headquarters_country,
          ...c.industry,
          ...c.services,
        ]
          .join(" ")
          .toLowerCase();
        return tokens.every((t) => hay.includes(t));
      });
    }
    if (industry) list = list.filter((c) => c.industry.includes(industry));
    if (companyType) list = list.filter((c) => c.company_type === companyType);
    if (service) list = list.filter((c) => c.services.includes(service));
    if (size) list = list.filter((c) => c.business_size === size);
    if (country)
      list = list.filter(
        (c) =>
          c.country_code === country ||
          c.headquarters_country
            .toLowerCase()
            .includes(
              (
                COUNTRIES.find((x) => x.code === country)?.name || ""
              ).toLowerCase()
            )
      );
    if (city.trim()) {
      const ct = city.trim().toLowerCase();
      list = list.filter((c) =>
        c.headquarters_city.toLowerCase().includes(ct)
      );
    }
    if (verifiedOnly) list = list.filter((c) => c.is_verified);
    if (featuredOnly) list = list.filter((c) => c.is_featured);
    if (hiringOnly) list = list.filter((c) => c.is_hiring);

    switch (sort) {
      case "az":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        list.sort((a, b) => (b.founded_year || 0) - (a.founded_year || 0));
        break;
      case "most_jobs":
        list.sort((a, b) => b.jobs_count - a.jobs_count);
        break;
      case "highest_rated":
        list.sort((a, b) => b.rating_avg - a.rating_avg);
        break;
      case "most_followed":
        list.sort((a, b) => b.followers_count - a.followers_count);
        break;
      case "hiring":
        list.sort((a, b) => Number(b.is_hiring) - Number(a.is_hiring));
        break;
      default:
        list.sort((a, b) => {
          if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
          if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1;
          if (a.is_hiring !== b.is_hiring) return a.is_hiring ? -1 : 1;
          return b.rating_avg - a.rating_avg;
        });
    }
    return list;
  }, [
    appliedSearch,
    industry,
    companyType,
    service,
    size,
    country,
    city,
    verifiedOnly,
    featuredOnly,
    hiringOnly,
    sort,
  ]);

  const featured = useMemo(
    () => MOCK_COMPANIES.filter((c) => c.is_featured).slice(0, 4),
    []
  );

  const hasFilters = !!(
    appliedSearch ||
    industry ||
    companyType ||
    service ||
    size ||
    country ||
    city ||
    verifiedOnly ||
    featuredOnly ||
    hiringOnly
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const locationLabel = country
    ? COUNTRIES.find((c) => c.code === country)?.name || country
    : "";

  if (!mounted) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ── Hero (same pattern as Jobs / Marketplace) ───────── */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border py-12 pt-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-7 w-7 text-primary shrink-0" />
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span className="gradient-text">Hunared Company Directory</span>
            </h1>
          </div>
          <p className="text-muted-foreground max-w-xl mb-6">
            Discover verified employers, contractors, service providers and
            organizations worldwide. Search by industry, services, location and
            more.
          </p>

          {/* Horizontal filter bar — Marketplace style */}
          <div className="space-y-3">
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 lg:items-end">
              {/* Search */}
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applySearch();
                    }}
                    placeholder="Search companies…"
                    className={cn(fieldClass, "pl-9 pr-10")}
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <VoiceSearchButton
                      onResult={(text) => {
                        setSearch(text);
                        setAppliedSearch(text.trim());
                        setPage(1);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Industry */}
              <div className="w-full lg:w-44">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Industry
                </label>
                <select data-color-scheme="dark"
                  value={industry}
                  onChange={(e) => {
                    setIndustry(e.target.value);
                    setPage(1);
                  }}
                  className={fieldClass}
                >
                  <option className="bg-background text-foreground" value="">All Industries</option>
                  {INDUSTRIES.map((i) => (
                    <option className="bg-background text-foreground" key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div className="w-full lg:w-44">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Country
                </label>
                <select data-color-scheme="dark"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setCity("");
                    setPage(1);
                  }}
                  className={fieldClass}
                >
                  <option className="bg-background text-foreground" value="">All countries</option>
                  {COUNTRIES.map((c) => (
                    <option className="bg-background text-foreground" key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City — optional, writable + dropdown suggestions (same as Jobs) */}
              <div className="w-full lg:w-40">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  City
                </label>
                <CityCombobox
                  id="companies-city"
                  country={country}
                  value={city}
                  onChange={(v) => {
                    setCity(v);
                    setPage(1);
                  }}
                  size="md"
                  variant="select"
                  inputClassName="rounded-xl border-border h-10"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 lg:pb-0">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl gap-1.5"
                  onClick={() => setSheetOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {advancedCount > 0 && (
                    <span className="ml-0.5 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                      {advancedCount}
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  className="h-10 rounded-xl px-5"
                  onClick={applySearch}
                >
                  Search
                </Button>
                {hasFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 rounded-xl text-muted-foreground"
                    onClick={clearAll}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Active chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-1.5">
                {appliedSearch && (
                  <Chip
                    label={`“${appliedSearch}”`}
                    onClear={() => {
                      setSearch("");
                      setAppliedSearch("");
                    }}
                  />
                )}
                {industry && (
                  <Chip label={industry} onClear={() => setIndustry("")} />
                )}
                {companyType && (
                  <Chip label={companyType} onClear={() => setCompanyType("")} />
                )}
                {service && (
                  <Chip label={service} onClear={() => setService("")} />
                )}
                {size && <Chip label={size} onClear={() => setSize("")} />}
                {locationLabel && (
                  <Chip
                    label={locationLabel}
                    onClear={() => {
                      setCountry("");
                      setCity("");
                    }}
                  />
                )}
                {city && <Chip label={city} onClear={() => setCity("")} />}
                {verifiedOnly && (
                  <Chip
                    label="Verified"
                    onClear={() => setVerifiedOnly(false)}
                  />
                )}
                {featuredOnly && (
                  <Chip
                    label="Featured"
                    onClear={() => setFeaturedOnly(false)}
                  />
                )}
                {hiringOnly && (
                  <Chip label="Hiring" onClear={() => setHiringOnly(false)} />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Results ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Featured (only when no active filters) */}
        {!hasFilters && featured.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h2 className="text-base font-semibold">Featured companies</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {featured.map((c) => (
                <Link
                  key={c.id}
                  href={"/companies/" + c.slug}
                  className="group rounded-xl border border-border bg-card p-3.5 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl border border-border bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {c.name}
                        </span>
                        {c.is_verified && (
                          <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {c.headquarters_city} · {c.jobs_count} jobs
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Hiring now */}
        {!hasFilters && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-4 w-4 text-orange-500" />
              <h2 className="text-base font-semibold">Hiring now</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {MOCK_COMPANIES.filter((c) => c.is_hiring).map((c) => (
                <Link
                  key={"hire-" + c.id}
                  href={"/companies/" + c.slug}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.jobs_count} jobs
                  </span>
                  {c.is_verified && (
                    <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Count + sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-sm text-muted-foreground">
            {filtered.length} compan{filtered.length === 1 ? "y" : "ies"} found
            {appliedSearch && ` for "${appliedSearch}"`}
            {industry && ` · ${industry}`}
            {locationLabel && ` · ${locationLabel}`}
            {city && ` · ${city}`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Sort
            </span>
            <select data-color-scheme="dark"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="h-9 px-2.5 rounded-lg border border-border bg-background text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option className="bg-background text-foreground" key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {pageItems.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-lg">No companies found.</p>
            {hasFilters && (
              <Button variant="outline" className="mt-4" onClick={clearAll}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((c) => (
                <CompanyCard key={c.id} company={c} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA strip — like Marketplace */}
      <section className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-semibold mb-2">
            Represent a company?
          </h2>
          <p className="text-muted-foreground text-sm mb-5 max-w-md mx-auto">
            Create your company profile, post jobs, and reach talent on Hunared.
          </p>
          <Button asChild className="rounded-xl">
            <Link href="/register?goal=employer">Register your company</Link>
          </Button>
        </div>
      </section>

      {/* Advanced filters sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSheetOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-background border-l border-border shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">More filters</h2>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Company type
                </label>
                <select data-color-scheme="dark"
                  value={companyType}
                  onChange={(e) => setCompanyType(e.target.value)}
                  className={fieldClass}
                >
                  <option className="bg-background text-foreground" value="">All types</option>
                  {COMPANY_TYPES.map((t) => (
                    <option className="bg-background text-foreground" key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Services
                </label>
                <select data-color-scheme="dark"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className={fieldClass}
                >
                  <option className="bg-background text-foreground" value="">All services</option>
                  {COMMON_SERVICES.map((s) => (
                    <option className="bg-background text-foreground" key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Company size
                </label>
                <select data-color-scheme="dark"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className={fieldClass}
                >
                  <option className="bg-background text-foreground" value="">All sizes</option>
                  {BUSINESS_SIZES.map((s) => (
                    <option className="bg-background text-foreground" key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 pt-1">
                <p className="text-sm font-medium">Status</p>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="rounded border-border"
                  />
                  Verified only
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featuredOnly}
                    onChange={(e) => setFeaturedOnly(e.target.checked)}
                    className="rounded border-border"
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hiringOnly}
                    onChange={(e) => setHiringOnly(e.target.checked)}
                    className="rounded border-border"
                  />
                  Hiring now
                </label>
              </div>
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={clearAll}
              >
                Clear
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={() => {
                  setPage(1);
                  setSheetOpen(false);
                }}
              >
                Show {filtered.length}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium hover:bg-muted"
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  );
}

function CompanyCard({ company: c }: { company: CompanyRecord }) {
  return (
    <Link
      href={"/companies/" + c.slug}
      className="group flex flex-col rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all p-4 h-full"
    >
      <div className="flex gap-3 mb-3">
        <div className="h-12 w-12 rounded-xl border border-border bg-primary/10 flex items-center justify-center shrink-0 text-base font-bold text-primary">
          {c.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.logo_url}
              alt=""
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            c.name.charAt(0)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1">
            <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-1">
              {c.name}
            </h3>
            {c.is_verified && (
              <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {c.company_type}
            {c.industry[0] ? " · " + c.industry[0] : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {c.is_featured && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/12 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 text-[10px] font-medium">
            <Star className="h-2.5 w-2.5" /> Featured
          </span>
        )}
        {c.is_hiring && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/12 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 text-[10px] font-medium">
            <Flame className="h-2.5 w-2.5" /> Hiring
          </span>
        )}
        {c.is_premium && (
          <span className="rounded-full bg-violet-500/12 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 text-[10px] font-medium">
            Premium
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3 flex-1">
        {c.about}
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground border-t border-border/50 pt-2.5 mt-auto">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {c.headquarters_city}
        </span>
        {c.rating_avg > 0 && (
          <span className="inline-flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {c.rating_avg.toFixed(1)}
          </span>
        )}
        {c.jobs_count > 0 && (
          <span className="inline-flex items-center gap-0.5">
            <Briefcase className="h-3 w-3" />
            {c.jobs_count} jobs
          </span>
        )}
        <span className="inline-flex items-center gap-0.5">
          <Users className="h-3 w-3" />
          {c.followers_count.toLocaleString()}
        </span>
      </div>
    </Link>
  );
}
