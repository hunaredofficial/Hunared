"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { useGeoDetection } from "@/hooks/useGeoDetection";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "jobs", label: "Jobs" },
  { value: "candidates", label: "Candidates" },
  { value: "marketplace", label: "Marketplace" },
  { value: "services", label: "Services" },
  { value: "learning Hub", label: "Learning Hub" },
  { value: "accommodation", label: "Accommodation" },
  { value: "properties", label: "Properties" },
  { value: "hunared finder", label: "Hunared Finder" },
  { value: "hunared program", label: "Hunared Program" },
];

const POPULAR_CHIPS = [
  "Jobs",
  "Accommodation",
  "Marketplace",
  "Services",
  "Electrical",
  "Mechanical",
  "Civil",
  "Oil & Gas",
  "Engineering",
  "Helper",
  "Bed Spaces",
  "Report Lost Item",
  "IT",
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

const FLAG: Record<string, string> = {
  SA: "🇸🇦", AE: "🇦🇪", QA: "🇶🇦", KW: "🇰🇼", OM: "🇴🇲", BH: "🇧🇭",
  PK: "🇵🇰", IN: "🇮🇳", BD: "🇧🇩", NP: "🇳🇵", LK: "🇱🇰", AF: "🇦🇫", BT: "🇧🇹", MV: "🇲🇻",
  PH: "🇵🇭", ID: "🇮🇩", MY: "🇲🇾", TH: "🇹🇭", VN: "🇻🇳", SG: "🇸🇬", BN: "🇧🇳", KH: "🇰🇭", LA: "🇱🇦", MM: "🇲🇲", TL: "🇹🇱",
  CN: "🇨🇳", JP: "🇯🇵", KR: "🇰🇷", TW: "🇹🇼", HK: "🇭🇰", MO: "🇲🇴", MN: "🇲🇳", KP: "🇰🇵",
  KZ: "🇰🇿", UZ: "🇺🇿", KG: "🇰🇬", TJ: "🇹🇯", TM: "🇹🇲",
  EG: "🇪🇬", JO: "🇯🇴", IQ: "🇮🇶", IR: "🇮🇷", SY: "🇸🇾", LB: "🇱🇧", IL: "🇮🇱", PS: "🇵🇸", YE: "🇾🇪", TR: "🇹🇷", CY: "🇨🇾", GE: "🇬🇪", AM: "🇦🇲", AZ: "🇦🇿",
  GB: "🇬🇧", FR: "🇫🇷", DE: "🇩🇪", IT: "🇮🇹", ES: "🇪🇸", NL: "🇳🇱", BE: "🇧🇪", CH: "🇨🇭", AT: "🇦🇹", SE: "🇸🇪", NO: "🇳🇴", DK: "🇩🇰", FI: "🇫🇮",
  PL: "🇵🇱", CZ: "🇨🇿", HU: "🇭🇺", RO: "🇷🇴", PT: "🇵🇹", GR: "🇬🇷", IE: "🇮🇪", RU: "🇷🇺", UA: "🇺🇦", BY: "🇧🇾", BG: "🇧🇬",
  RS: "🇷🇸", HR: "🇭🇷", SI: "🇸🇮", SK: "🇸🇰", LT: "🇱🇹", LV: "🇱🇻", EE: "🇪🇪", IS: "🇮🇸", LU: "🇱🇺", MT: "🇲🇹",
  AL: "🇦🇱", MK: "🇲🇰", BA: "🇧🇦", ME: "🇲🇪", XK: "🇽🇰", MD: "🇲🇩",
  NG: "🇳🇬", ZA: "🇿🇦", KE: "🇰🇪", ET: "🇪🇹", GH: "🇬🇭", TZ: "🇹🇿", UG: "🇺🇬", DZ: "🇩🇿", MA: "🇲🇦", TN: "🇹🇳", LY: "🇱🇾", SD: "🇸🇩",
  AO: "🇦🇴", MZ: "🇲🇿", CM: "🇨🇲", CI: "🇨🇮", SN: "🇸🇳", ML: "🇲🇱", BF: "🇧🇫", NE: "🇳🇪", TD: "🇹🇩", CD: "🇨🇩", CG: "🇨🇬", GA: "🇬🇦",
  RW: "🇷🇼", BI: "🇧🇮", ZM: "🇿🇲", ZW: "🇿🇼", BW: "🇧🇼", NA: "🇳🇦", MW: "🇲🇼", MG: "🇲🇬", MU: "🇲🇺", SC: "🇸🇨",
  DJ: "🇩🇯", ER: "🇪🇷", SO: "🇸🇴", SS: "🇸🇸", GQ: "🇬🇶", GW: "🇬🇼", GN: "🇬🇳", SL: "🇸🇱", LR: "🇱🇷", TG: "🇹🇬", BJ: "🇧🇯",
  CV: "🇨🇻", ST: "🇸🇹", KM: "🇰🇲", MR: "🇲🇷", EH: "🇪🇭",
  US: "🇺🇸", CA: "🇨🇦", MX: "🇲🇽", BR: "🇧🇷", AR: "🇦🇷", CO: "🇨🇴", CL: "🇨🇱", PE: "🇵🇪", VE: "🇻🇪", EC: "🇪🇨",
  BO: "🇧🇴", PY: "🇵🇾", UY: "🇺🇾", GY: "🇬🇾", SR: "🇸🇷", GF: "🇬🇫", PA: "🇵🇦", CR: "🇨🇷", NI: "🇳🇮", HN: "🇭🇳",
  SV: "🇸🇻", GT: "🇬🇹", BZ: "🇧🇿", CU: "🇨🇺", DO: "🇩🇴", HT: "🇭🇹", JM: "🇯🇲", TT: "🇹🇹", BB: "🇧🇧", BS: "🇧🇸", PR: "🇵🇷",
  AU: "🇦🇺", NZ: "🇳🇿", FJ: "🇫🇯", PG: "🇵🇬", SB: "🇸🇧", VU: "🇻🇺", NC: "🇳🇨", PF: "🇵🇫", WS: "🇼🇸", TO: "🇹🇴",
  KI: "🇰🇮", FM: "🇫🇲", MH: "🇲🇭", PW: "🇵🇼", TV: "🇹🇻", NR: "🇳🇷",
  GL: "🇬🇱", FO: "🇫🇴", GI: "🇬🇮", IM: "🇮🇲", JE: "🇯🇪", GG: "🇬🇬", AX: "🇦🇽",
  AW: "🇦🇼", CW: "🇨🇼", SX: "🇸🇽", BQ: "🇧🇶", KY: "🇰🇾", BM: "🇧🇲", VG: "🇻🇬", VI: "🇻🇮",
  AS: "🇦🇸", GU: "🇬🇺", MP: "🇲🇵", CK: "🇨🇰", NU: "🇳🇺", TK: "🇹🇰", WF: "🇼🇫", PM: "🇵🇲",
  BL: "🇧🇱", MF: "🇲🇫", GP: "🇬🇵", MQ: "🇲🇶", RE: "🇷🇪", YT: "🇾🇹",
  AQ: "🇦🇶", IO: "🇮🇴",
};

export function HeroSection() {
  const router = useRouter();
  const geo = useGeoDetection();

  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (geo.countryCode && !country) setCountry(geo.countryCode);
    if (geo.city && !city) setCity(geo.city);
  }, [geo.countryCode, geo.city]);

  const cities = country ? CITIES_BY_COUNTRY[country] ?? [] : [];

  function handleSearch(e?: FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (country) params.set("country", country);
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    router.push(`/search?${params.toString()}`);
  }

  function handleChip(term: string) {
    const params = new URLSearchParams();
    params.set("q", term);
    if (country) params.set("country", country);
    if (city) params.set("city", city);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center overflow-hidden pt-28 pb-16">
      {/* Clean background like other sections */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/25" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[520px] w-[780px] rounded-full bg-[var(--brand-from)] opacity-[0.06] blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/5 h-[300px] w-[400px] rounded-full bg-[var(--brand-via)] opacity-[0.05] blur-[110px]" />
      </div>

      <div
        className={cn(
          "mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        )}
      >
        {/* Larger premium card — same language as CTA / Program */}
        <form
          onSubmit={handleSearch}
          className="relative overflow-hidden rounded-3xl bg-card border border-primary/20 brand-glow p-8 sm:p-10 md:p-12 space-y-6"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-[var(--brand-from)] opacity-[0.06] blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-[var(--brand-via)] opacity-[0.06] blur-3xl" />
          </div>

          <div className="text-center space-y-2">
            <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-primary">
              Universal Smart Search
            </span>
          </div>

          {/* Large search input */}
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-primary pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, accommodations, services, property, courses, ..."
              className="w-full h-16 sm:h-[4.25rem] pl-14 pr-5 rounded-2xl border border-primary/15 bg-background/70 text-foreground text-base sm:text-lg placeholder:text-muted-foreground/65 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary/35 transition"
              autoComplete="off"
            />
          </div>

          {/* Filters — larger controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Country — names only, no codes */}
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCity("");
                }}
                className="w-full h-12 sm:h-13 pl-10 pr-9 rounded-xl border border-primary/15 bg-background/70 text-sm sm:text-base text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                <option value="">All Countries</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* City */}
            <div className="relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!country || cities.length === 0}
                className="w-full h-12 sm:h-13 pl-3.5 pr-9 rounded-xl border border-primary/15 bg-background/70 text-sm sm:text-base text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!country ? "Select City" : cities.length === 0 ? "Any city" : "All Cities"}
                </option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Category */}
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-12 sm:h-13 pl-3.5 pr-9 rounded-xl border border-primary/15 bg-background/70 text-sm sm:text-base text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Primary button — same as other sections */}
          <button
            type="submit"
            className="w-full h-13 sm:h-14 rounded-full font-semibold text-base text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg transition-all duration-300 hover:scale-[1.015] active:scale-[0.99]"
          >
            Search Everything
          </button>
        </form>

        {/* Popular chips */}
        <div className="mt-8 space-y-3 text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Popular Searches
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {POPULAR_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChip(chip)}
                className="px-4 py-2 rounded-full text-xs sm:text-sm font-medium border border-primary/15 bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/10 transition-all duration-200"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}