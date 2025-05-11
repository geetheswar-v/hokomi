"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Star, Heart, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { AnimeData, MangaData } from "@/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  media: AnimeData | MangaData;
  type: "anime" | "manga";
  userEntry?: {
    status: string;
    score?: number;
    progress: number;
    isFavorite: boolean;
  };
  onToggleFavorite?: () => void;
}

export function Card({
  media,
  type,
  userEntry,
  onToggleFavorite,
}: CardProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onToggleFavorite) return;
    setIsLoading(true);
    try {
      await onToggleFavorite();
    } finally {
      setIsLoading(false);
    }
  };

  const synopsis = media.synopsis || "No synopsis available.";

  return (
    <div className="group relative cursor-pointer">
      <HoverCard openDelay={300} closeDelay={150}>
        <HoverCardTrigger asChild>
          <div className="relative rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl">
            {/* Main Card */}
            <Link href={`/${type}/${media.mal_id}`} className="block">
              <div className="aspect-[3/4] overflow-hidden relative">
                <Image
                  src={media.images.webp.large_image_url || media.images.jpg.large_image_url}
                  alt={media.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                />
                
                {/* Score overlay - top left */}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {media.score ?? "N/A"}
                </div>

                {/* Favorite button - top right */}
                {session && (
                  <button
                    onClick={handleToggleFavorite}
                    disabled={isLoading}
                    className={cn(
                      "absolute top-2 right-2 bg-black/70 backdrop-blur-sm p-1.5 rounded-full transition-all duration-200 hover:bg-black/90",
                      userEntry?.isFavorite ? "text-red-500" : "text-white hover:text-red-500"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", userEntry?.isFavorite && "fill-current")} />
                  </button>
                )}
              </div>
            </Link>
          </div>
        </HoverCardTrigger>

        {/* Hover card with detailed info */}
        <HoverCardContent side="right" className="w-80 p-4" sideOffset={10}>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Image
                  src={media.images.webp.image_url || media.images.jpg.image_url}
                  alt={media.title}
                  width={60}
                  height={80}
                  className="rounded object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm line-clamp-2 mb-1">{media.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {media.score ?? "N/A"}
                  </span>
                  <span>•</span>
                  <span>{media.status}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {media.genres?.slice(0, 3).map((genre) => (
                    <Badge key={genre.mal_id} variant="secondary" className="text-xs">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p className="line-clamp-3">{synopsis}</p>
            </div>
            
            <div className="flex gap-2">
              <Button asChild size="sm" className="flex-1">
                <Link href={`/${type}/${media.mal_id}`}>
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* Title below card - always visible */}
      <div className="mt-2 px-1">
        <Link href={`/${type}/${media.mal_id}`}>
          <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
            {media.title}
          </h3>
        </Link>
      </div>
    </div>
  );
}
