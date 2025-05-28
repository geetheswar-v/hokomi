"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { AnimeData, MangaData } from "@/types";

interface MediaDetailsProps {
  data: AnimeData | MangaData;
  type: "anime" | "manga";
  userEntry?: {
    status: string;
    progress: number;
    totalEpisodes?: number;
    totalChapters?: number;
    totalVolumes?: number;
    score?: number;
  };
  isFavorite?: boolean;
  onAddToList?: () => void;
  onToggleFavorite?: () => void;
  onStatusChange?: (status: string) => void;
  onProgressChange?: (progress: number) => void;
}

export default function MediaDetails({
  data,
  type,
  userEntry,
  isFavorite = false,
  onAddToList,
  onToggleFavorite,
  onStatusChange,
  onProgressChange,
}: MediaDetailsProps) {
  const [progress, setProgress] = useState(userEntry?.progress || 0);

  const isAnime = type === "anime";
  const animeData = isAnime ? (data as AnimeData) : null;
  const mangaData = !isAnime ? (data as MangaData) : null;

  const totalEpisodes = animeData?.episodes;
  const totalChapters = mangaData?.chapters;

  const statusOptions = isAnime
    ? [
        { value: "WATCHING", label: "Watching" },
        { value: "COMPLETED", label: "Completed" },
        { value: "ON_HOLD", label: "On Hold" },
        { value: "DROPPED", label: "Dropped" },
        { value: "PLAN_TO_WATCH", label: "Plan to Watch" },
      ]
    : [
        { value: "READING", label: "Reading" },
        { value: "COMPLETED", label: "Completed" },
        { value: "ON_HOLD", label: "On Hold" },
        { value: "DROPPED", label: "Dropped" },
        { value: "PLAN_TO_READ", label: "Plan to Read" },
      ];

  const getProgressPercentage = () => {
    if (isAnime && totalEpisodes) {
      return (progress / totalEpisodes) * 100;
    }
    if (!isAnime && totalChapters) {
      return (progress / totalChapters) * 100;
    }
    return 0;
  };

  const getProgressText = () => {
    if (isAnime) {
      return totalEpisodes ? `${progress}/${totalEpisodes} episodes` : `${progress} episodes`;
    }
    return totalChapters ? `${progress}/${totalChapters} chapters` : `${progress} chapters`;
  };

  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    onProgressChange?.(newProgress);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 -z-10">
        <Image
          src={data.images.jpg.large_image_url}
          alt={data.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-background/90" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image */}
          <div className="lg:col-span-1">
            <div className="stick top-8 aspect-[3/4] relative">
                    <Image
                      src={data.images.jpg.large_image_url}
                      alt={data.title}
                      fill
                      className="object-cover rounded-lg"
                    />
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Basic Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  {data.title}
                </h1>
                {data.title_english && data.title_english !== data.title && (
                  <h2 className="text-xl text-muted-foreground">
                    {data.title_english}
                  </h2>
                )}
                {data.title_japanese && (
                  <h3 className="text-lg text-muted-foreground">
                    {data.title_japanese}
                  </h3>
                )}
                {data.title_synonyms.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Also known as: {data.title_synonyms.join(", ")}
                  </p>
                )}
              </div>

              {/* Score and Stats */}
              <div className="flex items-center gap-4 flex-wrap">
                {data.score && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{data.score}</span>
                    <span className="text-muted-foreground">
                      ({data.scored_by?.toLocaleString()} users)
                    </span>
                  </div>
                )}
                {data.rank && (
                  <Badge variant="secondary">
                    Rank #{data.rank}
                  </Badge>
                )}
                <Badge variant="outline">
                  {data.status}
                </Badge>
                <Badge variant="outline">
                  {data.type}
                </Badge>
              </div>

              {/* Synopsis */}
              {data.synopsis && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Synopsis</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {data.synopsis}
                  </p>
                </div>
              )}

              {/* Genres */}
              {data.genres.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.genres.map((genre) => (
                      <Badge key={genre.mal_id} variant="secondary">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Themes */}
              {data.themes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.themes.map((theme) => (
                      <Badge key={theme.mal_id} variant="outline">
                        {theme.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* User Actions */}
            <div className="space-y-4">
              <div className="flex gap-3">
                {userEntry ? (
                  <Select
                    value={userEntry.status}
                    onValueChange={onStatusChange}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Button onClick={onAddToList} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add to List
                  </Button>
                )}

                <Button
                  variant={isFavorite ? "default" : "outline"}
                  onClick={onToggleFavorite}
                  className="flex items-center gap-2"
                >
                  <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                  {isFavorite ? "Favorited" : "Add to Favorites"}
                </Button>
              </div>

              {/* Progress Section */}
              {userEntry && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Progress</h3>
                    <span className="text-sm text-muted-foreground">
                      {getProgressText()}
                    </span>
                  </div>
                  
                  {(totalEpisodes || totalChapters) ? (
                    <div className="space-y-2">
                      <Progress value={getProgressPercentage()} className="h-2" />
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProgressChange(Math.max(0, progress - 1))}
                          disabled={progress <= 0}
                        >
                          -
                        </Button>
                        <span className="flex-1 text-center font-mono">
                          {progress}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const max = totalEpisodes || totalChapters || Infinity;
                            handleProgressChange(Math.min(max, progress + 1));
                          }}
                          disabled={progress >= (totalEpisodes || totalChapters || Infinity)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Episodes/chapters count not available for this series
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{data.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span>{data.status}</span>
                  </div>
                  {isAnime && animeData && (
                    <>
                      {animeData.episodes && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Episodes:</span>
                          <span>{animeData.episodes}</span>
                        </div>
                      )}
                      {animeData.duration && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span>{animeData.duration}</span>
                        </div>
                      )}
                      {animeData.rating && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rating:</span>
                          <span>{animeData.rating}</span>
                        </div>
                      )}
                      {animeData.season && animeData.year && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Season:</span>
                          <span>{animeData.season} {animeData.year}</span>
                        </div>
                      )}
                    </>
                  )}
                  {!isAnime && mangaData && (
                    <>
                      {mangaData.chapters && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Chapters:</span>
                          <span>{mangaData.chapters}</span>
                        </div>
                      )}
                      {mangaData.volumes && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Volumes:</span>
                          <span>{mangaData.volumes}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Popularity:</span>
                    <span>#{data.popularity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Members:</span>
                    <span>{data.members.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Favorites:</span>
                    <span>{data.favorites.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {isAnime ? "Production" : "Publication"}
                </h3>
                <div className="space-y-2 text-sm">
                  {isAnime && animeData && (
                    <>
                      {animeData.studios.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Studios:</span>
                          <div className="mt-1">
                            {animeData.studios.map((studio) => (
                              <Badge key={studio.mal_id} variant="outline" className="mr-1 mb-1">
                                {studio.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {animeData.producers.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Producers:</span>
                          <div className="mt-1">
                            {animeData.producers.map((producer) => (
                              <Badge key={producer.mal_id} variant="outline" className="mr-1 mb-1">
                                {producer.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {animeData.source && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Source:</span>
                          <span>{animeData.source}</span>
                        </div>
                      )}
                    </>
                  )}
                  {!isAnime && mangaData && (
                    <>
                      {mangaData.authors.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Authors:</span>
                          <div className="mt-1">
                            {mangaData.authors.map((author) => (
                              <Badge key={author.mal_id} variant="outline" className="mr-1 mb-1">
                                {author.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {mangaData.serializations.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Serializations:</span>
                          <div className="mt-1">
                            {mangaData.serializations.map((serialization) => (
                              <Badge key={serialization.mal_id} variant="outline" className="mr-1 mb-1">
                                {serialization.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
