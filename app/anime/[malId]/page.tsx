"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { JikanAPI } from "@/lib/jikan";
import MediaDetails from "@/components/media/MediaDetails";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnimeData } from "@/types";

interface UserEntry {
  id: string;
  status: string;
  episodesWatched: number;
  totalEpisodes?: number;
  score?: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export default function AnimeDetailsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [userEntry, setUserEntry] = useState<UserEntry | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const malId = params.malId as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch anime data from Jikan API
        const animeResponse = await JikanAPI.getAnimeFullData(parseInt(malId));
        setAnimeData(animeResponse.data);

        // Fetch user data if authenticated
        if (session?.user) {
          const userResponse = await fetch(`/api/user/anime/entries?malId=${malId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserEntry(userData.userEntry);
            setIsFavorite(userData.isFavorite);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load anime data");
      } finally {
        setLoading(false);
      }
    };

    if (malId) {
      fetchData();
    }
  }, [malId, session]);

  const handleAddToList = async () => {
    if (!session?.user || !animeData) return;

    try {
      const response = await fetch("/api/user/anime/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          malId: animeData.mal_id,
          action: "add",
          title: animeData.title,
          imageUrl: animeData.images.webp.large_image_url || animeData.images.jpg.large_image_url,
          status: "PLAN_TO_WATCH",
          episodesWatched: 0,
          totalEpisodes: animeData.episodes,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setUserEntry(result.entry);
      }
    } catch (error) {
      console.error("Error adding to list:", error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!session?.user || !animeData) return;

    try {
      const response = await fetch("/api/user/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          malId: animeData.mal_id,
          type: "anime",
          action: isFavorite ? "remove" : "add",
          title: animeData.title,
          imageUrl: animeData.images.webp.large_image_url || animeData.images.jpg.large_image_url,
        }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleUpdateEntry = async (data: {
    status?: string;
    episodesWatched?: number;
    score?: number;
    startDate?: string;
    endDate?: string;
    notes?: string;
  }) => {
    if (!session?.user || !animeData || !userEntry) return;

    try {
      const response = await fetch("/api/user/anime/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          malId: animeData.mal_id,
          action: "update",
          title: animeData.title,
          imageUrl: animeData.images.webp.large_image_url || animeData.images.jpg.large_image_url,
          status: data.status || userEntry.status,
          episodesWatched: data.episodesWatched ?? userEntry.episodesWatched,
          totalEpisodes: animeData.episodes,
          score: data.score ?? userEntry.score,
          startDate: data.startDate || userEntry.startDate,
          endDate: data.endDate || userEntry.endDate,
          notes: data.notes || userEntry.notes,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setUserEntry(result.entry);
      }
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  const handleRemoveEntry = async () => {
    if (!session?.user || !animeData) return;

    try {
      const response = await fetch("/api/user/anime/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          malId: animeData.mal_id,
          action: "remove",
        }),
      });

      if (response.ok) {
        setUserEntry(null);
      }
    } catch (error) {
      console.error("Error removing entry:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !animeData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">
            Error Loading Anime
          </h1>
          <p className="text-muted-foreground">
            {error || "Anime not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <MediaDetails
      data={animeData}
      type="anime"
      userEntry={userEntry ? {
        status: userEntry.status,
        episodesWatched: userEntry.episodesWatched,
        totalEpisodes: userEntry.totalEpisodes,
        score: userEntry.score,
        startDate: userEntry.startDate,
        endDate: userEntry.endDate,
        notes: userEntry.notes,
      } : undefined}
      isFavorite={isFavorite}
      onAddToList={handleAddToList}
      onToggleFavorite={handleToggleFavorite}
      onUpdateEntry={handleUpdateEntry}
      onRemoveEntry={handleRemoveEntry}
    />
  );
}
