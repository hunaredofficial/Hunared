"use client";

/**
 * Magic Post panel removed from team Post Job / Market forms.
 * Component kept as no-op so older imports do not break the build.
 */
export function MagicPostPanel(_props: {
  mode?: "job" | "listing";
  onApplyJob?: (fields: unknown) => void;
  onApplyListing?: (fields: unknown) => void;
}) {
  return null;
}
