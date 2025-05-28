"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/media/Card";
import { FeaturedSection } from "@/components/media/FeaturedSection";
import { Shimmer, MediaCardSkeleton, FeaturedSkeleton } from "@/components/Shimmer";
import { AnimeData, MangaData } from "@/types";
import { useSession } from "next-auth/react";
import { JikanAPI } from "@/lib/jikan";

interface FavoriteEntry {
  malId: number;
  type: string;
  title: string;
  imageUrl: string;
}

interface MediaPageProps {
  type: "anime" | "manga";
}

interface UserEntry {
  status: string;
  score?: number;
  progress: number;
  isFavorite: boolean;
}
export default function MediaPage({ type }: MediaPageProps) {
  const { data: session, status } = useSession();
  const [topMedia, setTopMedia] = useState<(AnimeData | MangaData)[]>([]);
  const [airingMedia, setAiringMedia] = useState<(AnimeData | MangaData)[]>([]);
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized featured list - top 5 from airing sorted by score
  const featured = useMemo(() => {
    return airingMedia
      .filter(media => media.score && media.score > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 5);
  }, [airingMedia]);

  const userEntries = useMemo(() => {
    const map = new Map<number, UserEntry>();
    
    // Add favorites
    favorites.forEach(fav => {
      if (fav.type === type.toUpperCase()) {
        map.set(fav.malId, {
          status: "none",
          progress: 0,
          isFavorite: true,
        });
      }
    });

    const allMedia = [...topMedia, ...airingMedia];
    allMedia.forEach(media => {
      if (!map.has(media.mal_id)) {
        map.set(media.mal_id, {
          status: "none",
          progress: 0,
          isFavorite: false,
        });
      }
    });

    return map;
  }, [favorites, topMedia, airingMedia, type]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Starting ${type} data fetch...`);
        setIsLoading(true);
        setError(null);

        let topData, airingData;

        if (type === "anime") {
          [topData, airingData] = await Promise.all([
            JikanAPI.getTopAnime({ limit: 20 }),
            JikanAPI.getCurrentSeasonAnime()
          ]);
        } else {
          [topData, airingData] = await Promise.all([
            JikanAPI.getTopManga({ limit: 20 }),
            JikanAPI.searchManga({ status: "publishing", limit: 20 })
          ]);
        }

        console.log(`${type} API calls completed successfully`);
        
        const topList = topData.data || [];
        const airingList = airingData.data || [];

        setTopMedia(topList);
        setAiringMedia(airingList);

        console.log("Top count:", topList.length);
        console.log("Airing count:", airingList.length);

      } catch (err) {
        console.error(`Error fetching ${type} data:`, err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [type]);

  // Fetch favorites when session loads
  useEffect(() => {
    const fetchFavorites = async () => {
      if (session?.user?.id) {
        try {
          const favoritesResponse = await fetch("/api/user/favorites/list");
          if (favoritesResponse.ok) {
            const userFavorites = await favoritesResponse.json();
            setFavorites(userFavorites);
          }
        } catch (err) {
          console.error("Error fetching favorites:", err);
        }
      } else {
        setFavorites([]);
      }
    };

    if (status !== "loading") {
      fetchFavorites();
    }
  }, [session?.user?.id, status]);

  // Toggle favorite
  const handleToggleFavorite = useCallback(async (malId: number) => {
    if (!session?.user?.id) return;

    // Find the media data from either topMedia or airingMedia
    const mediaData = [...topMedia, ...airingMedia].find(media => media.mal_id === malId);
    if (!mediaData) return;

    const isFavorite = favorites.some(fav => fav.malId === malId && fav.type === type.toUpperCase());

    try {
      const response = await fetch("/api/user/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          malId,
          type: type.toLowerCase(),
          action: isFavorite ? "remove" : "add",
          title: mediaData.title,
          imageUrl: mediaData.images.webp.large_image_url || mediaData.images.jpg.large_image_url,
        }),
      });

      if (!response.ok) throw new Error("Failed to toggle favorite");

      // Update favorites state
      if (!isFavorite) {
        setFavorites(prev => [...prev, {
          malId,
          type: type.toUpperCase(),
          title: mediaData.title,
          imageUrl: mediaData.images.webp.large_image_url || mediaData.images.jpg.large_image_url,
        }]);
      } else {
        setFavorites(prev => prev.filter(fav => !(fav.malId === malId && fav.type === type.toUpperCase())));
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  }, [session?.user?.id, type, favorites, topMedia, airingMedia]);

  if (isLoading) {
    return (
      <div className="min-h-screen space-y-12">
        <FeaturedSkeleton />
        
        {/* Currently Airing/Publishing Section */}
        <section className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Shimmer className="h-6 w-32 rounded" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 15 }).map((_, idx) => (
              <MediaCardSkeleton key={idx} />
            ))}
          </div>
        </section>

        {/* Top Section */}
        <section className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Shimmer className="h-6 w-32 rounded" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 15 }).map((_, idx) => (
              <MediaCardSkeleton key={idx} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-destructive mb-4">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-12">
      {/* Featured Section */}
      <FeaturedSection
        mediaList={featured}
        type={type}
        userEntries={userEntries}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Currently Airing/Publishing Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-4">
          Currently {type === "anime" ? "Airing" : "Publishing"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {airingMedia.slice(0, 15).map((media) => (
            <Card
              key={media.mal_id}
              media={media}
              type={type}
              userEntry={userEntries.get(media.mal_id)}
              onToggleFavorite={() => handleToggleFavorite(media.mal_id)}
            />
          ))}
        </div>
      </section>

      {/* Top Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-4">
          Top {type === "anime" ? "Anime" : "Manga"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {topMedia.slice(0, 15).map((media) => (
            <Card
              key={media.mal_id}
              media={media}
              type={type}
              userEntry={userEntries.get(media.mal_id)}
              onToggleFavorite={() => handleToggleFavorite(media.mal_id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
