import type { ComponentType } from "react";
import {
  ShoppingBag,
  KeyRound,
  Wrench,
  BedDouble,
  Building2,
  Home,
  Car,
  Truck,
  Bike,
  Laptop,
  Monitor,
  Sofa,
  Shirt,
  Smartphone,
  Tablet,
  Headphones,
  Watch,
  Camera,
  Hammer,
  Drill,
  Factory,
  PawPrint,
  Cat,
  Dog,
  Dumbbell,
  Baby,
  Apple,
  UtensilsCrossed,
  HeartPulse,
  Search,
  Gift,
  SearchCheck,
  Calendar,
  Store,
  Percent,
  Megaphone,
  HandHeart,
  Users,
  GraduationCap,
  Boxes,
  Package,
  Tag,
  Tv,
  Gamepad2,
  Refrigerator,
  Fan,
  Lamp,
  Armchair,
  DoorOpen,
  TreePine,
  Briefcase,
  Scissors,
  Paintbrush,
  Zap,
  Fuel,
  Ship,
  BookOpen,
  Music,
  Ticket,
  MapPin,
  Hotel,
  BedSingle,
  Warehouse,
  CookingPot,
  Microwave,
  Speaker,
  Mouse,
  Keyboard,
  HardDrive,
  Cpu,
  Bus,
  Tractor,
  Tent,
  Flower2,
  Pill,
  Stethoscope,
  ConciergeBell,
  Bath,
  ShowerHead,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** True only for real user-uploaded photos (not stock Unsplash defaults). */
export function isListingPhotoUrl(url: string | null | undefined): boolean {
  if (!url || !String(url).trim()) return false;
  const u = String(url).toLowerCase();
  if (u.includes("images.unsplash.com")) return false;
  if (u.includes("unsplash.com")) return false;
  if (u.includes("picsum.photos")) return false;
  if (u.includes("placeholder")) return false;
  if (u.startsWith("data:")) return true;
  return true;
}

type IconComp = ComponentType<{ className?: string; strokeWidth?: number }>;

/** Category fallback icons — each category unique */
const CATEGORY_ICONS: Record<string, IconComp> = {
  for_sale: ShoppingBag,
  for_rent: KeyRound,
  services: Wrench,
  accommodation: Hotel,
  property: Building2,
  vehicles: Car,
  electronics: Laptop,
  home_furniture: Sofa,
  furniture_home: Sofa,
  personel_workwear: Shirt,
  fashion_beauty: Shirt,
  mobiles_accessories: Smartphone,
  tools_equipment: Hammer,
  industrial_materials: Factory,
  pets_animals: PawPrint,
  sports_outdoors: Dumbbell,
  kids_baby: Baby,
  food_agriculture: Apple,
  health_medical: Stethoscope,
  wanted: Search,
  free_items: Gift,
  lost_found: SearchCheck,
  events: Calendar,
  business_commercial: Store,
  offers_deals: Percent,
  announcements: Megaphone,
  donations: HandHeart,
  community: Users,
  education_training: GraduationCap,
  wholesale: Boxes,
  other: Package,
};

/**
 * Keyword → icon. Longer keys win (matched first by length).
 * Keep bedspace / room / apartment distinct.
 */
const KEYWORD_ICONS: { keys: string[]; icon: IconComp }[] = [
  // --- Housing (most specific first via key length) ---
  { keys: ["bedspace", "bed space", "bed-space", "sharing room", "shared room", "partition"], icon: Users },
  { keys: ["studio apartment", "studio flat"], icon: Building2 },
  { keys: ["master room", "private room", "single room", "room for rent", "room"], icon: DoorOpen },
  { keys: ["apartment", "flat", "condo"], icon: Building2 },
  { keys: ["villa", "bungalow", "townhouse"], icon: Home },
  { keys: ["hostel", "hotel", "guest house", "pg "], icon: Hotel },
  { keys: ["office space", "shop space", "warehouse", "store for rent"], icon: Warehouse },
  { keys: ["land", "plot", "farm land"], icon: TreePine },
  { keys: ["bathroom", "washroom"], icon: Bath },
  { keys: ["shower"], icon: ShowerHead },
  { keys: ["kitchen"], icon: CookingPot },
  { keys: ["bed", "mattress", "bunk"], icon: BedSingle },
  { keys: ["accommodation", "housing", "lodging"], icon: Hotel },

  // --- Phones / mobiles ---
  { keys: ["iphone", "smartphone", "mobile phone", "cellphone"], icon: Smartphone },
  { keys: ["android phone", "samsung galaxy"], icon: Smartphone },
  { keys: ["mobile", "phone"], icon: Smartphone },
  { keys: ["tablet", "ipad"], icon: Tablet },
  { keys: ["earbud", "earphone", "headphone", "airpod", "headset"], icon: Headphones },
  { keys: ["smartwatch", "apple watch"], icon: Watch },
  { keys: ["charger", "power bank"], icon: Zap },

  // --- Computers ---
  { keys: ["macbook", "laptop", "notebook"], icon: Laptop },
  { keys: ["desktop", "computer", "pc "], icon: Monitor },
  { keys: ["monitor", "display screen"], icon: Monitor },
  { keys: ["keyboard"], icon: Keyboard },
  { keys: ["mouse", "mousepad"], icon: Mouse },
  { keys: ["hard drive", "ssd", "hdd", "storage"], icon: HardDrive },
  { keys: ["cpu", "processor", "graphics card", "gpu"], icon: Cpu },
  { keys: ["speaker", "soundbar"], icon: Speaker },

  // --- Home electronics ---
  { keys: ["television", "smart tv", " tv"], icon: Tv },
  { keys: ["camera", "dslr", "gopro"], icon: Camera },
  { keys: ["playstation", "xbox", "nintendo", "console", "gamepad", "gaming"], icon: Gamepad2 },
  { keys: ["fridge", "refrigerator", "freezer"], icon: Refrigerator },
  { keys: ["microwave", "oven"], icon: Microwave },
  { keys: ["air conditioner", "ac unit", "split ac"], icon: Fan },
  { keys: ["fan", "cooler"], icon: Fan },
  { keys: ["lamp", "light fixture"], icon: Lamp },

  // --- Vehicles ---
  { keys: ["motorcycle", "motorbike", "scooter", "bike for sale"], icon: Bike },
  { keys: ["bicycle", "cycle"], icon: Bike },
  { keys: ["truck", "pickup", "lorry"], icon: Truck },
  { keys: ["bus", "van", "minibus"], icon: Bus },
  { keys: ["tractor"], icon: Tractor },
  { keys: ["boat", "yacht"], icon: Ship },
  { keys: ["car", "sedan", "suv", "vehicle", "toyota", "honda", "nissan", "bmw", "mercedes", "hyundai"], icon: Car },
  { keys: ["fuel", "petrol", "diesel"], icon: Fuel },

  // --- Furniture ---
  { keys: ["sofa", "couch", "settee"], icon: Sofa },
  { keys: ["armchair", "office chair", "chair"], icon: Armchair },
  { keys: ["wardrobe", "cabinet", "shelf"], icon: Layers },
  { keys: ["door", "gate"], icon: DoorOpen },

  // --- Fashion ---
  { keys: ["uniform", "workwear", "safety boots", "helmet"], icon: Shirt },
  { keys: ["shirt", "dress", "jeans", "clothes", "clothing", "jacket", "shoes", "boots"], icon: Shirt },

  // --- Tools ---
  { keys: ["drill", "power tool"], icon: Drill },
  { keys: ["hammer", "spanner", "screwdriver", "toolbox"], icon: Hammer },
  { keys: ["paint", "brush"], icon: Paintbrush },
  { keys: ["scissor", "barber", "salon"], icon: Scissors },
  { keys: ["repair", "maintenance", "installation", "cleaning service"], icon: Wrench },

  // --- Pets ---
  { keys: ["kitten", "cat "], icon: Cat },
  { keys: ["puppy", "dog "], icon: Dog },
  { keys: ["pet", "animal", "bird", "fish aquarium"], icon: PawPrint },

  // --- Food ---
  { keys: ["restaurant", "catering", "meal"], icon: UtensilsCrossed },
  { keys: ["fruit", "vegetable", "dates", "grocery"], icon: Apple },
  { keys: ["flower", "plant", "garden"], icon: Flower2 },

  // --- Health ---
  { keys: ["medicine", "pharmacy", "pill"], icon: Pill },
  { keys: ["clinic", "medical", "doctor", "health"], icon: Stethoscope },
  { keys: ["hospital", "ambulance"], icon: HeartPulse },

  // --- Services / jobs ---
  { keys: ["vacancy", "hiring", "job offer", "career"], icon: Briefcase },
  { keys: ["concierge", "reception"], icon: ConciergeBell },

  // --- Education / events ---
  { keys: ["course", "training", "tuition", "class", "school"], icon: BookOpen },
  { keys: ["university", "college", "degree"], icon: GraduationCap },
  { keys: ["concert", "music", "dj "], icon: Music },
  { keys: ["ticket", "event", "meetup", "conference"], icon: Ticket },
  { keys: ["camping", "tent", "outdoor"], icon: Tent },

  // --- Misc ---
  { keys: ["giveaway", "free item", "free stuff"], icon: Gift },
  { keys: ["lost", "found"], icon: SearchCheck },
  { keys: ["wanted", "looking for", "need "], icon: Search },
  { keys: ["wholesale", "bulk order"], icon: Boxes },
  { keys: ["package", "parcel", "box"], icon: Package },
  { keys: ["location", "map"], icon: MapPin },
  { keys: ["baby", "kids", "child", "stroller", "toy"], icon: Baby },
  { keys: ["gym", "fitness", "football", "sport"], icon: Dumbbell },
];

export function getListingCategoryIcon(
  category?: string | null,
  subcategory?: string | null,
  title?: string | null
): IconComp {
  const haystack = [title || "", subcategory || "", category || ""]
    .join(" ")
    .toLowerCase();

  let best: IconComp | null = null;
  let bestLen = 0;
  for (const entry of KEYWORD_ICONS) {
    for (const key of entry.keys) {
      if (haystack.includes(key) && key.length >= bestLen) {
        // Prefer longer match; on tie keep first (more specific groups listed first)
        if (key.length > bestLen || best === null) {
          bestLen = key.length;
          best = entry.icon;
        }
      }
    }
  }
  if (best) return best;

  if (category && CATEGORY_ICONS[category]) return CATEGORY_ICONS[category];
  return Tag;
}

type Props = {
  category?: string | null;
  subcategory?: string | null;
  title?: string | null;
  className?: string;
  boxClassName?: string;
  size?: "sm" | "md" | "lg";
};

/**
 * Vector icon for listings without a real photo.
 * Title / subcategory keywords first, then category — each type distinct.
 */
export function ListingCategoryIcon({
  category,
  subcategory,
  title,
  className,
  boxClassName,
  size = "md",
}: Props) {
  const Icon = getListingCategoryIcon(category, subcategory, title);
  // Larger on cards for a clear professional look
  const iconSize =
    size === "sm" ? "h-11 w-11" : size === "lg" ? "h-28 w-28" : "h-24 w-24";

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted/70 text-muted-foreground/60",
        boxClassName
      )}
      aria-hidden
    >
      <Icon className={cn(iconSize, className)} strokeWidth={1.25} />
    </div>
  );
}
