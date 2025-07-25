"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  PlayCircle,
  PauseCircle,
  XCircle,
  BookOpen,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TrackingData {
  status: string;
  episodesWatched?: number;
  chaptersRead?: number;
  totalEpisodes?: number;
  totalChapters?: number;
  startDate?: string;
  endDate?: string;
}

interface TrackingPopoverProps {
  type: "anime" | "manga";
  userEntry?: TrackingData;
  onUpdate: (data: Partial<TrackingData>) => void;
  onRemove: () => void;
  trigger: React.ReactNode;
}

export default function TrackingPopover({
  type,
  userEntry,
  onUpdate,
  onRemove,
  trigger,
}: TrackingPopoverProps) {
  const [localData, setLocalData] = useState<TrackingData>({
    status: userEntry?.status || (type === "anime" ? "PLAN_TO_WATCH" : "PLAN_TO_READ"),
    episodesWatched: userEntry?.episodesWatched || 0,
    chaptersRead: userEntry?.chaptersRead || 0,
    totalEpisodes: userEntry?.totalEpisodes,
    totalChapters: userEntry?.totalChapters,
    startDate: userEntry?.startDate,
    endDate: userEntry?.endDate,
  });

  const [open, setOpen] = useState(false);
  const isAnime = type === "anime";

  // Update local data when userEntry changes
  useEffect(() => {
    if (userEntry) {
      setLocalData({
        status: userEntry.status,
        episodesWatched: userEntry.episodesWatched || 0,
        chaptersRead: userEntry.chaptersRead || 0,
        totalEpisodes: userEntry.totalEpisodes,
        totalChapters: userEntry.totalChapters,
        startDate: userEntry.startDate,
        endDate: userEntry.endDate,
      });
    }
  }, [userEntry]);

  const statusOptions = isAnime
    ? [
        { value: "WATCHING", label: "Watching", icon: PlayCircle, color: "bg-green-500" },
        { value: "COMPLETED", label: "Completed", icon: CheckCircle, color: "bg-blue-500" },
        { value: "ON_HOLD", label: "On Hold", icon: PauseCircle, color: "bg-yellow-500" },
        { value: "DROPPED", label: "Dropped", icon: XCircle, color: "bg-red-500" },
        { value: "PLAN_TO_WATCH", label: "Plan to Watch", icon: Clock, color: "bg-gray-500" },
      ]
    : [
        { value: "READING", label: "Reading", icon: BookOpen, color: "bg-green-500" },
        { value: "COMPLETED", label: "Completed", icon: CheckCircle, color: "bg-blue-500" },
        { value: "ON_HOLD", label: "On Hold", icon: PauseCircle, color: "bg-yellow-500" },
        { value: "DROPPED", label: "Dropped", icon: XCircle, color: "bg-red-500" },
        { value: "PLAN_TO_READ", label: "Plan to Read", icon: Clock, color: "bg-gray-500" },
      ];

  const currentStatus = statusOptions.find((option) => option.value === localData.status);

  const handleUpdate = (field: keyof TrackingData, value: string | number | null) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onUpdate(newData);
  };

  const handleProgressChange = (field: "episodesWatched" | "chaptersRead", value: number) => {
    const currentValue = localData[field] || 0;
    const newValue = Math.max(0, currentValue + value);

    if (field === "episodesWatched" && localData.totalEpisodes) {
      handleUpdate(field, Math.min(newValue, localData.totalEpisodes));
    } else if (field === "chaptersRead" && localData.totalChapters) {
      handleUpdate(field, Math.min(newValue, localData.totalChapters));
    } else {
      handleUpdate(field, newValue);
    }
  };

  const handleDirectInput = (field: "episodesWatched" | "chaptersRead", value: string) => {
    const numValue = parseInt(value) || 0;
    const maxValue = field === "episodesWatched" ? localData.totalEpisodes : localData.totalChapters;

    if (maxValue && numValue > maxValue) {
      handleUpdate(field, maxValue);
    } else {
      handleUpdate(field, numValue);
    }
  };

  const getProgressText = () => {
    if (isAnime) {
      const watched = localData.episodesWatched || 0;
      const total = localData.totalEpisodes;
      return total ? `${watched}/${total} episodes` : `${watched} episodes`;
    } else {
      const read = localData.chaptersRead || 0;
      const total = localData.totalChapters;
      return total ? `${read}/${total} chapters` : `${read} chapters`;
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            {currentStatus && (
              <>
                <div className={cn("w-3 h-3 rounded-full", currentStatus.color)} />
                <currentStatus.icon className="w-4 h-4" />
              </>
            )}
            <span className="font-semibold">
              {type === "anime" ? "Anime" : "Manga"} List
            </span>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={localData.status}
              onValueChange={(value) => handleUpdate("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", option.color)} />
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Progress</Label>
              <Badge variant="outline" className="text-xs">
                {getProgressText()}
              </Badge>
            </div>

            {isAnime ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProgressChange("episodesWatched", -1)}
                  disabled={(localData.episodesWatched || 0) <= 0}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={localData.episodesWatched || 0}
                  onChange={(e) => handleDirectInput("episodesWatched", e.target.value)}
                  className="text-center font-mono"
                  min="0"
                  max={localData.totalEpisodes || undefined}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProgressChange("episodesWatched", 1)}
                  disabled={
                    !!(
                      localData.totalEpisodes &&
                      (localData.episodesWatched || 0) >= localData.totalEpisodes
                    )
                  }
                >
                  +
                </Button>
                <span className="text-xs text-muted-foreground">
                  {localData.totalEpisodes ? `/ ${localData.totalEpisodes}` : ""} ep
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProgressChange("chaptersRead", -1)}
                  disabled={(localData.chaptersRead || 0) <= 0}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={localData.chaptersRead || 0}
                  onChange={(e) => handleDirectInput("chaptersRead", e.target.value)}
                  className="text-center font-mono"
                  min="0"
                  max={localData.totalChapters || undefined}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProgressChange("chaptersRead", 1)}
                  disabled={
                    !!(
                      localData.totalChapters &&
                      (localData.chaptersRead || 0) >= localData.totalChapters
                    )
                  }
                >
                  +
                </Button>
                <span className="text-xs text-muted-foreground">
                  {localData.totalChapters ? `/ ${localData.totalChapters}` : ""} ch
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formatDate(localData.startDate)}
                onChange={(e) => handleUpdate("startDate", e.target.value || null)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formatDate(localData.endDate)}
                onChange={(e) => handleUpdate("endDate", e.target.value || null)}
                className="text-sm"
              />
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() => {
                onRemove();
                setOpen(false);
              }}
              size="sm"
            >
              Remove
            </Button>
            <Button
              onClick={() => setOpen(false)}
              size="sm"
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
