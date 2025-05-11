import type { BaseSearchParams, Entity, BaseMedia } from "./jikan";

export interface MangaData extends BaseMedia {
  chapters?: number;
  volumes?: number;
  publishing: boolean;
  published: {
    from: string;
    to: string;
    prop: {
      from: { day: number; month: number; year: number };
      to: { day: number; month: number; year: number };
    };
  };
  authors: Entity[];
  serializations: Entity[];
}

export interface MangaSearchParams extends BaseSearchParams {
  type?:
    | "manga"
    | "novel"
    | "lightnovel"
    | "oneshot"
    | "doujin"
    | "manhwa"
    | "manhua";
  status?: "publishing" | "complete" | "hiatus" | "discontinued" | "upcoming";
  magazines?: string;
}

export interface TopMangaParams {
  type?:
    | "manga"
    | "novel"
    | "lightnovel"
    | "oneshot"
    | "doujin"
    | "manhwa"
    | "manhua";
  filter?: "publishing" | "upcoming" | "bypopularity" | "favorite";
  page?: number;
  limit?: number;
  [key: string]: unknown;
}
