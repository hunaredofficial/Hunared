"use client";

/**
 * Company Directory
 * Matches Jobs page pattern:
 * page header · left sticky filters · results grid
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  "[color-scheme:dark] h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0";

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
  const pageSize = 12;
  const [remoteCompanies, setRemoteCompanies] = useState<CompanyRecord[] | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(true);
  const [remoteTotal, setRemoteTotal] = useState(0);

  useEffect(() => setMounted(true), []);

  const searchParams = useSearchParams();

  // Apply header deep-links: ?hiring=1, ?verified=1
  useEffect(() => {
    const h = searchParams.get("hiring");
    const v = searchParams.get("verified");
    if (h === "1" || h === "true") setHiringOnly(true);
    if (v === "1" || v === "true") setVerifiedOnly(true);
  }, [searchParams]);

  // Load real companies from API (falls back to mock if empty/error)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setRemoteLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("limit", "100");
        if (appliedSearch) params.set("q", appliedSearch);
        if (industry) params.set("industry", industry);
        if (companyType) params.set("type", companyType);
        if (service) params.set("services", service);
        if (size) params.set("size", size);
        if (country) params.set("country", country);
        if (city.trim()) params.set("city", city.trim());
        if (verifiedOnly) params.set("verified", "1");
        if (featuredOnly) params.set("featured", "1");
        if (hiringOnly) params.set("hiring", "1");
        if (sort) params.set("sort", sort);

        const res = await fetch(`/api/companies?${params.toString()}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const rows = (data.companies || data.data || []) as any[];
        const mapped: CompanyRecord[] = rows.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          logo_url: c.logo_url ?? null,
          industry: Array.isArray(c.industry) ? c.industry : [],
          services: Array.isArray(c.services) ? c.services : [],
          company_type: c.company_type || "",
          business_size: c.business_size || "",
          headquarters_city: c.headquarters_city || "",
          headquarters_country: c.headquarters_country || "",
          country_code: c.headquarters_country_code || c.country_code || "",
          is_verified: c.verification_status === "verified" || c.is_verified === true,
          is_featured: Boolean(c.is_featured),
          is_hiring: Boolean(c.is_hiring),
          is_premium: Boolean(c.is_premium),
          followers_count: c.followers_count ?? 0,
          jobs_count: c.jobs_count ?? 0,
          rating_avg: Number(c.rating_avg ?? 0),
          reviews_count: c.reviews_count ?? 0,
          services_count: c.services_count ?? 0,
          founded_year: c.founded_year ?? null,
          employee_range: c.employee_range || "",
          about: c.about || c.short_description || "",
          updated_at: c.updated_at || c.created_at || "",
        }));
        if (!cancelled) {
          setRemoteCompanies(mapped);
          setRemoteTotal(data.total ?? mapped.length);
        }
      } catch {
        if (!cancelled) {
          setRemoteCompanies(null); // use mock
          setRemoteTotal(0);
        }
      } finally {
        if (!cancelled) setRemoteLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
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
    let list = remoteCompanies !== null
      ? [...remoteCompanies]
      : [...MOCK_COMPANIES];
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
    remoteCompanies,
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

  const featured = useMemo(() => {
    const base = remoteCompanies !== null ? remoteCompanies : MOCK_COMPANIES;
    return base.filter((c) => c.is_featured).slice(0, 4);
  }, [remoteCompanies]);

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
      {/* Page header — matches Jobs */}
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Companies
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {filtered.length > 0
                  ? `${filtered.length.toLocaleString()} compan${filtered.length !== 1 ? "ies" : "y"} found`
                  : "Discover verified employers and contractors"}
              </p>
            </div>
            <Button size="sm" className="shrink-0 font-semibold" asChild>
              <Link href="/register?goal=employer">Register company</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop left filters — Jobs pattern */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-border bg-card p-4 space-y-1">
              <div className="flex items-center justify-between pb-2 mb-1 border-b border-border/60">
                <span className="text-sm font-semibold">Filters</span>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="py-2.5 border-b border-border/60">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applySearch();
                    }}
                    placeholder="Search companies…"
                    className={cn(fieldClass, "h-9 pl-8 pr-9 text-sm")}
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    <VoiceSearchButton
                      onResult={(text) => {
                        setSearch(text);
                        setAppliedSearch(text.trim());
                        setPage(1);
                      }}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="w-full mt-2 h-8"
                  onClick={applySearch}
                >
                  Search
                </Button>
              </div>

              {/* Industry */}
              <div className="py-2.5 border-b border-border/60">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => {
                    setIndustry(e.target.value);
                    setPage(1);
                  }}
                  className={cn(fieldClass, "h-9 text-sm")}
                >
                  <option className="bg-background text-foreground" value="">
                    All industries
                  </option>
                  {INDUSTRIES.map((i) => (
                    <option className="bg-background text-foreground" key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="py-2.5 border-b border-border/60 space-y-2">
                <label className="text-xs font-medium text-muted-foreground block">
                  Location
                </label>
                <select
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setCity("");
                    setPage(1);
                  }}
                  className={cn(fieldClass, "h-9 text-sm")}
                >
                  <option className="bg-background text-foreground" value="">
                    All countries
                  </option>
                  {COUNTRIES.map((c) => (
                    <option className="bg-background text-foreground" key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                <CityCombobox
                  id="companies-city-sidebar"
                  country={country}
                  value={city}
                  onChange={(v) => {
                    setCity(v);
                    setPage(1);
                  }}
                  size="md"
                  variant="select"
                  inputClassName="rounded-md border-input h-9 text-sm"
                />
              </div>

              {/* Company type */}
              <div className="py-2.5 border-b border-border/60">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Company type
                </label>
                <select
                  value={companyType}
                  onChange={(e) => {
                    setCompanyType(e.target.value);
                    setPage(1);
                  }}
                  className={cn(fieldClass, "h-9 text-sm")}
                >
                  <option className="bg-background text-foreground" value="">
                    Any type
                  </option>
                  {COMPANY_TYPES.map((ct) => (
                    <option className="bg-background text-foreground" key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div className="py-2.5 border-b border-border/60">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Business size
                </label>
                <select
                  value={size}
                  onChange={(e) => {
                    setSize(e.target.value);
                    setPage(1);
                  }}
                  className={cn(fieldClass, "h-9 text-sm")}
                >
                  <option className="bg-background text-foreground" value="">
                    Any size
                  </option>
                  {BUSINESS_SIZES.map((s) => (
                    <option className="bg-background text-foreground" key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service */}
              <div className="py-2.5 border-b border-border/60">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Service
                </label>
                <select
                  value={service}
                  onChange={(e) => {
                    setService(e.target.value);
                    setPage(1);
                  }}
                  className={cn(fieldClass, "h-9 text-sm")}
                >
                  <option className="bg-background text-foreground" value="">
                    Any service
                  </option>
                  {COMMON_SERVICES.map((s) => (
                    <option className="bg-background text-foreground" key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggles */}
              <div className="py-2.5 border-b border-border/60 space-y-2">
                <label className="text-xs font-medium text-muted-foreground block">
                  Status
                </label>
                {(
                  [
                    ["Hiring now", hiringOnly, setHiringOnly],
                    ["Verified only", verifiedOnly, setVerifiedOnly],
                    ["Featured", featuredOnly, setFeaturedOnly],
                  ] as const
                ).map(([label, val, setVal]) => (
                  <label
                    key={label}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary"
                  >
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={(e) => {
                        setVal(e.target.checked);
                        setPage(1);
                      }}
                      className="rounded border-border"
                    />
                    {label}
                  </label>
                ))}
              </div>

              {/* Sort */}
              <div className="py-2.5">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Sort by
                </label>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as SortOption);
                    setPage(1);
                  }}
                  className={cn(fieldClass, "h-9 text-sm")}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option className="bg-background text-foreground" key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Main results */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter trigger */}
            <div className="lg:hidden mb-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applySearch();
                  }}
                  placeholder="Search companies…"
                  className={cn(fieldClass, "pl-9 pr-10 h-10")}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-1.5 shrink-0"
                onClick={() => setSheetOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {advancedCount > 0 && (
                  <span className="ml-0.5 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5">
                    {advancedCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Results meta */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-sm text-muted-foreground">
                {remoteLoading
                  ? "Loading…"
                  : `${filtered.length.toLocaleString()} result${filtered.length !== 1 ? "s" : ""}`}
              </p>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as SortOption);
                    setPage(1);
                  }}
                  className={cn(fieldClass, "h-8 w-auto text-xs min-w-[8rem]")}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option className="bg-background text-foreground" key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hiring chips when no filters */}
            {!hasFilters && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold">Hiring now</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(remoteCompanies ?? MOCK_COMPANIES)
                    .filter((c) => c.is_hiring)
                    .slice(0, 8)
                    .map((c) => (
                      <Link
                        key={"hire-" + c.id}
                        href={"/companies/" + c.slug}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-primary/40 hover:bg-primary/5 transition-colors"
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

            {pageItems.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-border bg-card">
                <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No companies found.</p>
                {hasFilters && (
                  <Button variant="outline" className="mt-4" onClick={clearAll}>
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {pageItems.map((c) => (
                    <CompanyCard key={c.id} company={c} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
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
          </div>
        </div>
      </div>

      {/* Mobile filters sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSheetOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-background border-r border-border shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Filters</h2>
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
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className={cn(fieldClass, "h-10")}
                >
                  <option value="">All industries</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setCity("");
                  }}
                  className={cn(fieldClass, "h-10")}
                >
                  <option value="">All countries</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  City
                </label>
                <CityCombobox
                  id="companies-city-sheet"
                  country={country}
                  value={city}
                  onChange={setCity}
                  size="md"
                  variant="select"
                  inputClassName="rounded-md border-input h-10"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Company type
                </label>
                <select
                  value={companyType}
                  onChange={(e) => setCompanyType(e.target.value)}
                  className={cn(fieldClass, "h-10")}
                >
                  <option value="">Any type</option>
                  {COMPANY_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Business size
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className={cn(fieldClass, "h-10")}
                >
                  <option value="">Any size</option>
                  {BUSINESS_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                {(
                  [
                    ["Hiring now", hiringOnly, setHiringOnly],
                    ["Verified only", verifiedOnly, setVerifiedOnly],
                    ["Featured", featuredOnly, setFeaturedOnly],
                  ] as const
                ).map(([label, val, setVal]) => (
                  <label key={label} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={(e) => setVal(e.target.checked)}
                      className="rounded border-border"
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Sort
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className={cn(fieldClass, "h-10")}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <Button variant="outline" className="flex-1" onClick={clearAll}>
                Clear
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setPage(1);
                  setSheetOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompanyCard({ company: c }: { company: CompanyRecord }) {
  return (
    <Link
      href={"/companies/" + c.slug}
      className="group flex flex-col rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 p-4 h-full"
    >
      <div className="flex gap-3 mb-3">
        <div className="h-12 w-12 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0 text-base font-bold text-primary">
          {c.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.logo_url}
              alt=""
              className="h-full w-full object-cover rounded-lg"
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
          <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-medium">
            <Star className="h-2.5 w-2.5" /> Featured
          </span>
        )}
        {c.is_hiring && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 text-[10px] font-medium">
            <Flame className="h-2.5 w-2.5" /> Hiring
          </span>
        )}
        {c.is_premium && (
          <span className="rounded-full bg-muted text-muted-foreground px-1.5 py-0.5 text-[10px] font-medium">
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
