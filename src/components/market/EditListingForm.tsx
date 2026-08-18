"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
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
import type { Listing } from "@/types/database";

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

export function EditListingForm({ listing }: { listing: Listing }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  // Pre-fill state from existing listing
  const existingImages: string[] =
    listing.image_urls && listing.image_urls.length > 0
      ? listing.image_urls
      : listing.image_url
      ? [listing.image_url]
      : [];

  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [price, setPrice] = useState(listing.price);
  const [currency, setCurrency] = useState(listing.currency ?? "USD");
  const [category, setCategory] = useState(listing.category);
  const [location, setLocation] = useState(listing.location ?? "");
  const [contactPhone, setContactPhone] = useState(
    listing.contact_phone ?? ""
  );
  const [listingType, setListingType] = useState<ListingType>(
    (listing.listing_type as ListingType) ?? "standard"
  );
  const [externalLink, setExternalLink] = useState(listing.external_link ?? "");

  // Existing (already uploaded) images — tracked as URL strings
  const [keptImages, setKeptImages] = useState<string[]>(existingImages);

  // NEW files picked by the user in this edit session
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Price is optional only for the "services" category
  const isPriceOptional =
  category === "services" ||
  category === "free_items" ||
  category === "wanted" ||
  category === "lost_found" ||
  category === "announcements" ||
  category === "donations" ||
  category === "community";

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const totalCount = keptImages.length + newFiles.length + files.length;
    if (totalCount > 8) {
      toast.error("You can have at most 8 images total");
      return;
    }
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewFiles((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...previews]);
    e.target.value = "";
  }

  function removeExisting(index: number) {
    setKeptImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNew(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => {
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
    if (!isPriceOptional && !price.trim()) {
      toast.error("Price is required");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (listingType === "affiliate" && !externalLink.trim()) {
      toast.error("Please enter an external / affiliate URL");
      return;
    }

    // ✅ NEW: At least one image mandatory (kept + new)
    const totalImageCount = keptImages.length + newFiles.length;
    if (totalImageCount === 0) {
      toast.error("Please keep or upload at least one image");
      return;
    }

    setLoading(true);
    try {
      // Upload any new files
      const uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        setUploading(true);
        for (const file of newFiles) {
          const uploaded = await uploadImageToCloudinary(file);
          uploadedUrls.push(uploaded.url);
        }
        setUploading(false);
      }

      const finalImageUrls = [...keptImages, ...uploadedUrls];

      const res = await fetch(`/api/market/${listing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: price.trim(),
          currency,
          category,
          location: location || undefined,
          contact_phone: contactPhone.trim() || undefined,
          image_urls: finalImageUrls,
          listing_type: listingType,
          external_link: externalLink.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update listing");
      toast.success("Listing updated and resubmitted for review!");
      router.push("/dashboard/market");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setUploading(false);
    } finally {
      setLoading(false);
    }
  }

  const totalImageCount = keptImages.length + newFiles.length;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listing Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Image gallery – now mandatory */}
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
              {/* Existing kept images */}
              {keptImages.map((src, i) => (
                <div
                  key={`existing-${i}`}
                  className="relative h-24 w-24 shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Current image ${i + 1}`}
                    className="h-24 w-24 rounded-lg object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removeExisting(i)}
                    className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 hover:bg-destructive hover:text-white hover:border-destructive transition-colors shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {/* New image previews */}
              {newPreviews.map((src, i) => (
                <div key={`new-${i}`} className="relative h-24 w-24 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`New image ${i + 1}`}
                    className="h-24 w-24 rounded-lg object-cover border border-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => removeNew(i)}
                    className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 hover:bg-destructive hover:text-white hover:border-destructive transition-colors shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {totalImageCount < 8 && (
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
              placeholder="e.g. 2-bedroom apartment in Riyadh"
              maxLength={100}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Category + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Category <span className="text-destructive">*</span>
              </label>
              <Select
                value={category}
                onValueChange={(v) => {
                  if (v) setCategory(v);
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
                Location
              </label>
              <Select
                value={location}
                onValueChange={(v) => {
                  if (v) setLocation(v);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location..." />
                </SelectTrigger>
                {/* <SelectContent> 
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent> */}
              </Select>
            </div>
          </div>

          {/* Price + Currency - Price optional for services */}
          <div className="grid grid-cols-2 gap-4">
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
                Currency
              </label>
              <Select
                value={currency}
                onValueChange={(v) => {
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

          {/* Listing type */}
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

          {/* External link — shown only for affiliate type */}
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
              <p className="text-xs text-muted-foreground mt-1">
                Users will be directed to this URL to purchase or learn more.
              </p>
            </div>
          )}

          {/* Contact phone */}
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Contact Phone (optional)
            </label>
            <input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+966 5XX XXX XXXX"
              type="tel"
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Only shown to signed-in users
            </p>
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
            <Button type="submit" disabled={loading} className="min-w-[160px]">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...
                </>
              ) : loading ? (
                "Saving..."
              ) : (
                "Save & Resubmit"
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
  );
}
