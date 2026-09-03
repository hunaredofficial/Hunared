"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  ChevronDown,
  ArrowRight,
  LayoutGrid,
  List,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { VoiceSearchButton } from "@/components/shared/VoiceSearchButton";
import { CityCombobox } from "@/components/shared/CityCombobox";
import { useGeo } from "@/components/providers/GeoProvider";

const FINDER_CATEGORY = "lost_found";

/** Lost & Found item types — used in browse + post listing */
export const FINDER_ITEM_CATEGORIES = [
  "Mobile Phones",
  "Laptops",
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
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "lost", label: "Lost" },
  { value: "found", label: "Found" },
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  // Gulf / Middle East (your original + expansions)
  SA: ["Riyadh", "Jeddah", "Dammam", "Khobar", "Dhahran", "Jubail", "Yanbu", "Makkah", "Madinah", "Taif", "Abha", "Tabuk", "Hail", "Najran", "Jazan", "Buraidah", "Hofuf", "Neom"],
  AE: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Al Ain"],
  QA: ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor", "Lusail", "Mesaieed"],
  KW: ["Kuwait City", "Hawalli", "Salmiya", "Jahra", "Ahmadi", "Fahaheel", "Mahboula"],
  OM: ["Muscat", "Salalah", "Sohar", "Nizwa", "Sur", "Seeb", "Ibri"],
  BH: ["Manama", "Riffa", "Muharraq", "Hamad Town", "Isa Town", "Juffair"],

  // South Asia
  PK: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Hyderabad", "Gujranwala"],
  IN: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad"],
  BD: ["Dhaka", "Chittagong", "Khulna", "Sylhet", "Rajshahi", "Gazipur", "Narayanganj"],
  NP: ["Kathmandu", "Pokhara", "Lalitpur", "Biratnagar", "Bharatpur"],
  LK: ["Colombo", "Kandy", "Galle", "Jaffna", "Negombo", "Trincomalee"],
  AF: ["Kabul", "Kandahar", "Herat", "Mazar-i-Sharif", "Jalalabad"],
  BT: ["Thimphu", "Phuntsholing", "Paro"],
  MV: ["Malé", "Addu City"],

  // Southeast Asia
  PH: ["Manila", "Cebu", "Davao", "Quezon City", "Makati", "Taguig", "Pasig", "Cagayan de Oro", "Zamboanga", "Bacolod"],
  ID: ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Palembang", "Tangerang", "Depok", "Bekasi", "Yogyakarta"],
  MY: ["Kuala Lumpur", "George Town", "Johor Bahru", "Ipoh", "Shah Alam", "Petaling Jaya", "Kota Kinabalu", "Kuching", "Malacca"],
  TH: ["Bangkok", "Chiang Mai", "Pattaya", "Phuket", "Hat Yai", "Nonthaburi", "Nakhon Ratchasima"],
  VN: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hai Phong", "Can Tho", "Bien Hoa", "Nha Trang"],
  SG: ["Singapore"],
  BN: ["Bandar Seri Begawan"],
  KH: ["Phnom Penh", "Siem Reap", "Battambang", "Sihanoukville"],
  LA: ["Vientiane", "Luang Prabang", "Pakse", "Savannakhet"],
  MM: ["Yangon", "Mandalay", "Naypyidaw", "Mawlamyine"],
  TL: ["Dili"],

  // East Asia
  CN: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Chongqing", "Tianjin", "Wuhan", "Hangzhou", "Xi'an", "Nanjing", "Suzhou", "Dongguan", "Qingdao", "Zhengzhou"],
  JP: ["Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kyoto", "Kawasaki", "Saitama", "Hiroshima", "Sendai"],
  KR: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon", "Ulsan"],
  TW: ["Taipei", "Kaohsiung", "Taichung", "Tainan", "New Taipei", "Taoyuan"],
  HK: ["Hong Kong"],
  MO: ["Macau"],
  MN: ["Ulaanbaatar", "Erdenet", "Darkhan"],
  KP: ["Pyongyang", "Hamhung", "Chongjin", "Nampo"],

  // Central Asia
  KZ: ["Astana", "Almaty", "Shymkent", "Karaganda", "Aktobe", "Taraz"],
  UZ: ["Tashkent", "Samarkand", "Bukhara", "Namangan", "Andijan", "Nukus"],
  KG: ["Bishkek", "Osh", "Jalal-Abad"],
  TJ: ["Dushanbe", "Khujand", "Kulob"],
  TM: ["Ashgabat", "Turkmenabat", "Dashoguz"],

  // Middle East / West Asia
  EG: ["Cairo", "Alexandria", "Giza", "Sharm El Sheikh", "Hurghada", "Port Said", "Suez", "Luxor", "Aswan", "Mansoura"],
  JO: ["Amman", "Irbid", "Zarqa", "Aqaba", "Salt", "Madaba"],
  IQ: ["Baghdad", "Basra", "Mosul", "Erbil", "Najaf", "Karbala", "Kirkuk", "Sulaymaniyah"],
  IR: ["Tehran", "Mashhad", "Isfahan", "Karaj", "Shiraz", "Tabriz", "Qom", "Ahvaz"],
  SY: ["Damascus", "Aleppo", "Homs", "Latakia", "Hama"],
  LB: ["Beirut", "Tripoli", "Sidon", "Tyre", "Zahle", "Byblos"],
  IL: ["Jerusalem", "Tel Aviv", "Haifa", "Rishon LeZion", "Petah Tikva", "Ashdod", "Netanya"],
  PS: ["Ramallah", "Gaza", "Hebron", "Nablus", "Bethlehem"],
  YE: ["Sana'a", "Aden", "Taiz", "Hodeidah", "Mukalla"],
  TR: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Gaziantep", "Konya", "Mersin"],
  CY: ["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta"],
  GE: ["Tbilisi", "Batumi", "Kutaisi", "Rustavi"],
  AM: ["Yerevan", "Gyumri", "Vanadzor"],
  AZ: ["Baku", "Ganja", "Sumqayit", "Mingachevir"],

  // Europe
  GB: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool", "Bristol", "Sheffield", "Edinburgh", "Leicester", "Coventry", "Bradford", "Cardiff", "Belfast"],
  FR: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims"],
  DE: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen", "Bremen", "Dresden", "Hanover", "Nuremberg"],
  IT: ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania", "Venice", "Verona"],
  ES: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao", "Alicante", "Córdoba"],
  NL: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen", "Tilburg", "Almere"],
  BE: ["Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges", "Namur"],
  CH: ["Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Winterthur", "Lucerne"],
  AT: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck"],
  SE: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås", "Örebro"],
  NO: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen"],
  DK: ["Copenhagen", "Aarhus", "Odense", "Aalborg"],
  FI: ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku"],
  PL: ["Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin", "Bydgoszcz", "Lublin"],
  CZ: ["Prague", "Brno", "Ostrava", "Plzeň", "Liberec"],
  HU: ["Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs", "Győr"],
  RO: ["Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Craiova", "Brașov"],
  PT: ["Lisbon", "Porto", "Braga", "Coimbra", "Funchal", "Setúbal"],
  GR: ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa", "Volos"],
  IE: ["Dublin", "Cork", "Limerick", "Galway", "Waterford"],
  RU: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan", "Nizhny Novgorod", "Chelyabinsk", "Samara", "Omsk", "Rostov-on-Don", "Ufa", "Krasnoyarsk", "Voronezh", "Perm", "Volgograd"],
  UA: ["Kyiv", "Kharkiv", "Odesa", "Dnipro", "Donetsk", "Zaporizhzhia", "Lviv", "Kryvyi Rih"],
  BY: ["Minsk", "Gomel", "Mogilev", "Vitebsk", "Grodno", "Brest"],
  BG: ["Sofia", "Plovdiv", "Varna", "Burgas", "Ruse"],
  RS: ["Belgrade", "Novi Sad", "Niš", "Kragujevac"],
  HR: ["Zagreb", "Split", "Rijeka", "Osijek", "Zadar"],
  SI: ["Ljubljana", "Maribor", "Celje"],
  SK: ["Bratislava", "Košice", "Prešov", "Žilina"],
  LT: ["Vilnius", "Kaunas", "Klaipėda", "Šiauliai"],
  LV: ["Riga", "Daugavpils", "Liepāja", "Jelgava"],
  EE: ["Tallinn", "Tartu", "Narva"],
  IS: ["Reykjavik", "Kópavogur", "Hafnarfjörður", "Akureyri"],
  LU: ["Luxembourg City", "Esch-sur-Alzette"],
  MT: ["Valletta", "Birkirkara", "Mosta", "Qormi", "Sliema"],
  AL: ["Tirana", "Durrës", "Vlorë", "Shkodër", "Elbasan"],
  MK: ["Skopje", "Bitola", "Kumanovo", "Prilep"],
  BA: ["Sarajevo", "Banja Luka", "Tuzla", "Zenica", "Mostar"],
  ME: ["Podgorica", "Nikšić", "Herceg Novi", "Bar"],
  XK: ["Pristina", "Prizren", "Mitrovica", "Peja"],
  MD: ["Chișinău", "Tiraspol", "Bălți", "Bender"],

  // Africa
  NG: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City", "Kaduna", "Enugu", "Aba", "Onitsha"],
  ZA: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "East London", "Soweto"],
  KE: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
  ET: ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Bahir Dar", "Hawassa"],
  GH: ["Accra", "Kumasi", "Tamale", "Takoradi", "Cape Coast"],
  TZ: ["Dar es Salaam", "Dodoma", "Mwanza", "Arusha", "Mbeya", "Zanzibar City"],
  UG: ["Kampala", "Gulu", "Lira", "Mbarara", "Jinja"],
  DZ: ["Algiers", "Oran", "Constantine", "Annaba", "Blida", "Batna"],
  MA: ["Casablanca", "Rabat", "Fes", "Marrakech", "Tangier", "Agadir", "Meknes", "Oujda"],
  TN: ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès"],
  LY: ["Tripoli", "Benghazi", "Misrata", "Bayda", "Zawiya"],
  SD: ["Khartoum", "Omdurman", "Port Sudan", "Kassala", "Nyala"],
  AO: ["Luanda", "Huambo", "Lobito", "Benguela", "Lubango"],
  MZ: ["Maputo", "Matola", "Beira", "Nampula", "Chimoio"],
  CM: ["Douala", "Yaoundé", "Garoua", "Bamenda", "Bafoussam"],
  CI: ["Abidjan", "Bouaké", "Yamoussoukro", "Daloa", "San-Pédro"],
  SN: ["Dakar", "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor"],
  ML: ["Bamako", "Sikasso", "Mopti", "Koutiala", "Ségou"],
  BF: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Ouahigouya"],
  NE: ["Niamey", "Zinder", "Maradi", "Agadez"],
  TD: ["N'Djamena", "Moundou", "Sarh", "Abéché"],
  CD: ["Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kananga", "Kisangani", "Goma"],
  CG: ["Brazzaville", "Pointe-Noire", "Dolisie"],
  GA: ["Libreville", "Port-Gentil", "Franceville"],
  RW: ["Kigali", "Butare", "Gisenyi", "Ruhengeri"],
  BI: ["Bujumbura", "Gitega", "Ngozi"],
  ZM: ["Lusaka", "Kitwe", "Ndola", "Kabwe", "Livingstone"],
  ZW: ["Harare", "Bulawayo", "Chitungwiza", "Mutare", "Gweru"],
  BW: ["Gaborone", "Francistown", "Molepolole", "Maun"],
  NA: ["Windhoek", "Walvis Bay", "Swakopmund", "Rundu"],
  MW: ["Lilongwe", "Blantyre", "Mzuzu", "Zomba"],
  MG: ["Antananarivo", "Toamasina", "Antsirabe", "Mahajanga", "Fianarantsoa"],
  MU: ["Port Louis", "Beau Bassin-Rose Hill", "Vacoas-Phoenix", "Curepipe"],
  SC: ["Victoria"],
  RE: ["Saint-Denis", "Saint-Paul", "Saint-Pierre"],
  DJ: ["Djibouti"],
  ER: ["Asmara", "Keren", "Massawa", "Assab"],
  SO: ["Mogadishu", "Hargeisa", "Bosaso", "Kismayo", "Merca"],
  SS: ["Juba", "Wau", "Malakal", "Yei"],
  GQ: ["Malabo", "Bata", "Ebebiyín"],
  GW: ["Bissau", "Bafatá"],
  GN: ["Conakry", "Nzérékoré", "Kankan", "Kindia"],
  SL: ["Freetown", "Bo", "Kenema", "Makeni"],
  LR: ["Monrovia", "Gbarnga", "Kakata", "Buchanan"],
  TG: ["Lomé", "Sokodé", "Kara"],
  BJ: ["Cotonou", "Porto-Novo", "Parakou", "Djougou", "Abomey"],
  CV: ["Praia", "Mindelo", "Santa Maria"],
  ST: ["São Tomé"],
  KM: ["Moroni", "Mutsamudu"],
  MR: ["Nouakchott", "Nouadhibou", "Rosso"],
  EH: ["Laayoune", "Dakhla"],

  // Americas
  US: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", "Seattle", "Denver", "Washington", "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City", "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore", "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento", "Mesa", "Kansas City", "Atlanta", "Omaha", "Colorado Springs", "Raleigh", "Miami", "Virginia Beach", "Oakland", "Minneapolis", "Tulsa", "Tampa", "Arlington", "New Orleans"],
  CA: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener", "London", "Victoria", "Halifax", "Oshawa", "Windsor"],
  MX: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Zapopan", "Mérida", "San Luis Potosí", "Aguascalientes", "Hermosillo", "Saltillo", "Mexicali", "Culiacán", "Acapulco", "Querétaro", "Morelia", "Chihuahua", "Cancún"],
  BR: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Goiânia", "Belém", "Porto Alegre", "Guarulhos", "Campinas", "São Luís", "São Gonçalo", "Maceió", "Duque de Caxias", "Natal", "Teresina"],
  AR: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "Tucumán", "La Plata", "Mar del Plata", "Salta", "Santa Fe"],
  CO: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira", "Santa Marta"],
  CL: ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta", "Temuco", "Rancagua", "Iquique", "Puerto Montt"],
  PE: ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Iquitos", "Cusco", "Huancayo", "Chimbote"],
  VE: ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana", "Barcelona", "Maturín", "San Cristóbal"],
  EC: ["Guayaquil", "Quito", "Cuenca", "Santo Domingo", "Machala", "Manta", "Portoviejo", "Ambato"],
  BO: ["Santa Cruz", "La Paz", "El Alto", "Cochabamba", "Oruro", "Sucre", "Tarija", "Potosí"],
  PY: ["Asunción", "Ciudad del Este", "San Lorenzo", "Luque", "Capiatá", "Lambaré"],
  UY: ["Montevideo", "Salto", "Ciudad de la Costa", "Paysandú", "Las Piedras", "Rivera"],
  GY: ["Georgetown", "Linden", "New Amsterdam"],
  SR: ["Paramaribo", "Lelydorp", "Nieuw Nickerie"],
  GF: ["Cayenne", "Saint-Laurent-du-Maroni", "Kourou"],
  PA: ["Panama City", "San Miguelito", "Colón", "David", "La Chorrera", "Santiago"],
  CR: ["San José", "Limón", "Alajuela", "Heredia", "Cartago", "Puntarenas"],
  NI: ["Managua", "León", "Masaya", "Chinandega", "Matagalpa", "Estelí"],
  HN: ["Tegucigalpa", "San Pedro Sula", "Choloma", "La Ceiba", "El Progreso", "Choluteca"],
  SV: ["San Salvador", "Santa Ana", "San Miguel", "Mejicanos", "Soyapango", "Apopa"],
  GT: ["Guatemala City", "Mixco", "Villa Nueva", "Quetzaltenango", "Escuintla", "Chinautla"],
  BZ: ["Belize City", "San Ignacio", "Belmopan", "Orange Walk", "San Pedro"],
  CU: ["Havana", "Santiago de Cuba", "Camagüey", "Holguín", "Santa Clara", "Guantánamo"],
  DO: ["Santo Domingo", "Santiago", "Santo Domingo Este", "Santo Domingo Norte", "Santo Domingo Oeste", "San Pedro de Macorís", "La Romana", "Puerto Plata"],
  HT: ["Port-au-Prince", "Cap-Haïtien", "Gonaïves", "Les Cayes", "Port-de-Paix", "Jacmel"],
  JM: ["Kingston", "Spanish Town", "Portmore", "Montego Bay", "May Pen"],
  TT: ["Port of Spain", "San Fernando", "Chaguanas", "Arima", "Point Fortin"],
  BB: ["Bridgetown", "Speightstown", "Oistins", "Holetown"],
  BS: ["Nassau", "Freeport", "West End"],
  PR: ["San Juan", "Bayamón", "Carolina", "Ponce", "Caguas", "Guaynabo"],

  // Oceania
  AU: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Wollongong", "Geelong", "Hobart", "Townsville", "Cairns", "Darwin", "Toowoomba"],
  NZ: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Napier-Hastings", "Dunedin", "Palmerston North", "Nelson", "Rotorua"],
  FJ: ["Suva", "Nadi", "Lautoka", "Labasa"],
  PG: ["Port Moresby", "Lae", "Mount Hagen", "Madang", "Goroka"],
  SB: ["Honiara"],
  VU: ["Port Vila", "Luganville"],
  NC: ["Nouméa"],
  PF: ["Papeete", "Faaa"],
  WS: ["Apia"],
  TO: ["Nukuʻalofa"],
  KI: ["South Tarawa"],
  FM: ["Palikir", "Weno"],
  MH: ["Majuro"],
  PW: ["Ngerulmud", "Koror"],
  TV: ["Funafuti"],
  NR: ["Yaren"],

  // Others / Territories (selected useful ones)
  GL: ["Nuuk", "Sisimiut", "Ilulissat"],
  FO: ["Tórshavn", "Klaksvík"],
  GI: ["Gibraltar"],
  IM: ["Douglas"],
  JE: ["Saint Helier"],
  GG: ["Saint Peter Port"],
  AX: ["Mariehamn"],
  AW: ["Oranjestad"],
  CW: ["Willemstad"],
  SX: ["Philipsburg"],
  BQ: ["Kralendijk"],
  KY: ["George Town"],
  BM: ["Hamilton"],
  VG: ["Road Town"],
  VI: ["Charlotte Amalie"],
  AS: ["Pago Pago"],
  GU: ["Hagåtña", "Dededo"],
  MP: ["Saipan"],
  CK: ["Avarua"],
  NU: ["Alofi"],
  TK: ["Nukunonu"],
  WF: ["Mata-Utu"],
  PM: ["Saint-Pierre"],
  BL: ["Gustavia"],
  MF: ["Marigot"],
  GP: ["Basse-Terre", "Pointe-à-Pitre"],
  MQ: ["Fort-de-France"],
  RE: ["Saint-Denis"],
  YT: ["Mamoudzou"],
  TF: [],
  AQ: [],
  BV: [],
  HM: [],
  GS: [],
  IO: ["Diego Garcia"],
  UM: [],
};

