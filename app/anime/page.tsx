"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/media/Card";
import { AnimeData } from "@/types";
import { useSession } from "next-auth/react";
import { JikanAPI } from "@/lib/jikan";

interface FavoriteEntry {
  malId: number;
  type: string;
  title: string;
  imageUrl: string;
}

export default function AnimePage() {
  const { data: session } = useSession();
  const [topAnime, setTopAnime] = useState<AnimeData[]>([]);
  const [airingAnime, setAiringAnime] = useState<AnimeData[]>([]);
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Starting anime data fetch...");
        setIsLoading(true);
        setError(null);

        const [topAnimeData, airingAnimeData] = await Promise.all([
          JikanAPI.getTopAnime({ limit: 16 }),
          JikanAPI.searchAnime({ status: "airing", limit: 16 })
        ]);

        setTopAnime(topAnimeData.data || []);
        setAiringAnime(airingAnimeData.data || []);
      } catch (err) {
        console.error("Error fetching anime data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (session?.user?.id) {
        try {
          const favoritesResponse = await fetch("/api/track/favorites");
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

    fetchFavorites();
  }, [session?.user?.id]);

  const isAnimeFavorite = (malId: number) => {
    return favorites.some(fav => fav.malId === malId && fav.type === "ANIME");
  };

  const toggleFavorite = async (malId: number) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/track/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          malId,
          type: "ANIME",
        }),
      });

      if (!response.ok) throw new Error("Failed to toggle favorite");

      const result = await response.json();
      
      if (result.action === "added") {
        setFavorites(prev => [...prev, result.favorite]);
      } else {
        setFavorites(prev => prev.filter(fav => !(fav.malId === malId && fav.type === "ANIME")));
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading anime...</p>
          </div>
        </div>
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
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-12">
        {/* Top Anime Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Top Anime</h2>
            <p className="text-muted-foreground">Most popular anime of all time</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {topAnime.map((anime) => (
              <Card
                key={anime.mal_id}
                media={anime}
                type="anime"
                userEntry={{
                  status: "none",
                  progress: 0,
                  isFavorite: isAnimeFavorite(anime.mal_id),
                }}
                onToggleFavorite={() => toggleFavorite(anime.mal_id)}
              />
            ))}
          </div>
        </section>

        {/* Airing Anime Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Currently Airing</h2>
            <p className="text-muted-foreground">Anime currently broadcasting</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {airingAnime.map((anime) => (
              <Card
                key={anime.mal_id}
                media={anime}
                type="anime"
                userEntry={{
                  status: "none",
                  progress: 0,
                  isFavorite: isAnimeFavorite(anime.mal_id),
                }}
                onToggleFavorite={() => toggleFavorite(anime.mal_id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
