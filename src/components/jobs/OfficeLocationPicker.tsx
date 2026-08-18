"use client";

import { useState, useEffect } from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface OfficeLocation {
  lat: number;
  lng: number;
  address: string; // stores the Google Maps URL (or text)
}

interface OfficeLocationPickerProps {
  value: OfficeLocation | null;
  onChange: (v: OfficeLocation | null) => void;
  /** Jobs: "Office Location (Optional)" — Listings: "Location (Optional)" */
  label?: string;
}

const PATTERNS: RegExp[] = [
  /@(-?\d{1,2}\.\d{3,})[,+%2C]+(-?\d{1,3}\.\d{3,})/i,
  /[?&]q=(-?\d{1,2}\.\d{3,})[,+%2C]+(-?\d{1,3}\.\d{3,})/i,
  /ll=(-?\d{1,2}\.\d{3,})[,+%2C]+(-?\d{1,3}\.\d{3,})/i,
  /\/(?:place|search)\/[^/]*\/(-?\d{1,2}\.\d{3,})[,+%2C]+(-?\d{1,3}\.\d{3,})/i,
  /(-?\d{1,2}\.\d{3,})%2C(-?\d{1,3}\.\d{3,})/i,
  /\/(-?\d{1,2}\.\d{3,})[,+%2C]+(-?\d{1,3}\.\d{3,})(?:\/|$|\?)/i,
];

function extractCoords(url: string): { lat: number; lng: number } | null {
  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    /* keep */
  }
  for (const source of [url, decoded]) {
    for (const pattern of PATTERNS) {
      const m = source.match(pattern);
      if (m) {
        const lat = parseFloat(m[1]);
        const lng = parseFloat(m[2]);
        if (
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        ) {
          return { lat, lng };
        }
      }
    }
  }
  return null;
}

function isMapsUrl(text: string) {
  const t = text.trim().toLowerCase();
  return (
    t.startsWith("http://") ||
    t.startsWith("https://") ||
    t.includes("maps.google") ||
    t.includes("goo.gl/maps") ||
    t.includes("maps.app.goo.gl")
  );
}

export function OfficeLocationPicker({
  value,
  onChange,
  label = "Paste Google Maps URL (Optional)",
}: OfficeLocationPickerProps) {
  const [urlInput, setUrlInput] = useState(value?.address ?? "");

  useEffect(() => {
    setUrlInput(value?.address ?? "");
  }, [value?.address]);

  function applyUrl(raw: string) {
    const trimmed = raw.trim();
    setUrlInput(raw);

    if (!trimmed) {
      onChange(null);
      return;
    }

    if (!isMapsUrl(trimmed)) {
      // Allow plain address text too (still optional)
      onChange({ lat: 0, lng: 0, address: trimmed });
      return;
    }

    const coords = extractCoords(trimmed);
    onChange({
      lat: coords?.lat ?? 0,
      lng: coords?.lng ?? 0,
      address: trimmed,
    });
  }

  const mapsHref =
    value?.address && isMapsUrl(value.address)
      ? value.address
      : value && value.lat !== 0 && value.lng !== 0
        ? `https://www.google.com/maps?q=${value.lat},${value.lng}`
        : null;

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Input
          value={urlInput}
          onChange={(e) => applyUrl(e.target.value)}
          placeholder="https://maps.app.goo.gl/... or full Google Maps link"
          className="mt-1.5"
        />
        <p className="text-[11px] text-muted-foreground mt-1.5">
          Optional. Paste a Google Maps link. Visitors can open it on the map.
        </p>
      </div>

      {mapsHref && (
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <MapPin className="h-3.5 w-3.5" />
          Open location on Google Maps
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}