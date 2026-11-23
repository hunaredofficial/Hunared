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
  Phone,
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
  Plane,
  BookOpen,
  Music,
  Ticket,
  MapPin,
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

/** Category fallback icons */
const CATEGORY_ICONS: Record<string, IconComp> = {
  for_sale: ShoppingBag,
  for_rent: KeyRound,
  services: Wrench,
  accommodation: BedDouble,
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
  health_medical: HeartPulse,
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
 * Keyword → icon. Longer / more specific keys preferred.
 * Matched against title + subcategory + category text.
 */
const KEYWORD_ICONS: { keys: string[]; icon: IconComp }[] = [
  // Phones
  { keys: ["iphone", "android", "smartphone", "mobile phone", "cellphone", "mobile", "phone"], icon: Smartphone },
  { keys: ["tablet", "ipad"], icon: Tablet },
  { keys: ["earbud", "earphone", "headphone", "airpod", "headset"], icon: Headphones },
  { keys: ["smartwatch", "watch", "wearable"], icon: Watch },
  { keys: ["charger", "power bank", "cable"], icon: Zap },
  // Computers & electronics
  { keys: ["laptop", "macbook", "notebook"], icon: Laptop },
  { keys: ["desktop", "pc ", "computer", "monitor", "screen"], icon: Monitor },
  { keys: ["tv", "television", "smart tv"], icon: Tv },
  { keys: ["camera", "dslr", "gopro"], icon: Camera },
  { keys: ["playstation", "xbox", "nintendo", "console", "gamepad", "gaming"], icon: Gamepad2 },
  { keys: ["fridge", "refrigerator", "freezer"], icon: Refrigerator },
  { keys: ["fan", "ac unit", "air conditioner", "cooler"], icon: Fan },
  { keys: ["lamp", "light fixture", "bulb"], icon: Lamp },
  // Vehicles
  { keys: ["truck", "pickup", "lorry"], icon: Truck },
  { keys: ["bike", "bicycle", "motorcycle", "motorbike", "scooter"], icon: Bike },
  { keys: ["car", "sedan", "suv", "vehicle", "auto", "toyota", "honda", "nissan", "bmw", "mercedes"], icon: Car },
  { keys: ["boat", "yacht", "ship"], icon: Ship },
  { keys: ["fuel", "petrol", "diesel"], icon: Fuel },
  // Property / housing
  { keys: ["villa", "house", "bungalow"], icon: Home },
  { keys: ["apartment", "flat", "studio"], icon: Building2 },
  { keys: ["room", "bedspace", "bed space", "sharing", "hostel"], icon: BedDouble },
  { keys: ["office", "shop", "warehouse", "store space"], icon: Store },
  { keys: ["land", "plot", "farm"], icon: TreePine },
  { keys: ["door", "gate"], icon: DoorOpen },
  // Furniture
  { keys: ["sofa", "couch", "settee"], icon: Sofa },
  { keys: ["chair", "armchair", "stool"], icon: Armchair },
  { keys: ["bed", "mattress"], icon: BedDouble },
  // Fashion
  { keys: ["shirt", "dress", "jeans", "clothes", "clothing", "jacket", "shoes", "boots", "uniform", "workwear"], icon: Shirt },
  // Tools
  { keys: ["drill", "power tool"], icon: Drill },
  { keys: ["hammer", "tool", "wrench", "spanner", "screwdriver"], icon: Hammer },
  { keys: ["paint", "brush"], icon: Paintbrush },
  { keys: ["scissor", "barber", "salon"], icon: Scissors },
  // Pets
  { keys: ["cat", "kitten"], icon: Cat },
  { keys: ["dog", "puppy"], icon: Dog },
  { keys: ["pet", "animal", "bird", "fish"], icon: PawPrint },
  // Food
  { keys: ["food", "restaurant", "meal", "catering", "kitchen"], icon: UtensilsCrossed },
  { keys: ["fruit", "vegetable", "date", "grocery", "farm"], icon: Apple },
  // Services
  { keys: ["repair", "maintenance", "service", "installation", "cleaning"], icon: Wrench },
  { keys: ["job", "hiring", "vacancy", "career"], icon: Briefcase },
  // Education / events
  { keys: ["course", "training", "class", "tuition", "school", "university", "book"], icon: BookOpen },
  { keys: ["concert", "music", "dj"], icon: Music },
  { keys: ["ticket", "event", "meetup", "conference"], icon: Ticket },
  // Misc
  { keys: ["gift", "free", "giveaway"], icon: Gift },
  { keys: ["lost", "found"], icon: SearchCheck },
  { keys: ["wanted", "looking for", "need"], icon: Search },
  { keys: ["location", "map"], icon: MapPin },
  { keys: ["baby", "kids", "child", "toy", "stroller"], icon: Baby },
  { keys: ["gym", "fitness", "sport", "football", "ball"], icon: Dumbbell },
  { keys: ["medicine", "medical", "health", "clinic"], icon: HeartPulse },
  { keys: ["wholesale", "bulk"], icon: Boxes },
  { keys: ["package", "box", "parcel"], icon: Package },
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
      if (haystack.includes(key) && key.length > bestLen) {
        bestLen = key.length;
        best = entry.icon;
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
 * Vector icon placeholder for listings without a real photo.
 * Picks icon from title / subcategory keywords, then category.
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
  const iconSize =
    size === "sm" ? "h-10 w-10" : size === "lg" ? "h-24 w-24" : "h-20 w-20";

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted/80 text-muted-foreground/55",
        boxClassName
      )}
      aria-hidden
    >
      <Icon className={cn(iconSize, className)} strokeWidth={1.35} />
    </div>
  );
}
