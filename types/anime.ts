import type { BaseSearchParams, Entity, BaseMedia } from "./jikan";

export interface AnimeData extends BaseMedia {
  source: string;
  episodes?: number;
  airing: boolean;
  aired: {
    from: string;
    to: string;
    prop: {
      from: { day: number; month: number; year: number };
      to: { day: number; month: number; year: number };
    };
  };
  duration: string;
  rating: string;
  season?: string;
  year?: number;
  broadcast?: {
    day: string;
    time: string;
    timezone: string;
    string: string;
  };
  producers: Entity[];
  licensors: Entity[];
  studios: Entity[];
}

export interface AnimeSearchParams extends BaseSearchParams {
  type?: "tv" | "movie" | "ova" | "special" | "ona" | "music";
  status?: "airing" | "complete" | "upcoming";
  rating?: "g" | "pg" | "pg13" | "r17" | "r" | "rx";
  producers?: string;
}

export interface TopAnimeParams {
  type?: "tv" | "movie" | "ova" | "special" | "ona" | "music";
  filter?: "airing" | "upcoming" | "bypopularity" | "favorite";
  rating?: "g" | "pg" | "pg13" | "r17" | "r" | "rx";
  sfw?: boolean;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface SeasonParams {
  year: number;
  season: "winter" | "spring" | "summer" | "fall";
  page?: number;
  limit?: number;
  [key: string]: unknown;
}