export function HunaredFinder() {
  const router = useRouter();
  const geo = useGeo();
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("");
  const [showCategories, setShowCategories] = useState(false);

  // Auto-fill country/city from geo when user hasn't chosen yet
  useEffect(() => {
    if (geo.loading) return;
    if (country) return; // user already chose
    if (geo.countryCode) setCountry(geo.countryCode);
    // city stays empty = All Cities
  }, [geo.loading, geo.countryCode, country]);

  const cities = useMemo(() => {
    if (!country) return [];
    return CITIES_BY_COUNTRY[country] ?? ["Other"];
  }, [country]);

  function handleCountryChange(code: string) {
    setCountry(code);
    setCity("");
  }

  function handleSearch(e?: FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    params.set("category", FINDER_CATEGORY);
    if (keyword.trim()) params.set("search", keyword.trim());
    if (country) params.set("country", country);
    if (city) params.set("city", city);
    if (status) params.set("status", status);
    router.push(`/market?${params.toString()}`);
  }

  function openItemCategory(item: string) {
    const params = new URLSearchParams();
    params.set("category", FINDER_CATEGORY);
    params.set("subcategory", item);
    if (status) params.set("status", status);
    if (country) params.set("country", country);
    if (city) params.set("city", city);
    router.push(`/market?${params.toString()}`);
  }

  return (
    <section className="py-14 sm:py-16 md:py-20 bg-muted/25">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-card border border-primary/20 brand-glow p-8 sm:p-10 md:p-12 space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Community Service
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              <span className="gradient-text">Hunared Finder</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Lost something? Found an item? Search by type, or report an item so
              the community can help.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary pointer-events-none" />
              <input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search lost or found items..."
                className="w-full h-14 pl-12 pr-12 rounded-2xl border border-primary/15 bg-background/70 text-base focus:outline-none focus:ring-2 focus:ring-primary/35"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <VoiceSearchButton
                  onResult={(t) => setKeyword(t)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <select data-color-scheme="dark"
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="[color-scheme:dark] w-full h-12 pl-9 pr-8 rounded-xl border border-primary/15 bg-background/70 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  <option className="bg-background text-foreground" value="">All Countries</option>
                  {COUNTRIES.map((c) => (
                    <option className="bg-background text-foreground" key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              <CityCombobox
                id="finder-city"
                country={country}
                value={city}
                onChange={setCity}
                size="lg"
                variant="hero"
              />

              <div className="relative">
                <select data-color-scheme="dark"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="[color-scheme:dark] w-full h-12 pl-3 pr-8 rounded-xl border border-primary/15 bg-background/70 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option className="bg-background text-foreground" key={s.value || "all"} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-full font-semibold text-sm text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg transition-all"
            >
              Search Listings
            </button>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/market/new?category=lost_found&type=Lost"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-11 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-500"
            >
              <AlertCircle className="h-4 w-4" />
              Report Lost Item
            </Link>
            <Link
              href="/dashboard/market/new?category=lost_found&type=Found"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-11 rounded-full text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500"
            >
              <CheckCircle2 className="h-4 w-4" />
              Report Found Item
            </Link>
          </div>

          {/* Browse categories + Latest */}
          <div className="pt-2 border-t border-border/60 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8">
              <button
                type="button"
                onClick={() => setShowCategories((v) => !v)}
                className={cn(
                  "inline-flex items-center gap-2 text-sm font-medium transition-colors",
                  showCategories
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                Browse categories
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    showCategories && "rotate-180"
                  )}
                />
              </button>
              <Link
                href={`/market?category=${FINDER_CATEGORY}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <List className="h-4 w-4" />
                Latest community listings
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {showCategories && (
              <div className="rounded-2xl border border-border/60 bg-background/50 p-4 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-center">
                  Lost &amp; Found item types
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {FINDER_ITEM_CATEGORIES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => openItemCategory(item)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      {item}
                      <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}