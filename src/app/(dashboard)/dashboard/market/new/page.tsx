"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ImagePlus, X, Loader2, Link2 } from "lucide-react";
import { LISTING_CATEGORIES, LISTING_CURRENCIES } from "@/lib/constants";
import { COUNTRIES } from "@/lib/countries";

const RichTextEditor = dynamic(
  () => import("@/components/ui/RichTextEditor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-[167px] rounded-md border border-input bg-muted/30 animate-pulse" />
    ),
  }
);

const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

type ListingType = "standard" | "native" | "affiliate";

const SUBCATEGORIES: Record<string, string[]> = {
  accommodation: [
    "Houses for Rent",
    "Apartments",
    "Villas",
    "Rooms",
    "Bed Spaces",
    "Commercial Property",
    "Offices",
    "Shops",
    "Warehouses",
    "Land",
  ],
  property: [
    "Apartment",
    "Villa",
    "Land",
    "Commercial",
    "Office",
    "Shop",
    "Warehouse",
  ],
  vehicles: ["Cars", "Motorcycles", "Trucks", "Spare Parts", "Tires"],
  electronics: [
    "Mobile Phones",
    "Laptops",
    "Computers",
    "Tablets",
    "Watches",
    "Printers",
  ],
  furniture_home: [
    "Furniture",
    "Appliances",
    "Kitchen",
    "Decor",
    "Home Accessories",
  ],
  services: [
    "Electrical",
    "Mechanical",
    "Plumbing",
    "HVAC",
    "Carpentry",
    "Painting",
    "Welding",
    "IT Support",
    "Web Development",
    "Design",
    "Cleaning",
    "Security",
    "Logistics",
    "Transportation",
    "Consulting",
  ],
  for_sale: ["New", "Used", "Like New"],
  for_rent: ["Daily", "Weekly", "Monthly", "Yearly"],
  lost_found: [
    "Mobile Phones",
    "Laptops",
    "Tablets",
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
  ],
  free_items: ["Furniture", "Electronics", "Clothes", "Other"],
  wanted: ["Item Wanted", "Service Wanted", "Property Wanted"],
  events: ["Workshop", "Meetup", "Conference", "Other"],
  business_commercial: ["Office", "Shop", "Equipment", "Other"],
  offers_deals: ["Discount", "Bundle", "Clearance"],
  announcements: ["Public Notice", "Community Notice"],
  donations: ["Clothes", "Food", "Equipment", "Other"],
  community: ["Help Request", "Volunteer", "Other"],
  education_training: ["Course", "Training", "Tutoring", "Certification"],
  wholesale: ["Bulk Items", "Trade Supply"],
  other: [
    "Furniture",
    "Home Appliances",
    "Kitchen Equipment",
    "Decor",
    "Tools",
    "Machinery",
    "Safety Equipment",
    "Construction Equipment",
  ],
};

async function uploadImageToCloudinary(
  file: File
): Promise<{ url: string; public_id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return { url: data.secure_url, public_id: data.public_id };
}

function NewListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("SAR");
  const [category, setCategory] = useState(
    searchParams.get("category") ?? ""
  );
  const [subcategory, setSubcategory] = useState(
    searchParams.get("subcategory") ?? ""
  );
  const [country, setCountry] = useState("SA");
  const [city, setCity] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [listingType, setListingType] = useState<ListingType>("standard");
  const [externalLink, setExternalLink] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableSubcategories = category ? SUBCATEGORIES[category] ?? [] : [];

  const isPriceOptional =
    category === "services" ||
    category === "free_items" ||
    category === "wanted" ||
    category === "lost_found" ||
    category === "announcements" ||
    category === "donations" ||
    category === "community";

  useEffect(() => {
    if (
      category === "services" ||
      category === "accommodation" ||
      category === "lost_found"
    ) {
      setListingType("standard");
      setExternalLink("");
    }
  }, [category]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 8 - imageFiles.length;
    const selected = files.slice(0, remaining);
    const newPreviews = selected.map((f) => URL.createObjectURL(f));
    setImageFiles((prev) => [...prev, ...selected]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!isPriceOptional && !price.trim()) {
      toast.error("Price is required");
      return;
    }
    if (!city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!contactPhone.trim()) {
      toast.error("Contact phone is required");
      return;
    }
    if (listingType === "affiliate" && !externalLink.trim()) {
      toast.error("Please enter an external / affiliate URL");
      return;
    }
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setLoading(true);
    try {
      const imageUrls: string[] = [];
      setUploading(true);
      for (const file of imageFiles) {
        const uploaded = await uploadImageToCloudinary(file);
        imageUrls.push(uploaded.url);
      }
      setUploading(false);

      const countryName =
        COUNTRIES.find((c) => c.code === country)?.name ?? country;
      const locationString =
        [city.trim(), countryName, mapsUrl.trim()]
          .filter(Boolean)
          .join(" | ") || undefined;

      const res = await fetch("/api/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: price.trim() || "",
          currency,
          category,
          subcategory: subcategory || undefined,
          country: country || undefined,
          city: city.trim() || undefined,
          location: locationString,
          contact_phone: contactPhone.trim() || undefined,
          image_urls: imageUrls,
          listing_type: listingType,
          external_link: externalLink.trim() || undefined,
        }),
      });

      const text = await res.text();
      let data: { error?: string } = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server error. Please try again.");
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to create listing");

      toast.success("Listing submitted for review!");
      router.push("/dashboard/market");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setUploading(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Post a Listing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Listings are reviewed before appearing on the Marketplace.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Listing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Photos */}
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Photos <span className="text-destructive">*</span>{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (required - up to 8)
                </span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="flex flex-wrap gap-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative h-24 w-24 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="h-24 w-24 rounded-lg object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 hover:bg-destructive hover:text-white hover:border-destructive transition-colors shadow-sm"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 8 && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="h-24 w-24 flex flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground border border-dashed border-border rounded-lg hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <ImagePlus className="h-5 w-5" />
                    Add photo
                  </button>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  category === "lost_found"
                    ? "e.g. Lost iPhone near Riyadh Park"
                    : category === "services"
                    ? "e.g. Electrical Maintenance in Riyadh"
                    : category === "accommodation"
                    ? "e.g. 2-bedroom apartment in Riyadh"
                    : "e.g. Samsung Mobile for Sale"
                }
                maxLength={100}
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Category + Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Category <span className="text-destructive">*</span>
                </label>
                <Select
                  value={category}
                  onValueChange={(v: string | null) => {
                    if (v) {
                      setCategory(v);
                      setSubcategory("");
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTING_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Subcategory
                </label>
                <Select
                  value={subcategory}
                  onValueChange={(v: string | null) => {
                    if (v) setSubcategory(v);
                  }}
                  disabled={!availableSubcategories.length}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        availableSubcategories.length
                          ? "Select subcategory..."
                          : "Select category first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubcategories.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Country + City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Country <span className="text-destructive">*</span>
                </label>
                <Select
                  value={country}
                  onValueChange={(v: string | null) => {
                    if (v) setCountry(v);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select country..." />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  City <span className="text-destructive">*</span>
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Riyadh"
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Google Maps URL (Optional) */}
            <div className="col-span-full">
              <label className="text-sm font-medium block mb-1.5">
                Location (Optional)
              </label>
              <input
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/... or Google Maps link"
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional. Paste a Google Maps link so buyers can open the place
                on the map.
              </p>
            </div>

            {/* Price + Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Price{" "}
                  {isPriceOptional ? (
                    <span className="text-muted-foreground text-xs font-normal">
                      (optional)
                    </span>
                  ) : (
                    <span className="text-destructive">*</span>
                  )}
                </label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={
                    isPriceOptional
                      ? "e.g. 2500, Free, or leave blank"
                      : "e.g. 2500 or Free"
                  }
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Currency <span className="text-destructive">*</span>
                </label>
                <Select
                  value={currency}
                  onValueChange={(v: string | null) => {
                    if (v) setCurrency(v);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTING_CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Listing Type */}
            {category !== "services" &&
              category !== "accommodation" &&
              category !== "lost_found" && (
                <div>
                  <label className="text-sm font-medium block mb-1.5">
                    Listing Type
                  </label>
                  <Select
                    value={listingType}
                    onValueChange={(v) => setListingType(v as ListingType)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        Standard (Contact to Buy)
                      </SelectItem>
                      <SelectItem value="native">Native Purchase</SelectItem>
                      <SelectItem value="affiliate">
                        Affiliate / External Link
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

            {listingType === "affiliate" && (
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  External Link / Affiliate URL{" "}
                  <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    placeholder="https://example.com/product"
                    type="url"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            )}

            {/* Contact phone */}
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Contact Phone <span className="text-destructive">*</span>
              </label>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+966 5XX XXX XXXX"
                type="tel"
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Description <span className="text-destructive">*</span>
              </label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Describe your listing in detail..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="min-w-[140px]">
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : loading ? (
                  "Submitting..."
                ) : (
                  "Submit Listing"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/market")}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default function NewListingPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-8 text-sm text-muted-foreground">
          Loading form…
        </div>
      }
    >
      <NewListingForm />
    </Suspense>
  );
}