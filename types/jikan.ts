export interface ImageSet {
  image_url: string;
  small_image_url: string;
  large_image_url: string;
}

export interface MediaImages {
  jpg: ImageSet;
  webp: ImageSet;
}

export interface Entity {
  mal_id: number;
  name: string;
  url: string;
}

export interface PaginationData {
  last_visible_page: number;
  has_next_page: boolean;
  items: {
    count: number;
    total: number;
    per_page: number;
  };
}

export interface JikanResponse<T> {
  data: T;
  pagination?: PaginationData;
}

export interface BaseSearchParams {
  q?: string;
  page?: number;
  limit?: number;
  score?: number;
  min_score?: number;
  max_score?: number;
  sfw?: boolean;
  genres?: string;
  genres_exclude?: string;
  order_by?: string;
  sort?: "desc" | "asc";
  letter?: string;
  start_date?: string;
  end_date?: string;
  [key: string]: unknown;
}

export interface BaseMedia {
  mal_id: number;
  url: string;
  images: MediaImages;
  title: string;
  title_english?: string;
  title_japanese?: string;
  title_synonyms: string[];
  type: string;
  status: string;
  score?: number;
  scored_by?: number;
  rank?: number;
  popularity: number;
  members: number;
  favorites: number;
  synopsis?: string;
  background?: string;
  genres: Entity[];
  themes: Entity[];
  demographics: Entity[];
}