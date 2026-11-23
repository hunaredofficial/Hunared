import type { ComponentType } from "react";
import {
  ShoppingBag,
  KeyRound,
  Wrench,
  BedDouble,
  Building2,
  Car,
  Laptop,
  Sofa,
  Shirt,
  Smartphone,
  Hammer,
  Factory,
  PawPrint,
  Dumbbell,
  Baby,
  Apple,
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

const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
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

export function getListingCategoryIcon(
  category: string | null | undefined
): ComponentType<{ className?: string }> {
  if (!category) return Tag;
  return CATEGORY_ICONS[category] ?? Tag;
}

type Props = {
  category?: string | null;
  className?: string;
  /** Outer box (card cover). Default aspect-square. */
  boxClassName?: string;
  size?: "sm" | "md" | "lg";
};

/**
 * Vector icon placeholder for listings without a real photo.
 * Never uses stock photos — icons only by category.
 */
export function ListingCategoryIcon({
  category,
  className,
  boxClassName,
  size = "md",
}: Props) {
  const Icon = getListingCategoryIcon(category);
  const iconSize =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-16 w-16" : "h-12 w-12";

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted/80 text-muted-foreground/50",
        boxClassName
      )}
      aria-hidden
    >
      <Icon className={cn(iconSize, className)} strokeWidth={1.5} />
    </div>
  );
}
