"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, Play, Heart } from "lucide-react";
import { AnimeData, MangaData } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";

interface UserEntry {
  status: string;
  score?: number;
  progress: number;
  isFavorite: boolean;
}

interface FeaturedSectionProps {
  mediaList: (AnimeData | MangaData)[];
  type: "anime" | "manga";
  userEntries: Map<number, UserEntry>;
  onToggleFavorite: (malId: number) => Promise<void>;
}

export function FeaturedSection({ mediaList, type, userEntries, onToggleFavorite }: FeaturedSectionProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFavorite = async (malId: number) => {
    setIsLoading(true);
    try {
      await onToggleFavorite(malId);
    } finally {
      setIsLoading(false);
    }
  };

  const featuredMedia = mediaList.slice(0, 8);

  return (
    <div className="relative w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {featuredMedia.map((media, index) => (
            <CarouselItem key={media.mal_id} className="pl-0">
              <div className="relative h-[70vh] w-full">
                {/* Background Image - Full width, no rounded corners */}
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={media.images.webp.large_image_url || media.images.jpg.large_image_url}
                    alt={media.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="100vw"
                  />
                  {/* Theme-aware gradient overlay - transparent to opaque */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/30 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex items-center h-full px-8 lg:px-16">
                  <div className="flex items-center gap-8 max-w-7xl w-full">
                    {/* Poster - rounded corners */}
                    <div className="flex-shrink-0 hidden md:block">
                      <div className="w-64 h-96 rounded-xl overflow-hidden shadow-2xl">
                        <Image
                          src={media.images.webp.large_image_url || media.images.jpg.large_image_url}
                          alt={media.title}
                          width={256}
                          height={384}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-6 text-foreground">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary" className="bg-primary text-primary-foreground">
                            Featured
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {media.score ?? "N/A"}
                          </span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold line-clamp-2 text-foreground">
                          {media.title}
                        </h1>
                      </div>

                      <p className="text-lg text-muted-foreground line-clamp-3 max-w-2xl">
                        {media.synopsis || "No synopsis available."}
                      </p>

                      {/* Genres */}
                      <div className="flex flex-wrap gap-2">
                        {media.genres?.slice(0, 4).map((genre) => (
                          <Badge
                            key={genre.mal_id}
                            variant="outline"
                            className="border-border text-foreground bg-background/50"
                          >
                            {genre.name}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-4 pt-4">
                        <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90">
                          <Link href={`/${type}/${media.mal_id}`}>
                            <Play className="w-5 h-5 mr-2" />
                            View Details
                          </Link>
                        </Button>

                        {session && (
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => handleToggleFavorite(media.mal_id)}
                            disabled={isLoading}
                            className={cn(
                              "border-border text-foreground hover:bg-background/50",
                              userEntries.get(media.mal_id)?.isFavorite && "text-red-500 border-red-500"
                            )}
                          >
                            <Heart className={cn(
                              "w-5 h-5",
                              userEntries.get(media.mal_id)?.isFavorite && "fill-current"
                            )} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 bg-background/50 border-border text-foreground hover:bg-background/70" />
        <CarouselNext className="right-4 bg-background/50 border-border text-foreground hover:bg-background/70" />
      </Carousel>
    </div>
  );
}
