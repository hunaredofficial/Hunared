// Cloudinary upload helper (client-side unsigned upload)
export async function uploadToCloudinary(
  file: File,
  folder: string = "hunared/avatars",
  options?: {
    /** Override the upload preset. Defaults to NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET. */
    preset?: string;
    /** Cloudinary resource type. Use "auto" for PDFs/docs. Defaults to "image". */
    resourceType?: "image" | "video" | "raw" | "auto";
  }
): Promise<{ url: string; publicId: string }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error(
      "Image upload is not configured (missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME). Add Cloudinary env vars on Vercel."
    );
  }

  const uploadPreset =
    options?.preset ??
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!uploadPreset) throw new Error("Cloudinary upload preset is not set");

  const resourceType = options?.resourceType ?? "image";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Cloudinary upload failed");
  }

  const data = await res.json();
  let url = data.secure_url as string;

  // For raw/auto uploads (e.g. PDFs), Cloudinary can mistakenly
  // return /image/upload/ in the URL. Normalise to /raw/upload/ so
  // browsers serve the file correctly without trying to render it.
  if (resourceType === "raw" || resourceType === "auto") {
    url = normalizeCvUrl(url);
  }

  return { url, publicId: data.public_id as string };
}

/**
 * Ensures a Cloudinary CV/PDF URL:
 *   1. Uses /raw/upload/ (not /image/ or /video/) so Cloudinary serves the file correctly.
 *   2. Injects fl_attachment/ right after /upload/ so the browser always
 *      triggers a Save-As dialog instead of trying to render the PDF inline.
 *
 * Input:  https://res.cloudinary.com/demo/image/upload/v123/folder/file.pdf
 * Output: https://res.cloudinary.com/demo/raw/upload/fl_attachment/v123/folder/file.pdf
 *
 * Safe to call on any URL — non-Cloudinary URLs are returned unchanged.
 */
export function normalizeCvUrl(url: string): string {
  // Step 1: ensure https://
  let normalized = url.startsWith("http://")
    ? url.replace("http://", "https://")
    : url.startsWith("https://")
    ? url
    : `https://${url}`;

  // Step 2: use /image/upload/ — /raw/upload/ causes browser connection errors for PDFs
  normalized = normalized.replace(
    /\/(?:raw|video)\/upload\//,
    "/image/upload/"
  );

  // Step 3: inject fl_attachment/ after /upload/ (only once)
  if (!normalized.includes("fl_attachment")) {
    normalized = normalized.replace("/upload/", "/upload/fl_attachment/");
  }

  // Step 4: remove any accidental duplicate fl_attachment
  normalized = normalized.replace(/\/fl_attachment\/fl_attachment\//g, "/fl_attachment/");

  return normalized;
}

// Server-side: delete asset from Cloudinary via Admin API route
// Call our internal API route instead of Cloudinary SDK directly from client
export async function deleteCloudinaryAsset(publicId: string): Promise<void> {
  const res = await fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId }),
  });
  if (!res.ok) {
    throw new Error("Failed to delete Cloudinary asset");
  }
}
