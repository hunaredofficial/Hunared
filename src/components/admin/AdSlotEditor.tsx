"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { upsertAdPlacement, deleteAdPlacement } from "@/app/(dashboard)/dashboard/admin/ads/actions";
import type { AdPlacement, AdType } from "@/types/database";
import { getAdSlotMeta } from "@/lib/ads/slots";

interface Props {
  placement: AdPlacement;
}

export function AdSlotEditor({ placement }: Props) {
  const meta = getAdSlotMeta(placement.slot_name);
  const [isActive, setIsActive] = useState(placement.is_active);
  const [adType, setAdType] = useState<AdType>(placement.ad_type);
  const [imageUrl, setImageUrl] = useState(placement.custom_image_url ?? "");
  const [redirectUrl, setRedirectUrl] = useState(placement.custom_redirect_url ?? "");
  const [adsenseSlotId, setAdsenseSlotId] = useState(placement.adsense_slot_id ?? "");
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  function handleSave() {
    startSave(async () => {
      try {
        await upsertAdPlacement({
          id: placement.id,
          slot_name: placement.slot_name,
          is_active: isActive,
          ad_type: adType,
          custom_image_url: imageUrl,
          custom_redirect_url: redirectUrl,
          adsense_slot_id: adsenseSlotId,
        });
        toast.success("Ad slot saved.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete slot "${placement.slot_name}"? This cannot be undone.`)) return;
    startDelete(async () => {
      try {
        await deleteAdPlacement(placement.id);
        toast.success("Ad slot deleted.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete");
      }
    });
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-sm font-semibold truncate">
                {meta?.label ?? placement.slot_name}
              </CardTitle>
              {isActive ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px]">
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px]">
                  Off
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground font-mono truncate">
              {placement.slot_name}
              {meta?.sizeLabel ? ` · ${meta.sizeLabel}` : ""}
              {meta?.group ? ` · ${meta.group}` : ""}
            </p>
            {meta?.description ? (
              <p className="text-[11px] text-muted-foreground leading-snug">
                {meta.description}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-muted-foreground">Active</span>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="cursor-pointer"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Ad Type</Label>
          <Select
            value={adType}
            onValueChange={(v) => {
              if (v === "adsense" || v === "custom") setAdType(v);
            }}
          >
            <SelectTrigger className="h-8 text-xs cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer text-xs" value="custom">
                Custom Banner
              </SelectItem>
              <SelectItem className="cursor-pointer text-xs" value="adsense">
                Google AdSense
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {adType === "adsense" ? (
          <div className="space-y-1.5">
            <Label className="text-xs">AdSense Slot ID</Label>
            <Input
              className="h-8 text-xs font-mono"
              placeholder="1234567890"
              value={adsenseSlotId}
              onChange={(e) => setAdsenseSlotId(e.target.value)}
            />
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">Banner Image URL</Label>
              <Input
                className="h-8 text-xs"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Redirect URL</Label>
              <Input
                className="h-8 text-xs"
                placeholder="https://..."
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            onClick={handleDelete}
            disabled={isDeleting || isSaving}
          >
            {isDeleting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs cursor-pointer"
            onClick={handleSave}
            disabled={isSaving || isDeleting}
          >
            {isSaving ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" /> Saving…
              </span>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
