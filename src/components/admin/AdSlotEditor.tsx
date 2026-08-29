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
import { Loader2, Trash2, MonitorPlay, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { upsertAdPlacement, deleteAdPlacement } from "@/app/(dashboard)/dashboard/admin/ads/actions";
import type { AdPlacement, AdType } from "@/types/database";

interface Props {
  placement: AdPlacement;
}

export function AdSlotEditor({ placement }: Props) {
  const [isActive, setIsActive] = useState(placement.is_active);
  const [adType, setAdType] = useState<AdType>(placement.ad_type);
  const [imageUrl, setImageUrl] = useState(placement.custom_image_url ?? "");
  const [redirectUrl, setRedirectUrl] = useState(placement.custom_redirect_url ?? "");
  const [adsenseSlotId, setAdsenseSlotId] = useState(placement.adsense_slot_id ?? "");
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  function handleSave() {
    startSave(async () => {
      const result = await upsertAdPlacement({
        id: placement.id,
        slot_name: placement.slot_name,
        is_active: isActive,
        ad_type: adType,
        custom_image_url: imageUrl,
        custom_redirect_url: redirectUrl,
        adsense_slot_id: adsenseSlotId,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Ad slot saved.");
    });
  }

  function handleDelete() {
    if (!confirm(`Delete slot "${placement.slot_name}"? This cannot be undone.`)) return;
    startDelete(async () => {
      const result = await deleteAdPlacement(placement.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Ad slot deleted.");
    });
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-mono">{placement.slot_name}</CardTitle>
            <Badge
              className={
                isActive
                  ? "bg-green-100 text-green-800 border-green-200 text-xs"
                  : "bg-muted text-muted-foreground text-xs"
              }
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor={`active-${placement.id}`} className="text-xs text-muted-foreground">
              Active
            </Label>
            <Switch
              id={`active-${placement.id}`}
              checked={isActive}
              onCheckedChange={setIsActive}
              className="cursor-pointer"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Ad Type */}
        <div className="space-y-1.5">
          <Label className="text-xs">Ad Type</Label>
          <Select
            value={adType}
            onValueChange={(val) => setAdType(val as AdType)}
          >
            <SelectTrigger className="h-8 text-xs cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer text-xs" value="adsense">
                <span className="flex items-center gap-1.5">
                  <MonitorPlay className="h-3 w-3" /> Google AdSense
                </span>
              </SelectItem>
              <SelectItem className="cursor-pointer text-xs" value="custom">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="h-3 w-3" /> Custom Banner
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conditional fields */}
        {adType === "adsense" && (
          <div className="space-y-1.5">
            <Label className="text-xs">AdSense Slot ID</Label>
            <Input
              className="h-8 text-xs"
              placeholder="e.g. 1234567890"
              value={adsenseSlotId}
              onChange={(e) => setAdsenseSlotId(e.target.value)}
            />
          </div>
        )}

        {adType === "custom" && (
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

        {/* Actions */}
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
