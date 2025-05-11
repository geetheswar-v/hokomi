import {
  JikanResponse,
  
  AnimeData,
  AnimeSearchParams,
  TopAnimeParams,
  SeasonParams,

  MangaData,
  MangaSearchParams,
  TopMangaParams,
} from "@/types";

const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

export class JikanAPI {
  private static async fetch<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${JIKAN_BASE_URL}${endpoint}`);
    if (!res.ok)
      throw new Error(`Jikan API error: ${res.status} ${res.statusText}`);
    return res.json();
  }

  private static buildQuery(params: Record<string, unknown> = {}): string {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) query.append(key, String(val));
    });
    return query.toString();
  }

  private static filterUniqueById<T extends { mal_id: number }>(
    items: T[]
  ): T[] {
    const seen = new Set<number>();
    return items.filter((item) => {
      if (seen.has(item.mal_id)) return false;
      seen.add(item.mal_id);
      return true;
    });
  }

  private static filterUniqueResponse<T extends { mal_id: number }>(
    response: JikanResponse<T[]>
  ): JikanResponse<T[]> {
    return { ...response, data: this.filterUniqueById(response.data) };
  }

  // --- Anime Endpoints ---

  static getAnime = (id: number) =>
    this.fetch<JikanResponse<AnimeData>>(`/anime/${id}`);

  static getAnimeFullData = (id: number) =>
    this.fetch<JikanResponse<AnimeData>>(`/anime/${id}/full`);

  static searchAnime = async (
    params: AnimeSearchParams = {}
  ): Promise<JikanResponse<AnimeData[]>> => {
    const query = this.buildQuery(params);
    const res = await this.fetch<JikanResponse<AnimeData[]>>(`/anime?${query}`);
    return this.filterUniqueResponse(res);
  };

  // --- Manga Endpoints ---

  static getManga = (id: number) =>
    this.fetch<JikanResponse<MangaData>>(`/manga/${id}`);

  static getMangaFullData = (id: number) =>
    this.fetch<JikanResponse<MangaData>>(`/manga/${id}/full`);

  static searchManga = async (
    params: MangaSearchParams = {}
  ): Promise<JikanResponse<MangaData[]>> => {
    const query = this.buildQuery(params);
    const res = await this.fetch<JikanResponse<MangaData[]>>(`/manga?${query}`);
    return this.filterUniqueResponse(res);
  };

  // --- Top Rankings ---

  static getTopAnime = async (
    params: TopAnimeParams = {}
  ): Promise<JikanResponse<AnimeData[]>> => {
    const query = this.buildQuery(params);
    const res = await this.fetch<JikanResponse<AnimeData[]>>(
      `/top/anime?${query}`
    );
    return this.filterUniqueResponse(res);
  };

  static getTopManga = async (
    params: TopMangaParams = {}
  ): Promise<JikanResponse<MangaData[]>> => {
    const query = this.buildQuery(params);
    const res = await this.fetch<JikanResponse<MangaData[]>>(
      `/top/manga?${query}`
    );
    return this.filterUniqueResponse(res);
  };

  // --- Seasonal ---

  static getSeasonalAnime = async ({
    year,
    season,
    ...rest
  }: SeasonParams): Promise<JikanResponse<AnimeData[]>> => {
    const query = this.buildQuery(rest);
    const res = await this.fetch<JikanResponse<AnimeData[]>>(
      `/seasons/${year}/${season}?${query}`
    );
    return this.filterUniqueResponse(res);
  };

  static getCurrentSeasonAnime = async (page?: number) => {
    const query = page ? `?page=${page}` : "";
    const res = await this.fetch<JikanResponse<AnimeData[]>>(
      `/seasons/now${query}`
    );
    return this.filterUniqueResponse(res);
  };

  static getUpcomingSeasonAnime = async (page?: number) => {
    const query = page ? `?page=${page}` : "";
    const res = await this.fetch<JikanResponse<AnimeData[]>>(
      `/seasons/upcoming${query}`
    );
    return this.filterUniqueResponse(res);
  };

  static getSeasonsList = () =>
    this.fetch<JikanResponse<{ year: number; seasons: string[] }[]>>(
      `/seasons`
    );

  // --- Schedule ---

  static getAnimeSchedule = async (
    day?:
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday"
  ): Promise<JikanResponse<AnimeData[]>> => {
    const query = day ? `?filter=${day}` : "";
    const res = await this.fetch<JikanResponse<AnimeData[]>>(
      `/schedules${query}`
    );
    return this.filterUniqueResponse(res);
  };
}

